// Past events as a vertical timeline. A glowing line draws itself as you scroll,
// dots light up as you reach each event, and tapping an event opens its photos.
//
// At the top, under "Coming up", there are two kinds of black "photos coming" boxes, in this order:
//  1) one permanent plain "Event name coming soon" box (turn it off with SHOW_NEXT_EVENT_BOX below)
//  2) after it, a box for every event you added in data/site.js that has a title but NO photos yet (images: [])
//     -> it shows the event name, type and date, and turns into a normal photo card once you add images
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './Icons';
import { Reveal } from './ui';
import { Lightbox, usePast } from './events';
import { pastEvents } from '../data/site';
import { normCat, catColor, dateFromText } from './time';
import './TimelineSoon.css';

/* ✏️ THE PLAIN "COMING SOON" BOX (always the first box under "Coming up")
   true = show it, false = hide it. You can change its words below. */
const SHOW_NEXT_EVENT_BOX = true;
const NEXT_BOX = {
  chip: 'Event',
  title: 'Event name coming soon',
  text: 'This one is still ahead of us. Photos and highlights will be added here right after the event.',
  date: 'Coming soon',
  note: 'Photos will be added after the event',
};
const SOON_COLOR = '#c792ea';

// events you announced (they have a title) but that have no photos yet
const hasImages = (e) => !!(e.images && e.images.length);
const soonEvents = pastEvents.filter((e) => e.title && String(e.title).trim() && !hasImages(e));

export default function Timeline() {
  const photos = usePast();                 // finished events that have photos, newest first
  const wrap = useRef(null);
  const [fill, setFill] = useState(0);
  const [open, setOpen] = useState(null);

  // group events by year (list is already newest first)
  const groups = useMemo(() => {
    const out = [];
    const thisYear = String(new Date().getFullYear());
    photos.forEach((ev) => {
      const year = (ev.sortDate || dateFromText(ev.date) || '').slice(0, 4) || thisYear;
      if (!out.length || out[out.length - 1].year !== year) out.push({ year, items: [] });
      out[out.length - 1].items.push(ev);
    });
    return out;
  }, [photos]);

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

  const soonCount = soonEvents.length + (SHOW_NEXT_EVENT_BOX ? 1 : 0);
  let n = soonCount;                        // the "coming up" boxes take the first spots (left, right, left ...)
  return (
    <div className="s-tl" ref={wrap}>
      <div className="s-tl-line" aria-hidden="true"><div className="s-tl-fill" style={{ height: `${fill}px` }} /></div>
      {soonCount > 0 && (
        <div className="s-tl-group">
          <Marker fill={fill}><span>Coming up</span></Marker>
          {SHOW_NEXT_EVENT_BOX && (
            <SoonItem key="soon-plain" side="l" fill={fill} />
          )}
          {soonEvents.map((ev, i) => (
            <SoonItem key={`soon-${i}`} ev={ev} side={(i + (SHOW_NEXT_EVENT_BOX ? 1 : 0)) % 2 ? 'r' : 'l'} fill={fill} />
          ))}
        </div>
      )}
      {groups.map((g) => (
        <div className="s-tl-group" key={g.year}>
          <Marker fill={fill}><span>{g.year}</span></Marker>
          {g.items.map((ev) => (
            <Item key={ev.id} ev={ev} side={n++ % 2 ? 'r' : 'l'} fill={fill} onOpen={() => setOpen(photos.indexOf(ev))} />
          ))}
        </div>
      ))}
      {open !== null && photos[open] && (
        <Lightbox list={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
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

// a black "photos coming after the event" box (not clickable).
// With `ev` it shows that event's name, type and date; without it, the plain "Event name coming soon" box.
function SoonItem({ ev, side, fill }) {
  const [ref, top] = useTop();
  const info = ev
    ? {
        chip: ev.category ? normCat(ev.category) : NEXT_BOX.chip,
        title: ev.title,
        text: ev.description || NEXT_BOX.text,
        date: ev.date || NEXT_BOX.date,
        note: NEXT_BOX.note,
        color: ev.category ? catColor(ev.category) : SOON_COLOR,
      }
    : { ...NEXT_BOX, color: SOON_COLOR };
  return (
    <div ref={ref} className={`s-tl-item is-soon ${side} ${fill > top + 40 ? 'on' : ''}`} style={{ '--c': info.color }}>
      <span className="s-tl-dot" aria-hidden="true" />
      <Reveal className="s-tl-card">
        <div className="s-tl-card-in is-soon">
          <div className="s-tl-media is-soon" aria-hidden="true">
            <span className="s-tl-wait"><Icon.Image size={22} /></span>
            <code className="s-tl-term">photos: pending<i>_</i></code>
            <span className="s-tl-date"><Icon.Calendar size={13} /> {info.date}</span>
          </div>
          <div className="s-tl-body">
            <span className="s-chip">{info.chip}</span>
            <h3>{info.title}</h3>
            <p>{info.text}</p>
            <span className="s-tl-soon"><Icon.Clock size={15} /> {info.note}</span>
          </div>
        </div>
      </Reveal>
    </div>
  );
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
            <img src={imgs[0]} alt="" loading="lazy" decoding="async" />
            {ev.date && <span className="s-tl-date"><Icon.Calendar size={13} /> {ev.date}</span>}
            {imgs.length > 1 && <span className="s-past-count"><Icon.Image size={13} /> {imgs.length}</span>}
          </div>
          <div className="s-tl-body">
            <span className="s-chip">{normCat(ev.category)}</span>
            <h3>{ev.title}</h3>
            {ev.description && <p>{ev.description}</p>}
            <span className="s-link">View photos <Icon.ArrowRight size={15} /></span>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
