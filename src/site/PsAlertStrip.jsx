// Vibe-A-Thon page: a small amber ALERT strip at the very top of the page (just under the menu bar, above the big card), telling people the problem statements are coming.
// The date is NOT written here. It is the "releaseLabel" in src/data/problemStatement.js (or the time set in the dashboard), so there is one place to change.
// The strip goes away by itself once the problem statement PDF is added and its release time has come.
// It is mounted in src/pages/Upcoming.jsx and only shows on the Vibe-A-Thon (hackathon) page.
// To remove the strip, delete <PsAlertStrip /> in src/pages/Upcoming.jsx.
//
// People whose phone/PC has "reduce motion" / "remove animations" turned ON still see the strip moving, only slower.
// To make it a still, centered notice for those people, set FOLLOW_REDUCED_MOTION to true.
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
  const rel = psRelease();

  // same rule as the Problem Statement section: published = the PDF is added AND the time has come
  const published = pdf !== '' && (unlockNow || !Number.isFinite(rel.ms) || Date.now() >= rel.ms);
  // only on the Vibe-A-Thon page: the big card is on and the event is a hackathon
  if (!isTeaserLive() || eventType() !== 'hackathon' || !show || published) return null;

  // '21 Nov 2026, 8:00 PM IST' -> '21 Nov, 8:00 PM IST'
  const when = String(rel.label || '').replace(/\s\d{4}(?=,)/, '').trim();
  const text = when ? `Problem Statement tentative publish on ${when}` : 'Problem Statement will be published soon';

  const row = (hidden) => (
    <ul className="pa-row" aria-hidden={hidden || undefined}>
      {[0, 1].map((n) => (
        <li key={n} aria-hidden={n > 0 ? 'true' : undefined}>
          <span className="pa-text">{text}</span>
          <i className="pa-sep" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="s-container pa-wrap">
      <div className={FOLLOW_REDUCED_MOTION ? 'pa pa-calm' : 'pa'} role="note" aria-label="Notice about the problem statement release">
        <span className="pa-badge">
          <WarnIcon />
          <b>Alert</b>
        </span>
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
