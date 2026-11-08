// The "mystery pictures" of the newer designs. A popup and the matching Upcoming card use the same picture,
// only bigger or smaller (every size inside follows the font-size of .nv).
// You never edit this file.
import { useEffect, useRef, useState } from 'react';
import './NewParts.css';

const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

/* ---------- slot machine: three reels that spin and stop on "?" ---------- */
const REELS = [['7', '★', '◆', '{ }', '♠', '</>'], ['★', '</>', '7', '♠', '◆', '{ }'], ['◆', '7', '{ }', '★', '</>', '♠']];
export function Reels() {
  return (
    <div className="nv nv-reels" aria-hidden="true">
      <div className="nv-reels-row">
        {REELS.map((r, k) => (
          <div key={k} className="nv-reel" style={{ '--k': k }}>
            <div className="nv-strip">{['?', ...r, '?'].map((s, i) => <b key={i}><span>{s}</span></b>)}</div>
          </div>
        ))}
        <i className="nv-payline" />
      </div>
    </div>
  );
}

/* ---------- scratch card: silver foil you can scratch (it scratches itself a little first) ---------- */
export function ScratchPanel() {
  const host = useRef(null);
  const cv = useRef(null);
  const st = useRef({ drag: false, last: null, w: 0, h: 0, done: false, user: false });
  const ctxOf = () => (cv.current ? cv.current.getContext('2d', { willReadFrequently: true }) : null);

  const stroke = (a, b) => {
    const ctx = ctxOf();
    if (!ctx) return;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = Math.max(20, st.current.h * 0.24);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  };
  const covered = () => {
    const ctx = ctxOf();
    const { w, h } = st.current;
    if (!ctx || !w || !h) return 0;
    const d = ctx.getImageData(0, 0, w, h).data;
    let n = 0, c = 0;
    for (let i = 3; i < d.length; i += 64) { n += 1; if (d[i] < 40) c += 1; }
    return n ? c / n : 0;
  };
  const check = () => {
    const s = st.current;
    if (s.done || !host.current) return;
    if (covered() > 0.55) { s.done = true; host.current.classList.add('is-clear'); }
  };

  useEffect(() => {
    const el = cv.current;
    const box = host.current;
    if (!el || !box) return undefined;
    const ctx = el.getContext('2d', { willReadFrequently: true });
    const s = st.current;
    let raf = 0, alive = true, t0 = 0, timer = 0;
    const quiet = reduced();

    const paint = () => {
      const { w, h } = s;
      ctx.globalCompositeOperation = 'source-over';
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#e9edf3'); g.addColorStop(0.28, '#aab2bf'); g.addColorStop(0.5, '#f6f8fb'); g.addColorStop(0.72, '#9aa3b0'); g.addColorStop(1, '#dfe4ec');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (let i = 0, n = Math.round((w * h) / 90); i < n; i += 1) {
        ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.35)' : 'rgba(70,80,96,.18)';
        ctx.fillRect(((i * 7919) % w), ((i * 104729) % h), 1 + (i % 5), 1);
      }
      let fs = Math.max(12, Math.round(h * 0.2));
      ctx.font = `400 ${fs}px Impact, 'Arial Narrow', sans-serif`;
      const tw = ctx.measureText('SCRATCH HERE').width;
      if (tw > w * 0.84) { fs = Math.max(10, Math.floor(fs * (w * 0.84) / tw)); ctx.font = `400 ${fs}px Impact, 'Arial Narrow', sans-serif`; }
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fillText('SCRATCH HERE', w / 2 + 1, h / 2 + 1);
      ctx.fillStyle = 'rgba(60,68,84,.85)'; ctx.fillText('SCRATCH HERE', w / 2, h / 2);
    };
    const fit = () => {
      const r = box.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || s.done) return;
      s.w = el.width = Math.round(r.width); s.h = el.height = Math.round(r.height);
      paint();
      if (quiet) { ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.ellipse(s.w / 2, s.h / 2, s.w * 0.34, s.h * 0.42, 0, 0, 7); ctx.fill(); }
    };
    fit();

    // first it scratches itself a little, so everybody sees what to do
    const coin = box.querySelector('.nv-coin');
    const path = [[0.14, 0.36], [0.86, 0.36], [0.86, 0.64], [0.14, 0.64]];
    const segLen = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
    const total = segLen.reduce((a, b) => a + b, 0);
    let prev = null;
    const at = (f) => {
      let d = f * total;
      for (let i = 0; i < segLen.length; i += 1) {
        if (d <= segLen[i] || i === segLen.length - 1) { const k = Math.min(1, d / (segLen[i] || 1)); return [(path[i][0] + (path[i + 1][0] - path[i][0]) * k) * s.w, (path[i][1] + (path[i + 1][1] - path[i][1]) * k) * s.h]; }
        d -= segLen[i];
      }
      return [0, 0];
    };
    const frame = (t) => {
      if (!alive || s.user || s.done) { if (coin) coin.style.opacity = 0; return; }
      raf = requestAnimationFrame(frame);
      if (!t0) t0 = t;
      const f = Math.min(1, Math.max(0, (t - t0 - 600) / 2600));
      if (f <= 0) return;
      const p = at(f);
      if (prev) stroke(prev, p);
      prev = p;
      if (coin) { coin.style.opacity = f >= 1 ? 0 : 1; coin.style.transform = `translate(${p[0]}px, ${p[1]}px)`; }
      if (f >= 1) { cancelAnimationFrame(raf); }
    };
    if (!quiet) raf = requestAnimationFrame(frame);
    timer = setInterval(check, 350);

    let ro = null;
    if ('ResizeObserver' in window) { ro = new ResizeObserver(fit); ro.observe(box); }
    return () => { alive = false; cancelAnimationFrame(raf); clearInterval(timer); if (ro) ro.disconnect(); };
  }, []);

  const pos = (e) => {
    const r = cv.current.getBoundingClientRect();
    return [(e.clientX - r.left) * (st.current.w / (r.width || 1)), (e.clientY - r.top) * (st.current.h / (r.height || 1))];
  };
  return (
    <div ref={host} className="nv nv-scratch" aria-hidden="true">
      <div className="nv-sc-under"><span className="nv-sc-q">?</span><span className="nv-sc-cap">Something big</span></div>
      <canvas
        ref={cv}
        className="nv-foil"
        onPointerDown={(e) => { const s = st.current; s.user = true; s.drag = true; s.last = pos(e); if (e.currentTarget.setPointerCapture) { try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) { /* fine */ } } stroke(s.last, s.last); }}
        onPointerMove={(e) => { const s = st.current; if (!s.drag) return; const p = pos(e); stroke(s.last, p); s.last = p; }}
        onPointerUp={() => { st.current.drag = false; check(); }}
        onPointerCancel={() => { st.current.drag = false; }}
      />
      <i className="nv-coin" />
    </div>
  );
}

/* ---------- chat: "someone is typing..." ---------- */
export function ChatThread() {
  return (
    <div className="nv nv-chat" aria-hidden="true">
      <p className="nv-m in" style={{ '--i': 0 }}>psst... are you there?</p>
      <p className="nv-m in" style={{ '--i': 1 }}>something big is coming</p>
      <p className="nv-m out extra" style={{ '--i': 2 }}>what is it??</p>
      <p className="nv-m in dots" style={{ '--i': 3 }}><i /><i /><i /></p>
    </div>
  );
}

/* ---------- comic panel: a burst with "?!" ---------- */
const STAR = (() => {
  const pts = [];
  for (let i = 0; i < 32; i += 1) {
    const r = i % 2 ? 37 : 50;
    const a = (i / 32) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(1)}% ${(50 + r * Math.sin(a)).toFixed(1)}%`);
  }
  return `polygon(${pts.join(',')})`;
})();
export function ComicPanel() {
  return (
    <div className="nv nv-comic" aria-hidden="true">
      <span className="nv-cm-star" style={{ clipPath: STAR }}><span style={{ clipPath: STAR }} /></span>
      <b className="nv-cm-q">?!</b>
      <span className="nv-cm-bubble">Psst!</span>
      <span className="nv-cm-sfx">Boom</span>
    </div>
  );
}

/* ---------- TV news screen: LIVE, lower third and a ticker ---------- */
const TICK = 'Name to be announced soon  ✦  Dates under wraps  ✦  Details locked for now  ✦  Stay tuned  ✦  ';
export function TvScreen() {
  return (
    <div className="nv nv-tv" aria-hidden="true">
      <span className="nv-tv-globe"><i /><i /><i /></span>
      <span className="nv-tv-live"><i />Live</span>
      <div className="nv-tv-low"><b>Breaking</b><span>Something big is on the way</span></div>
      <div className="nv-tv-tick"><span>{TICK}{TICK}</span></div>
    </div>
  );
}

/* ---------- crash screen (blue screen of death) with a ticking percent and a QR code ---------- */
const QN = 13;
const QCELLS = (() => {
  const out = [];
  let k = 11;
  const rnd = () => { k = (k * 1103515245 + 12345) & 0x7fffffff; return k / 0x7fffffff; };
  for (let y = 0; y < QN; y += 1) {
    for (let x = 0; x < QN; x += 1) {
      const finder = (x < 5 && y < 5) || (x > QN - 6 && y < 5) || (x < 5 && y > QN - 6);
      if (!finder && rnd() > 0.5) out.push([x, y]);
    }
  }
  return out;
})();
function Qr() {
  return (
    <svg className="nv-bs-qr" viewBox={`-1 -1 ${QN + 2} ${QN + 2}`} shapeRendering="crispEdges" aria-hidden="true">
      <rect x="-1" y="-1" width={QN + 2} height={QN + 2} fill="#fff" />
      {QCELLS.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#111" />)}
      {[[0, 0], [QN - 4, 0], [0, QN - 4]].map(([x, y]) => (
        <g key={`${x}${y}`}><rect x={x} y={y} width="4" height="4" fill="#111" /><rect x={x + 1} y={y + 1} width="2" height="2" fill="#fff" /></g>
      ))}
    </svg>
  );
}
export function BsodScreen() {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduced()) { setN(35); return undefined; }
    let id = 0, v = 0;
    const step = () => { v = v >= 99 ? 0 : v + 1; setN(v); id = setTimeout(step, v >= 99 ? 1400 : v % 17 === 0 ? 520 : 95); };
    id = setTimeout(step, 400);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className="nv nv-bsod" aria-hidden="true">
      <b className="nv-bs-face">:(</b>
      <div className="nv-bs-txt"><span>Something big is loading</span><span>{n}% complete</span><small>Stop code: BIG_NEWS_INCOMING</small></div>
      <Qr />
    </div>
  );
}

/* ---------- clapperboard: it claps now and then ---------- */
export function Clapper() {
  return (
    <div className="nv nv-clap" aria-hidden="true">
      <span className="nv-cl-bar t" /><span className="nv-cl-bar b" />
      <div className="nv-cl-board">
        <span className="nv-cl-stick" />
        <span className="nv-cl-top" />
        <div className="nv-cl-body">
          <p><small>Prod.</small><b>Sipna Coders</b></p>
          <div className="nv-cl-grid"><p><small>Scene</small><b>?</b></p><p><small>Take</small><b>?</b></p><p><small>Roll</small><b>?</b></p></div>
        </div>
      </div>
      <i className="nv-cl-flash" />
    </div>
  );
}

/* ---------- synthwave sunset: striped sun, moving grid and a "?" ---------- */
export function Sunset() {
  return (
    <div className="nv nv-sun" aria-hidden="true">
      <span className="nv-sn-sun" />
      <b className="nv-sn-q">?</b>
      <span className="nv-sn-grid"><i /></span>
    </div>
  );
}

/* ---------- self-destruct: red countdown, hazard stripes and a burning fuse ---------- */
const TICKS = ['9', '8', '7', '6', '5', '4', '3', '2', '1', '0', '??'];
export function Bomb() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced()) { setI(TICKS.length - 1); return undefined; }
    let id = 0, v = 0;
    const step = () => { v = (v + 1) % TICKS.length; setI(v); id = setTimeout(step, v === TICKS.length - 1 ? 1800 : 1000); };
    id = setTimeout(step, 1000);
    return () => clearTimeout(id);
  }, []);
  const d = TICKS[i];
  return (
    <div className="nv nv-spy" aria-hidden="true">
      <span className="nv-sp-haz t" /><span className="nv-sp-haz b" />
      <div className={`nv-sp-led ${d === '??' ? 'is-err' : ''}`}><span>00:0</span><b>{d}</b></div>
      <p className="nv-sp-msg">This message will self-destruct</p>
      <span className="nv-sp-fuse"><i /></span>
    </div>
  );
}

/* ---------- RPG: a treasure chest with a floating "?" ---------- */
export function Chest() {
  return (
    <div className="nv nv-quest" aria-hidden="true">
      <span className="nv-qs-rays" />
      <b className="nv-qs-q">?</b>
      <svg className="nv-qs-chest" viewBox="0 0 16 14" shapeRendering="crispEdges">
        <g className="nv-qs-lid">
          <rect x="2" y="0" width="12" height="1" fill="#2a1208" />
          <rect x="1" y="1" width="14" height="5" fill="#2a1208" />
          <rect x="2" y="1" width="12" height="4" fill="#b86a28" />
          <rect x="2" y="1" width="12" height="1" fill="#e09a4a" />
          <rect x="4" y="1" width="1" height="5" fill="#3c1d0c" />
          <rect x="11" y="1" width="1" height="5" fill="#3c1d0c" />
        </g>
        <rect x="1" y="6" width="14" height="8" fill="#2a1208" />
        <rect x="2" y="6" width="12" height="7" fill="#8b4a1a" />
        <rect x="2" y="11" width="12" height="2" fill="#6d3812" />
        <rect x="4" y="6" width="1" height="7" fill="#3c1d0c" />
        <rect x="11" y="6" width="1" height="7" fill="#3c1d0c" />
        <rect x="6" y="5" width="4" height="4" fill="#2a1208" />
        <rect x="7" y="6" width="2" height="2" fill="#ffd23f" />
      </svg>
      <i className="nv-qs-sp a" /><i className="nv-qs-sp b" /><i className="nv-qs-sp c" />
    </div>
  );
}
