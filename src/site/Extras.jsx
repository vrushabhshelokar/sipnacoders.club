// Small extras: scroll progress line + the "sudo" Matrix easter egg.
import { useEffect, useRef, useState } from 'react';

/* thin line in the logo colours along the top that fills as you scroll */
export function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
        if (ref.current) ref.current.style.transform = `scaleX(${p})`;
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const ro = new ResizeObserver(update);
    ro.observe(document.body);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);
  return <div className="s-progress" ref={ref} aria-hidden="true" />;
}

/* Easter egg: type "sudo" anywhere (or tap the logo 5 times on a phone) -> Matrix code rain */
export function MatrixEgg() {
  const [run, setRun] = useState(0);
  const [toast, setToast] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    let buf = '';
    const trigger = () => setRun((r) => r + 1);
    const onKey = (e) => {
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (!e.key || e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-4);
      if (buf === 'sudo') { buf = ''; trigger(); }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('scc:egg', trigger);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('scc:egg', trigger); };
  }, []);

  useEffect(() => {
    if (!run) return undefined;
    setToast(true);
    const hideToast = setTimeout(() => setToast(false), 4200);
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const c = canvasRef.current;
    if (reduce || !c) return () => clearTimeout(hideToast);

    const g = c.getContext('2d');
    const W = window.innerWidth, H = window.innerHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = W * dpr; c.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    c.classList.add('on');
    const fs = W < 700 ? 14 : 16;
    const cols = Math.ceil(W / fs);
    const drops = Array.from({ length: cols }, () => -Math.random() * 40);
    const chars = 'アイウエオカキクケコ01<>/{}[]=+*;#$'.split('');
    const start = performance.now();
    let raf = 0, last = 0;
    const draw = (now) => {
      if (now - last > 45) {
        last = now;
        g.fillStyle = 'rgba(2, 6, 3, .12)';
        g.fillRect(0, 0, W, H);
        g.font = `600 ${fs}px ui-monospace, Menlo, Consolas, monospace`;
        for (let i = 0; i < cols; i++) {
          const ch = chars[(Math.random() * chars.length) | 0];
          g.fillStyle = Math.random() < 0.06 ? '#e8ffe9' : '#3ddc84';
          g.fillText(ch, i * fs, drops[i] * fs);
          if (drops[i] * fs > H && Math.random() > 0.975) drops[i] = 0;
          drops[i] += 1;
        }
      }
      if (now - start < 4200) raf = requestAnimationFrame(draw);
      else c.classList.remove('on');
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); clearTimeout(hideToast); c.classList.remove('on'); };
  }, [run]);

  return (
    <>
      <canvas ref={canvasRef} className="s-matrix" aria-hidden="true" />
      <div className={`s-toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">
        <span>$ sudo</span> access granted. welcome to the club, hacker &#128526;
      </div>
    </>
  );
}
