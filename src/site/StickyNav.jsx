// Sticky Section Navigation
// Desktop: clean horizontal anchor links.
// Mobile: intuitive section jump dropdown menu + persistent Register CTA.
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icons';
import './StickyNav.css';

const NAV_ITEMS = [
  { id: 'upcoming', label: 'Overview' },
  { id: 'problem-statement', label: 'PS Release' },
  { id: 'why-participate', label: 'Why Join' },
  { id: 'event-journey', label: 'Journey' },
  { id: 'rules', label: 'Rules' },
  { id: 'prize-pool', label: 'Prizes & Fees' },
  { id: 'schedule', label: 'Timeline' },
  { id: 'finale-schedule', label: 'Finale Day' },
];

export default function StickyNav() {
  const [activeId, setActiveId] = useState('upcoming');
  const [isStuck, setIsStuck] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!navRef.current) return;
      const rect = navRef.current.getBoundingClientRect();
      setIsStuck(rect.top <= 75);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -65% 0px',
        threshold: 0,
      }
    );

    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveId(id);
    }
  };

  const currentLabel = NAV_ITEMS.find((n) => n.id === activeId)?.label || 'Sections';

  return (
    <nav
      ref={navRef}
      className={`st-nav-wrapper ${isStuck ? 'is-stuck' : ''}`}
      aria-label="Event Sections Navigation"
    >
      <div className="st-nav-container">
        {/* Desktop: Horizontal tab list */}
        <div className="st-nav-track" role="tablist" aria-label="Section shortcuts">
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`st-nav-link ${isActive ? 'is-active' : ''}`}
                onClick={(e) => scrollTo(e, item.id)}
                role="tab"
                aria-selected={isActive}
              >
                <span className="st-nav-dot" aria-hidden="true" />
                <span className="st-nav-label">{item.label}</span>
              </a>
            );
          })}
        </div>

        {/* Mobile: Intuitive dropdown menu trigger */}
        <div className="st-mobile-menu-wrap">
          <button
            type="button"
            className="st-mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Navigation Menu"
          >
            <Icon.Menu size={15} />
            <span className="st-mobile-active-label">{currentLabel}</span>
            <Icon.ChevronDown
              size={13}
              style={{
                transform: menuOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>
        </div>

        {/* Persistent Register CTA */}
        <div className="st-nav-action">
          <Link to="/register" className="st-register-btn" aria-label="Register for Vibe-A-Thon">
            <Icon.ClipboardList size={13} />
            <span className="st-btn-text">Register</span>
            <span className="st-btn-fee">₹200</span>
          </Link>
        </div>
      </div>

      {/* Mobile: Dropdown sheet menu */}
      {menuOpen && (
        <div className="st-dropdown-sheet" role="menu">
          <div className="st-dropdown-header">
            <span>QUICK JUMP TO SECTION</span>
            <button
              type="button"
              className="st-dropdown-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <Icon.X size={14} />
            </button>
          </div>
          <div className="st-dropdown-list">
            {NAV_ITEMS.map((item, idx) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`st-dropdown-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => {
                    // the menu is closed first, then we scroll: while it was open it pushed the page down, so the jump went too far
                    setMenuOpen(false);
                    requestAnimationFrame(() => requestAnimationFrame(() => scrollTo({ preventDefault() {} }, item.id)));
                  }}
                  role="menuitem"
                >
                  <span className="st-dropdown-num">0{idx + 1}</span>
                  <span className="st-dropdown-label">{item.label}</span>
                  {isActive && <span className="st-dropdown-dot" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
