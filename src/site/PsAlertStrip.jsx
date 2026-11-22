// Vibe-A-Thon page: a small amber ALERT strip at the very top of the page (just under the menu bar, above the big card), telling people the problem statements are coming.
// The words come from the dashboard (Events tab -> Date and time -> Alert strip) or, when point 1 is empty, from alertText in src/data/problemStatement.js.
// There can be a second point (dashboard: Alert strip point 2, or alertText2 in problemStatement.js). It is shown right after point 1 on the same moving line.
// The strip goes away by itself once the problem statement PDF is added and its release time has come.
// It is mounted in src/pages/Upcoming.jsx and only shows on the Vibe-A-Thon (hackathon) page.
// To remove the strip, delete <PsAlertStrip /> in src/pages/Upcoming.jsx.
//
// People whose phone/PC has "reduce motion" / "remove animations" turned ON still see the strip moving, only slower.
// To make it a still, centered notice for those people, set FOLLOW_REDUCED_MOTION to true.
import { Fragment } from 'react';
import { PS } from '../data/problemStatement';
import { useSwitch } from './liveSettings';
import { psRelease } from './psRelease';
import { isTeaserLive } from './teaserCore';
import { eventType } from './eventLive';
import './PsAlertStrip.css';

const FOLLOW_REDUCED_MOTION = false;

const WarnIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M12 3.5 2.8 19.5h18.4L12 3.5Z" />
    <path d="M12 10v4.6" />
    <path d="M12 17.4h.01" />
  </svg>
);

export default function PsAlertStrip() {
  const show = useSwitch('psShow', true);
  const pdf = String(useSwitch('psPdf', PS.pdf) || '').trim();
  const unlockNow = useSwitch('psUnlockNow', PS.unlockNow);
  const alertOwn = String(useSwitch('psAlertText', PS.alertText || '') || '').trim();   // point 1: words from the dashboard (or alertText in problemStatement.js)
  const alertOwn2 = String(useSwitch('psAlertText2', PS.alertText2 || '') || '').trim();   // point 2 (optional): shown right after point 1
  const rel = psRelease();

  // same rule as the Problem Statement section: published = the PDF is added AND the time has come
  const published = pdf !== '' && (unlockNow || !Number.isFinite(rel.ms) || Date.now() >= rel.ms);
  // only on the Vibe-A-Thon page: the big card is on and the event is a hackathon
  if (!isTeaserLive() || eventType() !== 'hackathon' || !show || published) return null;

  // '21 Nov 2026, 8:00 PM IST' -> '21 Nov, 8:00 PM IST'
  const when = String(rel.label || '').replace(/\s\d{4}(?=,)/, '').trim();
  const text = alertOwn || (when ? `Problem Statement tentative publish on ${when}` : 'Problem Statement will be published soon');

  const points = [text, alertOwn2].filter(Boolean);   // point 1, then point 2 when it is written

  const row = (hidden) => (
    <ul className="pa-row" aria-hidden={hidden || undefined}>
      {[0, 1].map((n) => (
        <li key={n} aria-hidden={n > 0 ? 'true' : undefined}>
          {points.map((pt, i) => (
            <Fragment key={i}>
              <span className="pa-text">{pt}</span>
              <i className="pa-sep" aria-hidden="true" />
            </Fragment>
          ))}
        </li>
      ))}
    </ul>
  );

  return (
     <div className="s-container pa-wrap">
    <div
      className={FOLLOW_REDUCED_MOTION ? 'pa pa-calm' : 'pa'}
      role="note"
      aria-label="Problem statement announcement"
    >
      <span className="pa-indicator" aria-hidden="true" />
      <div className="pa-track">
        <div className="pa-move">
          {row(false)}
          {row(true)}
          {row(true)}
        </div>
      </div>
    </div>
  </div>
  );
}
