// Overview tab extras: the registration funnel and the busiest hours of the day.
import { useEffect, useState } from 'react';
import { api } from './kit';

const fmt = (n) => (typeof n === 'number' ? n.toLocaleString('en-IN') : '-');
const hourName = (h) => `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;
const span = (h) => `${hourName(h)} to ${hourName((h + 1) % 24)}`;

/* how many real form submissions came in during the last `range` days (all events that have a register button) */
export function useSubmissions(range, enabled = true, stamp = 0) {
  const [s, setS] = useState({ ready: false, count: 0, any: false });
  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    (async () => {
      const r = await api('/api/admin/registrations?summary=1');
      if (!alive || !r.ok || !r.json.events) return;
      const from = new Date(Date.now() + 5.5 * 3600e3 - (range - 1) * 864e5).toISOString().slice(0, 10);
      let count = 0;
      let any = false;
      for (const ev of ['vibe-a-thon', 'code-clash']) {
        const e = r.json.events[ev];
        if (!e) continue;
        if (e.total > 0) any = true;
        for (const [d, n] of Object.entries(e.days || {})) if (d >= from) count += n;
      }
      setS({ ready: true, count, any });
    })();
    return () => { alive = false; };
  }, [range, enabled, stamp]);
  return s;
}

/* busiest hours: one bar per hour of the day (Indian time) */
export function HoursChart({ hours }) {
  const total = hours.reduce((s, v) => s + v, 0);
  if (!total) return <p className="ad-empty">Hour-by-hour numbers start from the day this update went live. Check back after some visits.</p>;
  const max = Math.max(...hours);
  const peak = hours.indexOf(max);
  return (
    <div className="ac-hours">
      <p className="ac-hours-lead">Busiest hour: <b>{span(peak)}</b> ({fmt(max)} visits, {Math.round((max / total) * 100)}% of visits counted by hour)</p>
      <div className="ac-hbars" role="img" aria-label={`Visits by hour of the day, Indian time. Busiest ${span(peak)} with ${max} visits.`}>
        {hours.map((v, h) => (
          <span key={h} className={`ac-hbar ${h === peak ? 'is-peak' : ''}`} title={`${span(h)}: ${fmt(v)}`}>
            <i style={{ height: `${v ? Math.max(4, (v / max) * 100) : 2}%` }} />
            <small>{h % 3 === 0 ? (h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`) : ''}</small>
          </span>
        ))}
      </div>
      <details className="ad-table-view">
        <summary>View as table</summary>
        <table>
          <thead><tr><th>Hour</th><th>Visits</th></tr></thead>
          <tbody>{hours.map((v, h) => (v ? <tr key={h}><td>{span(h)}</td><td>{fmt(v)}</td></tr> : null))}</tbody>
        </table>
      </details>
    </div>
  );
}
