// Overview tab extra: the busiest hours of the day.

const fmt = (n) => (typeof n === 'number' ? n.toLocaleString('en-IN') : '-');
const hourName = (h) => `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;
const span = (h) => `${hourName(h)} to ${hourName((h + 1) % 24)}`;

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
