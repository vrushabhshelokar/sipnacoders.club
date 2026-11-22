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
export const OBJECT_KEYS = ['banner', 'timeline', 'details', 'eventDetails', 'eventPoints', 'eventBanners', 'popupLogo', 'siteLinks', 'siteStats', 'siteText', 'sitePictures', 'faq', 'voices', 'wins', 'joinSteps', 'tracks', 'tools', 'pastEvents'];                                    // longer content (see the clean functions below)
export const ENUM_KEYS = { eventType: ['hackathon', 'workshop', 'online'] };       // one of these words
export const TEXT_KEYS = { eventName: 60, popupDesc: 120, psAlertText: 120, psAlertText2: 120 };                         // one line of text, at most this long
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
/* ---------------------------------------------------------------------------------------------
   Site content (Site content tab of the dashboard): links, numbers, words, pictures, lists and past events.
   A key that is missing means "use what is written in src/data/site.js".
   --------------------------------------------------------------------------------------------- */
const EMAIL_RE = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,120}\.[A-Za-z]{2,24}$/;
const hostOf = (s) => { try { return new URL(s).hostname.toLowerCase(); } catch { return ''; } };
const hostIn = (s, list) => { const h = hostOf(s); return list.some((d) => h === d || h.endsWith(`.${d}`)); };

// the buttons and contact links: only the ones that were changed are stored
const SITE_LINK_KEYS = ['membershipForm', 'joinForm', 'instagram', 'linkedin', 'email'];
function cleanSiteLinks(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
  const out = {};
  for (const k of Object.keys(v)) {
    if (!SITE_LINK_KEYS.includes(k) || typeof v[k] !== 'string') return null;
    const s = v[k].trim();
    if (k === 'email') { if (!EMAIL_RE.test(s)) return null; out[k] = s; continue; }
    const l = cleanLink(s);
    if (l === null) return null;
    if (k !== 'joinForm' && !l.startsWith('https://')) return null;     // only the Join button may point to a page of this site
    if (k === 'instagram' && !hostIn(l, ['instagram.com'])) return null;
    if (k === 'linkedin' && !hostIn(l, ['linkedin.com', 'lnkd.in'])) return null;
    out[k] = l;
  }
  return Object.keys(out).length ? out : null;
}

// the four number tiles on the Home page: [{ value, suffix, label }]
function cleanSiteStats(v) {
  if (!Array.isArray(v) || v.length !== 4) return null;
  const out = [];
  for (const it of v) {
    if (!it || typeof it !== 'object' || !Number.isInteger(it.value) || it.value < 0 || it.value > 999999) return null;
    if (typeof it.suffix !== 'string' || !/^[+kKmM%x]{0,2}$/.test(it.suffix)) return null;
    const label = oneLine(it.label, 24, 1);
    if (label === null) return null;
    out.push({ value: it.value, suffix: it.suffix, label });
  }
  return out;
}

// headings and sentences of the Home page (only the ones that were changed are stored)
export const SITE_TEXT_MAX = {
  heroPill: 60, heroLine1: 40, heroGrad: 30, heroSub: 260,
  joinTitle: 60, joinSub: 140, pastTitle: 60, pastSub: 160, doTitle: 60, doSub: 160,
  faqTitle: 60, faqSub: 160, crewTitle: 60, crewText: 200,
};
function cleanSiteText(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
  const out = {};
  for (const k of Object.keys(v)) {
    if (!(k in SITE_TEXT_MAX)) return null;
    const s = oneLine(v[k], SITE_TEXT_MAX[k], 1);
    if (s === null) return null;
    out[k] = s;
  }
  return Object.keys(out).length ? out : null;
}

// the two big pictures: { membership: { v, r? }, group: { v, r?, pos? } }  v = version of the stored picture, r = width / height, pos = 0 top .. 100 bottom
function cleanSitePictures(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
  const out = {};
  for (const k of Object.keys(v)) {
    const p = v[k];
    if ((k !== 'membership' && k !== 'group') || !p || typeof p !== 'object' || typeof p.v !== 'string' || !MEDIA_VERSION.test(p.v)) return null;
    const e = { v: p.v };
    if (p.r !== undefined) { if (typeof p.r !== 'number' || !(p.r >= 0.2 && p.r <= 5)) return null; e.r = Math.round(p.r * 1000) / 1000; }
    if (k === 'group' && p.pos !== undefined) { if (!Number.isInteger(p.pos) || p.pos < 0 || p.pos > 100) return null; e.pos = p.pos; }
    out[k] = e;
  }
  return Object.keys(out).length ? out : null;
}

// simple lists of short records (FAQ, voices, wins, join steps, tracks, tools)
export const TRACK_ICONS = ['Globe', 'Code', 'Sparkles', 'Cloud', 'Smartphone', 'Terminal', 'GitBranch', 'Zap', 'Trophy', 'Users'];
const LIST_SPECS = {
  faq: { min: 0, max: 16, f: { q: [3, 140], a: [3, 700] }, faqLink: true },
  voices: { min: 0, max: 12, f: { quote: [5, 300], name: [2, 60], role: [0, 60] } },
  wins: { min: 0, max: 12, f: { kind: ['Award', 'Project'], title: [3, 100], who: [0, 80], year: [0, 10], desc: [0, 220], link: 'link' } },
  joinSteps: { min: 1, max: 6, f: { title: [2, 60], desc: [0, 160] } },
  tracks: { min: 1, max: 8, f: { id: 'id', icon: TRACK_ICONS, color: 'hex', title: [2, 40], desc: [0, 140] } },
};
function cleanRows(name, v) {
  const spec = LIST_SPECS[name];
  if (!Array.isArray(v) || v.length < spec.min || v.length > spec.max) return null;
  const ids = new Set();
  const out = [];
  for (const it of v) {
    if (!it || typeof it !== 'object') return null;
    const row = {};
    for (const [f, rule] of Object.entries(spec.f)) {
      if (Array.isArray(rule) && typeof rule[0] === 'string') { if (!rule.includes(it[f])) return null; row[f] = it[f]; }
      else if (Array.isArray(rule)) { const s = oneLine(it[f] ?? '', rule[1], rule[0]); if (s === null) return null; row[f] = s; }
      else if (rule === 'hex') { if (typeof it[f] !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(it[f])) return null; row[f] = it[f].toLowerCase(); }
      else if (rule === 'id') { if (typeof it[f] !== 'string' || !/^[a-z0-9_-]{1,12}$/.test(it[f]) || ids.has(it[f])) return null; ids.add(it[f]); row[f] = it[f]; }
      else if (rule === 'link') { if (it[f] === undefined || it[f] === '') { row[f] = ''; continue; } const l = cleanLink(it[f]); if (l === null) return null; row[f] = l; }
    }
    if (spec.faqLink && it.link !== undefined && it.link !== null) {
      const L = it.link;
      if (!L || typeof L !== 'object') return null;
      const label = oneLine(L.label, 30, 1);
      const to = L.to === undefined ? null : cleanLink(L.to);
      const href = L.href === undefined ? null : cleanLink(L.href);
      if (label === null || (to === null) === (href === null)) return null;
      if (to !== null && !to.startsWith('/')) return null;
      if (href !== null && !href.startsWith('https://')) return null;
      row.link = to !== null ? { label, to } : { label, href };
    }
    out.push(row);
  }
  return out;
}
const cleanFaq = (v) => cleanRows('faq', v);
const cleanVoices = (v) => cleanRows('voices', v);
const cleanWins = (v) => cleanRows('wins', v);
const cleanJoinSteps = (v) => cleanRows('joinSteps', v);
const cleanTracks = (v) => cleanRows('tracks', v);
// the strip of tool names: ['Google Gemini', 'GitHub', ...]
function cleanTools(v) {
  if (!Array.isArray(v) || v.length > 14) return null;
  const out = [];
  for (const t of v) { const s = oneLine(t, 40, 1); if (s === null) return null; out.push(s); }
  return out;
}

// past events with their photos. key = the event in src/data/site.js it came from (null = added here);
// an image is { c: n } (picture n of that code event) or { id: 'g-<event id>-<1..8>', v: '<version>' } (uploaded in the dashboard)
const PAST_ID = /^[a-z0-9]{2,10}$/;
function cleanPastEvents(v) {
  if (!Array.isArray(v) || v.length > 40) return null;
  const seen = new Set();
  const out = [];
  for (const it of v) {
    if (!it || typeof it !== 'object' || typeof it.id !== 'string' || !PAST_ID.test(it.id) || seen.has(it.id)) return null;
    seen.add(it.id);
    const key = it.key === undefined || it.key === null || it.key === '' ? null : it.key;
    if (key !== null && !(typeof key === 'string' && /^[a-z0-9-]{1,60}$/.test(key))) return null;
    const title = oneLine(it.title, 90, 2);
    const category = oneLine(it.category ?? '', 30);
    const date = oneLine(it.date ?? '', 30);
    const description = oneLine(it.description ?? '', 320);
    const sortDate = it.sortDate === undefined || it.sortDate === '' ? '' : (typeof it.sortDate === 'string' && /^\d{4}-\d\d-\d\d$/.test(it.sortDate) && !Number.isNaN(Date.parse(`${it.sortDate}T00:00:00Z`)) ? it.sortDate : null);
    if (title === null || category === null || date === null || description === null || sortDate === null) return null;
    if (!date && !sortDate) return null;
    if (!Array.isArray(it.images) || it.images.length > 8) return null;
    const imgs = [];
    const used = new Set();
    for (const im of it.images) {
      if (!im || typeof im !== 'object') return null;
      let one;
      if (im.c !== undefined) {
        if (key === null || !Number.isInteger(im.c) || im.c < 0 || im.c > 30) return null;
        one = { c: im.c };
      } else {
        if (typeof im.id !== 'string' || !new RegExp(`^g-${it.id}-[1-8]$`).test(im.id) || typeof im.v !== 'string' || !MEDIA_VERSION.test(im.v)) return null;
        one = { id: im.id, v: im.v };
      }
      const tag = one.id || `c${one.c}`;
      if (used.has(tag)) return null;
      used.add(tag);
      imgs.push(one);
    }
    out.push({ id: it.id, key, title, category, date, sortDate, description, images: imgs });
  }
  return out;
}

const OBJECT_CLEANERS = {
  banner: cleanBanner, timeline: cleanTimeline, details: cleanDetails,
  eventDetails: cleanEventDetails, eventPoints: cleanEventPoints, eventBanners: cleanEventBanners, popupLogo: cleanPopupLogo,
  siteLinks: cleanSiteLinks, siteStats: cleanSiteStats, siteText: cleanSiteText, sitePictures: cleanSitePictures,
  faq: cleanFaq, voices: cleanVoices, wins: cleanWins, joinSteps: cleanJoinSteps, tracks: cleanTracks, tools: cleanTools, pastEvents: cleanPastEvents,
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
