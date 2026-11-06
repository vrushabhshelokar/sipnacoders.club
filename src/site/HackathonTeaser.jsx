// Mystery hackathon teaser for the Upcoming events section.
// Only the dates below need editing. The card hides itself when Round 2 is over.
import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icons';
import { Reveal } from './ui';
import { LINKS } from '../data/site';
import { toDate } from './time';
import './HackathonTeaser.css';

/* ✏️ EDIT HERE (Indian time, 'YYYY-MM-DDTHH:MM') ------------------------- */
const SHOW_TEASER = true;                 // set to false to hide the teaser completely
const TEASER_FROM = '2026-11-07T00:00';   // the "compiling" bar starts filling from here
const ROUND1_START = '2026-12-08T10:00';  // Round 1 (online). Estimated: 2nd week of December
const ROUND2_START = '2026-12-26T09:00';  // Round 2 (on campus)
const ROUND2_END = '2026-12-27T23:59';    // the card disappears after this moment
/* ----------------------------------------------------------------------- */

const T = { from: toDate(TEASER_FROM), r1: toDate(ROUND1_START), r2: toDate(ROUND2_START), end: toDate(ROUND2_END) };

export const isTeaserLive = () => SHOW_TEASER && !!T.end && Date.now() < T.end.getTime();

const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const GLYPHS = '0123456789ABCDEF#$%&*+<>/';
const rnd = (n) => Array.from({ length: n }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join('');
const HEX = Array.from({ length: 36 }, (_, i) => `0x${(((i + 3) * 2654435761) >>> 24).toString(16).toUpperCase().padStart(2, '0')}`).join('  ');

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function parts(ms) {
  let r = Math.max(0, ms);
  const d = Math.floor(r / 864e5); r -= d * 864e5;
  const h = Math.floor(r / 36e5); r -= h * 36e5;
  const m = Math.floor(r / 6e4); r -= m * 6e4;
  return { d, h, m, s: Math.floor(r / 1000) };
}

/* flickering random characters, used for everything that is "classified" */
function Cipher({ len, speed = 150 }) {
  const [s, setS] = useState(() => (reduced() ? '█'.repeat(len) : rnd(len)));
  useEffect(() => {
    if (reduced()) return undefined;
    const id = setInterval(() => setS(rnd(len)), speed);
    return () => clearInterval(id);
  }, [len, speed]);
  return <span aria-hidden="true">{s}</span>;
}

function Cell({ k, v, sub }) {
  return (
    <div className="s-mys-cell">
      <span className="s-mys-k">{k}</span>
      <b className="s-mys-v">{v}</b>
      {sub && <span className="s-mys-sub">{sub}</span>}
    </div>
  );
}

function Locked({ k, len, phase }) {
  return (
    <div className={`s-mys-cell is-lock ${phase === 'denied' ? 'is-denied' : ''}`}>
      <span className="s-mys-k">{k}</span>
      {phase === 'work' && <b className="s-mys-v s-mys-code"><Cipher len={len} speed={45} /></b>}
      {phase === 'denied' && <b className="s-mys-v s-mys-code">ACCESS DENIED</b>}
      {phase === 'idle' && <b className="s-mys-v s-mys-soon">Will be revealed soon</b>}
    </div>
  );
}

export default function HackathonTeaser() {
  const now = useNow();
  const [phase, setPhase] = useState('idle'); // idle -> work -> denied -> idle
  const [prog, setProg] = useState(0);
  const ids = useRef([]);
  useEffect(() => {
    const list = ids.current;
    return () => list.forEach((i) => { clearTimeout(i); clearInterval(i); });
  }, []);

  if (!SHOW_TEASER || !T.from || !T.r1 || !T.r2 || !T.end || now >= T.end.getTime()) return null;

  const decrypt = () => {
    if (phase !== 'idle') return;
    const later = (fn, ms) => { ids.current.push(setTimeout(fn, ms)); };
    const deny = () => { setPhase('denied'); later(() => setPhase('idle'), 2000); };
    if (reduced()) { setProg(99); deny(); return; }
    setPhase('work');
    setProg(0);
    const t0 = Date.now();
    const tick = setInterval(() => setProg(Math.min(99, Math.round(((Date.now() - t0) / 2600) * 99))), 60);
    ids.current.push(tick);
    later(() => { clearInterval(tick); deny(); }, 2600);
  };

  // which countdown to show
  let label, at;
  if (now < T.r1.getTime()) { label = 'Round 1 begins in'; at = T.r1; }
  else if (now < T.r2.getTime()) { label = 'Round 2 begins in'; at = T.r2; }
  const c = at ? parts(at.getTime() - now) : null;
  const cells = c ? [['Days', c.d], ['Hours', c.h], ['Mins', c.m], ['Secs', c.s]] : [];

  const compile = now < T.r1.getTime()
    ? Math.max(1, Math.min(99, Math.round(((now - T.from.getTime()) / (T.r1.getTime() - T.from.getTime())) * 100)))
    : 99;
  const shown = phase === 'idle' ? compile : prog;
  const status = phase === 'denied' ? 'Access denied' : phase === 'work' ? 'Decrypting' : 'Compiling the unknown';
  const btn = phase === 'denied' ? 'Access denied' : phase === 'work' ? `Decrypting… ${prog}%` : 'Try to decrypt';

  return (
    <Reveal>
      <article className={`s-mys is-${phase}`} aria-label="A hackathon is coming. Details will be revealed soon.">
        <div className="s-mys-vis" aria-hidden="true">
          <div className="s-mys-radar">
            <i /><i /><i />
            <b className="s-mys-sweep" />
            <em className="s-mys-blip b1" /><em className="s-mys-blip b2" /><em className="s-mys-blip b3" />
          </div>
          <div className="s-mys-q">?</div>
          <div className="s-mys-hex"><span>{HEX}  {HEX}  </span></div>
          <span className="s-mys-tag">18H · 2 ROUNDS</span>
        </div>

        <div className="s-mys-body">
          <div className="s-row">
            <span className="s-mys-flag"><i /> Signal detected</span>
            <span className="s-mys-file">Classified</span>
          </div>

          <h3 className="s-mys-title">
            The <span className="s-mys-bar" aria-hidden="true" /><span className="s-mys-sr"> (name hidden) </span> Hackathon
          </h3>
          <p className="s-mys-lede">18 hours. 2 rounds. Everything else is classified.</p>
          <p className="s-mys-desc">
            The Coders Club is organising a hackathon. The name, the theme and the prizes are still under wraps.
            Round 1 will be held online. Round 2 will be held on campus.
          </p>

          {c ? (
            <>
              <div className="s-mys-cdl">{label}</div>
              <div className="s-cd" role="timer" aria-label={`${label} ${c.d} days ${c.h} hours ${c.m} minutes`}>
                {cells.map(([name, v]) => (
                  <div className="s-cd-cell" key={name}>
                    <b key={v}>{String(v).padStart(2, '0')}</b>
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="s-live"><i /> Round 2 is live</div>
          )}

          <div className="s-mys-grid">
            <Cell k="Format" v="18 hours" />
            <Cell k="Round 1" v="Online" sub="Expected: 2nd week of Dec" />
            <Cell k="Round 2" v="On campus" sub="Expected: 26 & 27 Dec" />
            <Cell k="Team size" v="4 members" />
            <Locked k="Theme" len={9} phase={phase} />
            <Locked k="Prizes" len={8} phase={phase} />
          </div>

          <div className="s-mys-prog" role="progressbar" aria-label="Compiling" aria-valuemin={0} aria-valuemax={100} aria-valuenow={shown}>
            <span>{status}</span>
            <div className="s-mys-track"><i style={{ width: `${shown}%` }} /></div>
            <span>{shown}%</span>
          </div>

          <div className="s-actions">
            <a className="s-btn s-btn-light" href={LINKS.joinForm} target="_blank" rel="noopener noreferrer">
              <Icon.Bell size={16} /> Get notified
            </a>
            <button type="button" className="s-btn s-btn-ghost s-mys-dec" onClick={decrypt} disabled={phase !== 'idle'}>
              <Icon.Terminal size={16} /> {btn}
            </button>
            <a className="s-link" href={LINKS.instagram} target="_blank" rel="noopener noreferrer">
              <Icon.Instagram size={16} /> Get updates on Instagram
            </a>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
