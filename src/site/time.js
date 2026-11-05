// Date helpers. All event times are Indian Standard Time.
import { useEffect, useState } from 'react';

export const TZ = 'Asia/Kolkata';

// '2026-12-12T10:00' (IST) or '2026-12-12' -> Date
export function toDate(s) {
  if (!s) return null;
  let iso = s;
  if (/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(s)) iso = s + ':00+05:30';
  else if (/^\d{4}-\d\d-\d\d$/.test(s)) iso = s + 'T00:00:00+05:30';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

// Upcoming = not finished yet. Dated events first (soonest first), "TBA" events last.
export function getUpcoming(list, now = Date.now()) {
  return list
    .map((e) => ({ ...e, at: toDate(e.date) }))
    .filter((e) => !e.at || e.at.getTime() + (e.durationMins || 0) * 60000 > now)
    .sort((a, b) => (a.at ? a.at.getTime() : Infinity) - (b.at ? b.at.getTime() : Infinity));
}

// Past = dated today or earlier, newest first
export function getPast(list, now = Date.now()) {
  return [...list]
    .filter((e) => {
      const d = toDate(e.sortDate);
      return !d || d.getTime() <= now;
    })
    .sort((a, b) => (b.sortDate || '').localeCompare(a.sortDate || ''));
}

const fmt = (d, o) => d.toLocaleString('en-IN', { timeZone: TZ, ...o });
export const fmtDay = (d) => fmt(d, { day: '2-digit' });
export const fmtMon = (d) => fmt(d, { month: 'short' }).toUpperCase();
export const fmtFull = (d) => fmt(d, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
export const fmtTime = (d) => fmt(d, { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase() + ' IST';

export function durLabel(mins) {
  if (!mins) return '';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h}h ${m}m` : `${h} hr${h > 1 ? 's' : ''}`;
}

export function relative(at, now = Date.now()) {
  if (!at) return 'date TBA';
  const ms = at.getTime() - now;
  if (ms <= 0) return 'live now';
  const days = Math.floor(ms / 864e5);
  if (days >= 2) return `in ${days} days`;
  if (days === 1) return 'tomorrow';
  const hrs = Math.floor(ms / 36e5);
  return hrs >= 1 ? `in ${hrs} hr${hrs > 1 ? 's' : ''}` : 'starting soon';
}

// Ticking countdown to a Date
export function useCountdown(at) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!at) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [at]);
  if (!at) return null;
  let ms = Math.max(0, at.getTime() - now);
  const d = Math.floor(ms / 864e5); ms -= d * 864e5;
  const h = Math.floor(ms / 36e5); ms -= h * 36e5;
  const m = Math.floor(ms / 6e4); ms -= m * 6e4;
  const s = Math.floor(ms / 1000);
  return { d, h, m, s, live: at.getTime() <= now };
}

// "Add to Google Calendar" link
function stamp(d) {
  const p = {};
  new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(d).forEach((x) => { p[x.type] = x.value; });
  return `${p.year}${p.month}${p.day}T${p.hour === '24' ? '00' : p.hour}${p.minute}00`;
}

export function gcalLink(ev) {
  if (!ev.at) return '';
  const end = new Date(ev.at.getTime() + (ev.durationMins || 60) * 60000);
  const details = (ev.description || '') + (ev.registerLink ? `\n\nRegister: ${ev.registerLink}` : '') + '\n\nSipna Coders Club';
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${ev.title} | Sipna Coders Club`,
    dates: `${stamp(ev.at)}/${stamp(end)}`,
    ctz: TZ,
    details,
    location: ev.venue || '',
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

// Short stable "commit hash" from a string
export function hash7(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return ((h >>> 0).toString(16) + '0000000').slice(0, 7);
}

// "SEMINAR" / "Online Workshop" -> "Seminar" / "Online Workshop"
export const normCat = (c = '') => c.toLowerCase().replace(/\b\w/g, (x) => x.toUpperCase());

const CAT_COLORS = { workshop: '#4c8dff', hackathon: '#c792ea', seminar: '#3ddc84', contest: '#f78c6c' };
export function catColor(c = '') {
  const k = c.toLowerCase();
  for (const key of Object.keys(CAT_COLORS)) if (k.includes(key)) return CAT_COLORS[key];
  return k.includes('online') || k.includes('night') ? '#22d3ee' : '#fbbc05';
}
