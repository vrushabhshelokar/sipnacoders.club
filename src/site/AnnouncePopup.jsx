// Announcement popup: only hints that something big is coming and takes visitors straight to "Upcoming events".
// All the information stays on the Upcoming events card. Shows once per visit (after the opening animation),
// and only while the Upcoming events teaser card is live.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './Icons';
import { useIntroDone } from './ui';
import { isTeaserLive } from './HackathonTeaser';
import './AnnouncePopup.css';

/* ✏️ EDIT HERE ------------------------------------------------------------- */
const SHOW_POPUP = true;        // set to false to turn the popup off completely
const SEEN_KEY = 'scc-hack-popup-1'; // change the number (…-2) to show it again to people who already closed it
const DELAY = 600;              // milliseconds to wait after the opening animation
const SKIP_ON = ['/register'];  // pages where the popup never appears
/* ------------------------------------------------------------------------- */

let handled = false; // also remembers "already shown" when the browser blocks sessionStorage
const wasSeen = () => {
  if (handled) return true;
  try { return window.sessionStorage.getItem(SEEN_KEY) === '1'; } catch { return false; }
};
const markSeen = () => {
  handled = true;
  try { window.sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* storage blocked: the variable above is enough */ }
};
const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

export default function AnnouncePopup() {
  const introDone = useIntroDone();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const back = useRef(null);
  const card = useRef(null);
  const cta = useRef(null);
  const from = useRef(null);
  const skip = SKIP_ON.includes(pathname);

  // open it once the opening animation is over
  useEffect(() => {
    if (!SHOW_POPUP || !introDone || skip || wasSeen() || !isTeaserLive()) return undefined;
    const id = setTimeout(() => {
      if (wasSeen()) return;
      from.current = document.activeElement;
      markSeen();
      setOpen(true);
    }, DELAY);
    return () => clearTimeout(id);
  }, [introDone, skip]);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
      const el = from.current;
      if (el && el.focus && document.contains(el)) el.focus({ preventScroll: true });
    }, 240);
  }, []);

  // while it is open: Esc closes, Tab stays inside, the page behind does not scroll
  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => { if (cta.current) cta.current.focus({ preventScroll: true }); }, 60);
    const onKey = (e) => {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab' || !card.current) return;
      const items = [...card.current.querySelectorAll('button, a[href]')].filter((n) => !n.disabled);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!card.current.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    };
    const b = back.current;
    const stop = (e) => { if (!card.current || !card.current.contains(e.target)) e.preventDefault(); };
    document.addEventListener('keydown', onKey);
    if (b) { b.addEventListener('wheel', stop, { passive: false }); b.addEventListener('touchmove', stop, { passive: false }); }
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      if (b) { b.removeEventListener('wheel', stop); b.removeEventListener('touchmove', stop); }
    };
  }, [open, close]);

  // "See what's coming": go to Upcoming events (this page, or the home page if we are somewhere else)
  const go = () => {
    from.current = null;
    if (pathname === '/' || pathname === '/events') {
      const el = document.getElementById('upcoming');
      if (el) el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' });
    } else {
      navigate('/#upcoming');
    }
    close();
  };

  if (!open) return null;

  return (
    <div
      ref={back}
      className={`s-ann ${closing ? 'is-out' : ''}`}
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div ref={card} className="s-ann-card" role="dialog" aria-modal="true" aria-labelledby="s-ann-t" aria-describedby="s-ann-d">
        <button type="button" className="s-ann-x" onClick={close} aria-label="Close">
          <Icon.X size={18} />
        </button>

        <div className="s-ann-vis" aria-hidden="true">
          <div className="s-ann-radar">
            <i /><i /><i />
            <b className="s-ann-sweep" />
            <em className="b1" /><em className="b2" /><em className="b3" />
          </div>
          <span className="s-ann-q">?</span>
        </div>

        <div className="s-ann-body">
          <span className="s-ann-flag"><i /> New signal detected</span>
          <h2 id="s-ann-t" className="s-ann-title"><span>Something big</span> is coming</h2>
          <p id="s-ann-d" className="s-ann-desc">
            Tap below to see what&apos;s next at Sipna Coders Club.
          </p>

          <div className="s-ann-actions">
            <button ref={cta} type="button" className="s-btn s-btn-light s-ann-go" onClick={go}>
              See what&apos;s coming <span className="s-ann-down" aria-hidden="true"><Icon.ArrowRight size={17} /></span>
            </button>
            <button type="button" className="s-ann-later" onClick={close}>Maybe later</button>
          </div>
        </div>
      </div>
    </div>
  );
}
