import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './AdminAnalytics.css';
import { VIBEATHON_POPUP } from '../site/eventSwitches';
import * as C from '../site/upcomingConfig';
import { PS } from '../data/problemStatement';
import './admin/AdminCenter.css';
import { EVENT_SCHEDULE } from '../data/vibeathonData';
import { istWords } from '../site/psRelease';
import { same } from './admin/kit';
import AdminAutomation from './admin/AdminAutomation';
import AdminContent from './admin/AdminContent';
import AdminEventContent from './admin/AdminEventContent';
import AdminUpcoming, { pruneDetails } from './admin/AdminUpcoming';
import { SITE_DEFAULTS, SITE_KEYS, mergeSite, prepareSite } from './admin/siteKeys';
import './admin/AdminSite.css';
import { HoursChart } from './admin/AdminOverviewExtra';

/* ---------------------------------------------------------------------------------------------
   Private admin dashboard (/admin/visitor-analytics)
   Five tabs: Overview, Upcoming event, Events, Site content, Automation (src/pages/admin/*).
   Overview is also open to the view-only login. Everything else is admin only.
   --------------------------------------------------------------------------------------------- */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayLabel = (iso) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;
const fmt = (n) => (typeof n === 'number' ? n.toLocaleString('en-IN') : '—');
const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

const PAGE_NAMES = {
  '/': 'Home', '/upcoming': 'Upcoming', '/events': 'Events', '/team': 'Team', '/connect': 'Connect', '/register': 'Register', '/other': 'Other pages',
};
const SOURCE_NAMES = {
  direct: 'Direct or unknown', instagram: 'Instagram', whatsapp: 'WhatsApp', linkedin: 'LinkedIn', facebook: 'Facebook', google: 'Google',
  x: 'X (Twitter)', youtube: 'YouTube', telegram: 'Telegram', discord: 'Discord', reddit: 'Reddit', unstop: 'Unstop', hackerrank: 'HackerRank', search: 'Other search',
};
const DEVICE_NAMES = { mobile: 'Phone', desktop: 'Laptop / desktop', tablet: 'Tablet' };
const CLICK_NAMES = {
  'register-vibeathon': 'Vibe-A-Thon register button', membership: 'Membership form button',
};

// what the code files say today. The dashboard shows these until an admin changes something.
const TL_DEFAULT = (Array.isArray(EVENT_SCHEDULE) ? EVENT_SCHEDULE : []).slice(0, 12).map((r) => ({
  id: String(r.id), phase: r.phase || '', milestone: r.milestone || '', time: r.time || '', date: r.date || '', desc: r.desc || '',
  ...(r.accent ? { accent: String(r.accent).toLowerCase() } : {}), ...(r.icon ? { icon: r.icon } : {}),
}));
const DETAIL_TYPE = ['hackathon', 'workshop', 'online'].includes(C.EVENT_TYPE) ? C.EVENT_TYPE : 'hackathon';
const DETAIL_DEFAULT = Object.fromEntries(Object.entries((C.DETAILS && C.DETAILS[DETAIL_TYPE]) || {}).map(([k, v]) => [k, String(v || '')]));
const PS_STAMP = /^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(String(PS.releaseAt || '')) ? String(PS.releaseAt).slice(0, 16) : '';
const FILE_DEFAULTS = {
  // Vibe-A-Thon
  vibeRegistration: true,
  vibePopup: VIBEATHON_POPUP,
  upcomingShow: !!C.SHOW_UPCOMING,
  flowShow: !!C.SHOW_FLOW,
  round2Details: false,   // false = every Round 2 block says "Publishing soon"
  hideAfter: C.HIDE_AFTER || '',
  eventStart: C.EVENT_START || '',
  currentRound: Math.round(Number(C.CURRENT_ROUND)) === 2 ? 2 : 1,
  roundEnd1: (C.ROUND_END && C.ROUND_END[1]) || '',
  roundEnd2: (C.ROUND_END && C.ROUND_END[2]) || '',
  // Vibe-A-Thon: problem statements
  psShow: true,
  psUnlockNow: !!PS.unlockNow,
  psReleaseAt: PS_STAMP,
  psPdf: PS.pdf || '',
  psCount: Number(PS.count) || 10,
  psAlertText: String(PS.alertText || ''),
  psAlertText2: String(PS.alertText2 || ''),
  // longer text (Events tab: timeline + detail boxes, Site content tab: banner)
  banner: { on: false, text: '', link: '', linkText: '', until: '', tone: 'info' },
  timeline: TL_DEFAULT,
  details: DETAIL_DEFAULT,
  // Upcoming event tab (eventStart, hideAfter, upcomingShow and vibePopup above also belong to it)
  eventType: DETAIL_TYPE,
  eventName: String(C.EVENT_NAME || '').trim(),
  eventLink: '',
  eventDetails: {},
  eventPoints: [],
  eventBanners: [],
  popupTheme: Math.round(Number(C.FORCE_DESIGN)) || 0,
  popupDelay: Math.round((Number(C.POPUP_DELAY) || 0) / 1000),
  popupLogo: null,
  popupDesc: '',
  // Site content tab: links, numbers, words, pictures, lists and past events (admin/siteKeys.js)
  ...SITE_DEFAULTS,
};
const SETTING_KEYS = Object.keys(FILE_DEFAULTS);
const OBJECT_KEYS = ['banner', 'timeline', 'details', 'eventDetails', 'eventPoints', 'eventBanners', 'popupLogo', ...SITE_KEYS];   // saved as a whole; equal to the code file = "not changed"
const UPCOMING_KEYS = ['eventType', 'eventName', 'eventLink', 'eventStart', 'hideAfter', 'upcomingShow', 'vibePopup', 'eventDetails', 'details', 'eventPoints', 'eventBanners', 'popupTheme', 'popupDelay', 'popupLogo', 'popupDesc'];   // the Upcoming event tab
const BANNER_KEYS = ['banner', ...SITE_KEYS];                           // these belong to the Site content tab, the rest of the settings to the Events tab

const TABS = [['overview', 'Overview'], ['upcoming', 'Upcoming event'], ['events', 'Events'], ['content', 'Site content'], ['automation', 'Automation']];
const VIEWER_TABS = ['overview'];
const tabFromHash = () => {
  try { const h = window.location.hash.replace('#', ''); return TABS.some(([id]) => id === h) ? h : 'overview'; } catch { return 'overview'; }
};

// same rule as the server (api-lib/shared.js): a file in the public folder (/name.pdf) or a full https:// link
const PDF_LINK_OK = (v) => /^(\/(?!\/)[^\s"'<>\\]+|https:\/\/[^\s"'<>\\]+)$/.test(v) && v.length <= 300 && !(v.startsWith('/') && v.includes('..'));

/* The controls, grouped by event. type: 'switch' (default) | 'date' | 'select' | 'text' | 'number' */
const SECTIONS = [
  {
    id: 'dates',
    title: 'Date and time',
    tag: 'Vibe-A-Thon only',
    link: { href: '/upcoming', text: 'Open the Vibe-A-Thon page' },
    blocks: [
      {
        title: 'Vibe-A-Thon dates and times (Indian time)',
        hint: 'Leave a date empty to use the one written in the code files.',
        items: [
          { key: 'eventStart', type: 'date', label: 'Event start', hint: 'The big card counts down to this moment. The same box is in the Upcoming event tab.' },
          { key: 'psReleaseAt', type: 'date', label: 'Problem statement PDF release time', hint: 'Only the date shown in the Timeline row. It does not open or lock anything: use the "Problem statement buttons" switch (Problem statements block below) for that.' },
          { key: 'currentRound', type: 'select', label: 'Current round', options: [[1, 'Round 1'], [2, 'Round 2']] },
          { key: 'roundEnd1', type: 'date', label: 'Round 1 ends' },
          { key: 'roundEnd2', type: 'date', label: 'Round 2 ends' },
        ],
      },
      {
        title: 'Alert strip (amber strip at the top of the Vibe-A-Thon page)',
        hint: 'To change the date, edit it in point 1 and press Save changes. Point 1 empty = the usual words. Point 2 is optional: it is shown right after point 1 on the same moving line (empty = only point 1). The strip goes away once the problem statement buttons are switched on.',
        items: [
          { key: 'psAlertText', type: 'line', max: 120, label: 'Point 1', placeholder: 'Problem Statement tentative publish on 21 Nov, IST', wide: true, hint: 'At most 120 letters.' },
          { key: 'psAlertText2', type: 'line', max: 120, label: 'Point 2 (new)', placeholder: 'Optional. Shown right after point 1.', wide: true, hint: 'At most 120 letters. Shown right after point 1, on the same moving line. Empty = only point 1.' },
        ],
      },
    ],
  },
  {
    id: 'vibe',
    title: 'Vibe-A-Thon',
    tag: 'Upcoming event',
    link: { href: '/upcoming', text: 'Open the Vibe-A-Thon page' },
    blocks: [
      {
        title: 'Registration',
        items: [
          { key: 'vibeRegistration', label: 'Vibe-A-Thon registration', on: 'Open', off: 'Closed', hint: 'Closed: the Register page shows "Registrations are closed" instead of the form.' },
        ],
      },
      {
        title: 'Event flow',
        hint: 'The card, popup, name, banner, date and on / off switches are in the Upcoming event tab. This block is the hackathon-only flow.',
        items: [
          { key: 'flowShow', label: 'Two-Round Event Flow section', on: 'Shown', off: 'Hidden', hint: 'The "How it works" block under the Upcoming card.' },
        ],
      },
      {
        title: 'Round 2',
        hint: 'Round 2 is shown as "Publishing soon" until you switch its details on. The change is live as soon as you press Save changes.',
        items: [
          { key: 'round2Details', label: 'Round 2 details', on: 'Shown', off: 'Publishing soon', hint: 'Off: the Round 2 fee box, the Round 2 row of the timeline and the Round 2 card of the event flow show only "Publishing soon". On: the full Round 2 details (fee, payment window, what is included, the 18-hour plan) appear in their place, and the rulebook and journey add the Round 2 fee lines.' },
        ],
      },
      {
        title: 'Problem statements (Round 1 briefing)',
        hint: 'The "Problem Statement Release" section with the View PS and Download buttons. The buttons stay locked until you switch them on below (no schedule).',
        items: [
          { key: 'psShow', label: 'Problem Statement Release section', on: 'Shown', off: 'Hidden', hint: 'Hides the whole section on the Vibe-A-Thon page.' },
          { key: 'psUnlockNow', label: 'Problem statement buttons (View PS and Download)', on: 'Open', off: 'Locked', hint: 'Locked until you switch this on, and it does not follow any schedule. Switch on, then press Save changes: View PS then shows the 5 domains. Download uses the PDF link below (empty = the Round 1 PDF already added to the site).' },
          { key: 'psPdf', type: 'text', label: 'PDF link', placeholder: 'Empty = the Round 1 PDF added to the site', wide: true, hint: 'Leave this empty to use the Round 1 PDF that is already in the public folder. Only fill it to use another file (a path starting with /, or an https:// link). Visitors never see this link while the buttons are Locked. A link to another website opens in a new tab and cannot be saved with the Download button. The saved file is always named VIBEATHON R1 PS.pdf.' },
          { key: 'psCount', type: 'number', label: 'How many problem statements', min: 1, max: 99 },
        ],
      },
    ],
  },
];

function SwitchRow({ it, view, overrides, edit }) {
  const on = !!view[it.key];
  const edited = it.key in overrides;
  return (
    <div className="ad-row">
      <div className="ad-row-text">
        <span id={`lbl-${it.key}`} className="ad-row-label">{it.label}{edited && <em>edited here</em>}</span>
        {it.hint && <span className="ad-row-hint">{it.hint}</span>}
      </div>
      <div className="ad-row-ctl">
        <span className={`ad-state ${on ? 'is-on' : ''}`}>{on ? it.on : it.off}</span>
        <Toggle id={`sw-${it.key}`} labelledBy={`lbl-${it.key}`} checked={on} onChange={(v) => edit(it.key, v)} />
      </div>
    </div>
  );
}

function FieldInput({ it, view, overrides, edit }) {
  const edited = it.key in overrides;
  const id = `fld-${it.key}`;
  const value = view[it.key] === undefined || view[it.key] === null ? '' : view[it.key];
  let input;
  if (it.type === 'select') {
    input = (
      <select id={id} value={value} onChange={(e) => edit(it.key, Number(e.target.value))}>
        {it.options.map(([v, text]) => <option key={v} value={v}>{text}</option>)}
      </select>
    );
  } else if (it.type === 'date') {
    input = <input id={id} type="datetime-local" value={value} onChange={(e) => edit(it.key, e.target.value)} />;
  } else if (it.type === 'line') {
    input = <input id={id} type="text" maxLength={it.max || 120} autoComplete="off" placeholder={it.placeholder || ''} value={value} onChange={(e) => edit(it.key, e.target.value)} />;
  } else if (it.type === 'number') {
    input = <input id={id} type="number" inputMode="numeric" min={it.min} max={it.max} step="1" value={value} onChange={(e) => edit(it.key, e.target.value === '' ? '' : Number(e.target.value))} />;
  } else {
    input = <input id={id} type="text" inputMode="url" autoComplete="off" spellCheck="false" placeholder={it.placeholder || ''} value={value} onChange={(e) => edit(it.key, e.target.value)} />;
  }
  return (
    <div className={`ad-field ${it.wide ? 'ad-field-wide' : ''}`}>
      <label htmlFor={id}>{it.label}{edited && <em>edited here</em>}</label>
      {input}
      {it.hint && <span className="ad-field-hint">{it.hint}</span>}
    </div>
  );
}

/* ------------------------------------------------ small pieces ------------------------------------------------ */

function RangeToggle({ value, onChange }) {
  return (
    <div className="ad-range" role="radiogroup" aria-label="Date range">
      {[7, 30].map((d) => (
        <button key={d} type="button" role="radio" aria-checked={value === d} className={value === d ? 'is-on' : ''} onClick={() => onChange(d)}>
          Last {d} days
        </button>
      ))}
    </div>
  );
}

function Kpi({ label, value, sub }) {
  return (
    <div className="s-analytics-card ad-kpi">
      <div className="ad-kpi-label">{label}</div>
      <div className="ad-kpi-value">{fmt(value)}</div>
      <div className="ad-kpi-sub">{sub}</div>
    </div>
  );
}

// rows: [{ label, value }]. The bar is scaled to `scale` (default: the biggest row). Value and share sit at the tip.
function BarList({ rows, total, scale, empty = 'No data in this range yet.' }) {
  if (!rows.length) return <p className="ad-empty">{empty}</p>;
  const max = scale || Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="ad-bars">
      {rows.map((r) => (
        <li key={r.label} title={`${r.label}: ${fmt(r.value)}${total ? ` (${pct(r.value, total)}%)` : ''}`}>
          <span className="ad-bars-label">{r.label}</span>
          <span className="ad-bars-track"><i style={{ width: `${Math.max(2, Math.min(100, (r.value / max) * 100))}%` }} /></span>
          <span className="ad-bars-val">{fmt(r.value)}{total ? <small>{pct(r.value, total)}%</small> : null}</span>
        </li>
      ))}
    </ul>
  );
}

function Toggle({ id, checked, onChange, labelledBy }) {
  return (
    <button id={id} type="button" role="switch" aria-checked={checked} aria-labelledby={labelledBy} className={`ad-toggle ${checked ? 'is-on' : ''}`} onClick={() => onChange(!checked)}>
      <i />
    </button>
  );
}

/* a clean top value and step for the y axis: at most 4 steps */
function axisTicks(maxVal) {
  const raw = Math.max(4, maxVal);
  const mag = 10 ** Math.floor(Math.log10(raw / 4));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => raw / s <= 4);
  const top = Math.ceil(raw / step) * step;
  const ticks = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);
  return { top, ticks };
}

// bars = visits per day, line = unique visitors per day. Hover or arrow keys read one day. A table view sits below.
function DailyChart({ days }) {
  const wrap = useRef(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return undefined;
    const measure = () => setWidth(Math.max(280, Math.round(el.getBoundingClientRect().width)));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const H = 230;
  const m = { l: 40, r: 12, t: 22, b: 28 };
  const innerW = width - m.l - m.r;
  const innerH = H - m.t - m.b;
  const n = days.length;
  const band = innerW / n;
  const barW = Math.max(3, Math.min(24, band - 2));
  const maxVal = Math.max(...days.map((d) => Math.max(d.visits, d.unique)), 0);
  const { top, ticks } = axisTicks(maxVal);
  const y = (v) => m.t + innerH - (v / top) * innerH;
  const cx = (i) => m.l + band * i + band / 2;
  const base = m.t + innerH;
  const peak = days.reduce((best, d, i) => (d.visits > days[best].visits ? i : best), 0);
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(innerW / 58))));

  const barPath = (i, v) => {
    const h = base - y(v);
    if (h <= 0) return '';
    const r = Math.min(4, barW / 2, h);
    const x0 = cx(i) - barW / 2;
    const x1 = x0 + barW;
    const yt = y(v);
    return `M${x0},${base}V${yt + r}Q${x0},${yt} ${x0 + r},${yt}H${x1 - r}Q${x1},${yt} ${x1},${yt + r}V${base}Z`;
  };

  const line = days.map((d, i) => `${i ? 'L' : 'M'}${cx(i)},${y(d.unique)}`).join('');
  const last = days[n - 1];
  const hd = hover === null ? null : days[hover];
  const tipLeft = hover === null ? 0 : Math.min(width - 80, Math.max(80, cx(hover)));

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const i = Math.floor((e.clientX - rect.left - m.l) / band);
    setHover(Math.max(0, Math.min(n - 1, i)));
  };
  const onKey = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); setHover((h) => Math.max(0, (h === null ? n : h) - 1)); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); setHover((h) => Math.min(n - 1, (h === null ? -1 : h) + 1)); }
    else if (e.key === 'Escape') setHover(null);
  };

  const total = days.reduce((s, d) => s + d.visits, 0);

  return (
    <div className="ad-chart">
      <div className="ad-legend" aria-hidden="true">
        <span><i className="ad-key-bar" /> Visits</span>
        <span><i className="ad-key-line" /> Unique visitors</span>
      </div>
      <div className="ad-chart-wrap" ref={wrap}>
        <svg
          width={width}
          height={H}
          role="img"
          tabIndex={0}
          aria-label={`Daily visits for the last ${n} days. ${fmt(total)} visits in total. Busiest day ${dayLabel(days[peak].date)} with ${days[peak].visits}. Use the left and right arrow keys to read each day.`}
          onKeyDown={onKey}
          onBlur={() => setHover(null)}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={m.l} x2={width - m.r} y1={y(t)} y2={y(t)} className={t === 0 ? 'ad-axis' : 'ad-grid'} />
              <text x={m.l - 8} y={y(t) + 4} textAnchor="end" className="ad-tick">{t >= 10000 ? `${t / 1000}K` : t}</text>
            </g>
          ))}
          {days.map((d, i) => ((n - 1 - i) % labelEvery === 0 ? (
            <text key={d.date} x={cx(i)} y={H - 8} textAnchor="middle" className="ad-tick">{dayLabel(d.date)}</text>
          ) : null))}
          {days.map((d, i) => (
            <path key={d.date} d={barPath(i, d.visits)} className={`ad-bar ${hover === i ? 'is-hot' : ''}`} />
          ))}
          {hover !== null && <line x1={cx(hover)} x2={cx(hover)} y1={m.t} y2={base} className="ad-cross" />}
          <path d={line} className="ad-line" />
          <circle cx={cx(n - 1)} cy={y(last.unique)} r="4" className="ad-dot" />
          {days[peak].visits > 0 && (
            <text x={cx(peak)} y={y(days[peak].visits) - 7} textAnchor="middle" className="ad-peak">{days[peak].visits}</text>
          )}
        </svg>
        {hd && (
          <div className="ad-tip" style={{ left: tipLeft }} role="status">
            <div className="ad-tip-date">{dayLabel(hd.date)}</div>
            <div><i className="ad-key-bar" /> <b>{fmt(hd.visits)}</b> visits</div>
            <div><i className="ad-key-line" /> <b>{fmt(hd.unique)}</b> unique</div>
          </div>
        )}
      </div>
      <details className="ad-table-view">
        <summary>View as table</summary>
        <table>
          <thead><tr><th>Day</th><th>Visits</th><th>Unique visitors</th></tr></thead>
          <tbody>
            {[...days].reverse().map((d) => (
              <tr key={d.date}><td>{dayLabel(d.date)}</td><td>{fmt(d.visits)}</td><td>{fmt(d.unique)}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

/* sum the daily objects for the chosen range */
function aggregate(days) {
  const sum = { visits: 0, newVisitors: 0, returning: 0, pages: {}, devices: {}, sources: {}, clicks: {}, hours: Array(24).fill(0) };
  for (const d of days) {
    sum.visits += d.visits;
    sum.newVisitors += d.newVisitors || 0;
    sum.returning += d.returning || 0;
    for (const [h, v] of Object.entries(d.hours || {})) { const i = Number(h); if (i >= 0 && i < 24) sum.hours[i] += Number(v) || 0; }
    for (const bucket of ['pages', 'devices', 'sources', 'clicks']) {
      for (const [k, v] of Object.entries(d[bucket] || {})) sum[bucket][k] = (sum[bucket][k] || 0) + v;
    }
  }
  return sum;
}

const toRows = (obj, names, limit = 8) => Object.entries(obj)
  .map(([k, v]) => ({ label: names[k] || k, value: v }))
  .sort((a, b) => b.value - a.value)
  .slice(0, limit);

/* ------------------------------------------------ the page ------------------------------------------------ */

export default function AdminAnalytics() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [range, setRange] = useState(7);
  const [role, setRole] = useState('admin');         // 'admin' | 'viewer' (view-only login)
  const [tab, setTab] = useState(tabFromHash);

  const [overrides, setOverrides] = useState({});   // what the admin saved (missing key = the code file decides)
  const [draft, setDraft] = useState(null);         // unsaved edits
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState({ type: '', text: '' });
  const [confirmReset, setConfirmReset] = useState(false);

  const effective = useMemo(() => mergeSite({ ...FILE_DEFAULTS, ...overrides }), [overrides]);
  const view = draft || effective;
  const changedKeys = draft ? SETTING_KEYS.filter((k) => !same(draft[k], effective[k])) : [];
  const dirty = changedKeys.length > 0;
  const changedTabs = [...new Set(changedKeys.map((k) => (UPCOMING_KEYS.includes(k) ? 'upcoming' : BANNER_KEYS.includes(k) ? 'content' : 'events')))];

  const loadStats = useCallback(async () => {
    setRefreshing(true);
    setStatsError('');
    try {
      const res = await fetch('/api/admin/analytics', { method: 'GET', headers: { Accept: 'application/json' } });
      if (res.status === 401) {
        setAuthenticated(false);
        return false;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setOverrides(json.settings || {});
      setRole(json.role === 'viewer' ? 'viewer' : 'admin');
      setAuthenticated(true);
      return true;
    } catch {
      setStatsError('Failed to fetch updated statistics.');
      return false;
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Check existing session on mount
  useEffect(() => {
    let alive = true;
    (async () => {
      await loadStats();
      if (alive) setCheckingAuth(false);
    })();
    return () => { alive = false; };
  }, [loadStats]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    setSubmitting(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ action: 'login', password: password.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.authenticated) {
        setPassword('');
        setAuthenticated(true);
        loadStats();
      } else {
        setLoginError(json.error || 'Invalid admin credentials.');
      }
    } catch {
      setLoginError('Authentication service unreachable.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
    } catch {
      // Ignore
    } finally {
      setAuthenticated(false);
      setData(null);
      setDraft(null);
    }
  };

  const edit = (key, value) => {
    setSaveMsg({ type: '', text: '' });
    setConfirmReset(false);
    setDraft((d) => ({ ...(d || effective), [key]: value }));
  };

  const postSettings = async (patch) => {
    setSaving(true);
    setSaveMsg({ type: '', text: '' });
    try {
      const res = await fetch('/api/admin/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ action: 'save-settings', settings: patch }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) { setAuthenticated(false); return false; }
      if (!res.ok || !json.ok) {
        setSaveMsg({ type: 'err', text: json.error || 'Could not save. Try again.' });
        return false;
      }
      setOverrides(json.settings || {});
      setDraft(null);
      return true;
    } catch {
      setSaveMsg({ type: 'err', text: 'Could not reach the server. Nothing was saved.' });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (!draft) return;
    const patch = {};
    const siteProblems = [];
    for (const k of SETTING_KEYS) {
      if (same(draft[k], effective[k])) continue;
      if (SITE_KEYS.includes(k)) { const r = prepareSite(k, draft[k]); siteProblems.push(...r.problems); patch[k] = r.value; continue; }
      let v = typeof draft[k] === 'string' ? draft[k].trim() : draft[k];
      if (k === 'banner') v = { ...v, text: v.text.trim(), link: v.link.trim(), linkText: v.linkText.trim() };
      if (k === 'eventDetails') v = pruneDetails(v);
      if (k === 'eventPoints') v = v.map((p) => ({ t: String(p.t || '').trim(), d: String(p.d || '').trim() })).filter((p) => p.t);
      if (k === 'eventName') { patch[k] = v === FILE_DEFAULTS.eventName ? null : v; continue; }   // an emptied name is a real choice (no name yet)
      if (OBJECT_KEYS.includes(k)) patch[k] = same(v, FILE_DEFAULTS[k]) ? null : v;   // the same as the code file = go back to it
      else patch[k] = v === '' ? null : v;                                              // an emptied date or link goes back to the code file's value
    }
    if (!Object.keys(patch).length) return;
    const problems = [...siteProblems];
    if (typeof patch.psPdf === 'string' && !PDF_LINK_OK(patch.psPdf)) problems.push('PDF link: start it with / (a file in the public folder) or https://, and use no spaces.');
    if (typeof patch.psCount === 'number' && !(Number.isInteger(patch.psCount) && patch.psCount >= 1 && patch.psCount <= 99)) problems.push('How many problem statements: a whole number from 1 to 99.');
    if (patch.banner) {
      if (patch.banner.on && !patch.banner.text) problems.push('Banner: write what it says, or switch it off.');
      if (patch.banner.link && !PDF_LINK_OK(patch.banner.link)) problems.push('Banner link: start it with / (a page of this site) or https://, and use no spaces.');
    }
    if (patch.timeline) {
      patch.timeline.forEach((r, i) => {
        const word = (v) => String(v || '').trim();
        if (!word(r.milestone)) problems.push(`Timeline row ${i + 1}: needs a milestone name.`);
        else if (word(r.milestone).length > 80 || word(r.phase).length > 24 || word(r.time).length > 40 || word(r.date).length > 40 || word(r.desc).length > 260) problems.push(`Timeline row ${i + 1}: one of the texts is too long.`);
      });
    }
    if (typeof patch.eventName === 'string' && patch.eventName.length > 60) problems.push('Event name: at most 60 letters.');
    if (typeof patch.eventLink === 'string' && !PDF_LINK_OK(patch.eventLink)) problems.push('Register button link: start it with / (a page of this site) or https://, and use no spaces.');
    if (typeof patch.popupDesc === 'string' && patch.popupDesc.length > 120) problems.push('Popup words: at most 120 letters.');
    if (typeof patch.psAlertText === 'string' && patch.psAlertText.length > 120) problems.push('Alert strip point 1: at most 120 letters.');
    if (typeof patch.psAlertText2 === 'string' && patch.psAlertText2.length > 120) problems.push('Alert strip point 2: at most 120 letters.');
    if (typeof patch.popupTheme === 'number' && !(Number.isInteger(patch.popupTheme) && patch.popupTheme >= 0 && patch.popupTheme <= 21)) problems.push('Popup design number: a whole number from 0 to 21.');
    if (typeof patch.popupDelay === 'number' && !(Number.isInteger(patch.popupDelay) && patch.popupDelay >= 0 && patch.popupDelay <= 120)) problems.push('Popup delay: a whole number of seconds from 0 to 120.');
    if (patch.eventDetails) Object.values(patch.eventDetails).forEach((d) => Object.entries(d).forEach(([k, val]) => { if (String(val || '').trim().length > 80) problems.push(`${k}: at most 80 letters.`); }));
    if (patch.eventPoints) patch.eventPoints.forEach((p, i) => { if (p.t.length > 60 || p.d.length > 160) problems.push(`Description point ${i + 1}: the text is too long.`); });
    if (problems.length) { setSaveMsg({ type: 'err', text: problems.join(' ') }); return; }
    if (await postSettings(patch)) {
      setSaveMsg({ type: 'ok', text: 'Saved. The site picks it up within about a minute (people already on a page see it on their next page load).' });
    }
  };

  const resetAll = async () => {
    if (!confirmReset) { setConfirmReset(true); return; }
    setConfirmReset(false);
    const patch = Object.fromEntries(SETTING_KEYS.map((k) => [k, null]));
    if (await postSettings(patch)) {
      setSaveMsg({ type: 'ok', text: 'Everything is back to the values written in the code files.' });
    }
  };

  const shownTabs = role === 'admin' ? TABS : TABS.filter(([id]) => VIEWER_TABS.includes(id));
  const active = shownTabs.some(([id]) => id === tab) ? tab : 'overview';
  const selectTab = (id) => {
    setTab(id);
    try { window.history.replaceState(null, '', `#${id}`); } catch { /* the address bar stays as it is */ }
  };
  const onTabKey = (e) => {
    const ids = shownTabs.map(([id]) => id);
    const i = ids.indexOf(active);
    const next = e.key === 'ArrowRight' ? ids[(i + 1) % ids.length] : e.key === 'ArrowLeft' ? ids[(i - 1 + ids.length) % ids.length] : e.key === 'Home' ? ids[0] : e.key === 'End' ? ids[ids.length - 1] : null;
    if (!next) return;
    e.preventDefault();
    selectTab(next);
    const el = document.getElementById(`ac-tab-${next}`);
    if (el) el.focus();
  };
  useEffect(() => {
    const on = () => setTab(tabFromHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  // "Saved." goes away by itself
  useEffect(() => {
    if (saveMsg.type !== 'ok') return undefined;
    const id = setTimeout(() => setSaveMsg({ type: '', text: '' }), 9000);
    return () => clearTimeout(id);
  }, [saveMsg]);
  const discard = () => { setDraft(null); setSaveMsg({ type: '', text: '' }); };
  // the Problem Statement row of the Timeline shows the PDF release time once the dashboard changed it
  const psFollows = 'psReleaseAt' in overrides || view.psReleaseAt !== FILE_DEFAULTS.psReleaseAt;
  const psWords = istWords(view.psReleaseAt) || { date: '', time: '' };

  const days = useMemo(() => (data && data.days ? data.days.slice(-range) : []), [data, range]);
  const agg = useMemo(() => aggregate(days), [days]);
  const pageTotal = Object.values(agg.pages).reduce((s, v) => s + v, 0);
  const deviceTotal = Object.values(agg.devices).reduce((s, v) => s + v, 0);
  const sourceTotal = Object.values(agg.sources).reduce((s, v) => s + v, 0);
  const registerClicks = agg.clicks['register-vibeathon'] || 0;
  const visitorKinds = agg.newVisitors + agg.returning;
  const registerViews = agg.pages['/register'] || 0;
  const configured = !data || data.configured !== false;

  const formatTimestamp = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return iso;
    }
  };

  if (checkingAuth) {
    return (
      <div className="s-container s-analytics-wrap">
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
          Checking authorization...
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="s-container s-analytics-wrap">
        <div className="s-login-card">
          <div className="s-analytics-tag">RESTRICTED</div>
          <h2>ADMIN ACCESS</h2>
          <p>Enter the admin secret key to open the dashboard.</p>
          <form className="s-login-form" onSubmit={handleLogin}>
            <input
              type="password"
              className="s-login-input"
              placeholder="Admin Secret Key"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              autoFocus
              required
            />
            <button type="submit" className="s-btn s-btn-light" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? 'Authenticating...' : 'Unlock Dashboard'}
            </button>
            {loginError && <div className="s-login-error">{loginError}</div>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="s-container s-analytics-wrap ad">
      <div className="s-analytics-header ad-head">
        <div>
          <div className="s-analytics-tag">PRIVATE DASHBOARD</div>
          <h1 className="s-analytics-title">ADMIN DASHBOARD</h1>
          <p className="s-analytics-sub">{role === 'viewer' ? 'View-only access: you can look at the Overview (visitor numbers), but nothing can be changed and no names or contact details are shown.' : 'Visitors and site controls in one place. Visitor counts are anonymous and stored in Upstash Redis.'}</p>
        </div>
        <div className="ad-head-actions">
          <span className="ad-updated">Updated <b>{formatTimestamp(data && data.updatedAt)}</b></span>
          <button type="button" className="s-btn s-btn-light s-btn-refresh" onClick={loadStats} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <button type="button" className="s-btn s-btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {statsError && <div className="ad-alert ad-alert-err">{statsError}</div>}
      {!configured && (
        <div className="ad-alert ad-alert-err">
          Redis is not connected on this server, so there is no data and the switches cannot be saved. Add the Upstash variables (UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN) and redeploy.
        </div>
      )}

      {configured && data && (
        <div className={refreshing ? 'ad-body is-loading' : 'ad-body'}>
          <div className="ac-tabs" role="tablist" aria-label="Dashboard sections" onKeyDown={onTabKey}>
            {shownTabs.map(([id, label]) => (
              <button
                key={id}
                id={`ac-tab-${id}`}
                type="button"
                role="tab"
                aria-selected={active === id}
                aria-controls={`ac-panel-${id}`}
                tabIndex={active === id ? 0 : -1}
                className="ac-tab-btn"
                onClick={() => selectTab(id)}
              >
                {label}
                {changedTabs.includes(id) && <span className="ac-tab-dot" title="Unsaved changes" aria-label="unsaved changes" />}
                {id === 'automation' && role === 'admin' && data.pending > 0 && <span className="ac-tab-badge" title="Changes waiting for their time" aria-label={`${data.pending} scheduled`}>{data.pending}</span>}
              </button>
            ))}
          </div>

          {(dirty || saveMsg.text) && (
            <div className="ac-dirty" data-type={saveMsg.type} role="status">
              <div className="ac-dirty-text">
                {saveMsg.text || 'You have unsaved changes.'}
                {dirty && <small>Changed in: {changedTabs.map((id) => (TABS.find((t) => t[0] === id) || [])[1]).join(', ')}. Nothing is live until you press Save changes.</small>}
              </div>
              <button type="button" className="s-btn s-btn-light" onClick={save} disabled={!dirty || saving}>{saving ? 'Saving...' : 'Save changes'}</button>
              <button type="button" className="s-btn s-btn-ghost" onClick={discard} disabled={!dirty || saving}>Discard</button>
            </div>
          )}

          <div role="tabpanel" id={`ac-panel-${active}`} aria-labelledby={`ac-tab-${active}`} className="ac-panelwrap">

            {active === 'overview' && (
              <>
                <div className="ad-kpis">
                  <Kpi label="Today" value={data.today.visits} sub={`${fmt(data.today.unique)} unique visitors`} />
                  <Kpi label="Last 7 days" value={data.week.visits} sub={`${fmt(data.week.unique)} unique visitors`} />
                  <Kpi label="Last 30 days" value={data.month.visits} sub={`${fmt(data.month.unique)} unique visitors`} />
                  <Kpi label="All time" value={data.total} sub={`${fmt(data.unique)} unique visitors`} />
                </div>
                <p className="ad-note">A visit is one page load by one browser. Unique visitors are distinct browsers, so someone using two devices counts twice. Days follow Indian time. Daily numbers start from the day this update went live; the all-time numbers include everything before.</p>

                <div className="ad-filter">
                  <RangeToggle value={range} onChange={setRange} />
                </div>

                <section className="ad-panel" aria-labelledby="ad-h-daily">
                  <h2 id="ad-h-daily">Visitors per day</h2>
                  <DailyChart days={days} />
                </section>

                <div className="ad-two">
                  <section className="ad-panel" aria-labelledby="ad-h-reg">
                    <h2 id="ad-h-reg">Registration funnel</h2>
                    <p className="ad-sub">From a visit to a click on the Register button.</p>
                    <BarList
                      scale={agg.visits}
                      total={agg.visits}
                      rows={[
                        { label: 'Visits', value: agg.visits },
                        { label: 'Register page views', value: registerViews },
                        { label: 'Register button clicks', value: registerClicks },
                      ]}
                    />
                    <h3 className="ad-h3">Button clicks</h3>
                    <BarList rows={toRows(agg.clicks, CLICK_NAMES)} empty="No clicks counted in this range yet." />
                    <p className="ad-note ad-note-tight">These are clicks on the Register buttons, counted by the site. They are not submitted forms.</p>
                  </section>

                  <section className="ad-panel" aria-labelledby="ad-h-hours">
                    <h2 id="ad-h-hours">Busiest hours</h2>
                    <p className="ad-sub">When people visit, by hour of the day (Indian time). A good time to post or announce.</p>
                    <HoursChart hours={agg.hours} />
                  </section>

                  <section className="ad-panel" aria-labelledby="ad-h-pages">
                    <h2 id="ad-h-pages">Top pages</h2>
                    <p className="ad-sub">Page views, every time a page is opened.</p>
                    <BarList rows={toRows(agg.pages, PAGE_NAMES)} total={pageTotal} />
                  </section>

                  <section className="ad-panel" aria-labelledby="ad-h-dev">
                    <h2 id="ad-h-dev">Phone or laptop</h2>
                    <p className="ad-sub">Share of visits by device.</p>
                    <BarList rows={toRows(agg.devices, DEVICE_NAMES)} total={deviceTotal} />
                  </section>

                  <section className="ad-panel" aria-labelledby="ad-h-ret">
                    <h2 id="ad-h-ret">New and returning visitors</h2>
                    <p className="ad-sub">New: this browser opened the site for the first time. Returning: it came back on a later day. Each browser is counted once a day.</p>
                    <BarList
                      rows={[{ label: 'New visitors', value: agg.newVisitors }, { label: 'Returning visitors', value: agg.returning }]}
                      total={visitorKinds}
                      empty="No visitors counted in this range yet."
                    />
                    <p className="ad-note ad-note-tight">Counting started when this update went live, so older days show 0. A visitor who clears the browser data or opens the site on another device counts as new.</p>
                  </section>

                  <section className="ad-panel" aria-labelledby="ad-h-src">
                    <h2 id="ad-h-src">Where visitors came from</h2>
                    <p className="ad-sub">Share of visits by source.</p>
                    <BarList rows={toRows(agg.sources, SOURCE_NAMES)} total={sourceTotal} />
                    <p className="ad-note ad-note-tight">
                      Instagram, WhatsApp and many apps hide where a click came from, and those show up as "Direct or unknown". To track one poster or link, add a tag to it:
                      {' '}<code>sipnacoders.club/?src=poster1</code> or <code>sipnacoders.club/?src=whatsapp-group</code>. The tag appears here by name.
                    </p>
                  </section>
                </div>
              </>
            )}


            {active === 'upcoming' && role === 'admin' && <AdminUpcoming view={view} edit={edit} overrides={overrides} changed={changedKeys} />}

            {active === 'events' && role === 'admin' && (
              <section className="ad-panel ad-controls" aria-labelledby="ad-h-ctl">
                <h2 id="ad-h-ctl">Events</h2>
                <p className="ad-sub">Everything about Vibe-A-Thon. Change the live site without a deploy. Anything you do not change keeps the value written in the code files.</p>

                {SECTIONS.map((s) => (
                  <div className="ad-sec" key={s.id} role="group" aria-labelledby={`ad-sec-${s.id}`}>
                    <div className="ad-sec-head">
                      <h3 id={`ad-sec-${s.id}`} className="ad-sec-title">{s.title}</h3>
                      <span className="ad-sec-tag">{s.tag}</span>
                      <a className="ad-link ad-sec-link" href={s.link.href} target="_blank" rel="noopener noreferrer">{s.link.text}</a>
                    </div>
                    {s.blocks.map((b) => {
                      const switches = b.items.filter((it) => !it.type || it.type === 'switch');
                      const fields = b.items.filter((it) => it.type && it.type !== 'switch');
                      return (
                        <div className="ad-group" key={b.title}>
                          <h4 className="ad-h3">{b.title}</h4>
                          {b.hint && <p className="ad-row-hint ad-hint-block">{b.hint}</p>}
                          {switches.map((it) => <SwitchRow key={it.key} it={it} view={view} overrides={overrides} edit={edit} />)}
                          {fields.length > 0 && (
                            <div className="ad-fields">
                              {fields.map((it) => <FieldInput key={it.key} it={it} view={view} overrides={overrides} edit={edit} />)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {s.id === 'vibe' && (
                      <div className="ad-group">
                        <h4 className="ad-h3">Words on the Vibe-A-Thon pages</h4>
                        <AdminEventContent
                          view={view}
                          edit={edit}
                          overrides={overrides}
                          changed={changedKeys}
                          fileDefaults={FILE_DEFAULTS}
                          psFollows={psFollows}
                          psWords={psWords}
                          isAdmin={role === 'admin'}
                        />
                      </div>
                    )}
                  </div>
                ))}

                <p className="ad-note ad-note-tight">
                  The event name, banner, details and popup (design, delay, logo) are in the Upcoming event tab. Still in the code files (they rarely change): the Two-Round Event Flow words, and fees or dates that are written inside other sections (prize pool, event snapshot, sticky bar). They live in <code>src/site/upcomingConfig.js</code>, <code>src/site/eventSwitches.js</code> and <code>src/data/vibeathonData.js</code>.
                </p>

                <div className="ad-resetrow">
                  <button type="button" className="ad-link" onClick={resetAll} disabled={saving || (!confirmReset && Object.keys(overrides).length === 0)}>
                    {confirmReset ? 'Click again to reset everything' : 'Reset every switch and text to the code files'}
                  </button>
                </div>
              </section>
            )}

            {active === 'content' && role === 'admin' && <AdminContent view={view} edit={edit} overrides={overrides} changed={changedKeys} isAdmin />}

            {active === 'automation' && role === 'admin' && (
              <AdminAutomation
                banner={effective.banner}
                locked={dirty}
                onSettingsChanged={(s) => { setOverrides(s || {}); setDraft(null); }}
              />
            )}

          </div>
        </div>
      )}
    </div>
  );
}
