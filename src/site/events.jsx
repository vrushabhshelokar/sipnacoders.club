// Event components: featured "next up" card, countdown, event cards, past-event cards + photo viewer.
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Icon } from './Icons';
import { Reveal } from './ui';
import { LINKS, upcomingEvents, pastEvents } from '../data/site';
import {
  getUpcoming, getPast, useCountdown, fmtDay, fmtMon, fmtFull, fmtTime, durLabel, relative, gcalLink, normCat, catColor, hasPhotos,
} from './time';
import HackathonTeaser, { isTeaserLive } from './HackathonTeaser';

export function useUpcoming() {
  const [now] = useState(() => Date.now());
  return useMemo(() => getUpcoming(upcomingEvents, now), [now]);
}
export const usePast = () => useMemo(() => getPast(pastEvents), []);

/* live countdown */
export function Countdown({ at }) {
  const c = useCountdown(at);
  if (!c) return null;
  if (c.live) return <div className="s-live"><i /> Happening now</div>;
  const cells = [['Days', c.d], ['Hours', c.h], ['Mins', c.m], ['Secs', c.s]];
  return (
    <div className="s-cd" role="timer" aria-label={`${c.d} days ${c.h} hours ${c.m} minutes to go`}>
      {cells.map(([label, v]) => (
        <div className="s-cd-cell" key={label}>
          <b key={v}>{String(v).padStart(2, '0')}</b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function RegisterBtn({ ev, small = false }) {
  if (ev.registerLink) {
    return (
      <a className={`s-btn s-btn-light ${small ? 's-btn-sm' : ''}`} href={ev.registerLink} target="_blank" rel="noopener noreferrer">
        Register now <Icon.ArrowUpRight size={15} />
      </a>
    );
  }
  return (
    <span className={`s-btn s-btn-muted ${small ? 's-btn-sm' : ''}`} aria-disabled="true">
      <Icon.Clock size={14} /> Registration opens soon
    </span>
  );
}

function CalLink({ ev }) {
  if (!ev.at) return null;
  return (
    <a className="s-link" href={gcalLink(ev)} target="_blank" rel="noopener noreferrer">
      <Icon.CalendarPlus size={15} /> Add to calendar
    </a>
  );
}

/* the big "next up" card */
export function FeaturedEvent({ ev }) {
  return (
    <article className="s-feat" style={{ '--c': catColor(ev.category) }}>
      <div className="s-feat-media">
        {ev.poster
          ? <img src={ev.poster} alt={`${ev.title} poster`} loading="lazy" decoding="async" />
          : (
            <div className="s-feat-cover" aria-hidden="true">
              <b>&lt;/&gt;</b>
              <span>{normCat(ev.category)}</span>
            </div>
          )}
        <span className="s-flag"><i /> Next up</span>
      </div>
      <div className="s-feat-body">
        <div className="s-row">
          <span className="s-chip">{normCat(ev.category)}</span>
          <span className="s-when">{relative(ev.at)}</span>
        </div>
        <h3 className="s-feat-title">{ev.title}</h3>
        {ev.description && <p className="s-feat-desc">{ev.description}</p>}
        <ul className="s-facts">
          <li><Icon.Calendar size={16} /><span>{ev.at ? fmtFull(ev.at) : 'Date TBA'}</span></li>
          <li><Icon.Clock size={16} /><span>{ev.at ? fmtTime(ev.at) : 'Time TBA'}{ev.durationMins ? ` · ${durLabel(ev.durationMins)}` : ''}</span></li>
          <li><Icon.MapPin size={16} /><span>{ev.venue || 'Venue TBA'}</span></li>
        </ul>
        {ev.at && <Countdown at={ev.at} />}
        <div className="s-actions">
          <RegisterBtn ev={ev} />
          <CalLink ev={ev} />
        </div>
      </div>
    </article>
  );
}

/* smaller upcoming card */
function EventCard({ ev, i }) {
  return (
    <Reveal className="s-ev" delay={i * 90} style={{ '--c': catColor(ev.category) }}>
      <div className="s-ev-date">
        {ev.at ? <><b>{fmtDay(ev.at)}</b><span>{fmtMon(ev.at)}</span></> : <><b>TBA</b><span>Date</span></>}
      </div>
      <div className="s-ev-body">
        <div className="s-row">
          <span className="s-chip">{normCat(ev.category)}</span>
          <span className="s-when">{relative(ev.at)}</span>
        </div>
        <h4>{ev.title}</h4>
        {ev.description && <p>{ev.description}</p>}
        <div className="s-ev-meta">
          <span><Icon.Clock size={14} />{ev.at ? fmtTime(ev.at) : 'Time TBA'}</span>
          <span><Icon.MapPin size={14} />{ev.venue || 'Venue TBA'}</span>
        </div>
        <div className="s-actions s-actions-sm">
          <RegisterBtn ev={ev} small />
          <CalLink ev={ev} />
        </div>
      </div>
    </Reveal>
  );
}

/* featured + the rest, or a friendly empty state */
export function UpcomingBlock() {
  const list = useUpcoming();
  if (!list.length && isTeaserLive()) return <HackathonTeaser />;
  if (!list.length) {
    return (
      <Reveal className="s-soon">
        <div className="s-soon-glow" aria-hidden="true" />
        <span className="s-soon-ic" aria-hidden="true"><Icon.Calendar size={26} /></span>
        <span className="s-soon-tag"><i /> Coming soon</span>
        <h3>Our next event is being planned.</h3>
        <p>
          Workshops, hackathons and coding contests are in the works.
          Join the club to hear about it first and to get a seat.
        </p>
        <a className="s-btn s-btn-light" href={LINKS.joinForm} target="_blank" rel="noopener noreferrer">
          <Icon.Bell size={16} /> Get notified
        </a>
      </Reveal>
    );
  }
  const [first, ...rest] = list;
  return (
    <div className="s-upcoming">
      <HackathonTeaser />
      <Reveal><FeaturedEvent ev={first} /></Reveal>
      {rest.length > 0 && (
        <div className="s-ev-grid">
          {rest.map((ev, i) => <EventCard key={ev.id} ev={ev} i={i} />)}
        </div>
      )}
    </div>
  );
}

/* past-event card */
export function PastCard({ ev, i, onOpen }) {
  const key = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } };
  const imgs = ev.images || [];
  return (
    <Reveal className="s-past" delay={(i % 3) * 90} style={{ '--c': catColor(ev.category) }}>
      <div className="s-past-in" role="button" tabIndex={0} onClick={onOpen} onKeyDown={key} aria-label={`Open photos of ${ev.title}`}>
        <div className="s-past-media">
          {imgs[0] && <img src={imgs[0]} alt="" loading="lazy" decoding="async" />}
          {imgs.length > 1 && <span className="s-past-count"><Icon.Image size={13} /> {imgs.length}</span>}
        </div>
        <div className="s-past-body">
          <div className="s-row">
            <span className="s-chip">{normCat(ev.category)}</span>
            <span className="s-date">{ev.date}</span>
          </div>
          <h4>{ev.title}</h4>
          <p>{ev.description}</p>
        </div>
      </div>
    </Reveal>
  );
}

/* past events with optional filter buttons */
export function PastEvents({ limit, filters = true }) {
  const everything = usePast();
  const all = useMemo(() => everything.filter(hasPhotos), [everything]);
  const cats = useMemo(() => ['All', ...Array.from(new Set(all.map((e) => normCat(e.category))))], [all]);
  const [cat, setCat] = useState('All');
  const [open, setOpen] = useState(null);
  let list = cat === 'All' ? all : all.filter((e) => normCat(e.category) === cat);
  if (limit) list = list.slice(0, limit);

  return (
    <>
      {filters && (
        <div className="s-filters" role="tablist" aria-label="Filter events">
          {cats.map((c) => (
            <button key={c} role="tab" aria-selected={c === cat} className={c === cat ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      )}
      <div className="s-past-grid">
        {list.map((e, i) => <PastCard key={cat + e.id} ev={e} i={i} onOpen={() => setOpen(i)} />)}
      </div>
      {open !== null && list[open] && (
        <Lightbox list={list} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      )}
    </>
  );
}

/* ---------- Home page: past events as a bento "spotlight" ----------
   big tile = latest event, two smaller tiles = the next two,
   wide tile = "+N more events" with sliding photo strips, links to the timeline. */

// gentle 3D tilt + light glare that follows the mouse (mouse only, not touch)
const tiltMove = (e) => {
  if (e.pointerType && e.pointerType !== 'mouse') return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  el.style.setProperty('--rx', `${((0.5 - y) * 5).toFixed(2)}deg`);
  el.style.setProperty('--ry', `${((x - 0.5) * 7).toFixed(2)}deg`);
  el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
  el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
};
const tiltLeave = (e) => {
  e.currentTarget.style.setProperty('--rx', '0deg');
  e.currentTarget.style.setProperty('--ry', '0deg');
};

function BentoTile({ ev, area, big = false, delay, onOpen }) {
  const imgs = ev.images || [];
  const key = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } };
  return (
    <Reveal className={`s-bt a-${area} ${big ? 'big' : ''}`} delay={delay} style={{ '--c': catColor(ev.category) }}>
      <div
        className="s-bt-in" role="button" tabIndex={0} onClick={onOpen} onKeyDown={key}
        onPointerMove={tiltMove} onPointerLeave={tiltLeave} aria-label={`Open photos of ${ev.title}`}
      >
        {imgs[0] && <img className="s-bt-img" src={imgs[0]} alt="" loading="lazy" decoding="async" />}
        <span className="s-bt-shade" aria-hidden="true" />
        <span className="s-bt-glare" aria-hidden="true" />
        {big && <span className="s-bt-latest"><i /> Latest event</span>}
        {imgs.length > 1 && <span className="s-past-count"><Icon.Image size={13} /> {imgs.length}</span>}
        <div className="s-bt-body">
          <div className="s-bt-meta">
            <span className="s-chip">{normCat(ev.category)}</span>
            <span className="s-bt-date">{ev.date}</span>
          </div>
          <h3>{ev.title}</h3>
          {big && <p>{ev.description}</p>}
          <span className="s-bt-cta">View photos <Icon.ArrowRight size={15} /></span>
        </div>
      </div>
    </Reveal>
  );
}

function BentoMore({ rest, total }) {
  // photos from the events not shown above, split into two strips that slide in opposite directions
  const pool = rest.flatMap((e) => (e.images || []).slice(0, 2));
  const rowA = pool.filter((_, i) => i % 2 === 0);
  const rowB = pool.filter((_, i) => i % 2 === 1);
  const strip = (row, cls) => (
    <div className={`s-bt-strip ${cls}`}>
      {[...row, ...row].map((src, i) => <img key={i} src={src} alt="" loading="lazy" decoding="async" />)}
    </div>
  );
  return (
    <Reveal className="s-bt s-bt-more a-more" delay={240}>
      <Link to="/events#past" className="s-bt-in" onPointerMove={tiltMove} onPointerLeave={tiltLeave} aria-label={`See all ${total} past events on the timeline`}>
        <div className="s-bt-strips" aria-hidden="true">
          {rowA.length > 0 && strip(rowA, 'go-l')}
          {rowB.length > 0 && strip(rowB, 'go-r')}
        </div>
        <span className="s-bt-shade" aria-hidden="true" />
        <span className="s-bt-glare" aria-hidden="true" />
        <div className="s-bt-body">
          <b className="s-bt-plus">+{rest.length}</b>
          <h3>more events</h3>
          <p>Seminars, workshops, build nights and more.</p>
          <span className="s-bt-cta">Open the timeline <Icon.ArrowRight size={15} /></span>
        </div>
      </Link>
    </Reveal>
  );
}

export function PastBento() {
  const everything = usePast();
  const all = useMemo(() => everything.filter(hasPhotos), [everything]);   // events without photos only show on the Events timeline
  const [open, setOpen] = useState(null);
  if (!all.length) return null;
  const top = all.slice(0, 3);
  const rest = all.slice(3);
  const areas = ['big', 's1', 's2'];
  return (
    <>
      <div className={`s-bento n${top.length} ${rest.length ? '' : 'no-more'}`}>
        {top.map((ev, i) => (
          <BentoTile key={ev.id} ev={ev} area={areas[i]} big={i === 0} delay={i * 90} onOpen={() => setOpen(i)} />
        ))}
        {rest.length > 0 && <BentoMore rest={rest} total={all.length} />}
      </div>
      {open !== null && all[open] && (
        <Lightbox list={all} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      )}
    </>
  );
}

/* full-screen photo viewer */
export function Lightbox({ list, index, onIndex, onClose }) {
  const ev = list[index];
  const imgs = ev.images || [];
  const [k, setK] = useState(0);
  useEffect(() => { setK(0); }, [index]);

  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') setK((x) => (x + 1) % imgs.length);
      else if (e.key === 'ArrowLeft') setK((x) => (x - 1 + imgs.length) % imgs.length);
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); root.style.overflow = prev; };
  }, [imgs.length, onClose]);

  return createPortal(
    <div className="s-lb" role="dialog" aria-modal="true" aria-label={ev.title} onClick={onClose}>
      <button className="s-lb-close" onClick={onClose} aria-label="Close"><Icon.X size={20} /></button>
      <div className="s-lb-panel" onClick={(e) => e.stopPropagation()}>
        <div className="s-lb-stage">
          <img key={imgs[k]} src={imgs[k]} alt={`${ev.title} photo ${k + 1}`} />
          {imgs.length > 1 && (
            <>
              <button className="s-lb-nav l" onClick={() => setK((x) => (x - 1 + imgs.length) % imgs.length)} aria-label="Previous photo"><Icon.ChevronLeft size={22} /></button>
              <button className="s-lb-nav r" onClick={() => setK((x) => (x + 1) % imgs.length)} aria-label="Next photo"><Icon.ChevronRight size={22} /></button>
              <span className="s-lb-count">{k + 1} / {imgs.length}</span>
            </>
          )}
        </div>
        <div className="s-lb-info">
          <div className="s-row">
            <span className="s-chip" style={{ '--c': catColor(ev.category) }}>{normCat(ev.category)}</span>
            <span className="s-date">{ev.date}</span>
          </div>
          <h3>{ev.title}</h3>
          <p>{ev.description}</p>
          <div className="s-lb-step">
            <button className="s-link" disabled={index === 0} onClick={() => onIndex(index - 1)}><Icon.ChevronLeft size={15} /> Newer</button>
            <button className="s-link" disabled={index === list.length - 1} onClick={() => onIndex(index + 1)}>Older <Icon.ChevronRight size={15} /></button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
