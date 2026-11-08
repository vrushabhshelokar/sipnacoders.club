// The 10 looks of the "Something big is coming" popup. They all say the same thing (every detail is hidden,
// tap to see the Upcoming events page), only the design is different.
// You never edit this file. The design is picked by itself (see DESIGNS in site/upcomingConfig.js).
// Names: radar, terminal, glitch, launch, matrix, ticket, neon, arcade, git, confetti
import { useEffect, useRef } from 'react';
import { Icon } from './Icons';
import PosterStage from './PosterStage';
import NameReveal from './NameReveal';
import './PopupStyles.css';

/* ---------- small shared pieces ---------- */
const Close = ({ onClose }) => (
  <button type="button" className="pp-x" onClick={onClose} aria-label="Close"><Icon.X size={18} /></button>
);
// once the event name is written (text.name) the heading is the animated NameReveal, with this design's own effect (fx)
const Title = ({ text, extra, fx }) => (text.name
  ? <NameReveal as="h2" id="s-ann-t" className="pp-title" text={text.name} rest={text.rest} effect={fx} {...extra} />
  : <h2 id="s-ann-t" className="pp-title" {...extra}>{text.title}</h2>);
const Desc = ({ text }) => <p id="s-ann-d" className="pp-desc">{text.desc}</p>;
const Actions = ({ text, p }) => (
  <div className="pp-actions">
    <button ref={p.ctaRef} type="button" className="pp-go" onClick={p.onGo}>
      <span>{text.button}</span><Icon.ArrowRight size={17} />
    </button>
    <button type="button" className="pp-later" onClick={p.onClose}>{text.later}</button>
  </div>
);
function Shell({ name, p, children }) {
  return (
    <div ref={p.cardRef} className={`pp pp-${name}`} role="dialog" aria-modal="true" aria-labelledby="s-ann-t" aria-describedby="s-ann-d">
      <Close onClose={p.onClose} />
      {children}
    </div>
  );
}
const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

/* ---------- 1. radar (the original look) ---------- */
function Radar({ text, ...p }) {
  // "Something big is coming": the part before " is coming" glows, like it always did
  const m = /^(.*?)( is coming)$/.exec(text.title);
  return (
    <div ref={p.cardRef} className="s-ann-card" role="dialog" aria-modal="true" aria-labelledby="s-ann-t" aria-describedby="s-ann-d">
      <button type="button" className="s-ann-x" onClick={p.onClose} aria-label="Close"><Icon.X size={18} /></button>
      <PosterStage kind="popup">
        <div className="s-ann-vis" aria-hidden="true">
          <div className="s-ann-radar">
            <i /><i /><i />
            <b className="s-ann-sweep" />
            <em className="b1" /><em className="b2" /><em className="b3" />
          </div>
          <span className="s-ann-q">?</span>
        </div>
      </PosterStage>
      <div className="s-ann-body">
        <span className="s-ann-flag"><i /> {text.flag || 'New signal detected'}</span>
        {text.name
          ? <NameReveal as="h2" id="s-ann-t" className="s-ann-title" text={text.name} rest={text.rest} effect="radar" />
          : <h2 id="s-ann-t" className="s-ann-title">{m ? <><span>{m[1]}</span>{m[2]}</> : <span>{text.title}</span>}</h2>}
        <p id="s-ann-d" className="s-ann-desc">{text.desc}</p>
        <div className="s-ann-actions">
          <button ref={p.ctaRef} type="button" className="s-btn s-btn-light s-ann-go" onClick={p.onGo}>
            {text.button} <span className="s-ann-down" aria-hidden="true"><Icon.ArrowRight size={17} /></span>
          </button>
          <button type="button" className="s-ann-later" onClick={p.onClose}>{text.later}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 2. terminal ---------- */
const T_LINES = [
  { t: '$ ./reveal --next-event', n: 23, d: 0.2 },
  { t: '> connecting to server... ok', n: 28, d: 1.2 },
  { t: '> reading event.cfg', n: 19, d: 2.2 },
  { t: 'ERROR 403: access denied', n: 24, d: 3.0, err: true },
  { t: '> details: [##########]', n: 23, d: 3.9 },
];
function Terminal({ text, ...p }) {
  return (
    <Shell name="terminal" p={p}>
      <div className="pp-bar" aria-hidden="true"><i /><i /><i /><span>sipna@coders: ~</span></div>
      <PosterStage kind="popup">
        <div className="pp-vis" aria-hidden="true">
          {T_LINES.map((l) => (
            <span key={l.t} className={`pp-t-line ${l.err ? 'err' : ''}`} style={{ '--n': l.n, '--d': `${l.d}s` }}>{l.t}</span>
          ))}
          <span className="pp-t-cur">$ <i /></span>
        </div>
      </PosterStage>
      <div className="pp-body">
        <Title fx="terminal" text={text} />
        <Desc text={text} />
        <Actions text={text} p={p} />
      </div>
    </Shell>
  );
}

/* ---------- 3. glitch ---------- */
function Glitch({ text, ...p }) {
  return (
    <Shell name="glitch" p={p}>
      <PosterStage kind="popup">
        <div className="pp-vis" aria-hidden="true">
          <div className="pp-stripes" />
          <div className="pp-gl-tag"><i /> ALERT <b>//</b> SIGNAL INTERCEPTED</div>
        </div>
      </PosterStage>
      <div className="pp-body">
        <Title fx="glitch" text={text} extra={{ 'data-text': text.title }} />
        <Desc text={text} />
        <Actions text={text} p={p} />
      </div>
    </Shell>
  );
}

/* ---------- 4. rocket launch ---------- */
function Launch({ text, ...p }) {
  return (
    <Shell name="launch" p={p}>
      <PosterStage kind="popup">
        <div className="pp-vis" aria-hidden="true">
          <div className="pp-stars" />
          <svg className="pp-rocket" viewBox="0 0 60 104" width="58" height="100">
            <defs>
              <linearGradient id="pp-fl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fff3b0" /><stop offset=".45" stopColor="#ff9a3d" /><stop offset="1" stopColor="#ff4b2b" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="pp-flame" d="M23 64 Q30 104 37 64Z" fill="url(#pp-fl)" />
            <path d="M18 52 L5 76 L19 69Z" fill="#ff8a3d" />
            <path d="M42 52 L55 76 L41 69Z" fill="#ff8a3d" />
            <path d="M30 3 C43 18 45 42 43 66 L17 66 C15 42 17 18 30 3Z" fill="#eef2ff" />
            <path d="M30 3 C36 9 39 15 40.5 23 L19.5 23 C21 15 24 9 30 3Z" fill="#ff5b5b" />
            <circle cx="30" cy="42" r="7" fill="#4c8dff" stroke="#fff" strokeWidth="2.5" />
          </svg>
          <div className="pp-cd">T<b>-</b> <em>--</em><u>:</u><em>--</em><u>:</u><em>--</em></div>
        </div>
      </PosterStage>
      <div className="pp-body">
        <span className="pp-flag"><i /> Launch window: classified</span>
        <Title fx="launch" text={text} />
        <Desc text={text} />
        <Actions text={text} p={p} />
      </div>
    </Shell>
  );
}

/* ---------- 5. digital rain ---------- */
function Rain() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const ctx = cv.getContext('2d');
    const chars = '01{}</>;=+*#$%&'.split('');
    const size = 14;
    let w = 0, h = 0, cols = [], raf = 0, last = 0, alive = true;
    const fit = () => {
      const r = cv.parentElement.getBoundingClientRect();
      w = cv.width = Math.max(1, Math.floor(r.width));
      h = cv.height = Math.max(1, Math.floor(r.height));
      cols = Array.from({ length: Math.ceil(w / size) }, () => Math.floor(Math.random() * (h / size)));
      ctx.fillStyle = '#020805'; ctx.fillRect(0, 0, w, h);
      ctx.font = `${size}px ui-monospace, Menlo, Consolas, monospace`;   // resizing a canvas resets its font
    };
    const frame = (t) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      if (t - last < 55) return;
      last = t;
      ctx.fillStyle = 'rgba(2, 8, 5, .14)'; ctx.fillRect(0, 0, w, h);
      cols.forEach((y, i) => {
        ctx.fillStyle = Math.random() > 0.96 ? '#e8fff1' : '#2dff8a';
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * size, y * size);
        cols[i] = y * size > h && Math.random() > 0.96 ? 0 : y + 1;
      });
    };
    fit();
    if (reduced()) {
      for (let k = 0; k < 40; k += 1) { ctx.fillStyle = 'rgba(2,8,5,.14)'; ctx.fillRect(0, 0, w, h); cols.forEach((y, i) => { ctx.fillStyle = '#2dff8a'; ctx.fillText(chars[(i * 7 + k) % chars.length], i * size, ((y + k) % Math.ceil(h / size)) * size); }); }
    } else {
      raf = requestAnimationFrame(frame);
    }
    window.addEventListener('resize', fit);
    return () => { alive = false; cancelAnimationFrame(raf); window.removeEventListener('resize', fit); };
  }, []);
  return <canvas ref={ref} className="pp-rain" aria-hidden="true" />;
}
function Matrix({ text, ...p }) {
  return (
    <Shell name="matrix" p={p}>
      <Rain />
      <PosterStage kind="popup">
        <div className="pp-vis" aria-hidden="true">
          <span className="pp-mx-tag">&gt; the network is hiding something<i>_</i></span>
        </div>
      </PosterStage>
      <div className="pp-body">
        <Title fx="matrix" text={text} />
        <Desc text={text} />
        <Actions text={text} p={p} />
      </div>
    </Shell>
  );
}

/* ---------- 6. ticket ---------- */
const BARS = Array.from({ length: 40 }, (_, i) => 1 + ((i * 7 + (i % 3) * 5) % 4));
function Ticket({ text, ...p }) {
  return (
    <Shell name="ticket" p={p}>
      <div className="pp-stub" aria-hidden="true">
        <span className="pp-tk-brand"><span className="pp-tk-s">Sipna </span>Coders Club</span>
        <span className="pp-tk-admit">Admit one</span>
      </div>
      <div className="pp-tk-main">
        <Title fx="ticket" text={text} />
        <PosterStage kind="popup">
          <dl className="pp-tk-rows" aria-hidden="true">
            <div><dt>Event</dt><dd><s /></dd></div>
            <div><dt>Date</dt><dd><s className="sm" /></dd></div>
            <div><dt>Venue</dt><dd><s /></dd></div>
            <div><dt>Seat</dt><dd>???</dd></div>
          </dl>
        </PosterStage>
        <Desc text={text} />
      </div>
      <div className="pp-perf" aria-hidden="true" />
      <div className="pp-tk-foot">
        <div className="pp-bars" aria-hidden="true">{BARS.map((w, i) => <i key={i} style={{ width: `${w}px` }} />)}</div>
        <Actions text={text} p={p} />
      </div>
    </Shell>
  );
}

/* ---------- 7. neon sign ---------- */
function Neon({ text, ...p }) {
  const words = text.title.split(' ');
  const half = Math.ceil(words.length / 2);
  return (
    <Shell name="neon" p={p}>
      <div className="pp-body">
        <PosterStage kind="popup">
          <span className="pp-nx-ring" aria-hidden="true"><b>?</b></span>
        </PosterStage>
        {text.name
          ? <NameReveal as="h2" id="s-ann-t" className="pp-title" text={text.name} rest={text.rest} effect="neon" all />
          : (
            <h2 id="s-ann-t" className="pp-title">
              <span className="pp-n1">{words.slice(0, half).join(' ')}</span>{' '}
              <span className="pp-n2">{words.slice(half).join(' ')}</span>
            </h2>
          )}
        <span className="pp-nx-sub" aria-hidden="true">coming soon</span>
        <Desc text={text} />
        <Actions text={text} p={p} />
      </div>
    </Shell>
  );
}

/* ---------- 8. arcade ---------- */
function Arcade({ text, ...p }) {
  return (
    <Shell name="arcade" p={p}>
      <div className="pp-hud" aria-hidden="true"><span>1UP</span><span>HI-SCORE ??????</span></div>
      <div className="pp-body">
        <Title fx="arcade" text={text} />
        <PosterStage kind="popup">
          <div className="pp-lv" aria-hidden="true">
            <span>LEVEL ??</span>
            <div className="pp-seg">{Array.from({ length: 16 }, (_, i) => <i key={i} className={i < 6 ? 'on' : ''} />)}</div>
          </div>
        </PosterStage>
        <Desc text={text} />
        <span className="pp-coin" aria-hidden="true">INSERT COIN</span>
        <Actions text={text} p={p} />
      </div>
    </Shell>
  );
}

/* ---------- 9. git log ---------- */
const COMMITS = [
  { h: '???????', m: 'feat: ████████████', head: true },
  { h: '9c41e7d', m: 'ship: past events' },
  { h: '4be02a1', m: 'ship: first workshop' },
  { h: '0a17f3c', m: 'init: Sipna Coders Club' },
];
function Git({ text, ...p }) {
  return (
    <Shell name="git" p={p}>
      <div className="pp-gh" aria-hidden="true"><code>$ git log --graph</code></div>
      <PosterStage kind="popup">
        <ul className="pp-log" aria-hidden="true">
          {COMMITS.map((c, i) => (
            <li key={c.h} className={c.head ? 'head' : ''}>
              <svg width="26" height="44" viewBox="0 0 26 44">
                {i > 0 && <line x1="13" y1="0" x2="13" y2="22" />}
                {i < COMMITS.length - 1 && <line x1="13" y1="22" x2="13" y2="44" />}
                <circle cx="13" cy="22" r={c.head ? 6 : 5} />
              </svg>
              <code className="h">{c.h}</code>
              <code className="m">{c.m}</code>
              {c.head && <code className="b">HEAD → next-event</code>}
            </li>
          ))}
        </ul>
      </PosterStage>
      <div className="pp-body">
        <Title fx="git" text={text} />
        <Desc text={text} />
        <Actions text={text} p={p} />
      </div>
    </Shell>
  );
}

/* ---------- 10. gift + confetti ---------- */
const COLORS = ['#4285f4', '#ea4335', '#fbbc05', '#34a853'];
const PIECES = Array.from({ length: 26 }, (_, i) => ({
  l: (i * 41 + 7) % 100, d: ((i * 13) % 24) / 10, t: 3 + (i % 5) * 0.55, c: COLORS[i % 4], r: (i * 53) % 360, w: 6 + (i % 3) * 3,
}));
function Confetti({ text, ...p }) {
  return (
    <Shell name="confetti" p={p}>
      <PosterStage kind="popup">
        <div className="pp-vis" aria-hidden="true">
          {PIECES.map((c, i) => (
            <i key={i} className="pp-cf" style={{ left: `${c.l}%`, width: `${c.w}px`, height: `${c.w * 1.6}px`, background: c.c, animationDelay: `${c.d}s`, animationDuration: `${c.t}s`, '--r': `${c.r}deg` }} />
          ))}
          <svg className="pp-gift" viewBox="0 0 96 96" width="92" height="92">
            <rect x="14" y="44" width="68" height="40" rx="5" fill="#4285f4" />
            <rect x="10" y="34" width="76" height="16" rx="5" fill="#5b9bff" />
            <rect x="43" y="34" width="10" height="50" fill="#fbbc05" />
            <path d="M48 34 C38 12 20 18 28 30 C32 35 44 34 48 34Z" fill="#ea4335" />
            <path d="M48 34 C58 12 76 18 68 30 C64 35 52 34 48 34Z" fill="#ea4335" />
            <circle cx="48" cy="34" r="5" fill="#fbbc05" />
          </svg>
          <span className="pp-gq">?</span>
        </div>
      </PosterStage>
      <div className="pp-body">
        <Title fx="confetti" text={text} />
        <Desc text={text} />
        <Actions text={text} p={p} />
      </div>
    </Shell>
  );
}

const DESIGNS = { radar: Radar, terminal: Terminal, glitch: Glitch, launch: Launch, matrix: Matrix, ticket: Ticket, neon: Neon, arcade: Arcade, git: Git, confetti: Confetti };

/* picks the design by name (an unknown name falls back to radar) */
export default function PopupStyle({ name, ...props }) {
  const Design = DESIGNS[name] || Radar;
  return <Design {...props} />;
}
