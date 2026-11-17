/* =====================================================================================
   Mobile card slider for the Vibe-A-Thon page ("Why Participate?" and "Have Any Questions?").
   On a phone the cards sit side by side: ONE card at a time, with a Previous / Next arrow button
   (swiping works too). On a laptop nothing changes: the arrows are hidden and the grid stays as it was.

   - It does NOT edit WhyParticipate.jsx / EventJourney.jsx or any data file. It only adds the arrow bar
     next to the card grid after the page has drawn it, and marks the grid with data-ms-track.
   - All the look is in UpcomingClean.css (the .ms-* rules and the [data-ms-track] rules).
   - If this file is not imported, the page simply keeps the normal vertical cards.
   - Imported by one line in src/pages/Upcoming.jsx:  import '../site/mobileSlider.js';
   ===================================================================================== */

const SLIDERS = [
  // section, the card grid, where the accent colour lives (element inside the slide, css variable), name for screen readers
  { section: '#why-participate', track: '.cy-why-grid', accentEl: '', accentVar: '--card-accent', label: 'Why participate' },
  { section: '#event-journey', track: '.ej-pipeline', accentEl: '.ej-stage', accentVar: '--sa', label: 'Participant roadmap' },
];

const ARROW = {
  prev: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  next: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
};

const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function enhance(cfg) {
  const track = document.querySelector(`${cfg.section} ${cfg.track}`);
  if (!track || track.hasAttribute('data-ms-track')) return;
  const slides = () => Array.from(track.children);
  if (slides().length < 2) return;

  // ---- the arrow bar ----
  const bar = document.createElement('div');
  bar.className = 'ms-bar';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', `${cfg.label}: previous and next card`);
  bar.innerHTML =
    `<button type="button" class="ms-btn ms-prev" aria-label="Previous card">${ARROW.prev}</button>` +
    '<div class="ms-mid"><span class="ms-count" aria-live="polite"></span><span class="ms-dots" aria-hidden="true"></span></div>' +
    `<button type="button" class="ms-btn ms-next" aria-label="Next card">${ARROW.next}</button>`;
  const prev = bar.querySelector('.ms-prev');
  const next = bar.querySelector('.ms-next');
  const count = bar.querySelector('.ms-count');
  const dots = bar.querySelector('.ms-dots');
  dots.innerHTML = slides().map(() => '<i></i>').join('');

  // where a slide starts inside the scrolling track
  const slideLeft = (s) => s.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
  const current = () => {
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestD = Infinity;
    slides().forEach((s, i) => {
      const d = Math.abs(slideLeft(s) + s.offsetWidth / 2 - mid);
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  };
  const goTo = (i) => {
    const list = slides();
    const s = list[Math.max(0, Math.min(list.length - 1, i))];
    track.scrollTo({ left: slideLeft(s) - (track.clientWidth - s.offsetWidth) / 2, behavior: reducedMotion() ? 'auto' : 'smooth' });
  };

  let shown = -1;
  const paint = () => {
    const list = slides();
    const i = current();
    if (i === shown) return;
    shown = i;
    count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
    Array.from(dots.children).forEach((d, k) => d.classList.toggle('is-on', k === i));
    prev.disabled = i === 0;
    next.disabled = i === list.length - 1;
    // the bar takes the accent colour of the card on screen (mint / blue / amber / red)
    const host = cfg.accentEl ? list[i].querySelector(cfg.accentEl) : list[i];
    const c = host && getComputedStyle(host).getPropertyValue(cfg.accentVar).trim();
    if (c) bar.style.setProperty('--ms-c', c);
  };

  let raf = 0;
  track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); }, { passive: true });
  const onResize = () => {
    if (!track.isConnected) { window.removeEventListener('resize', onResize); return; }
    shown = -1;
    paint();
  };
  window.addEventListener('resize', onResize);
  prev.addEventListener('click', () => goTo(current() - 1));
  next.addEventListener('click', () => goTo(current() + 1));

  track.setAttribute('data-ms-track', '');
  track.insertAdjacentElement('afterend', bar);
  paint();
}

let queued = false;
function scan() {
  queued = false;
  SLIDERS.forEach(enhance);
}
function schedule() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(scan);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  schedule();
  // the sections are drawn by React a moment later (and again when you leave and come back to the page): watch for them
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
}
