// Section 4: The Rule Book — Holographic HUD Tech Interface
// 6 consolidated categories, synchronized tabs, arrows, progress indicator, and futuristic telemetry.
import { useState, useRef, useCallback } from 'react';
import { Reveal } from './ui';
import { Icon } from './Icons';
import { RULEBOOK_CATEGORIES } from '../data/vibeathonData';
import './RuleBook.css';

const TOTAL = RULEBOOK_CATEGORIES.length;

export default function RuleBook() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const [mobileOpenCat, setMobileOpenCat] = useState('01');
  const tabsRef = useRef(null);
  const timeoutRef = useRef(null);

  // Smooth holographic transition then swap content
  const goTo = useCallback((idx) => {
    if (idx === activeIdx) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setFading(true);
    timeoutRef.current = setTimeout(() => {
      setActiveIdx(idx);
      setFading(false);
      // Keep selected tab in view smoothly
      if (tabsRef.current) {
        const tab = tabsRef.current.querySelectorAll('.rb-tab')[idx];
        if (tab) tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 150);
  }, [activeIdx]);

  const prev = () => goTo(Math.max(0, activeIdx - 1));
  const next = () => goTo(Math.min(TOTAL - 1, activeIdx + 1));

  const cat = RULEBOOK_CATEGORIES[activeIdx];
  const IconC = Icon[cat.icon] || Icon.Files;

  return (
    <section id="rules" className="rb-section" aria-labelledby="rb-heading">
      <Reveal className="rb-head">
        <span className="rb-eyebrow">Event Protocols</span>
        <h2 id="rb-heading" className="rb-h">The Rule Book</h2>
        <p className="rb-sub">
          Official competition protocols, participant guidelines, and submission directives.
        </p>
      </Reveal>

      {/* ---- Control Bar: Counter + Holographic Progress + Prev/Next ---- */}
      <div className="rb-controls" role="group" aria-label="Rulebook navigation controls">
        {/* Holographic Counter */}
        <div className="rb-counter" aria-live="polite" aria-atomic="true">
          <span className="rb-counter-idx">{String(activeIdx + 1).padStart(2, '0')}</span>
          <span className="rb-counter-sep">/</span>
          <span className="rb-counter-tot">{String(TOTAL).padStart(2, '0')}</span>
        </div>

        {/* HUD Segmented Progress Bar */}
        <div
          className="rb-progress"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={TOTAL}
          aria-valuenow={activeIdx + 1}
          aria-label="Category progression"
        >
          <div className="rb-seg" aria-hidden="true">
            {Array.from({ length: TOTAL }, (_, i) => (
              <button
                type="button"
                key={i}
                className={`rb-seg-cell${i <= activeIdx ? ' on' : ''}${i === activeIdx ? ' current' : ''}`}
                onClick={() => goTo(i)}
                tabIndex={-1}
                aria-label={`Jump to category ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* HUD Navigation Arrows */}
        <div className="rb-arrows">
          <button
            type="button"
            className="rb-arrow"
            onClick={prev}
            disabled={activeIdx === 0}
            aria-label="Previous category"
          >
            <Icon.ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="rb-arrow"
            onClick={next}
            disabled={activeIdx === TOTAL - 1}
            aria-label="Next category"
          >
            <Icon.ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ---- Holographic Tab Strip ---- */}
      <div className="rb-tabs-wrap">
        <div className="rb-tabs" ref={tabsRef} role="tablist" aria-label="Rulebook categories">
          {RULEBOOK_CATEGORIES.map((c, i) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={i === activeIdx}
              aria-controls="rb-holo-screen"
              id={`rb-tab-${c.id}`}
              className={`rb-tab${i === activeIdx ? ' active' : ''}`}
              onClick={() => goTo(i)}
            >
              <span className="rb-tab-glow" aria-hidden="true" />
              <span className="rb-tab-idx">[{c.id}]</span>
              <span className="rb-tab-label">{c.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ---- Holographic Screen Frame ---- */}
      <div
        id="rb-holo-screen"
        className="rb-holo-screen"
        role="tabpanel"
        aria-labelledby={`rb-tab-${cat.id}`}
      >
        {/* Holographic HUD corner brackets */}
        <span className="rb-hud-corner rb-hud-tl" aria-hidden="true" />
        <span className="rb-hud-corner rb-hud-tr" aria-hidden="true" />
        <span className="rb-hud-corner rb-hud-bl" aria-hidden="true" />
        <span className="rb-hud-corner rb-hud-br" aria-hidden="true" />

        {/* Ambient Holographic Scanline Overlay */}
        <div className="rb-holo-scanlines" aria-hidden="true" />

        {/* Top HUD Telemetry Ribbon */}
        <div className="rb-hud-ribbon" aria-hidden="true">
          <div className="rb-hud-ribbon-left">
            <span className="rb-status-dot" />
            <span className="rb-hud-chip">PROTOCOL // {cat.tag}</span>
            <span className="rb-hud-chip muted">NODE: 0x{cat.id}</span>
          </div>
          <div className="rb-hud-ribbon-right">
            <span className="rb-hud-chip access">ACCESS // GRANTED</span>
            <span className="rb-hud-chip muted">RULESET 2.6</span>
          </div>
        </div>

        {/* Animated Main Content Stage */}
        <div className={`rb-holo-content${fading ? ' is-swapping' : ''}`} aria-live="polite">
          {/* Ghost Number Watermark */}
          <span className="rb-holo-ghost" aria-hidden="true">{cat.id}</span>

          <div className="rb-holo-grid">
            {/* Left Telemetry Pillar */}
            <aside className="rb-pillar">
              <div className="rb-pillar-badge">
                <span className="rb-pillar-id">{cat.id}</span>
                <div className="rb-pillar-icon" aria-hidden="true">
                  <IconC size={26} />
                </div>
              </div>

              <div className="rb-pillar-meta">
                <div className="rb-meta-row">
                  <span className="rb-meta-key">PROTOCOL</span>
                  <span className="rb-meta-val">{cat.tag}</span>
                </div>
                <div className="rb-meta-row">
                  <span className="rb-meta-key">SECURITY</span>
                  <span className="rb-meta-val active">UNRESTRICTED</span>
                </div>
                <div className="rb-meta-row">
                  <span className="rb-meta-key">AUTHENTICITY</span>
                  <span className="rb-meta-val">SCC_VERIFIED</span>
                </div>
                <div className="rb-meta-row">
                  <span className="rb-meta-key">STATUS</span>
                  <span className="rb-meta-val active">ACTIVE_NODE</span>
                </div>
              </div>
            </aside>

            {/* Right Directive Feed */}
            <div className="rb-feed">
              <div className="rb-feed-head">
                <span className="rb-feed-kicker">DIRECTIVE {cat.id} OF 0{TOTAL}</span>
                <h3 className="rb-feed-title">{cat.title}</h3>
                <p className="rb-feed-intro">{cat.intro}</p>
              </div>

              {/* Technical Directives List */}
              <ul className="rb-rules" aria-label={`Directives for ${cat.title}`}>
  {cat.points.map((pt, idx) => (
    <li key={pt} className="rb-rule-item">
      <span
  className={`rb-rule-index ${
    (cat.id === '02' && idx === 3) ||
    (cat.id === '03' && idx === 2) ||
    (cat.id === '04' && idx === 5)
      ? 'rb-rule-index-danger'
      : ''
  }`}
  aria-hidden="true"
>
  {cat.id}.{String(idx + 1).padStart(2, '0')}
</span>
      <span className="rb-rule-text">{pt}</span>
    </li>
  ))}
</ul>
            </div>
          </div>
        </div>

        {/* HUD Bottom Telemetry Bar */}
        <div className="rb-hud-footer" aria-hidden="true">
          <span className="rb-footer-code">// SEC_HASH: 0x98A4_{cat.id}9C // SIPNA CODERS CLUB</span>
          <span className="rb-footer-sync">LIVE HUD STREAM // DECRYPTED</span>
        </div>
      </div>

      {/* Mobile-Only Accordion (Active exclusively on mobile viewports <= 768px) */}
      <div className="rb-mobile-accordion" role="region" aria-label="Mobile Rule Book Accordion">
        {RULEBOOK_CATEGORIES.map((c) => {
          const isOpen = mobileOpenCat === c.id;
          const CIcon = Icon[c.icon] || Icon.Files;
          return (
            <div key={c.id} className={`rb-acc-item ${isOpen ? 'is-open' : ''}`}>
              <button
                type="button"
                className="rb-acc-trigger"
                onClick={() => setMobileOpenCat(isOpen ? null : c.id)}
                aria-expanded={isOpen}
              >
                <div className="rb-acc-left">
                  <span className="rb-acc-idx">0{c.id}</span>
                  <div className="rb-acc-icon" aria-hidden="true"><CIcon size={14} /></div>
                  <span className="rb-acc-title">{c.title}</span>
                </div>
                <Icon.ChevronDown
                  size={14}
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>
              {isOpen && (
                <div className="rb-acc-content">
                  <p className="rb-acc-intro">{c.intro}</p>
                  <ul className="rb-acc-points">
                    {c.points.map((pt, i) => (
                      <li key={pt}>
                        <span className="rb-acc-num">{c.id}.0{i + 1}</span>
                        <span className="rb-acc-text">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
