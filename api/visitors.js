import crypto from 'node:crypto';
import {
  KEYS, KEEP_DAYS, getRedisClient, parseCookies, readBody, sendResponse, istDay,
} from '../api-lib/shared.js';
import { clientIp, memoryHit } from '../api-lib/ratelimit.js';

// First-party cookie configuration
const COOKIE_NAME = 'scc_vid';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

// Regular expression to identify automated bots and crawlers
const BOT_REGEX = /bot|spider|crawl|slurp|lighthouse|headless|facebookexternalhit|whatsapp|google-read-aloud/i;

function isBot(userAgent) {
  return Boolean(userAgent && BOT_REGEX.test(userAgent));
}

/* ---------------------------------------------------------------------------------------------
   What the website sends (POST, JSON). An old cached copy of the site sends nothing: that counts as a plain visit.
     { t: 'visit', path, src, ref }   once when a page is opened   -> visits, unique, device, source, page
     { t: 'pv',    path }             every later page change      -> page views
     { t: 'click', k }                a register / membership button -> clicks
   Only the values below are stored, so nobody can fill Redis with random names.
   If you add a new page to the site, add its path to PAGES.
   --------------------------------------------------------------------------------------------- */
const PAGES = new Set(['/', '/upcoming', '/events', '/team', '/connect', '/register']);
const CLICKS = new Set(['register-vibeathon', 'register-codeclash', 'membership']);

// where a visitor came from, by the website name in the referrer
const SOURCE_BY_HOST = [
  [/instagram|l\.instagram/, 'instagram'],
  [/whatsapp|wa\.me/, 'whatsapp'],
  [/linkedin|lnkd\.in/, 'linkedin'],
  [/facebook|fb\.com|fb\.me|messenger/, 'facebook'],
  [/(^|\.)t\.co$|twitter|(^|\.)x\.com$/, 'x'],
  [/youtube|youtu\.be/, 'youtube'],
  [/telegram|(^|\.)t\.me$/, 'telegram'],
  [/discord/, 'discord'],
  [/reddit/, 'reddit'],
  [/unstop/, 'unstop'],
  [/hackerrank/, 'hackerrank'],
  [/google\./, 'google'],
  [/bing\.|duckduckgo|yahoo|ecosia/, 'search'],
];

// Real browsers send an Origin header on a POST. If it names another website, the request did not come from our pages.
// (No Origin at all is allowed: some privacy modes and old cached copies of the site leave it out.)
function sameOrigin(req) {
  const origin = req.headers['origin'];
  if (!origin) return true;
  try {
    const from = new URL(origin).hostname.replace(/^www\./, '').toLowerCase();
    const own = String(req.headers.host || '').split(':')[0].replace(/^www\./, '').toLowerCase();
    return !own || from === own;
  } catch { return true; }
}

// One address may send this many counting requests per minute to one Vercel instance. A whole class on one college
// Wi-Fi opening the link together stays far below it; a script that floods the counters does not.
const MAX_PER_MINUTE = 240;

function cleanPath(p) {
  if (typeof p !== 'string') return null;
  let path = p.split('?')[0].split('#')[0].toLowerCase();
  if (path.length > 1) path = path.replace(/\/+$/, '');
  return PAGES.has(path) ? path : '/other';
}

// a tag the club puts in its own links: sipnacoders.club/?src=poster1
function cleanTag(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 20);
}

function deviceOf(ua) {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return 'tablet';
  if (/mobi|iphone|ipod|android/i.test(ua)) return 'mobile';
  return 'desktop';
}

function sourceOf(body, ua, ownHost) {
  const tag = cleanTag(body.src);
  if (tag) return tag;

  if (typeof body.ref === 'string' && body.ref) {
    try {
      const host = new URL(body.ref).hostname.replace(/^www\./, '').toLowerCase();
      if (host && host !== ownHost) {
        for (const [re, name] of SOURCE_BY_HOST) if (re.test(host)) return name;
        return host.replace(/[^a-z0-9.-]/g, '').slice(0, 30) || 'direct';
      }
    } catch { /* not a link: ignore */ }
  }

  // Instagram, Facebook and LinkedIn apps open links in their own browser and hide the referrer, but tell on themselves here
  if (/instagram/i.test(ua)) return 'instagram';
  if (/FBAN|FBAV/.test(ua)) return 'facebook';
  if (/LinkedInApp/i.test(ua)) return 'linkedin';
  return 'direct';
}

export default async function handler(req, res) {
  // Public GET is disabled to prevent leaking visitor statistics
  if (req.method === 'GET') {
    return sendResponse(res, 403, {
      error: 'Public statistics access is disabled. Use the protected admin endpoint.',
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendResponse(res, 405, { error: 'Method Not Allowed' });
  }

  // Checked before Redis is touched, so a flood from outside costs no Redis commands
  if (!sameOrigin(req)) {
    return sendResponse(res, 403, { ok: false });
  }
  const hit = memoryHit(`visit:${clientIp(req)}`, MAX_PER_MINUTE, 60_000);
  if (hit.limited) {
    return sendResponse(res, 429, { ok: false }, { 'Retry-After': String(hit.retryAfter) });
  }

  const redis = getRedisClient();
  if (!redis) {
    return sendResponse(res, 200, { ok: false, message: 'Storage not configured' });
  }

  try {
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers['referer'] || '';

    // Ignore bots and requests originating from the admin dashboard
    if (isBot(userAgent) || referer.includes('/admin')) {
      return sendResponse(res, 200, { ok: true });
    }

    const body = await readBody(req);
    if (typeof body.path === 'string' && body.path.startsWith('/admin')) {
      return sendResponse(res, 200, { ok: true });
    }

    const type = body.t === 'pv' || body.t === 'click' ? body.t : 'visit';
    const day = istDay();
    const dayKey = KEYS.day(day);
    const path = cleanPath(body.path);

    // ---- later page change ----
    if (type === 'pv') {
      if (path) await redis.hincrby(dayKey, `pv:${path}`, 1);
      return sendResponse(res, 200, { ok: true });
    }

    // ---- button click ----
    if (type === 'click') {
      if (CLICKS.has(body.k)) await redis.hincrby(dayKey, `clk:${body.k}`, 1);
      return sendResponse(res, 200, { ok: true });
    }

    // ---- a page was opened (counts as one visit) ----
    const cookies = parseCookies(req.headers.cookie);
    let vid = cookies[COOKIE_NAME];
    let isNewVisitorCookie = false;

    // Validate UUID format or generate a fresh anonymous identifier
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!vid || !uuidRegex.test(vid)) {
      vid = crypto.randomUUID();
      isNewVisitorCookie = true;
    }

    const responseHeaders = {};
    if (isNewVisitorCookie) {
      const isSecure = process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
      responseHeaders['Set-Cookie'] = `${COOKIE_NAME}=${vid}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax; HttpOnly${isSecure ? '; Secure' : ''}`;
    }

    const ownHost = String(req.headers.host || '').split(':')[0].replace(/^www\./, '').toLowerCase();

    const pipeline = redis.pipeline();
    pipeline.incr(KEYS.total);
    pipeline.sadd(KEYS.unique, vid);
    pipeline.hincrby(dayKey, 'visits', 1);                                        // result index 2
    pipeline.hincrby(dayKey, `dev:${deviceOf(userAgent)}`, 1);
    pipeline.hincrby(dayKey, `src:${sourceOf(body, userAgent, ownHost)}`, 1);
    if (path) pipeline.hincrby(dayKey, `pv:${path}`, 1);
    pipeline.pfadd(KEYS.dayUnique(day), vid);
    const results = await pipeline.exec();

    // the first visit of a day creates the day's keys: tell Redis to delete them after KEEP_DAYS
    if (Number(results[2]) === 1) {
      const ttl = KEEP_DAYS * 86400;
      await redis.pipeline().expire(dayKey, ttl).expire(KEYS.dayUnique(day), ttl).exec();
    }

    // Never return counts to public visitors
    return sendResponse(res, 200, { ok: true }, responseHeaders);
  } catch (err) {
    console.error('Visitor record error:', err.message);
    return sendResponse(res, 200, { ok: false });
  }
}
