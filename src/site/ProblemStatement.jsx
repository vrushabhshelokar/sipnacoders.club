// Vibe-A-Thon: "Problem Statement Release" section (sits right before "Why Participate?").
// Two buttons: View PS (opens the PDF in a new tab) and Download (saves the PDF to the phone / laptop).
// The section is LOCKED until you switch it on in the dashboard (Events tab -> Problem statements -> Problem statement buttons). No schedule, no countdown.
// Edit src/data/problemStatement.js only to add the PDF path. Nothing in this file needs to change.
// Once the buttons open, "View PS" shows / hides the "5 Domains" cards (site/PsDomains.jsx, words in data/psDomains.js) under the card.
// The PDF itself is opened from the link inside that panel, and saved with Download.
import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Reveal } from './ui';
import { Guard } from './teaserCore';
import { PS } from '../data/problemStatement';
import { useSwitch } from './liveSettings';
import './ProblemStatement.css';

// The 5 domains are a separate download: the browser fetches them on the first click of "View PS" (which only works once the
// section has unlocked), so before the release nobody can see them on the page. The words are in data/psDomains.js.
const PsDomains = lazy(() => import('./PsDomains'));

const svg = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: 'false' };
const EyeIcon = () => (<svg {...svg}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>);
const DownloadIcon = () => (<svg {...svg}><path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M5 21h14" /></svg>);
const LockIcon = () => (<svg {...svg} width={14} height={14}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>);

export default function ProblemStatement() {
  // the dashboard (Site controls -> Problem statements) can change these without a deploy; data/problemStatement.js has the defaults
  const show = useSwitch('psShow', true);
  const pdf = String(useSwitch('psPdf', PS.pdf) || '');
  const unlockNow = useSwitch('psUnlockNow', PS.unlockNow);
  const count = useSwitch('psCount', PS.count);
  const hasFile = pdf.trim() !== '';
  // manual only: the buttons open when the switch is ON (and a PDF link is set). The release time on the Timeline is just a date shown to people.
  const switchedOn = !!unlockNow;
  const open = switchedOn && hasFile;

  // "View PS" opens / closes the 5 domains under the card. They are fetched on the first click.
  const [domainsSeen, setDomainsSeen] = useState(false);
  const [domainsOpen, setDomainsOpen] = useState(false);
  const wrapRef = useRef(null);
  const toggleDomains = () => {
    if (!domainsSeen) {
      setDomainsSeen(true);
      // two frames: the panel is drawn closed first, so it can slide open
      requestAnimationFrame(() => requestAnimationFrame(() => setDomainsOpen(true)));
    } else {
      setDomainsOpen((v) => !v);
    }
  };
  // on a phone the panel starts below the screen: bring it up under the menu bar (not needed when its top is already in view)
  useEffect(() => {
    if (!domainsOpen) return undefined;
    const t = setTimeout(() => {
      const el = wrapRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      if (top < window.innerHeight * 0.55) return;
      const nav = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav'), 10) || 70;
      const calm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      window.scrollBy({ top: top - nav - 16, behavior: calm ? 'auto' : 'smooth' });
    }, 160);
    return () => clearTimeout(t);
  }, [domainsOpen]);

  const state = open ? 'live' : switchedOn ? 'soon' : 'locked';
  const chip = open ? 'Released' : switchedOn ? 'Publishing shortly' : 'Locked';
  const note = open
    ? 'View PS shows the 5 domains. Download saves the PDF to your phone or laptop.'
    : switchedOn
      ? 'The problem statements are being added. Check back in a few minutes.'
      : 'Locked for now. It opens as soon as the problem statements are released.';

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
              <button
                type="button"
                className="cy-ps-btn cy-ps-btn-ghost"
                aria-expanded={domainsOpen}
                aria-controls="cy-psd-wrap"
                onClick={toggleDomains}
              >
                <EyeIcon />
                <span>{domainsOpen ? 'Hide PS' : 'View PS'}</span>
              </button>
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

      {/* the 5 domains: nothing is on the page until "View PS" is clicked for the first time */}
      {open && domainsSeen && (
        <div id="cy-psd-wrap" ref={wrapRef} className={`cy-psd-wrap${domainsOpen ? ' is-open' : ''}`} aria-hidden={!domainsOpen}>
          <div className="cy-psd-inner">
            <Guard>
              <Suspense fallback={null}>
                <PsDomains pdf={pdf} />
              </Suspense>
            </Guard>
          </div>
        </div>
      )}
    </section>
  );
}
