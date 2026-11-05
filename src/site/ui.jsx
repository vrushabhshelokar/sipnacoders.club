// Shared building blocks: scroll reveal, count-up, section headings, typing code card.
import { useEffect, useMemo, useRef, useState } from 'react';
import { highlight, renderTokens } from './highlight';

const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

/* visible on screen (fires once) */
export function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) { setInView(true); return undefined; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); io.disconnect(); }
    }, { threshold, rootMargin: '0px 0px -6% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* true once the opening animation (public/intro/intro.js) has finished */
export function useIntroDone() {
  const [done, setDone] = useState(() => !document.getElementById('scc-intro'));
  useEffect(() => {
    if (done) return undefined;
    const check = () => {
      if (!document.getElementById('scc-intro')) { setDone(true); mo.disconnect(); }
    };
    const mo = new MutationObserver(check);
    mo.observe(document.body, { childList: true });
    check();
    return () => mo.disconnect();
  }, [done]);
  return done;
}

/* fades + slides in when scrolled into view */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children, ...rest }) {
  const [ref, inView] = useInView();
  return (
    <Tag ref={ref} className={`rv ${inView ? 'in' : ''} ${className}`} style={{ '--d': `${delay}ms`, ...style }} {...rest}>
      {children}
    </Tag>
  );
}

/* number that counts up when visible */
export function CountUp({ to, play, duration = 1500, suffix = '' }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!play) return undefined;
    if (reduced()) { setV(to); return undefined; }
    let raf, t0 = null;
    const step = (t) => {
      if (t0 === null) t0 = t;
      const k = Math.min(1, (t - t0) / duration);
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [play, to, duration]);
  return <>{v}{suffix}</>;
}

/* small label + big title + subtitle */
export function SectionHead({ eyebrow, title, sub, center = false }) {
  return (
    <Reveal className={`s-head ${center ? 'is-center' : ''}`}>
      {eyebrow && <span className="s-eyebrow">{eyebrow}</span>}
      <h2 className="s-h2">{title}</h2>
      {sub && <p className="s-sub">{sub}</p>}
    </Reveal>
  );
}

/* header used at the top of inner pages */
export function PageHead({ eyebrow, title, sub }) {
  return (
    <header className="s-pagehead">
      <div className="s-pagehead-glow" aria-hidden="true" />
      <div className="s-container">
        <Reveal>
          {eyebrow && <span className="s-eyebrow">{eyebrow}</span>}
          <h1 className="s-h1">{title}</h1>
          {sub && <p className="s-sub s-sub-lg">{sub}</p>}
        </Reveal>
      </div>
    </header>
  );
}

/* editor-style card that types out a code snippet */
export function CodeCard({ code, play, file = 'future.js', output, speed = 75 }) {
  const tokens = useMemo(() => highlight(code), [code]);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!play) return undefined;
    if (reduced()) { setN(code.length); return undefined; }
    let raf, t0 = null;
    const step = (t) => {
      if (t0 === null) t0 = t;
      const k = Math.floor(((t - t0) / 1000) * speed);
      if (k >= code.length) { setN(code.length); return; }
      setN(k);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [code, play, speed]);
  const done = n >= code.length;
  return (
    <div className="s-code">
      <div className="s-code-bar">
        <span className="s-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="s-code-file">{file}</span>
      </div>
      <pre className="s-code-src">
        <code className="ghost" aria-hidden="true">{renderTokens(tokens)}</code>
        <code className="live">{renderTokens(tokens, n)}{!done && <span className="s-caret-bar" />}</code>
      </pre>
      {output && <div className={`s-code-out ${done ? 'on' : ''}`}>{output}</div>}
    </div>
  );
}

/* slot-machine number: each digit spins into place when `play` turns true */
const DIGITS20 = '01234567890123456789'.split('');
export function Odometer({ value, play, suffix = '' }) {
  const digits = String(value).split('');
  return (
    <span className="odo" aria-label={`${value}${suffix}`}>
      <span className="odo-in" aria-hidden="true">
        {digits.map((d, i) => (
          <span className="odo-col" key={i}>
            <span className="odo-strip" style={{ '--n': play ? Number(d) + 10 : 0, '--i': i }}>
              {DIGITS20.map((n, k) => <span key={k}>{n}</span>)}
            </span>
          </span>
        ))}
        {suffix && <span className="odo-suf">{suffix}</span>}
      </span>
    </span>
  );
}
