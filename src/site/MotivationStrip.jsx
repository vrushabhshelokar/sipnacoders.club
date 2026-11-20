// A calm, endless strip of motivation lines on the Vibe-A-Thon page. It is always ONE line that keeps moving (phones, laptops, everywhere).
// To change the words, edit LINES below. To remove the strip, delete <MotivationStrip /> in HackathonTeaser.jsx.
//
// People whose phone/PC has "reduce motion" / "remove animations" turned ON still see the strip, only slower.
// To make the strip stand still for those people (they can swipe it sideways instead), set FOLLOW_REDUCED_MOTION to true.
import './MotivationStrip.css';

const FOLLOW_REDUCED_MOTION = false;

const LINES = [
  'Your innovation has value',
  'Your creation has value',
  'Think beyond the traditional way',
  'Build what only you would build',
  'Vibe it. Build it. Ship it.',
];

export default function MotivationStrip() {
  const row = (hidden) => (
    <ul className="ms-row" aria-hidden={hidden || undefined}>
      {LINES.map((t) => (
        <li key={t}>
          <span className="ms-dot" aria-hidden="true" />
          {t}
        </li>
      ))}
    </ul>
  );
  return (
    <section className={FOLLOW_REDUCED_MOTION ? 'ms ms-calm' : 'ms'} aria-label="Vibe-A-Thon motto">
      <div className="ms-track">
        <div className="ms-move">
          {row(false)}
          {row(true)}
          {row(true)}
        </div>
      </div>
    </section>
  );
}
