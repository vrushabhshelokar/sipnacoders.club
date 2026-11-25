// Section 6: Event Schedule & Timeline
// Vertical timeline with 7 milestones, spine line, node circles, and content cards.
import { Reveal } from './ui';
import { Icon } from './Icons';
import { EVENT_SCHEDULE } from '../data/vibeathonData';
import { useRound2Soon } from './round2';
import { liveValue, useLiveSettings } from './liveSettings';
import { psRelease } from './psRelease';

const PS_ROW = 'Problem Statements Released';   // this row shows the release time set in the dashboard (if it was changed)

// The rows can be written in the dashboard (Events tab, Timeline and deadlines). If they were, those win; if not, the rows of
// data/vibeathonData.js are used. Colour and icon fall back to the code file's row at the same place.
const SPARE = ['#7cf2d4', '#4c8dff', '#ff5468', '#fbbc05'];
const rgbOf = (hex) => { const n = parseInt(hex.slice(1), 16); return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`; };
function scheduleRows() {
  const live = liveValue('timeline', null);
  if (!Array.isArray(live) || !live.length) return EVENT_SCHEDULE;
  return live.map((r, i) => {
    const base = EVENT_SCHEDULE[i] || {};
    const accent = /^#[0-9a-fA-F]{6}$/.test(r.accent || '') ? r.accent : base.accent || SPARE[i % SPARE.length];
    return { ...r, id: String(i + 1).padStart(2, '0'), accent, accentRgb: rgbOf(accent), icon: r.icon || base.icon || 'Calendar' };
  });
}
import './EventSchedule.css';

function TimelineRow({ item, index }) {
  const IconC = Icon[item.icon] || Icon.Calendar;
  const isTbd = !item.date || item.date === 'TBD' || item.date.toLowerCase().includes('announced');
  // While the Round 2 details are off (dashboard switch), a row that mentions Round 2 shows only "Publishing soon"
  const soonText = useRound2Soon();
  const soon = !!soonText && /round\s*2/i.test(`${item.phase} ${item.milestone} ${item.desc}`);

  return (
    <Reveal
      className="es-row"
      delay={index * 80}
      style={{ '--ra': item.accent, '--ra-rgb': item.accentRgb }}
    >
      {/* Left: time meta */}
      <div className="es-meta">
        <span className="es-num" aria-hidden="true">{item.id}</span>
        <span className="es-phase">{item.phase}</span>
        {soon ? null : <span className="es-time">{isTbd ? 'TBA' : item.time}</span>}
        {/* Node on the spine */}
        <div className="es-node" aria-hidden="true" />
      </div>

      {/* Right: content card */}
      {soon ? (
        <article className="es-card is-soon">
          <div className="es-card-head">
            <div className="es-icon" aria-hidden="true">
              <IconC size={15} />
            </div>
            <h3 className="es-milestone es-soon-text"><i aria-hidden="true" />{soonText}</h3>
          </div>
        </article>
      ) : (
        <article className="es-card">
          <div className="es-card-head">
            <div className="es-icon" aria-hidden="true">
              <IconC size={15} />
            </div>
            <h3 className="es-milestone">{item.milestone}</h3>
          </div>

          <p className="es-desc">{item.desc}</p>

          <div
            className="es-date-badge"
            aria-label={isTbd ? 'Date to be announced' : item.date}
          >
            {isTbd ? 'DATE: TO BE ANNOUNCED' : item.date}
          </div>
        </article>
      )}
    </Reveal>
  );
}

export default function EventSchedule() {
  useLiveSettings();
  const rel = psRelease();
  return (
    <section id="schedule" className="es-section" aria-labelledby="es-heading">
      <Reveal className="es-head">
        <span className="es-eyebrow">Event Timeline</span>
        <h2 id="es-heading" className="es-h">Milestone Schedule</h2>
        <p className="es-sub">
          Official competition roadmap from registration opening through Round 1 submissions, Top 75 qualifiers, and the offline finale.
        </p>
      </Reveal>

      <div className="es-timeline" role="list" aria-label="Event schedule milestones">
        {/* Spine line behind all rows */}
        <div className="es-spine" aria-hidden="true" />

        {scheduleRows().map((item, i) => (
          <div key={item.id} role="listitem">
            <TimelineRow item={rel.custom && item.milestone === PS_ROW ? { ...item, date: rel.date, time: rel.time } : item} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
