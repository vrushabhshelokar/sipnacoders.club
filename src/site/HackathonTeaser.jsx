// Mystery card for the Upcoming events section. Every detail is hidden ("will be revealed soon").
// - Put the event name in EVENT_NAME and the title shows it.
// - Put each detail in DETAILS and "Try to decrypt" types them out one by one in the black boxes.
// - The countdown stays asleep until you put the first date in EVENT_START.
// - The card hides itself after HIDE_AFTER.
import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icons';
import { Reveal } from './ui';
import { LINKS } from '../data/site';
import { toDate } from './time';
import './HackathonTeaser.css';

/* ✏️ EDIT HERE (Indian time, 'YYYY-MM-DDTHH:MM') ------------------------- */
const SHOW_TEASER = true;                 // set to false to hide the card completely
const EVENT_NAME = '';                    // when the name is announced, type it here and the title shows it
const EVENT_START = '';                   // when the dates are announced, put the first date here (example: '2026-12-10T10:00') and the timer starts
const HIDE_AFTER = '2026-12-28T00:00';    // the card disappears after this moment
const TEASER_FROM = '2026-11-07T00:00';   // only used once EVENT_START is set: the "compiling" bar fills from here to the start
const COMPILING = 35;                     // the "compiling" bar percentage while no date is announced
// When a detail is announced, type it here. "Try to decrypt" then types it out one by one in its black box.
// A box left empty ('') stays "Will be revealed soon". Examples: Format '18 hours', Team size '4 members'.
const DETAILS = {
  Format: '',
  Rounds: '',
  'Team size': '',
  Theme: '',
  Prizes: '',
  Registration: '',
};
const TYPE_MS = 45;                       // typing speed (milliseconds per letter)
/* ----------------------------------------------------------------------- */

const T = { from: toDate(TEASER_FROM), start: toDate(EVENT_START), end: toDate(HIDE_AFTER) };

export const isTeaserLive = () => SHOW_TEASER && !!T.end && Date.now() < T.end.getTime();

// the boxes: [label, length of the scrambled text shown while decrypting]
const BOXES = [['Format', 8], ['Rounds', 9], ['Team size', 7], ['Theme', 9], ['Prizes', 8], ['Registration', 10]];
const detailOf = (k) => String(DETAILS[k] || '');
const HAS_DETAILS = BOXES.some(([k]) => detailOf(k));

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

/* one black box: hidden, scrambling, access denied, or (when a detail is set) typed out */
function Box({ k, len, phase, n }) {
  const text = detailOf(k);
  if (text && (phase === 'typing' || phase === 'done')) {
    const typing = phase === 'typing';
    const shownText = typing ? text.slice(0, n) : text;
    return (
      <div className="s-mys-cell is-open">
        <span className="s-mys-k">{k}</span>
        <b className="s-mys-v s-mys-real">
          {typing && <span className="s-mys-sr">{text}</span>}
          <span aria-hidden={typing ? 'true' : undefined}>{shownText}</span>
          {typing && n < text.length && <span className="s-mys-cur" aria-hidden="true">_</span>}
        </b>
      </div>
    );
  }
  return (
    <div className={`s-mys-cell is-lock ${phase === 'denied' ? 'is-denied' : ''}`}>
      <span className="s-mys-k">{k}</span>
      {phase === 'work' && <b className="s-mys-v s-mys-code"><Cipher len={len} speed={45} /></b>}
      {phase === 'denied' && <b className="s-mys-v s-mys-code">ACCESS DENIED</b>}
      {(phase === 'idle' || phase === 'typing' || phase === 'done') && <b className="s-mys-v s-mys-soon">Will be revealed soon</b>}
    </div>
  );
}

export default function HackathonTeaser() {
  const now = useNow();
  const [phase, setPhase] = useState('idle'); // idle -> work -> denied -> idle   (or work -> typing -> done when details are set)
  const [prog, setProg] = useState(0);
  const [counts, setCounts] = useState(() => BOXES.map(() => 0));
  const ids = useRef([]);
  useEffect(() => {
    const list = ids.current;
    return () => list.forEach((i) => { clearTimeout(i); clearInterval(i); });
  }, []);

  if (!SHOW_TEASER || !T.end || now >= T.end.getTime()) return null;

  const decrypt = () => {
    if (phase !== 'idle') return;
    const later = (fn, ms) => { ids.current.push(setTimeout(fn, ms)); };
    const deny = () => { setPhase('denied'); later(() => setPhase('idle'), 2000); };
    // the real details appear, typed one letter at a time, box after box
    const reveal = () => {
      setProg(100);
      if (reduced()) { setPhase('done'); return; }
      setPhase('typing');
      const t0 = Date.now();
      const tick = setInterval(() => {
        const el = Date.now() - t0;
        const next = BOXES.map(([k], i) => Math.max(0, Math.min(detailOf(k).length, Math.floor((el - i * 260) / TYPE_MS))));
        setCounts(next);
        if (BOXES.every(([k], i) => next[i] >= detailOf(k).length)) { clearInterval(tick); setPhase('done'); }
      }, 35);
      ids.current.push(tick);
    };
    if (reduced()) { if (HAS_DETAILS) reveal(); else { setProg(99); deny(); } return; }
    setPhase('work');
    setProg(0);
    const t0 = Date.now();
    const tick = setInterval(() => setProg(Math.min(99, Math.round(((Date.now() - t0) / 2600) * 99))), 60);
    ids.current.push(tick);
    later(() => { clearInterval(tick); if (HAS_DETAILS) reveal(); else deny(); }, 2600);
  };

  // countdown: asleep until a start date is set, then it counts down, then it says "live"
  const startMs = T.start ? T.start.getTime() : null;
  const waiting = startMs === null;
  const counting = startMs !== null && now < startMs;
  const live = startMs !== null && now >= startMs;
  const c = counting ? parts(startMs - now) : null;
  const cells = c
    ? [['Days', c.d], ['Hours', c.h], ['Mins', c.m], ['Secs', c.s]]
    : [['Days', '--'], ['Hours', '--'], ['Mins', '--'], ['Secs', '--']];

  let compile = COMPILING;
  if (counting && T.from && T.from.getTime() < startMs) {
    compile = Math.max(1, Math.min(99, Math.round(((now - T.from.getTime()) / (startMs - T.from.getTime())) * 100)));
  } else if (live) {
    compile = 99;
  }
  const open = phase === 'typing' || phase === 'done';
  const shown = open ? 100 : phase === 'idle' ? compile : prog;
  const status = open ? 'Decrypted' : phase === 'denied' ? 'Access denied' : phase === 'work' ? 'Decrypting' : 'Compiling the unknown';
  const btn = open ? 'Decrypted' : phase === 'denied' ? 'Access denied' : phase === 'work' ? `Decrypting… ${prog}%` : 'Try to decrypt';

  return (
    <Reveal>
      <article className={`s-mys is-${phase}`} aria-label="Something big is coming. Every detail will be revealed soon.">
        <div className="s-mys-vis" aria-hidden="true">
          <div className="s-mys-radar">
            <i /><i /><i />
            <b className="s-mys-sweep" />
            <em className="s-mys-blip b1" /><em className="s-mys-blip b2" /><em className="s-mys-blip b3" />
          </div>
          <div className="s-mys-q">?</div>
          <div className="s-mys-hex"><span>{HEX}  {HEX}  </span></div>
          <span className="s-mys-tag">CLASSIFIED</span>
        </div>

        <div className="s-mys-body">
          <div className="s-row">
            <span className="s-mys-flag"><i /> Signal detected</span>
            <span className="s-mys-file">Classified</span>
          </div>

          <h3 className="s-mys-title">{EVENT_NAME || 'Name will be announced soon'}</h3>
          <p className="s-mys-lede">Something big is coming.</p>
          <p className="s-mys-desc">
            Every detail is classified for now. The name, dates, format and prizes will all be announced soon.
          </p>

          {live ? (
            <div className="s-live"><i /> It&apos;s live</div>
          ) : (
            <>
              <div className="s-mys-cdl">{counting ? 'Starts in' : 'Timer starts when the dates are announced'}</div>
              <div
                className={`s-cd ${waiting ? 'is-idle' : ''}`}
                role={counting ? 'timer' : 'group'}
                aria-label={counting ? `Starts in ${c.d} days ${c.h} hours ${c.m} minutes` : 'Timer not started yet'}
              >
                {cells.map(([name, v]) => (
                  <div className="s-cd-cell" key={name}>
                    <b key={v}>{typeof v === 'number' ? String(v).padStart(2, '0') : v}</b>
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="s-mys-grid">
            {BOXES.map(([k, len], i) => <Box key={k} k={k} len={len} phase={phase} n={counts[i]} />)}
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
