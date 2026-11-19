// Small pieces shared by the admin tabs (src/pages/admin/*). Nothing here talks to the live site.
import { useEffect, useRef, useState } from 'react';

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* a request to one of the admin endpoints. Never throws: { ok, status, json } (status 0 = could not reach the server). */
export async function api(path, body) {
  try {
    const res = await fetch(path, {
      method: body ? 'POST' : 'GET',
      headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
    let json = {};
    try { json = await res.json(); } catch { /* no JSON in the answer */ }
    return { ok: res.ok && json.ok !== false, status: res.status, json: json || {} };
  } catch {
    return { ok: false, status: 0, json: {} };
  }
}

export const EXPIRED = 'Your login expired. Log in again (open this page in a new tab), then try again.';
export const errorText = (r, fallback = 'Something went wrong. Try again.') => {
  if (r.status === 0) return 'Could not reach the server. Nothing was changed.';
  if (r.status === 401) return EXPIRED;
  if (r.status === 403) return 'View-only access: you cannot change anything.';
  return (r.json && r.json.error) || fallback;
};

/* '2026-11-19T18:30' (Indian time) -> '19 Nov, 6:30 PM' */
export function stampWords(stamp) {
  const m = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)/.exec(String(stamp || ''));
  if (!m) return '';
  const h = Number(m[4]);
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]}, ${h % 12 || 12}:${m[5]} ${h < 12 ? 'AM' : 'PM'}`;
}

/* an ISO moment -> Indian-time words */
export function isoWords(iso) {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return '';
  const d = new Date(ms + 5.5 * 3600e3);
  const h = d.getUTCHours();
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}, ${h % 12 || 12}:${String(d.getUTCMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

/* 'now' as 'YYYY-MM-DDTHH:MM' in Indian time, plus some minutes */
export function istStamp(plusMinutes = 0) {
  return new Date(Date.now() + 5.5 * 3600e3 + plusMinutes * 60e3).toISOString().slice(0, 16);
}

/* compares two values whatever the key order inside objects */
export function stable(v) {
  if (Array.isArray(v)) return `[${v.map(stable).join(',')}]`;
  if (v && typeof v === 'object') return `{${Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${stable(v[k])}`).join(',')}}`;
  return JSON.stringify(v === undefined ? null : v);
}
export const same = (a, b) => stable(a) === stable(b);

export function Toggle({ id, checked, onChange, labelledBy, disabled }) {
  return (
    <button id={id} type="button" role="switch" aria-checked={checked} aria-labelledby={labelledBy} disabled={disabled} className={`ad-toggle ${checked ? 'is-on' : ''}`} onClick={() => onChange(!checked)}>
      <i />
    </button>
  );
}

/* a message line under a form: { type: 'ok' | 'err' | '', text } */
export function Msg({ m }) {
  return <p className="ad-savemsg ac-msg" role="status" data-type={m.type}>{m.text}</p>;
}

/* a block that opens and closes, so a long editor does not push the rest of the tab down */
export function Fold({ title, hint, badge, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useRef(`fold-${Math.random().toString(36).slice(2, 8)}`).current;
  return (
    <div className={`ac-fold ${open ? 'is-open' : ''}`}>
      <button type="button" className="ac-fold-head" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <span className="ac-fold-text">
          <b>{title}{badge ? <em>{badge}</em> : null}</b>
          {hint && <small>{hint}</small>}
        </span>
        <span className="ac-fold-chev" aria-hidden="true" />
      </button>
      {open && <div id={id} className="ac-fold-body">{children}</div>}
    </div>
  );
}

/* the page that holds only this tab's own data: loads once when the tab opens */
export function useLoad(loader, deps = []) {
  const [state, setState] = useState({ loading: true, error: '', data: null });
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);
  const run = async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    const r = await loader();
    if (!alive.current) return null;
    setState(r.ok ? { loading: false, error: '', data: r.json } : { loading: false, error: errorText(r, 'Could not load this. Try again.'), data: null });
    return r;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { run(); }, deps);
  return [state, run];
}

/* names for the settings, used in the history and in the schedule */
export const KEY_LABELS = {
  vibeRegistration: 'Vibe-A-Thon registration', vibePopup: 'Vibe-A-Thon popup', upcomingShow: 'Upcoming card and menu number', flowShow: 'Event Flow section',
  hideAfter: 'Hide card and popup after', eventStart: 'Event start', currentRound: 'Current round', roundEnd1: 'Round 1 ends', roundEnd2: 'Round 2 ends',
  psShow: 'Problem Statement section', psUnlockNow: 'PDF buttons open now', psReleaseAt: 'PDF release time', psPdf: 'PDF link', psCount: 'Number of problem statements',
  codeClashRegistration: 'Code Clash registration', codeClashPopup: 'Code Clash popup', codeClashSection: 'Code Clash block on Home',
  banner: 'Announcement banner', timeline: 'Timeline rows', details: 'Detail boxes',
};

/* one saved value in plain words */
export function describeValue(key, v) {
  if (v === undefined || v === null || v === '') return 'the code file value';
  if (typeof v === 'boolean') return v ? 'On' : 'Off';
  if (key === 'banner' && typeof v === 'object') return `${v.on ? 'shown' : 'hidden'}${v.text ? `: "${String(v.text).slice(0, 40)}${String(v.text).length > 40 ? '...' : ''}"` : ''}`;
  if (key === 'timeline' && Array.isArray(v)) return `${v.length} rows`;
  if (key === 'details' && typeof v === 'object') { const n = Object.values(v).filter(Boolean).length; return `${n} filled box${n === 1 ? '' : 'es'}`; }
  if (/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(String(v))) return stampWords(v);
  if (key === 'currentRound') return `Round ${v}`;
  return String(v).length > 50 ? `${String(v).slice(0, 50)}...` : String(v);
}
