import { Redis } from '@upstash/redis';
import crypto from 'node:crypto';

// Upstash Redis storage keys
const KEY_TOTAL_VISITORS = 'scc:visitors:total';
const KEY_UNIQUE_SET = 'scc:visitors:unique_set';

// First-party cookie configuration
const COOKIE_NAME = 'scc_vid';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

// Regular expression to identify automated bots and crawlers
const BOT_REGEX = /bot|spider|crawl|slurp|lighthouse|headless|facebookexternalhit|whatsapp|google-read-aloud/i;

function isBot(userAgent) {
  return Boolean(userAgent && BOT_REGEX.test(userAgent));
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

  const redis = getRedisClient();
  if (!redis) {
    return sendResponse(res, 200, { ok: false, message: 'Storage not configured' });
  }

  try {
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers['referer'] || '';

    // Ignore bots and requests originating from admin dashboard
    const isBotRequest = isBot(userAgent);
    const isAdminReferer = referer.includes('/admin');

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
    if (isNewVisitorCookie && !isBotRequest && !isAdminReferer) {
      const isSecure = process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
      responseHeaders['Set-Cookie'] = `${COOKIE_NAME}=${vid}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax; HttpOnly${isSecure ? '; Secure' : ''}`;
    }

    if (!isBotRequest && !isAdminReferer) {
      // Atomic pipeline: INCR total, SADD unique identifier
      const pipeline = redis.pipeline();
      pipeline.incr(KEY_TOTAL_VISITORS);
      pipeline.sadd(KEY_UNIQUE_SET, vid);
      await pipeline.exec();
    }

    // Never return counts to public visitors
    return sendResponse(res, 200, { ok: true }, responseHeaders);
  } catch (err) {
    console.error('Visitor record error:', err.message);
    return sendResponse(res, 200, { ok: false });
  }
}
