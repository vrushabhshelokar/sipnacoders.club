// Past events as a vertical timeline. A glowing line draws itself as you scroll,
// dots light up as you reach each event, and tapping an event opens its photos.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './Icons';
import { Reveal } from './ui';
import { Lightbox, usePast } from './events';
import { normCat, catColor } from './time';

export default function Timeline() {
  const all = usePast();
  const wrap = useRef(null);
  const [fill, setFill] = useState(0);
  const [open, setOpen] = useState(null);

  // group events by year (list is already newest first)
  const groups = useMemo(() => {
    const out = [];
    all.forEach((ev, index) => {
      const year = (ev.sortDate || '').slice(0, 4) || 'Earlier';
      if (!out.length || out[out.length - 1].year !== year) out.push({ year, items: [] });
      out[out.length - 1].items.push({ ev, index });
    });
    return out;
  }, [all]);

  // how far the glowing line has been "drawn"
  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = wrap.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        setFill(Math.max(0, Math.min(r.height, window.innerHeight * 0.62 - r.top)));
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);

  let n = 0;
  return (
    <div className="s-tl" ref={wrap}>
      <div className="s-tl-line" aria-hidden="true"><div className="s-tl-fill" style={{ height: `${fill}px` }} /></div>
      {groups.map((g) => (
        <div className="s-tl-group" key={g.year}>
          <Marker fill={fill}><span>{g.year}</span></Marker>
          {g.items.map(({ ev, index }) => (
            <Item key={ev.id} ev={ev} side={n++ % 2 ? 'r' : 'l'} fill={fill} onOpen={() => setOpen(index)} />
          ))}
        </div>
      ))}
      {open !== null && all[open] && (
        <Lightbox list={all} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      )}
    </div>
  );
}

// remembers its own position inside the timeline so it knows when the line reaches it
function useTop() {
  const ref = useRef(null);
  const [top, setTop] = useState(Infinity);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => setTop(el.offsetTop);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el.closest('.s-tl') || el);
    return () => ro.disconnect();
  }, []);
  return [ref, top];
}

function Marker({ fill, children }) {
  const [ref, top] = useTop();
  return <div ref={ref} className={`s-tl-year ${fill > top + 10 ? 'on' : ''}`}>{children}</div>;
}

function Item({ ev, side, fill, onOpen }) {
  const [ref, top] = useTop();
  const imgs = ev.images || [];
  const key = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } };
  return (
    <div ref={ref} className={`s-tl-item ${side} ${fill > top + 40 ? 'on' : ''}`} style={{ '--c': catColor(ev.category) }}>
      <span className="s-tl-dot" aria-hidden="true" />
      <Reveal className="s-tl-card">
        <div className="s-tl-card-in" role="button" tabIndex={0} onClick={onOpen} onKeyDown={key} aria-label={`Open photos of ${ev.title}`}>
          <div className="s-tl-media">
            {imgs[0] && <img src={imgs[0]} alt="" loading="lazy" decoding="async" />}
            <span className="s-tl-date"><Icon.Calendar size={13} /> {ev.date}</span>
            {imgs.length > 1 && <span className="s-past-count"><Icon.Image size={13} /> {imgs.length}</span>}
          </div>
          <div className="s-tl-body">
            <span className="s-chip">{normCat(ev.category)}</span>
            <h3>{ev.title}</h3>
            <p>{ev.description}</p>
            <span className="s-link">View photos <Icon.ArrowRight size={15} /></span>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
