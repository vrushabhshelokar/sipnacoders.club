// The team and ambassador lists the website shows.
//
//   - Nobody edited a list in the admin dashboard  -> the website uses the lists written in src/data/site.js (TEAM, AMBASSADORS).
//   - The admin saved a list                       -> the saved list wins (the website asks /api/people once per visit).
//
// A person from site.js keeps the photo from the code until the admin uploads a new one (the person's `key` finds it again).
import { useMemo, useSyncExternalStore } from 'react';
import { TEAM, AMBASSADORS } from '../data/site';

const CACHE_KEY = 'scc-people-v1';   // last answer, so a returning visitor sees the right people straight away

export const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 34) || 'x';

const CODE = {
  team: new Map(TEAM.map((m) => [slug(m.name), m])),
  ambassadors: new Map(AMBASSADORS.map((a) => [slug(a.name), a])),
};

const isList = (v) => Array.isArray(v) && v.every((p) => p && typeof p === 'object' && typeof p.name === 'string' && typeof p.id === 'string');

function readCache() {
  try {
    const o = JSON.parse(window.localStorage.getItem(CACHE_KEY) || 'null');
    if (o && typeof o === 'object') return { team: isList(o.team) ? o.team : null, ambassadors: isList(o.ambassadors) ? o.ambassadors : null };
  } catch { /* storage blocked or broken: no cache */ }
  return { team: null, ambassadors: null };
}

let state = typeof window === 'undefined' ? { team: null, ambassadors: null } : readCache();
let started = false;
const listeners = new Set();
const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const getSnapshot = () => state;

function start() {
  if (started || typeof window === 'undefined') return;
  started = true;
  fetch('/api/people', { headers: { Accept: 'application/json' }, cache: 'no-store' })   // the browser never reuses an old answer; Vercel's edge keeps it for a few seconds
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (!d || typeof d !== 'object') return;
      const next = { team: isList(d.team) ? d.team : null, ambassadors: isList(d.ambassadors) ? d.ambassadors : null };
      if (JSON.stringify(next) === JSON.stringify(state)) return;
      state = next;
      try { window.localStorage.setItem(CACHE_KEY, JSON.stringify(next)); } catch { /* fine */ }
      listeners.forEach((fn) => fn());
    })
    .catch(() => { /* offline or no storage on the server: the lists from site.js stay */ });
}

function useStore() {
  start();
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/* ---------- photos ---------- */
function initialsAvatar(name) {
  const letters = String(name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase() || '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 420"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b2a4a"/><stop offset="1" stop-color="#0d1016"/></linearGradient></defs><rect width="400" height="420" fill="url(#g)"/><text x="200" y="235" text-anchor="middle" font-family="system-ui,sans-serif" font-size="120" font-weight="700" fill="#8fb4ff">${letters.replace(/[<>&]/g, '')}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** the picture to show for one saved person (list = 'team' | 'ambassadors') */
export function photoSrc(list, p) {
  if (p.photoData) return p.photoData;                                       // just chosen in the dashboard, not saved yet
  if (p.photo) return `/api/people?photo=${encodeURIComponent(p.id)}&v=${encodeURIComponent(p.photo)}`;
  const code = p.key ? CODE[list].get(p.key) : null;
  return (code && code.img) || initialsAvatar(p.name);
}

/* ---------- saved person -> the shape the page components already use ---------- */
const toTeamMember = (p) => ({
  id: p.id,
  name: p.name,
  role: p.role || '',
  img: photoSrc('team', p),
  status: p.year || '—',
  socials: { linkedin: p.linkedin || '', instagram: p.instagram || '' },
});

const toAmbassador = (p) => ({
  id: p.id,
  name: p.name,
  role: [p.role, p.year].filter(Boolean).join(' · '),
  img: photoSrc('ambassadors', p),
  programs: Array.isArray(p.programs) ? p.programs : [],
  status: p.status === 'past' ? 'past' : 'present',
  years: p.years || '',
});

export function useTeam() {
  const s = useStore();
  return useMemo(() => (s.team ? s.team.map(toTeamMember) : TEAM), [s.team]);
}

export function useAmbassadors() {
  const s = useStore();
  return useMemo(() => (s.ambassadors ? s.ambassadors.map(toAmbassador) : AMBASSADORS), [s.ambassadors]);
}

/* ---------- used by the admin dashboard ---------- */
const PAST = ['past', 'former', 'alumni'];

/** the list written in site.js, in the shape the dashboard edits and saves */
export function seedList(list) {
  const used = new Set();
  const idFor = (prefix, name) => {
    const key = slug(name);
    let id = prefix + key;
    let n = 2;
    while (used.has(id)) id = `${prefix}${key.slice(0, 30)}-${n++}`;
    used.add(id);
    return { id, key };
  };
  if (list === 'team') {
    return TEAM.map((m) => {
      const { id, key } = idFor('t-', m.name);
      return {
        id, key, name: m.name, role: m.role || '', year: m.status && m.status !== '—' ? m.status : '', photo: null,
        linkedin: (m.socials && m.socials.linkedin) || '', instagram: (m.socials && m.socials.instagram) || '',
      };
    });
  }
  return AMBASSADORS.map((a) => {
    const { id, key } = idFor('a-', a.name);
    const [role, ...rest] = String(a.role || '').split(' · ');
    return {
      id, key, name: a.name, role: (role || '').trim(), year: rest.join(' · ').trim(), photo: null,
      programs: [...(a.programs || [])], status: PAST.includes(String(a.status || '').trim().toLowerCase()) ? 'past' : 'present', years: a.years || '',
    };
  });
}

export function newPerson(list) {
  const bytes = new Uint8Array(5);
  (typeof crypto !== 'undefined' && crypto.getRandomValues ? crypto : { getRandomValues: (b) => b.map(() => Math.floor(Math.random() * 256)) }).getRandomValues(bytes);
  const rand = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  if (list === 'team') return { id: `t-${rand}`, key: null, name: '', role: '', year: '', photo: null, linkedin: '', instagram: '' };
  return { id: `a-${rand}`, key: null, name: '', role: '', year: '', photo: null, programs: [], status: 'present', years: '' };
}
