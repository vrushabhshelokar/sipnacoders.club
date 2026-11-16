import crypto from 'node:crypto';
import {
  KEYS, applyPatch, getRedisClient, istDay, parseCookies, parseStoredSettings, readBody, sendResponse,
} from '../../api-lib/shared.js';

const SESSION_COOKIE_NAME = 'scc_admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours
const RANGE_DAYS = 30;                         // how many days the dashboard can show

function getAdminSecret() {
  return process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET || process.env.ADMIN_API_KEY || null;
}

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function createSessionToken(secret) {
  const timestamp = Date.now().toString();
  const hmac = crypto.createHmac('sha256', secret).update(timestamp).digest('hex');
  return `${timestamp}.${hmac}`;
}

function verifySessionToken(token, secret) {
  if (!token || typeof token !== 'string') return false;
  const [timestampStr, signature] = token.split('.');
  if (!timestampStr || !signature) return false;

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Max session age: 24 hours
  const maxAgeMs = SESSION_MAX_AGE_SECONDS * 1000;
  if (Date.now() - timestamp > maxAgeMs || timestamp > Date.now() + 60000) {
    return false;
  }

  const expectedSignature = crypto.createHmac('sha256', secret).update(timestampStr).digest('hex');
  return safeCompare(signature, expectedSignature);
}

function isAuthenticated(req, secret) {
  if (!secret) return false;

  // 1. Check Authorization Bearer header
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.slice(7).trim();
    if (safeCompare(bearerToken, secret)) return true;
  }

  // 2. Check x-admin-key header
  const apiKey = req.headers['x-admin-key'];
  if (apiKey && safeCompare(apiKey, secret)) return true;

  // 3. Check HttpOnly cookie
  const cookies = parseCookies(req.headers.cookie);
  const sessionToken = cookies[SESSION_COOKIE_NAME];
  if (sessionToken && verifySessionToken(sessionToken, secret)) return true;

  return false;
}

// One day's hash ({ visits, 'pv:/team': 3, 'dev:mobile': 9, ... }) -> a tidy object for the dashboard
function shapeDay(date, hash, unique) {
  const day = { date, visits: 0, unique: Number(unique) || 0, pages: {}, devices: {}, sources: {}, clicks: {} };
  const parts = { 'pv:': 'pages', 'dev:': 'devices', 'src:': 'sources', 'clk:': 'clicks' };
  for (const [field, value] of Object.entries(hash || {})) {
    const n = Number(value) || 0;
    if (field === 'visits') { day.visits = n; continue; }
    for (const [prefix, bucket] of Object.entries(parts)) {
      if (field.startsWith(prefix)) { day[bucket][field.slice(prefix.length)] = n; break; }
    }
  }
  // keep each list short, so one noisy day can never make the response huge
  for (const bucket of ['pages', 'sources']) {
    const top = Object.entries(day[bucket]).sort((a, b) => b[1] - a[1]).slice(0, 40);
    day[bucket] = Object.fromEntries(top);
  }
  return day;
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return sendResponse(res, 405, { error: 'Method Not Allowed' });
  }

  const secret = getAdminSecret();

  // If server admin credentials are not configured, reject access
  if (!secret) {
    return sendResponse(res, 401, {
      authenticated: false,
      error: 'Admin authentication is not configured on the server. Please set ADMIN_PASSWORD in environment variables.',
    });
  }

  // Handle Authentication actions (login / logout / check) and saving the site switches
  if (req.method === 'POST') {
    const body = await readBody(req);
    const action = body.action || 'login';

    if (action === 'logout') {
      const isSecure = process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
      return sendResponse(res, 200, { authenticated: false }, {
        'Set-Cookie': `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Strict; HttpOnly${isSecure ? '; Secure' : ''}`,
      });
    }

    if (action === 'check') {
      const auth = isAuthenticated(req, secret);
      return sendResponse(res, auth ? 200 : 401, { authenticated: auth });
    }

    // Save the site switches (registration open/close, popups, countdown dates)
    if (action === 'save-settings') {
      if (!isAuthenticated(req, secret)) {
        return sendResponse(res, 401, { authenticated: false, error: 'Unauthorized: please log in again.' });
      }
      const redis = getRedisClient();
      if (!redis) {
        return sendResponse(res, 503, { ok: false, error: 'Redis is not configured, so switches cannot be saved.' });
      }
      try {
        const current = parseStoredSettings(await redis.get(KEYS.settings));
        const { next, rejected } = applyPatch(current, body.settings);
        if (rejected.length) {
          return sendResponse(res, 400, { ok: false, error: `Invalid value for: ${rejected.join(', ')}` });
        }
        await redis.set(KEYS.settings, JSON.stringify(next));
        return sendResponse(res, 200, { ok: true, settings: next });
      } catch (err) {
        console.error('Save settings error:', err.message);
        return sendResponse(res, 500, { ok: false, error: 'Could not save the switches.' });
      }
    }

    // Default POST action: Login
    const providedPassword = (body.password || body.secret || '').toString();
    if (safeCompare(providedPassword, secret)) {
      const sessionToken = createSessionToken(secret);
      const isSecure = process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
      return sendResponse(res, 200, { authenticated: true }, {
        'Set-Cookie': `${SESSION_COOKIE_NAME}=${sessionToken}; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; SameSite=Strict; HttpOnly${isSecure ? '; Secure' : ''}`,
      });
    } else {
      return sendResponse(res, 401, {
        authenticated: false,
        error: 'Invalid admin credentials.',
      });
    }
  }

  // GET: Fetch visitor analytics (Strictly Protected)
  if (!isAuthenticated(req, secret)) {
    return sendResponse(res, 401, {
      authenticated: false,
      error: 'Unauthorized: Valid admin authentication credentials required.',
    });
  }

  const redis = getRedisClient();
  if (!redis) {
    return sendResponse(res, 200, {
      total: null,
      unique: null,
      configured: false,
      message: 'Redis environment variables are not configured.',
      updatedAt: new Date().toISOString(),
    });
  }

  try {
    // Read-only operations. Notice: nothing is counted here. Admin refreshes do NOT inflate counts.
    const dates = Array.from({ length: RANGE_DAYS }, (_, i) => istDay(RANGE_DAYS - 1 - i));   // oldest first, today last
    const uniqueKeys = dates.map(KEYS.dayUnique);

    const pipeline = redis.pipeline();
    pipeline.get(KEYS.total);
    pipeline.scard(KEYS.unique);
    pipeline.get(KEYS.settings);
    dates.forEach((d) => pipeline.hgetall(KEYS.day(d)));
    uniqueKeys.forEach((k) => pipeline.pfcount(k));
    pipeline.pfcount(...uniqueKeys.slice(-7));    // distinct browsers over 7 days
    pipeline.pfcount(...uniqueKeys);              // distinct browsers over 30 days
    const out = await pipeline.exec();

    const [totalRaw, uniqueCount, settingsRaw] = out;
    const hashes = out.slice(3, 3 + RANGE_DAYS);
    const dayUniques = out.slice(3 + RANGE_DAYS, 3 + 2 * RANGE_DAYS);
    const week7 = out[3 + 2 * RANGE_DAYS];
    const month30 = out[3 + 2 * RANGE_DAYS + 1];

    const days = dates.map((d, i) => shapeDay(d, hashes[i], dayUniques[i]));
    const sumVisits = (list) => list.reduce((s, d) => s + d.visits, 0);
    const today = days[days.length - 1];

    return sendResponse(res, 200, {
      configured: true,
      total: Number(totalRaw) || 0,
      unique: Number(uniqueCount) || 0,
      today: { visits: today.visits, unique: today.unique },
      week: { visits: sumVisits(days.slice(-7)), unique: Number(week7) || 0 },
      month: { visits: sumVisits(days), unique: Number(month30) || 0 },
      days,
      settings: parseStoredSettings(settingsRaw),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Admin analytics Redis error:', err.message);
    return sendResponse(res, 500, {
      total: null,
      unique: null,
      error: 'Failed to retrieve visitor statistics from database.',
    });
  }
}
