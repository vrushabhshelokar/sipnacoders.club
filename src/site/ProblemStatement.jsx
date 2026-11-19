// Vibe-A-Thon: "Problem Statement Release" section (sits right before "Why Participate?").
// Two buttons: View PS (opens the PDF in a new tab) and Download (saves the PDF to the phone / laptop).
// Edit src/data/problemStatement.js to add the PDF and change the release time. Nothing in this file needs to change.
import { useEffect, useState } from 'react';
import { Reveal } from './ui';
import { PS } from '../data/problemStatement';
import { useSwitch } from './liveSettings';
import { psRelease } from './psRelease';
import './ProblemStatement.css';

const svg = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: 'false' };
const EyeIcon = () => (<svg {...svg}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>);
const DownloadIcon = () => (<svg {...svg}><path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M5 21h14" /></svg>);
const LockIcon = () => (<svg {...svg} width={14} height={14}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>);

// "3d 5h 12m" (days only when there are some)
function left(ms) {
  const m = Math.max(0, Math.ceil(ms / 60000));
  const d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60;
  return `${d ? `${d}d ` : ''}${d || h ? `${h}h ` : ''}${mm}m`;
}

export default function ProblemStatement() {
  // the dashboard (Site controls -> Problem statements) can change these without a deploy; data/problemStatement.js has the defaults
  const show = useSwitch('psShow', true);
  const pdf = String(useSwitch('psPdf', PS.pdf) || '');
  const unlockNow = useSwitch('psUnlockNow', PS.unlockNow);
  const count = useSwitch('psCount', PS.count);
  const rel = psRelease();
  const releaseMs = rel.ms;
  const hasFile = pdf.trim() !== '';
  const [now, setNow] = useState(() => Date.now());
  const timeOpen = unlockNow || !Number.isFinite(releaseMs) || now >= releaseMs;
  const open = timeOpen && hasFile;

  // keeps the countdown fresh and opens the buttons by themselves at the release time
  useEffect(() => {
    if (timeOpen) return undefined;
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, 15000);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', tick); };
  }, [timeOpen]);

  const state = open ? 'live' : timeOpen ? 'soon' : 'locked';
  const chip = open ? 'Released' : timeOpen ? 'Publishing shortly' : 'Locked';
  const note = open
    ? 'The PDF opens in a new tab. Download saves it to your phone or laptop.'
    : timeOpen
      ? 'The release time has come. The PDF is being added, check back in a few minutes.'
      : `Unlocks on ${rel.label}${Number.isFinite(releaseMs) ? ` (in ${left(releaseMs - now)})` : ''}.`;

  if (!show) return null;

  return (
    <section id="problem-statement" className="cy-ps" aria-labelledby="cy-ps-heading">
      <Reveal className="cy-why-head">
        <span className="cy-why-eyebrow">Round 1 Briefing</span>
        <h2 id="cy-ps-heading" className="cy-why-h">
          Problem Statement Release
        </h2>
        <p className="cy-why-sub">
          {count} problem statements, one PDF. Read them all, pick exactly one, build it with AI tools and deploy it.
        </p>
      </Reveal>

      <Reveal className={`cy-ps-card is-${state}`}>
        <div className="cy-ps-info">
          <span className={`cy-ps-chip is-${state}`}>
            {state === 'locked' ? <LockIcon /> : <i className="cy-ps-dot" aria-hidden="true" />}
            {chip}
          </span>
          <h3 className="cy-ps-title">{count} Problem Statements</h3>
          <p className="cy-ps-note" role="status">{note}</p>
          <ul className="cy-ps-meta" aria-label="About the file">
            <li>PDF</li>
            <li>Round 1</li>
            <li>Pick 1 of {count}</li>
          </ul>
        </div>

        <div className="cy-ps-actions">
          {open ? (
            <>
              <a className="cy-ps-btn cy-ps-btn-ghost" href={pdf} target="_blank" rel="noopener noreferrer">
                <EyeIcon />
                <span>View PS</span>
              </a>
              <a className="cy-ps-btn cy-ps-btn-main" href={pdf} download={PS.fileName}>
                <DownloadIcon />
                <span>Download</span>
              </a>
            </>
          ) : (
            <>
              <button type="button" className="cy-ps-btn cy-ps-btn-ghost" disabled>
                <EyeIcon />
                <span>View PS</span>
              </button>
              <button type="button" className="cy-ps-btn cy-ps-btn-main" disabled>
                <DownloadIcon />
                <span>Download</span>
              </button>
            </>
          )}
        </div>
      </Reveal>
    </section>
  );
}
