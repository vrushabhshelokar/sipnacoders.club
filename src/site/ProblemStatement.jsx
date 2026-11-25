// Vibe-A-Thon: "Problem Statement Release" section (sits right before "Why Participate?").
// Two buttons: View PS (shows the 5 domains under the card) and Download (saves the PDF to the phone / laptop).
// The section is LOCKED until you switch it on in the dashboard (Events tab -> Problem statements -> Problem statement buttons). No schedule, no countdown.
// Edit src/data/problemStatement.js only to add the PDF path. Nothing in this file needs to change.
// Once the buttons open, "View PS" shows / hides the "5 Domains" cards (site/PsDomains.jsx, words in data/psDomains.js) under the card.
// The PDF itself is opened from the link inside that panel, and saved with Download.
// UNLOCK ANIMATION, two looks. Both wait until the card is on screen and play once per page visit:
//   FIRST VISIT EVER ("vault", about 3 seconds): while locked the whole card is sealed (blurred, two hazard shutters, two chains, a big padlock).
//     The padlock shakes, then breaks: chains snap, shutters fly apart, shockwave + sparks, the card clears up, the title glitches in,
//     the chip "decrypts" LOCKED -> RELEASED and the two buttons light up.
//   EVERY VISIT AFTER THAT ("quick", about 2 seconds): the small padlock turns and opens, the chip decrypts, the buttons light up.
// The browser remembers the first visit (SEEN_KEY below). To show the big vault look to everybody again (a new release), change SEEN_KEY to '...-v2'.
// People who ask their device for less motion get the final look at once.
import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Reveal } from './ui';
import { Guard } from './teaserCore';
import { PS } from '../data/problemStatement';
import { useSwitch } from './liveSettings';
import './ProblemStatement.css';

// The 5 domains are a separate download: the browser fetches them on the first click of "View PS" (which only works once the
// section has unlocked), so before the release nobody can see them on the page. The words are in data/psDomains.js.
const PsDomains = lazy(() => import('./PsDomains'));

// padlock animation: "locked" -> "turn" (key turns) -> "open" (shackle lifts, ring, text decrypts, buttons light up) -> "live" (final look)
const SEEN_KEY = 'scc-ps-unlocked-v1';
const seenBefore = () => { try { return window.localStorage.getItem(SEEN_KEY) === '1'; } catch { return false; } };
const markSeen = () => { try { window.localStorage.setItem(SEEN_KEY, '1'); } catch { /* storage blocked: fine */ } };
const calm = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const GLYPHS = '01#$%&*+<>/ABCDEF';
const TURN_MS = 800;     // vault: charging, the padlock shakes harder and harder
const DONE_MS = 3200;    // vault: everything is finished, the seal is removed and the final look stays
const QUICK_TURN_MS = 450;   // quick: the small padlock wiggles (the key turns)
const QUICK_DONE_MS = 2100;  // quick: everything is finished

// sparks that burst out of the padlock (fixed numbers so every visitor sees the same burst): angle, distance, size, colour
const SPARKS = Array.from({ length: 22 }, (_, i) => {
  const a = (i / 22) * Math.PI * 2 + ((i * 37) % 11) * 0.05;
  const d = 80 + ((i * 53) % 9) * 16;
  return { x: Math.round(Math.cos(a) * d), y: Math.round(Math.sin(a) * d), s: 4 + (i % 3) * 2, c: ['#7cf2d4', '#ffd27a', '#ffffff'][i % 3], t: (i % 5) * 18 };
});

const svg = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: 'false' };
const EyeIcon = () => (<svg {...svg}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>);
const DownloadIcon = () => (<svg {...svg}><path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M5 21h14" /></svg>);
// the big padlock of the card: the shackle (top loop) swings open around its left foot while the card changes from amber to mint
const PadLock = () => (
  <svg className="cy-pl" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path className="cy-pl-shackle" d="M8 11V8a4 4 0 0 1 8 0v3" />
    <g className="cy-pl-body">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <circle cx="12" cy="16" r="1.3" fill="currentColor" stroke="none" />
    </g>
  </svg>
);

// one chain across the card, drawn twice (left half / right half) so it can snap in the middle
const ChainHalf = ({ id, side }) => (
  <svg className={`cy-chain-h ${side}`} height="20" width="100%" aria-hidden="true" focusable="false">
    <defs>
      <pattern id={id} width="44" height="20" patternUnits="userSpaceOnUse">
        <rect x="2" y="3" width="22" height="14" rx="7" fill="none" stroke="#aeb6c6" strokeWidth="2.6" />
        <rect x="21" y="7" width="21" height="6" rx="3" fill="#7d8799" />
      </pattern>
    </defs>
    <rect width="100%" height="20" fill={`url(#${id})`} />
  </svg>
);
const Chain = ({ n }) => (
  <div className={`cy-chain c${n}`}>
    <div className="cy-chain-in">
      <ChainHalf id={`cy-lk-${n}-l`} side="l" />
      <ChainHalf id={`cy-lk-${n}-r`} side="r" />
    </div>
  </div>
);

export default function ProblemStatement() {
  // the dashboard (Site controls -> Problem statements) can change these without a deploy; data/problemStatement.js has the defaults
  const show = useSwitch('psShow', true);
  const pdf = String(useSwitch('psPdf', PS.pdf) || '');
  const unlockNow = useSwitch('psUnlockNow', PS.unlockNow);
  const count = useSwitch('psCount', PS.count);
  const hasFile = pdf.trim() !== '';
  // manual only: View PS opens as soon as the switch is ON (the 5 domains need no PDF). Download needs the PDF link too.
  // The release time on the Timeline is just a date shown to people.
  const open = !!unlockNow;

  // "View PS" opens / closes the 5 domains under the card. They are fetched on the first click.
  const [domainsSeen, setDomainsSeen] = useState(false);
  const [domainsOpen, setDomainsOpen] = useState(false);
  const [glowKey, setGlowKey] = useState(0);   // goes up by one at every opening: the panel glows for 3 seconds each time
  const wrapRef = useRef(null);
  const openDomains = () => { setDomainsOpen(true); setGlowKey((k) => k + 1); };
  const toggleDomains = () => {
    if (!domainsSeen) {
      setDomainsSeen(true);
      // two frames: the panel is drawn closed first, so it can slide open
      requestAnimationFrame(() => requestAnimationFrame(openDomains));
    } else if (domainsOpen) {
      setDomainsOpen(false);
    } else {
      openDomains();
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

  // the unlock animation (see the top of this file). `open` is the real switch: the buttons work as soon as it is ON.
  // `lit` is only how the card LOOKS: it stays in the locked look until the padlock has opened.
  // quick = this browser has seen the vault look before (decided once per page visit, so the vault does not turn into the quick look in the middle)
  const [quick] = useState(seenBefore);
  const mode = open && quick ? 'quick' : 'vault';   // locked by the admin = sealed look
  const [stage, setStage] = useState(() => (open && calm() ? 'live' : 'locked'));
  const infoRef = useRef(null);
  useEffect(() => {
    if (!open) { setStage('locked'); return undefined; }
    if (stage !== 'locked') return undefined;
    if (calm()) { setStage('live'); markSeen(); return undefined; }
    const el = infoRef.current;
    const timers = [];
    const play = () => {
      setStage('turn');
      timers.push(setTimeout(() => setStage('open'), quick ? QUICK_TURN_MS : TURN_MS));
      timers.push(setTimeout(() => { setStage('live'); markSeen(); }, quick ? QUICK_DONE_MS : DONE_MS));
    };
    if (!el || !('IntersectionObserver' in window)) { setStage('live'); markSeen(); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); play(); } }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); timers.forEach(clearTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const lit = open && (stage === 'open' || stage === 'live');
  // the chip text "decrypts" from random characters to RELEASED while the padlock opens
  const [scramble, setScramble] = useState('');
  useEffect(() => {
    if (stage !== 'open') { setScramble(''); return undefined; }
    const word = 'RELEASED';
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      const fixed = Math.floor(n / 2);
      if (fixed >= word.length) { clearInterval(id); setScramble(''); return; }
      setScramble(word.split('').map((c, i) => (i < fixed ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(''));
    }, 50);
    return () => clearInterval(id);
  }, [stage]);

  const state = lit ? 'live' : 'locked';
  const chip = lit ? 'Released' : 'Locked';
  const note = !lit
    ? 'Locked for now. It opens as soon as the problem statements are released.'
    : hasFile
      ? 'View PS shows the 5 domains. Download saves the PDF to your phone or laptop.'
      : 'View PS shows the 5 domains. The PDF download is being added, check back in a few minutes.';

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

      <Reveal className={`cy-ps-card is-${state}`} data-stage={stage} data-mode={mode}>
        <div className="cy-ps-info" ref={infoRef}>
          <div className="cy-ps-head">
            <span className="cy-ps-badge"><span className="cy-ps-badge-in"><PadLock /></span></span>
            <span className={`cy-ps-chip is-${state}`}>
              <i className="cy-ps-dot" aria-hidden="true" />
              {scramble || chip}
            </span>
          </div>
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
                className={`cy-ps-btn cy-ps-btn-ghost${lit ? '' : ' is-wait'}`}
                aria-expanded={domainsOpen}
                aria-controls="cy-psd-wrap"
                onClick={toggleDomains}
              >
                <EyeIcon />
                <span>{domainsOpen ? 'Hide PS' : 'View PS'}</span>
              </button>
              {hasFile ? (
                <a className={`cy-ps-btn cy-ps-btn-main${lit ? '' : ' is-wait'}`} href={pdf} download={PS.fileName}>
                  <DownloadIcon />
                  <span>Download</span>
                </a>
              ) : (
                <button type="button" className={`cy-ps-btn cy-ps-btn-main${lit ? '' : ' is-wait'}`} disabled>
                  <DownloadIcon />
                  <span>Download</span>
                </button>
              )}
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

        {mode === 'vault' && stage !== 'live' && (
          <div className="cy-seal" aria-hidden="true">
            <i className="cy-seal-l" />
            <i className="cy-seal-r" />
            <Chain n={1} />
            <Chain n={2} />
            <i className="cy-seal-beam" />
            <i className="cy-seal-wave" />
            <i className="cy-seal-wave w2" />
            <div className="cy-seal-core">
              <span className="cy-seal-medal"><PadLock /></span>
              <b className="cy-seal-tag">{stage === 'locked' ? 'Locked' : 'Unlocking'}</b>
              {stage === 'locked' && <span className="cy-seal-sub">Opens as soon as the problem statements are released.</span>}
            </div>
            {SPARKS.map((k, i) => (
              <i key={i} className="cy-spark" style={{ '--x': `${k.x}px`, '--y': `${k.y}px`, '--s': `${k.s}px`, '--c': k.c, '--t': `${k.t}ms` }} />
            ))}
          </div>
        )}
      </Reveal>

      {/* the 5 domains: nothing is on the page until "View PS" is clicked for the first time */}
      {open && domainsSeen && (
        <div id="cy-psd-wrap" ref={wrapRef} className={`cy-psd-wrap${domainsOpen ? ' is-open' : ''}`} aria-hidden={!domainsOpen}>
          <div className="cy-psd-inner">
            <Guard>
              <Suspense fallback={null}>
                <PsDomains pdf={pdf} glowKey={glowKey} />
              </Suspense>
            </Guard>
          </div>
        </div>
      )}
    </section>
  );
}
