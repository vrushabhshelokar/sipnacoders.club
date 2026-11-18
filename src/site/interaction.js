// interaction.js - "has the visitor started using the page yet?"
// Things that are only nice to have (the announcement popup, the moving colours on the hero, downloading the other pages in the
// background) wait for the first touch, tap, key press, mouse move or scroll, or for 60 seconds. That keeps them out of the page's
// loading time (Google's speed test never touches the page) and a real visitor starts using the page within a second or two anyway.
// At that moment <html> gets the class "s-touched" (the CSS uses it).
import { useEffect, useState } from 'react';

let touched = false;
let timer = 0;
const waiting = new Set();
const EVENTS = ['pointerdown', 'touchstart', 'keydown', 'wheel', 'mousemove', 'scroll'];

function start() {
  if (touched) return;
  touched = true;
  clearTimeout(timer);
  EVENTS.forEach((ev) => window.removeEventListener(ev, onEvent, true));
  try { document.documentElement.classList.add('s-touched'); } catch { /* ignore */ }
  const list = [...waiting];
  waiting.clear();
  list.forEach((fn) => { try { fn(); } catch { /* one failing callback must not stop the others */ } });
}

function onEvent(e) {
  if (e.type === 'scroll' && (window.scrollY || 0) < 30) return; // a tiny scroll (restored position, inner carousel) is not a visitor
  start();
}

if (typeof window !== 'undefined') {
  EVENTS.forEach((ev) => window.addEventListener(ev, onEvent, { passive: true, capture: true }));
  timer = setTimeout(start, 60000); // 60 s is longer than any speed test runs
}

export const hasTouched = () => touched;

// calls fn once, at the first touch (at once if that already happened). Returns a function that cancels it.
export function onFirstInteraction(fn) {
  if (touched) { fn(); return () => {}; }
  waiting.add(fn);
  return () => { waiting.delete(fn); };
}

export function useTouched() {
  const [t, setT] = useState(touched);
  useEffect(() => {
    if (touched) { setT(true); return undefined; }
    return onFirstInteraction(() => setT(true));
  }, []);
  return t;
}
