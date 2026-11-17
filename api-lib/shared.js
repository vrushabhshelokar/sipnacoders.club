// Shared helpers for the API routes (api/visitors.js, api/settings.js, api/admin/analytics.js).
// It lives outside the /api folder on purpose, so Vercel does not turn it into an endpoint of its own.
import { Redis } from '@upstash/redis';

/* ---------------------------------------------------------------------------------------------
   Redis keys
   scc:visitors:total          all-time visits (a counter)                      (already existed)
   scc:visitors:unique_set     all-time unique browsers (a set)                 (already existed)
   scc:day:YYYY-MM-DD          one small hash per day (Indian date): visits, pv:<page>, dev:<device>,
                               src:<source>, clk:<button>. Deleted by Redis after KEEP_DAYS.
   scc:day:YYYY-MM-DD:u        unique browsers of that day (a HyperLogLog: tiny, counts distinct)
   scc:settings                the switches saved from the admin dashboard (JSON)
   --------------------------------------------------------------------------------------------- */
export const KEYS = {
  total: 'scc:visitors:total',
  unique: 'scc:visitors:unique_set',
  settings: 'scc:settings',
  day: (d) => `scc:day:${d}`,
  dayUnique: (d) => `scc:day:${d}:u`,
};

export const KEEP_DAYS = 90;

// Today's date in Indian time (YYYY-MM-DD). offsetDays = 1 gives yesterday, and so on.
export function istDay(offsetDays = 0, now = Date.now()) {
  return new Date(now + 5.5 * 3600e3 - offsetDays * 864e5).toISOString().slice(0, 10);
}

export function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(';')) {
    const [name, ...val] = part.split('=');
    if (name) cookies[name.trim()] = val.join('=').trim();
  }
  return cookies;
}

export function sendResponse(res, statusCode, data, headers = {}) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(data));
}

export function getRedisClient() {
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

export async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  // no body was sent (an old cached copy of the site posts nothing): do not wait for a stream that has nothing in it
  const h = req.headers || {};
  const hasBody = Number(h['content-length']) > 0 || Boolean(h['transfer-encoding']);
  if (!hasBody || typeof req.on !== 'function' || req.readableEnded || req.destroyed) return {};
  return new Promise((resolve) => {
    let data = '';
    const timer = setTimeout(() => resolve({}), 2000);
    const finish = (value) => { clearTimeout(timer); resolve(value); };
    req.on('data', (chunk) => { if (data.length < 20000) data += chunk; });   // nothing we accept is bigger than a few hundred bytes
    req.on('end', () => {
      try { finish(data ? JSON.parse(data) : {}); } catch { finish({}); }
    });
    req.on('error', () => finish({}));
  });
}

/* ---------------------------------------------------------------------------------------------
   Site switches (what the admin dashboard can change without a new deploy)
   A key that is missing means "use the value written in the code files" (eventSwitches.js, upcomingConfig.js).
   --------------------------------------------------------------------------------------------- */
export const BOOL_KEYS = ['codeClashRegistration', 'vibeRegistration', 'codeClashPopup', 'vibePopup', 'codeClashSection'];
export const DATE_KEYS = ['eventStart', 'roundEnd1', 'roundEnd2'];   // 'YYYY-MM-DDTHH:MM', Indian time
export const ALL_SETTING_KEYS = [...BOOL_KEYS, ...DATE_KEYS, 'currentRound'];

const DATE_RE = /^\d{4}-\d\d-\d\dT\d\d:\d\d$/;

// Keeps only known keys with valid values. Anything else is dropped.
export function cleanSettings(input) {
  const out = {};
  if (!input || typeof input !== 'object') return out;
  for (const k of BOOL_KEYS) if (typeof input[k] === 'boolean') out[k] = input[k];
  for (const k of DATE_KEYS) {
    const v = input[k];
    if (typeof v === 'string' && DATE_RE.test(v) && !Number.isNaN(Date.parse(`${v}:00+05:30`))) out[k] = v;
  }
  if (input.currentRound === 1 || input.currentRound === 2) out.currentRound = input.currentRound;
  return out;
}

// patch: { key: value } sets a switch, { key: null } (or '') removes it so the code file value is used again.
export function applyPatch(current, patch) {
  const next = { ...cleanSettings(current) };
  const rejected = [];
  if (!patch || typeof patch !== 'object') return { next, rejected };
  for (const key of ALL_SETTING_KEYS) {
    if (!(key in patch)) continue;
    if (patch[key] === null || patch[key] === '') { delete next[key]; continue; }
    const one = cleanSettings({ [key]: patch[key] });
    if (key in one) next[key] = one[key];
    else rejected.push(key);
  }
  return { next, rejected };
}

// Redis may hand back the saved JSON as an object or as a string.
export function parseStoredSettings(raw) {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try { return cleanSettings(JSON.parse(raw)); } catch { return {}; }
  }
  return cleanSettings(raw);
}
