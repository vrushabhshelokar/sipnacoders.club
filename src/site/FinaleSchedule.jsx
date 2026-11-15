// Section: VIBE-A-THON // 18-HOUR FINALE DAY SCHEDULE
// Clean, minimal, chronological event-day schedule for 26–27 December 2026 at Sipna COET.
import { useState } from 'react';
import { Reveal } from './ui';
import { Icon } from './Icons';
import { FINALE_EVENT_INFO, FINALE_SCHEDULE } from '../data/vibeathonData';
import './FinaleSchedule.css';

function ScheduleItem({ item }) {
  const IconC = Icon[item.icon] || Icon.Clock;
  const isPrimary = item.type === 'primary-build';
  const isMilestone = item.type === 'milestone';
  const isCeremony = item.type === 'ceremony';
  const isBreak = item.type === 'break';

  return (
    <article
      className={`fs-item fs-type-${item.type}${isPrimary ? ' is-primary' : ''}`}
      aria-label={`${item.id}. ${item.title} at ${item.time}`}
    >
      {/* Left Time Column & Marker */}
      <div className="fs-time-col">
        <span className="fs-num" aria-hidden="true">#{item.id}</span>
        <span className="fs-time-text">{item.time}</span>
        <div className={`fs-node${isPrimary ? ' fs-node-primary' : ''}`} aria-hidden="true">
          {isPrimary && <span className="fs-node-pulse" />}
        </div>
      </div>

      {/* Right Content Card */}
      <div className="fs-card">
        {/* Header with Title and Optional Highlight Badge */}
        <div className="fs-card-head">
          <div className="fs-title-wrap">
            <div className="fs-icon-box" aria-hidden="true">
              <IconC size={16} />
            </div>
            <h4 className="fs-item-title">{item.title}</h4>
          </div>

          {item.highlightTag && (
            <span className={`fs-tag-badge tag-${item.type}`}>
              {item.highlightTag}
            </span>
          )}
        </div>

        {/* Short Activity Description */}
        <p className="fs-item-desc">{item.desc}</p>

        {/* Dedicated Venue Field */}
        <div className="fs-venue-row">
          <span className="fs-venue-icon" aria-hidden="true">
            <Icon.MapPin size={13} />
          </span>
          <span className="fs-venue-text">{item.venue}</span>
        </div>

        <div className="fs-card-corner" aria-hidden="true" />
      </div>
    </article>
  );
}

// Temporary teaser switch: set to false when ready to reveal the complete schedule
const IS_TEASER = true;

export default function FinaleSchedule() {
  const [activeDay, setActiveDay] = useState('all');

  const visibleDays = activeDay === 'all'
    ? FINALE_SCHEDULE
    : FINALE_SCHEDULE.filter((d) => d.dayId === activeDay);

  // Compact Minimal Teaser Mode
  if (IS_TEASER) {
    return (
      <section id="finale-schedule" className="fs-section fs-teaser-only" aria-label="Finale Day Schedule — Reveal Soon">
        <div className="fs-compact-teaser">
          <span className="fs-compact-x" aria-hidden="true">✕</span>
          <span className="fs-compact-text">Event Day Schedule REVEAL SOON</span>
        </div>
      </section>
    );
  }

  return (
    <section id="finale-schedule" className="fs-section" aria-labelledby="fs-heading">
      <Reveal className="fs-head">
        <span className="fs-eyebrow">18-Hour Offline Finale // Schedule</span>
        <h2 id="fs-heading" className="fs-h">Finale Day Schedule</h2>
        <p className="fs-sub">
          Official chronological program from check-in on Day 1 to the winner announcement on Day 2.
        </p>
      </Reveal>

      {/* Quick Event Telemetry Bar */}
      <Reveal delay={60}>
        <div className="fs-telemetry-bar" role="complementary" aria-label="Event Schedule Summary">
          <div className="fs-tel-item">
            <span className="fs-tel-label">EVENT DATES</span>
            <strong className="fs-tel-val">{FINALE_EVENT_INFO.dates}</strong>
          </div>
          <div className="fs-tel-divider" aria-hidden="true" />
          <div className="fs-tel-item">
            <span className="fs-tel-label">DURATION</span>
            <strong className="fs-tel-val highlight">{FINALE_EVENT_INFO.duration} CONTINUOUS BUILD</strong>
          </div>
          <div className="fs-tel-divider" aria-hidden="true" />
          <div className="fs-tel-item">
            <span className="fs-tel-label">BUILD WINDOW</span>
            <strong className="fs-tel-val">{FINALE_EVENT_INFO.buildWindow}</strong>
          </div>
          <div className="fs-tel-divider" aria-hidden="true" />
          <div className="fs-tel-item">
            <span className="fs-tel-label">VENUE</span>
            <strong className="fs-tel-val">{FINALE_EVENT_INFO.venue}</strong>
          </div>
        </div>
      </Reveal>

      {/* Main Schedule Stage */}
      <div className="fs-schedule-stage">
        {/* Mobile Day Filter Tabs */}
        <div className="fs-filter-bar" role="tablist" aria-label="Filter schedule by day">
          <button
            type="button"
            className={`fs-filter-btn ${activeDay === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveDay('all')}
            role="tab"
            aria-selected={activeDay === 'all'}
          >
            All Days
          </button>
          <button
            type="button"
            className={`fs-filter-btn ${activeDay === 'day-01' ? 'is-active' : ''}`}
            onClick={() => setActiveDay('day-01')}
            role="tab"
            aria-selected={activeDay === 'day-01'}
          >
            Day 01 (26 Dec)
          </button>
          <button
            type="button"
            className={`fs-filter-btn ${activeDay === 'day-02' ? 'is-active' : ''}`}
            onClick={() => setActiveDay('day-02')}
            role="tab"
            aria-selected={activeDay === 'day-02'}
          >
            Day 02 (27 Dec)
          </button>
        </div>

        {/* Schedule Content */}
        <div className="fs-timeline-container">
          {/* Continuous Spine Line */}
          <div className="fs-spine" aria-hidden="true" />

          {visibleDays.map((dayBlock, dayIdx) => (
            <div key={dayBlock.dayId} className="fs-day-block">
              {/* Day Header Banner */}
              <Reveal delay={dayIdx * 80}>
                <div className="fs-day-header" aria-label={`${dayBlock.dayNumber} - ${dayBlock.dateLabel}`}>
                  <div className="fs-day-badge">
                    <span className="fs-day-num">{dayBlock.dayNumber}</span>
                    <span className="fs-day-date">{dayBlock.dateLabel}</span>
                  </div>
                  <p className="fs-day-summary">{dayBlock.summary}</p>
                </div>
              </Reveal>

              {/* List of Day Activities */}
              <div className="fs-items-list" role="list" aria-label={`Schedule for ${dayBlock.dayNumber}`}>
                {dayBlock.events.map((item, itemIdx) => (
                  <Reveal key={item.id} delay={60 + itemIdx * 40} role="listitem">
                    <ScheduleItem item={item} />
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
