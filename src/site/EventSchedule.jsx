// Section 6: Event Schedule & Timeline
// Vertical timeline with 7 milestones, spine line, node circles, and content cards.
import { Reveal } from './ui';
import { Icon } from './Icons';
import { EVENT_SCHEDULE } from '../data/vibeathonData';
import './EventSchedule.css';

function TimelineRow({ item, index }) {
  const IconC = Icon[item.icon] || Icon.Calendar;
  const isTbd = !item.date || item.date === 'TBD' || item.date.toLowerCase().includes('announced');

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
        <span className="es-time">{isTbd ? 'TBA' : item.time}</span>
        {/* Node on the spine */}
        <div className="es-node" aria-hidden="true" />
      </div>

      {/* Right: content card */}
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
    </Reveal>
  );
}

export default function EventSchedule() {
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

        {EVENT_SCHEDULE.map((item, i) => (
          <div key={item.id} role="listitem">
            <TimelineRow item={item} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
