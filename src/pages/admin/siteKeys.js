// The Site content tab: what the code files say today (the defaults), and the checks that run before "Save changes".
// The rules mirror api-lib/shared.js, which checks everything again on the server.
import * as D from '../../data/site';
import { SITE_TEXT_DEFAULTS } from '../../site/siteLive';
import { same } from './kit';

export const LINK_FIELDS = [
  ['membershipForm', 'Membership form (Become a member buttons)', 'https://forms.gle/...'],
  ['joinForm', 'Join Coders Community button', '/register or https://...'],
  ['instagram', 'Instagram page', 'https://www.instagram.com/...'],
  ['linkedin', 'LinkedIn page', 'https://www.linkedin.com/...'],
  ['email', 'Club email address', 'team@sipnacoders.club'],
  ['whatsappGroup', 'Vibe-A-Thon WhatsApp group (Join group button)', 'https://chat.whatsapp.com/...'],
];

// key, label, longest allowed, group heading
export const TEXT_FIELDS = [
  ['heroPill', 'Small line above the title', 60, 'Top of the Home page'],
  ['heroLine1', 'Title, first line', 40, 'Top of the Home page'],
  ['heroGrad', 'Title, coloured word', 30, 'Top of the Home page'],
  ['heroSub', 'Sentence under the title', 260, 'Top of the Home page'],
  ['joinTitle', 'Heading', 60, 'Membership block'],
  ['joinSub', 'Sentence under the heading', 140, 'Membership block'],
  ['pastTitle', 'Heading', 60, 'Past events section'],
  ['pastSub', 'Sentence under the heading', 160, 'Past events section'],
  ['doTitle', 'Heading', 60, 'What we do section'],
  ['doSub', 'Sentence under the heading', 160, 'What we do section'],
  ['faqTitle', 'Heading', 60, 'Questions section'],
  ['faqSub', 'Sentence under the heading', 160, 'Questions section'],
  ['crewTitle', 'Heading', 60, 'Founding crew banner (Home and Team page)'],
  ['crewText', 'Sentence', 200, 'Founding crew banner (Home and Team page)'],
];

export const ICONS = ['Globe', 'Code', 'Sparkles', 'Cloud', 'Smartphone', 'Terminal', 'GitBranch', 'Zap', 'Trophy', 'Users'];

const t = (s) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();

// the past events as they are written in the code, in the shape the dashboard edits: image { c: n } = picture n of that code event
export const seedPast = () => D.pastEvents.map((e, i) => ({
  id: `x${i + 1}`, key: e.id, title: e.title || '', category: e.category || '', date: e.date || '', sortDate: e.sortDate || '', description: e.description || '',
  images: (e.images || []).slice(0, 8).map((_, c) => ({ c })),
}));

// a button address that starts with / is a page of this site ({ to }), anything else is a full https:// link ({ href })
const canonLink = (l) => {
  if (!l || !l.label) return undefined;
  const a = String(l.to || l.href || '');
  return a.startsWith('/') ? { label: l.label, to: a } : { label: l.label, href: a };
};

export const SITE_DEFAULTS = {
  siteLinks: Object.fromEntries(LINK_FIELDS.map(([k]) => [k, D.LINKS[k]])),
  siteStats: D.STATS.map((s) => ({ value: s.value, suffix: s.suffix || '', label: s.label })),
  siteText: { ...SITE_TEXT_DEFAULTS },
  sitePictures: {},
  faq: D.FAQ.map((f) => { const l = canonLink(f.link); return l ? { q: f.q, a: f.a, link: l } : { q: f.q, a: f.a }; }),
  voices: D.VOICES.map((v) => ({ quote: v.quote, name: v.name, role: v.role || '' })),
  wins: D.WINS.map((w) => ({ kind: w.kind === 'Project' ? 'Project' : 'Award', title: w.title, who: w.who || '', year: w.year || '', desc: w.desc || '', link: w.link || '' })),
  joinSteps: D.JOIN_STEPS.map((s) => ({ title: s.title, desc: s.desc || '' })),
  tracks: D.TRACKS.map((x) => ({ id: x.id, icon: x.icon, color: String(x.color).toLowerCase(), title: x.title, desc: x.desc || '' })),
  tools: [...D.TOOLS],
  pastEvents: seedPast(),
};
export const SITE_KEYS = Object.keys(SITE_DEFAULTS);

/* ---------- link checks (same rules as the server) ---------- */
const LINK_RE = /^(\/(?!\/)[^\s"'<>\\]+|https:\/\/[^\s"'<>\\]+)$/;
const EMAIL_RE = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,120}\.[A-Za-z]{2,24}$/;
const hostOf = (s) => { try { return new URL(s).hostname.toLowerCase(); } catch { return ''; } };
const hostIn = (s, list) => { const h = hostOf(s); return list.some((d) => h === d || h.endsWith(`.${d}`)); };
export const linkOk = (s) => LINK_RE.test(s) && s.length <= 300 && !(s.startsWith('/') && s.includes('..'));
function linkProblem(k, s) {
  if (k === 'email') return EMAIL_RE.test(s) ? '' : 'write a full email address, like team@example.com.';
  if (!linkOk(s)) return 'use a full https:// link with no spaces.';
  if (k !== 'joinForm' && !s.startsWith('https://')) return 'it must start with https://';
  if (k === 'instagram' && !hostIn(s, ['instagram.com'])) return 'it must be an instagram.com address.';
  if (k === 'linkedin' && !hostIn(s, ['linkedin.com', 'lnkd.in'])) return 'it must be a linkedin.com address.';
  if (k === 'whatsappGroup' && !hostIn(s, ['whatsapp.com', 'wa.me'])) return 'it must be a WhatsApp group invite link (chat.whatsapp.com/...).';
  return '';
}

const ROWS = {
  faq: { noun: 'Question', f: [['q', 'question', 3, 140], ['a', 'answer', 3, 700]] },
  voices: { noun: 'Quote', f: [['quote', 'quote', 5, 300], ['name', 'name', 2, 60], ['role', 'role', 0, 60]] },
  wins: { noun: 'Win', f: [['title', 'title', 3, 100], ['who', 'who', 0, 80], ['year', 'year', 0, 10], ['desc', 'description', 0, 220]] },
  joinSteps: { noun: 'Step', f: [['title', 'title', 2, 60], ['desc', 'description', 0, 160]] },
  tracks: { noun: 'Track', f: [['title', 'title', 2, 40], ['desc', 'description', 0, 140]] },
};
export const ROW_LIMITS = { faq: [0, 16], voices: [0, 12], wins: [0, 12], joinSteps: [1, 6], tracks: [1, 8], tools: [0, 14] };

const fresh = (p) => `${p}${Math.random().toString(36).slice(2, 6)}`;
export const newPastId = () => fresh('n');
export const newTrackId = () => fresh('t');

/** Cleans one saved value and checks it. Returns { value, problems }: value is what is sent to the server (null = the same as the code files). */
export function prepareSite(key, v) {
  const problems = [];
  let value = v;
  if (key === 'siteLinks') {
    const out = {};
    for (const [k, label] of LINK_FIELDS) {
      const s = t(v && v[k]);
      if (!s || s === D.LINKS[k]) continue;                    // empty or unchanged = the code file value
      const p = linkProblem(k, s);
      if (p) problems.push(`${label}: ${p}`); else out[k] = s;
    }
    value = Object.keys(out).length ? out : null;
  } else if (key === 'siteText') {
    const out = {};
    for (const [k, label, max, group] of TEXT_FIELDS) {
      const s = t(v && v[k]);
      if (!s || s === SITE_TEXT_DEFAULTS[k]) continue;
      if (s.length > max) problems.push(`${group}, ${label.toLowerCase()}: at most ${max} letters.`); else out[k] = s;
    }
    value = Object.keys(out).length ? out : null;
  } else if (key === 'siteStats') {
    value = (Array.isArray(v) ? v : []).map((s, i) => {
      const n = Number(s.value);
      if (s.value === '' || !Number.isInteger(n) || n < 0 || n > 999999) problems.push(`Number ${i + 1}: a whole number from 0 to 999999.`);
      if (!/^[+kKmM%x]{0,2}$/.test(String(s.suffix || ''))) problems.push(`Number ${i + 1}: the sign after the number can be + k m % x.`);
      const label = t(s.label);
      if (!label || label.length > 24) problems.push(`Number ${i + 1}: the label needs 1 to 24 letters.`);
      return { value: n, suffix: String(s.suffix || ''), label };
    });
    if (value.length !== 4) problems.push('There must be exactly four numbers.');
  } else if (key === 'sitePictures') {
    value = v && typeof v === 'object' ? v : {};
  } else if (key === 'tools') {
    value = (Array.isArray(v) ? v : []).map(t).filter(Boolean);
    value.forEach((s, i) => { if (s.length > 40) problems.push(`Tool ${i + 1}: at most 40 letters.`); });
    if (value.length > 14) problems.push('Tools: at most 14 names.');
  } else if (key === 'pastEvents') {
    value = (Array.isArray(v) ? v : []).map((e, i) => {
      const row = { id: e.id, key: e.key || null, title: t(e.title), category: t(e.category), date: t(e.date), sortDate: e.sortDate || '', description: t(e.description), images: Array.isArray(e.images) ? e.images : [] };
      const nm = `Event ${i + 1}${row.title ? ` (${row.title})` : ''}`;
      if (row.title.length < 2 || row.title.length > 90) problems.push(`${nm}: the title needs 2 to 90 letters.`);
      if (row.category.length > 30) problems.push(`${nm}: the kind of event can be 30 letters at most.`);
      if (!row.date && !row.sortDate) problems.push(`${nm}: pick a date.`);
      if (row.date.length > 30) problems.push(`${nm}: the date words can be 30 letters at most.`);
      if (row.description.length > 320) problems.push(`${nm}: the description can be 320 letters at most.`);
      if (row.images.length > 8) problems.push(`${nm}: at most 8 photos.`);
      return row;
    });
    if (value.length > 40) problems.push('Past events: at most 40 events.');
  } else if (ROWS[key]) {
    const spec = ROWS[key];
    value = (Array.isArray(v) ? v : []).map((r, i) => {
      const row = {};
      if (key === 'tracks') { row.id = r.id; row.icon = ICONS.includes(r.icon) ? r.icon : 'Code'; row.color = /^#[0-9a-f]{6}$/i.test(r.color || '') ? r.color.toLowerCase() : '#4c8dff'; }
      if (key === 'wins') row.kind = r.kind === 'Project' ? 'Project' : 'Award';
      for (const [f, label, min, max] of spec.f) {
        row[f] = t(r[f]);
        if (row[f].length < min || row[f].length > max) problems.push(`${spec.noun} ${i + 1}: the ${label} ${min ? `needs ${min} to ${max} letters` : `can be ${max} letters at most`}.`);
      }
      if (key === 'wins') {
        row.link = t(r.link);
        if (row.link && !linkOk(row.link)) problems.push(`${spec.noun} ${i + 1}: the link must start with https:// (no spaces).`);
      }
      if (key === 'faq') {
        const l = r.link || {};
        const label = t(l.label);
        const addr = t(l.to || l.href);
        if (label || addr) {
          if (!label || !addr) problems.push(`${spec.noun} ${i + 1}: the button needs its words and its address, or neither.`);
          else if (label.length > 30) problems.push(`${spec.noun} ${i + 1}: the button words can be 30 letters at most.`);
          else if (!linkOk(addr) || (!addr.startsWith('/') && !addr.startsWith('https://'))) problems.push(`${spec.noun} ${i + 1}: the button address starts with / (a page of this site) or https://`);
          else row.link = addr.startsWith('/') ? { label, to: addr } : { label, href: addr };
        }
      }
      return row;
    });
    const [lo, hi] = ROW_LIMITS[key];
    if (value.length < lo) problems.push(`${spec.noun}s: keep at least ${lo}.`);
    if (value.length > hi) problems.push(`${spec.noun}s: at most ${hi}.`);
  }
  return { value: value === null || same(value, SITE_DEFAULTS[key]) ? null : value, problems };
}

// what the dashboard shows: the saved links / words with the code file's values filled in for everything that was not changed
export const mergeSite = (e) => ({
  ...e,
  siteLinks: { ...SITE_DEFAULTS.siteLinks, ...(e.siteLinks || {}) },
  siteText: { ...SITE_DEFAULTS.siteText, ...(e.siteText || {}) },
});
