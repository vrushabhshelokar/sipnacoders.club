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
  schedule: 'scc:schedule',   // scheduled changes (JSON list)
  history: 'scc:history',     // what the admin changed and when (JSON list, newest first)
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
export const BOOL_KEYS = [
  'codeClashRegistration', 'vibeRegistration', 'codeClashPopup', 'vibePopup', 'codeClashSection',
  'upcomingShow', 'flowShow', 'psShow', 'psUnlockNow',
];
export const DATE_KEYS = ['eventStart', 'roundEnd1', 'roundEnd2', 'hideAfter', 'psReleaseAt'];   // 'YYYY-MM-DDTHH:MM', Indian time
export const INT_KEYS = { psCount: [1, 99], popupTheme: [0, 21], popupDelay: [0, 120] };                                                    // whole number, [min, max]
export const LINK_KEYS = ['psPdf', 'eventLink'];                                                              // /file-in-public-folder.pdf or https://...
export const OBJECT_KEYS = ['banner', 'timeline', 'details', 'eventDetails', 'eventPoints', 'eventBanners', 'popupLogo'];                                    // longer content (see the clean functions below)
export const ENUM_KEYS = { eventType: ['hackathon', 'workshop', 'online'] };       // one of these words
export const TEXT_KEYS = { eventName: 60, popupDesc: 120 };                         // one line of text, at most this long
export const ALL_SETTING_KEYS = [...BOOL_KEYS, ...DATE_KEYS, ...Object.keys(INT_KEYS), ...LINK_KEYS, ...OBJECT_KEYS, ...Object.keys(ENUM_KEYS), ...Object.keys(TEXT_KEYS), 'currentRound'];

const DATE_RE = /^\d{4}-\d\d-\d\dT\d\d:\d\d$/;
const LINK_RE = /^(\/(?!\/)[^\s"'<>\\]+|https:\/\/[^\s"'<>\\]+)$/;
const CTRL = /[\u0000-\u001f\u007f]/g;

export const validStamp = (v) => typeof v === 'string' && DATE_RE.test(v) && !Number.isNaN(Date.parse(`${v}:00+05:30`));

// plain one-line text, or null when it is not text or too short / too long
function oneLine(v, max, min = 0) {
  if (typeof v !== 'string') return null;
  const s = v.replace(CTRL, ' ').replace(/\s+/g, ' ').trim();
  return s.length >= min && s.length <= max ? s : null;
}

function cleanLink(v) {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (!s || s.length > 300 || !LINK_RE.test(s)) return null;
  if (s.startsWith('/') && s.includes('..')) return null;
  return s;
}

// the announcement banner: { on, text, link, linkText, until, tone }
function cleanBanner(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
  const text = oneLine(v.text ?? '', 200);
  const linkText = oneLine(v.linkText ?? '', 30);
  const link = v.link === undefined || v.link === '' ? '' : cleanLink(v.link);
  const until = v.until === undefined || v.until === '' ? '' : (validStamp(v.until) ? v.until : null);
  if (text === null || linkText === null || link === null || until === null) return null;
  return { on: v.on === true, text, link, linkText, until, tone: ['info', 'urgent', 'success'].includes(v.tone) ? v.tone : 'info' };
}

// the Timeline rows of the Vibe-A-Thon page: [{ id, phase, milestone, time, date, desc, accent?, icon? }]
function cleanTimeline(v) {
  if (!Array.isArray(v) || v.length < 1 || v.length > 12) return null;
  const seen = new Set();
  const out = [];
  for (const it of v) {
    if (!it || typeof it !== 'object') return null;
    const id = typeof it.id === 'string' && /^[A-Za-z0-9_-]{1,12}$/.test(it.id) ? it.id : null;
    const milestone = oneLine(it.milestone, 80, 1);
    const phase = oneLine(it.phase ?? '', 24);
    const time = oneLine(it.time ?? '', 40);
    const date = oneLine(it.date ?? '', 40);
    const desc = oneLine(it.desc ?? '', 260);
    if (!id || seen.has(id) || milestone === null || phase === null || time === null || date === null || desc === null) return null;
    seen.add(id);
    const row = { id, phase, milestone, time, date, desc };
    if (typeof it.accent === 'string' && /^#[0-9a-fA-F]{6}$/.test(it.accent)) row.accent = it.accent.toLowerCase();
    if (typeof it.icon === 'string' && /^[A-Za-z]{1,24}$/.test(it.icon)) row.icon = it.icon;
    out.push(row);
  }
  return out;
}

// the detail boxes of the Upcoming card: { Format: '18-hour build-a-thon', ... }  (a box left '' stays "Will be revealed soon")
function cleanDetails(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
  const keys = Object.keys(v);
  if (keys.length < 1 || keys.length > 8) return null;
  const out = {};
  for (const k of keys) {
    if (!/^[A-Za-z0-9][A-Za-z0-9 &/_-]{0,23}$/.test(k)) return null;
    const val = oneLine(v[k] ?? '', 80);
    if (val === null) return null;
    out[k] = val;
  }
  return out;
}
// the detail boxes of each kind of event: { hackathon: { Format: '...' }, workshop: { ... } }. A kind that is missing uses the code file.
function cleanEventDetails(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
  const out = {};
  for (const t of Object.keys(v)) {
    if (!ENUM_KEYS.eventType.includes(t)) return null;
    const d = cleanDetails(v[t]);
    if (d === null) return null;
    out[t] = d;
  }
  return Object.keys(out).length ? out : null;
}

// the "what to expect" points under the Upcoming card: [{ t: 'bold line', d: 'one more line' }]
function cleanEventPoints(v) {
  if (!Array.isArray(v) || v.length < 1 || v.length > 8) return null;
  const out = [];
  for (const it of v) {
    if (!it || typeof it !== 'object') return null;
    const t = oneLine(it.t, 60, 1);
    const d = oneLine(it.d ?? '', 160);
    if (t === null || d === null) return null;
    out.push({ t, d });
  }
  return out;
}

// the uploaded banners: [{ id: 'e-b1' .. 'e-b4', v: '<version of the picture>' }]. The pictures live in the photo store (api/admin/people.js).
const MEDIA_VERSION = /^[a-z0-9]{1,16}$/;
function cleanEventBanners(v) {
  if (!Array.isArray(v) || v.length < 1 || v.length > 4) return null;
  const seen = new Set();
  const out = [];
  for (const b of v) {
    if (!b || typeof b !== 'object' || typeof b.id !== 'string' || !/^e-b[1-4]$/.test(b.id) || seen.has(b.id) || typeof b.v !== 'string' || !MEDIA_VERSION.test(b.v)) return null;
    seen.add(b.id);
    out.push({ id: b.id, v: b.v });
  }
  return out;
}

// the small logo of the popup: { v: '<version of the picture>' }
function cleanPopupLogo(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v) || typeof v.v !== 'string' || !MEDIA_VERSION.test(v.v)) return null;
  return { v: v.v };
}
const OBJECT_CLEANERS = {
  banner: cleanBanner, timeline: cleanTimeline, details: cleanDetails,
  eventDetails: cleanEventDetails, eventPoints: cleanEventPoints, eventBanners: cleanEventBanners, popupLogo: cleanPopupLogo,
};

// Keeps only known keys with valid values. Anything else is dropped.
export function cleanSettings(input) {
  const out = {};
  if (!input || typeof input !== 'object') return out;
  for (const k of BOOL_KEYS) if (typeof input[k] === 'boolean') out[k] = input[k];
  for (const k of DATE_KEYS) {
    if (validStamp(input[k])) out[k] = input[k];
  }
  for (const [k, [min, max]] of Object.entries(INT_KEYS)) {
    const v = input[k];
    if (Number.isInteger(v) && v >= min && v <= max) out[k] = v;
  }
  for (const k of LINK_KEYS) {
    const v = cleanLink(input[k]);
    if (v) out[k] = v;
  }
  for (const k of OBJECT_KEYS) {
    if (input[k] === undefined || input[k] === null) continue;
    const v = OBJECT_CLEANERS[k](input[k]);
    if (v !== null) out[k] = v;
  }
  for (const [k, list] of Object.entries(ENUM_KEYS)) {
    if (list.includes(input[k])) out[k] = input[k];
  }
  for (const [k, max] of Object.entries(TEXT_KEYS)) {
    if (typeof input[k] !== 'string') continue;
    const s = oneLine(input[k], max);
    if (s !== null && (s || k === 'eventName')) out[k] = s;   // an empty event name is a real choice ("no name yet"), an empty popup line is not
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
    if (key === 'eventName' && patch[key] === '') { next[key] = ''; continue; }   // an empty name is a real choice: no name yet
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
