// What a team member / ambassador looks like, how it is checked, and where it is stored.
// Used by api/people.js (public, read only) and api/admin/people.js (admin only, can change things).
// Everything that comes in is cleaned here, so nothing odd can reach Redis or the website.

/* ---------------------------------------------------------------------------------------------
   Redis keys
   scc:people        { team: [person, ...], ambassadors: [person, ...] }  (JSON, one small value)
                     A list that is missing means "nobody edited it yet": the website uses src/data/site.js.
   scc:photo:<id>    { v, t, d }  one uploaded photo: version, image type, image bytes as base64 (about 30-80 KB)
   --------------------------------------------------------------------------------------------- */
export const PEOPLE_KEY = 'scc:people';
export const photoKey = (id) => `scc:photo:${id}`;

// every id in the team list starts with t-, every id in the ambassador list with a-  (so a photo key never clashes)
export const LISTS = { team: 't-', ambassadors: 'a-' };
export const MAX_PEOPLE = 60;
export const MAX_PHOTO_BYTES = 250 * 1024;
export const ID_RE = /^[a-z0-9][a-z0-9_-]{1,38}$/;

const clean = (v, max) => (typeof v === 'string'
  ? v.replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max)
  : '');

// '' = empty (fine), null = not an allowed address, otherwise the cleaned https link
function cleanUrl(v, domains) {
  if (typeof v !== 'string') return '';
  const s = v.trim();
  if (!s) return '';
  if (s.length > 300) return null;
  let u;
  try { u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`); } catch { return null; }
  const host = u.hostname.toLowerCase();
  if (!domains.some((d) => host === d || host.endsWith(`.${d}`))) return null;
  u.protocol = 'https:';
  return u.toString();
}

/** Checks one person. Returns { person } or { error }. */
export function cleanPerson(list, input) {
  const prefix = LISTS[list];
  if (!prefix || !input || typeof input !== 'object') return { error: 'Invalid entry.' };
  const id = typeof input.id === 'string' ? input.id.toLowerCase() : '';
  if (!ID_RE.test(id) || !id.startsWith(prefix)) return { error: 'Invalid id.' };
  const name = clean(input.name, 60);
  if (!name) return { error: 'Every person needs a name.' };

  const person = {
    id,
    key: typeof input.key === 'string' && /^[a-z0-9-]{1,60}$/.test(input.key) ? input.key : null,   // the person's entry in site.js (keeps the code photo)
    name,
    role: clean(input.role, 60),
    year: clean(input.year, 30),
    photo: typeof input.photo === 'string' && /^[a-z0-9]{1,16}$/.test(input.photo) ? input.photo : null,
  };

  if (list === 'team') {
    const linkedin = cleanUrl(input.linkedin, ['linkedin.com', 'lnkd.in']);
    const instagram = cleanUrl(input.instagram, ['instagram.com']);
    if (linkedin === null) return { error: `${name}: the LinkedIn link must be a linkedin.com address.` };
    if (instagram === null) return { error: `${name}: the Instagram link must be an instagram.com address.` };
    person.linkedin = linkedin;
    person.instagram = instagram;
  } else {
    const programs = Array.isArray(input.programs) ? input.programs : [];
    person.programs = [...new Set(programs.filter((p) => typeof p === 'string' && /^[a-z0-9_-]{1,20}$/.test(p)))].slice(0, 6);
    person.status = input.status === 'past' ? 'past' : 'present';
    person.years = clean(input.years, 20);
  }
  return { person };
}

/** Checks a whole list. Returns { people } or { error }. */
export function cleanList(list, input) {
  if (!LISTS[list]) return { error: 'Unknown list.' };
  if (!Array.isArray(input)) return { error: 'The list is missing.' };
  if (input.length > MAX_PEOPLE) return { error: `A list can hold at most ${MAX_PEOPLE} people.` };
  const seen = new Set();
  const people = [];
  for (const item of input) {
    const r = cleanPerson(list, item);
    if (r.error) return { error: r.error };
    if (seen.has(r.person.id)) return { error: 'The same person is in the list twice.' };
    seen.add(r.person.id);
    people.push(r.person);
  }
  return { people };
}

// Redis may hand the saved JSON back as an object or as a string. A broken entry is dropped, never an error for visitors.
export function parseStored(raw) {
  let obj = raw;
  if (typeof raw === 'string') { try { obj = JSON.parse(raw); } catch { obj = null; } }
  const out = { team: null, ambassadors: null };
  if (!obj || typeof obj !== 'object') return out;
  for (const list of Object.keys(LISTS)) {
    if (!Array.isArray(obj[list])) continue;
    const seen = new Set();
    out[list] = [];
    for (const item of obj[list].slice(0, MAX_PEOPLE)) {
      const r = cleanPerson(list, item);
      if (r.person && !seen.has(r.person.id)) { seen.add(r.person.id); out[list].push(r.person); }
    }
  }
  return out;
}

/* ------------------------------- photos ------------------------------- */

// the first bytes of the file say what it really is (a name or a header sent by the browser can lie)
export function sniffImage(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

/** 'data:image/webp;base64,....'  ->  { mime, b64 } or { error } */
export function parseDataUrl(s) {
  if (typeof s !== 'string' || s.length > MAX_PHOTO_BYTES * 1.4 + 100) return { error: 'The photo is too large. Choose a smaller one.' };
  const m = /^data:(image\/(?:webp|jpeg|png));base64,([A-Za-z0-9+/]+={0,2})$/.exec(s);
  if (!m) return { error: 'The photo must be a JPG, PNG or WebP image.' };
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > MAX_PHOTO_BYTES) return { error: 'The photo is too large. Choose a smaller one.' };
  if (sniffImage(buf) !== m[1]) return { error: 'That file is not a real image.' };
  return { mime: m[1], b64: m[2] };
}

export function parseStoredPhoto(raw) {
  let o = raw;
  if (typeof raw === 'string') { try { o = JSON.parse(raw); } catch { return null; } }
  if (!o || typeof o !== 'object' || typeof o.d !== 'string') return null;
  const mime = ['image/webp', 'image/jpeg', 'image/png'].includes(o.t) ? o.t : null;
  return mime ? { mime, buf: Buffer.from(o.d, 'base64'), v: String(o.v || '') } : null;
}

/* ------------------------------- request helpers ------------------------------- */

// Reads the JSON body. Vercel has already read it (req.body); the local dev server has not, so the stream is read too.
export function readJson(req, maxBytes = 700_000) {
  const b = req.body;
  if (b && typeof b === 'object' && !Buffer.isBuffer(b)) return Promise.resolve({ body: b });
  const text = typeof b === 'string' ? b : Buffer.isBuffer(b) ? b.toString('utf8') : null;
  if (text !== null) {
    if (text.length > maxBytes) return Promise.resolve({ tooBig: true });
    try { return Promise.resolve({ body: JSON.parse(text) }); } catch { return Promise.resolve({ body: null }); }
  }
  if (typeof req.on !== 'function') return Promise.resolve({ body: null });
  return new Promise((resolve) => {
    const chunks = [];
    let size = 0;
    let done = false;
    const finish = (v) => { if (!done) { done = true; clearTimeout(timer); resolve(v); } };
    const timer = setTimeout(() => finish({ body: null }), 8000);
    req.on('data', (c) => {
      if (done) return;
      size += c.length;
      if (size > maxBytes) return finish({ tooBig: true });
      chunks.push(c);
    });
    req.on('end', () => {
      try { finish({ body: JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null') }); } catch { finish({ body: null }); }
    });
    req.on('error', () => finish({ body: null }));
  });
}

// Real browsers send an Origin header on a POST. If it names another website, the request did not come from our dashboard.
export function sameOrigin(req) {
  const origin = req.headers['origin'];
  if (!origin) return true;
  try {
    const from = new URL(origin).hostname.replace(/^www\./, '').toLowerCase();
    const own = String(req.headers.host || '').split(':')[0].replace(/^www\./, '').toLowerCase();
    return !own || from === own;
  } catch { return false; }
}

export function queryOf(req) {
  if (req.query && typeof req.query === 'object') return req.query;
  try { return Object.fromEntries(new URL(req.url || '/', 'http://x').searchParams); } catch { return {}; }
}
