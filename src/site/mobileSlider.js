/* =====================================================================================
   Mobile helpers for the Vibe-A-Thon page. Two things, both phone only (laptop looks exactly as before):

   1) Card sliders: ONE card at a time, with a Previous / Next arrow button (swiping works too).
      Two looks:
        - "slide":  Why Participate? and Have Any Questions? cards slide sideways.
        - "stack":  Prize Distribution with the Registration Matrix card BEHIND it, and Round 1 participants
                    with the Other Round 2 participants card BEHIND it. The front card is shown in full, the
                    other card peeks out behind it, tilted and dimmed like a fanned deck of cards.
                    Arrows, dots and a swipe (drag) bring the next card to the front.
      On a laptop the arrows are hidden and the cards stay as they were.
   2) "HackerRank Reward": the rewards of the winners (Infinity Subscription, Mock Interview Credits,
      Goodies ...) are copied from the Winners tier into the free space of the Champion (1st prize) card
      as small dotted lines. The text is read from the page itself, so if the data file changes the card follows.

   - It does NOT edit WhyParticipate.jsx / EventJourney.jsx or any data file. It only adds the arrow bar
     next to the card grid after the page has drawn it, and marks the grid with data-ms-track
     (plus data-ms-stack and a data-pos on every card for the stacked decks).
   - All the look is in UpcomingClean.css (the .ms-* rules and the [data-ms-track] / [data-ms-stack] rules).
   - To get a flat sideways slider instead of a stacked deck, delete  stack: true  from that line below.
   - If this file is not imported, the page simply keeps the normal vertical cards.
   - Imported by one line in src/pages/Upcoming.jsx:  import '../site/mobileSlider.js';
   ===================================================================================== */

const SLIDERS = [
  // section, the card grid, where the accent colour lives (element inside the slide, css variable), name for screen readers
  { section: '#why-participate', track: '.cy-why-grid', accentEl: '', accentVar: '--card-accent', label: 'Why participate' },
  { section: '#event-journey', track: '.ej-pipeline', accentEl: '.ej-stage', accentVar: '--sa', label: 'Participant roadmap' },
  // Prize Distribution card, with the Registration Matrix card right behind it (stacked deck)
  { section: '#prize-pool', track: '.pp-top-row', accentEl: '', accentVar: '', label: 'Prize distribution and registration fees', stack: true },
  // Round 1 Participants card, with the Other Round 2 Participants card behind it (the Winners card is hidden on phones)
  { section: '#prize-pool', track: '.pp-tiers-container', accentEl: '', accentVar: '--tra', label: 'Participant tiers', stack: true },
];

const ARROW = {
  prev: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  next: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
};

const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// the sliders / decks are a phone feature: on a wider screen nothing is touched
const phone = () => window.matchMedia('(max-width: 768px)').matches;

function enhance(cfg) {
  const track = document.querySelector(`${cfg.section} ${cfg.track}`);
  if (!track || track.hasAttribute('data-ms-track')) return;
  const stack = !!cfg.stack;
  // the cards that are really on screen, in the order they are shown (some cards are hidden or re-ordered by CSS on phones)
  const slides = () => Array.from(track.children)
    .filter((c) => c.getClientRects().length > 0)
    .sort((a, b) => Number(getComputedStyle(a).order) - Number(getComputedStyle(b).order));
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
  const buildDots = (n) => { dots.innerHTML = '<i></i>'.repeat(n); };
  buildDots(slides().length);

  // ---- which card is on screen ----
  // slide look: read from the scroll position.  stack look: kept in `idx`.
  let idx = 0;
  const slideLeft = (s) => s.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
  const scrollCurrent = (list = slides()) => {
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestD = Infinity;
    list.forEach((s, i) => {
      const d = Math.abs(slideLeft(s) + s.offsetWidth / 2 - mid);
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  };
  const current = (list = slides()) => (stack ? Math.max(0, Math.min(list.length - 1, idx)) : scrollCurrent(list));

  // stack look: every card gets data-pos = how far it is from the front card (0 front, -1 behind-left, 1 behind-right ...)
  const place = () => {
    const list = slides();
    const on = phone();
    idx = Math.max(0, Math.min(list.length - 1, idx));
    Array.from(track.children).forEach((c) => {
      const i = list.indexOf(c);
      if (!on || i < 0) {
        c.removeAttribute('data-pos');
        c.removeAttribute('aria-hidden');
        return;
      }
      const pos = Math.max(-2, Math.min(2, i - idx));
      c.setAttribute('data-pos', String(pos));
      if (pos === 0) c.removeAttribute('aria-hidden'); else c.setAttribute('aria-hidden', 'true');
    });
  };

  const goTo = (i) => {
    const list = slides();
    const n = Math.max(0, Math.min(list.length - 1, i));
    if (stack) {
      idx = n;
      place();
      paint();
      return;
    }
    const s = list[n];
    track.scrollTo({ left: slideLeft(s) - (track.clientWidth - s.offsetWidth) / 2, behavior: reducedMotion() ? 'auto' : 'smooth' });
  };

  let shown = '';
  function paint() {
    const list = slides();
    if (!list.length) return;
    const i = current(list);
    const key = `${i}/${list.length}`;
    if (key === shown) return;
    shown = key;
    if (dots.children.length !== list.length) buildDots(list.length);
    count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
    Array.from(dots.children).forEach((d, k) => d.classList.toggle('is-on', k === i));
    prev.disabled = i === 0;
    next.disabled = i === list.length - 1;
    // the bar takes the accent colour of the card on screen (mint / blue / amber / red)
    if (cfg.accentVar) {
      const host = cfg.accentEl ? list[i].querySelector(cfg.accentEl) : list[i];
      const c = host && getComputedStyle(host).getPropertyValue(cfg.accentVar).trim();
      if (c) bar.style.setProperty('--ms-c', c);
    }
  }

  if (!stack) {
    let raf = 0;
    track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); }, { passive: true });
  }
  const onResize = () => {
    if (!track.isConnected) { window.removeEventListener('resize', onResize); return; }
    shown = '';
    if (stack) place();
    paint();
  };
  window.addEventListener('resize', onResize);
  prev.addEventListener('click', () => goTo(current() - 1));
  next.addEventListener('click', () => goTo(current() + 1));

  // ---- stacked deck: drag the front card sideways to flip, tap the edge of the card behind it ----
  if (stack) {
    let pid = null;
    let sx = 0;
    let sy = 0;
    let dx = 0;
    let dragging = false;
    let justDragged = false;
    const front = () => slides()[current()];
    const setDrag = (el, x) => {
      if (x === null) { el.style.removeProperty('--dx'); el.style.removeProperty('--dr'); return; }
      el.style.setProperty('--dx', `${x}px`);
      el.style.setProperty('--dr', (x / 36).toFixed(2));
    };
    track.addEventListener('pointerdown', (e) => {
      if (!phone() || (e.pointerType === 'mouse' && e.button !== 0)) return;
      pid = e.pointerId; sx = e.clientX; sy = e.clientY; dx = 0; dragging = false;
    });
    track.addEventListener('pointermove', (e) => {
      if (e.pointerId !== pid) return;
      const mx = e.clientX - sx;
      const my = e.clientY - sy;
      if (!dragging) {
        // a mostly-sideways move starts the drag, a mostly-vertical one is the page scrolling
        if (Math.abs(mx) > 8 && Math.abs(mx) > Math.abs(my) * 1.2) {
          dragging = true;
          track.classList.add('is-drag');
          try { track.setPointerCapture(pid); } catch (err) { /* not needed */ }
        } else return;
      }
      const list = slides();
      const i = current(list);
      // a card cannot go past the first / last one: it resists
      dx = (mx > 0 && i === 0) || (mx < 0 && i === list.length - 1) ? mx * 0.3 : mx;
      const f = front();
      if (f) setDrag(f, dx);
    });
    const end = (e) => {
      if (e.pointerId !== pid) return;
      pid = null;
      if (!dragging) return;
      dragging = false;
      justDragged = true;
      setTimeout(() => { justDragged = false; }, 0);
      track.classList.remove('is-drag');
      const f = front();
      const w = f ? f.offsetWidth : 300;
      if (f) setDrag(f, null);
      const limit = Math.min(60, w * 0.18);
      if (dx < -limit) goTo(current() + 1);
      else if (dx > limit) goTo(current() - 1);
    };
    track.addEventListener('pointerup', end);
    track.addEventListener('pointercancel', end);
    // a tap on the card peeking out behind the front one brings it forward (only the gap around the front card is "the track")
    track.addEventListener('click', (e) => {
      if (justDragged || e.target !== track || !phone()) return;
      const f = front();
      if (!f) return;
      const r = f.getBoundingClientRect();
      goTo(current() + (e.clientX < r.left + r.width / 2 ? -1 : 1));
    });
  }

  track.setAttribute('data-ms-track', '');
  if (stack) track.setAttribute('data-ms-stack', '');
  track.insertAdjacentElement('afterend', bar);
  if (stack) place();
  paint();
}

// ---- HackerRank rewards of the winners, inside the Champion (1st prize) card ----
// The Winners & Runners-Up tier card is cut on phones, so its HackerRank rewards (Infinity Subscription,
// Mock Interview Credits, Goodies ...) are copied into the free space of the Champion card as small dotted lines.
function addPodiumPerks() {
  const first = document.querySelector('#prize-pool .pp-prize-col-card .pp-prize-first');
  const tier = document.querySelector('#prize-pool .pp-tier-block.is-winner');
  if (!first || !tier || first.querySelector('.pp-champ-perks')) return;
  // the first bullet is the cash breakdown (25,000 / 10,000 / 5,000): the prize cards already show it
  const items = Array.from(tier.querySelectorAll('.pp-tb-rewards li'))
    .map((li) => li.textContent.trim())
    .filter((t) => t && !/^cash\b/i.test(t));
  if (!items.length) return;
  // the rewards are for every podium team, not only the champion: say so ("ALL 3 WINNERS")
  const winners = document.querySelectorAll('#prize-pool .pp-prize-col-card .pp-prize-card').length;

  const box = document.createElement('div');
  box.className = 'pp-champ-perks';
  const head = document.createElement('div');
  head.className = 'pp-champ-perks-head';
  const label = document.createElement('b');
  label.textContent = 'HackerRank Reward';
  head.appendChild(label);
  if (winners > 1) {
    const who = document.createElement('span');
    who.textContent = `All ${winners} winners`;
    head.appendChild(who);
  }
  const list = document.createElement('ul');
  items.forEach((t) => { const li = document.createElement('li'); li.textContent = t; list.appendChild(li); });
  box.append(head, list);
  // after the amount, still inside the card (before the little corner tick)
  const corner = first.querySelector(':scope > .pp-card-corner');
  first.insertBefore(box, corner);
}

let queued = false;
function scan() {
  queued = false;
  SLIDERS.forEach(enhance);
  addPodiumPerks();
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
