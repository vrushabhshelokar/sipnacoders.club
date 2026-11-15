import { Redis } from '@upstash/redis';
import crypto from 'node:crypto';

const KEY_TOTAL_VISITORS = 'scc:visitors:total';
const KEY_UNIQUE_SET = 'scc:visitors:unique_set';
const SESSION_COOKIE_NAME = 'scc_admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours

function getAdminSecret() {
  return process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET || process.env.ADMIN_API_KEY || null;
}

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [name, ...val] = part.split('=');
    if (name) {
      cookies[name.trim()] = val.join('=').trim();
    }
  }
  return cookies;
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

function sendResponse(res, statusCode, data, headers = {}) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }

  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(data));
}

function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!url || !token) return null;

  try {
    return new Redis({ url, token });
  } catch (err) {
    console.error('Failed to initialize Redis client:', err.message);
    return null;
  }
}

async function getRequestBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch { resolve({}); }
    });
  });
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

  // Handle Authentication actions (login / logout / check)
  if (req.method === 'POST') {
    const body = await getRequestBody(req);
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
    // Read-only operations: get total and scard of unique set
    // Notice: INCR is never called here. Admin refreshes do NOT inflate counts.
    const pipeline = redis.pipeline();
    pipeline.get(KEY_TOTAL_VISITORS);
    pipeline.scard(KEY_UNIQUE_SET);

    const [totalRaw, uniqueCount] = await pipeline.exec();

    return sendResponse(res, 200, {
      total: Number(totalRaw) || 0,
      unique: Number(uniqueCount) || 0,
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
