// Quick-access dock.
// Laptop: floating glass dock at the bottom (icons grow on hover, like a Mac dock); slides in after you scroll.
// Phone: app-style bottom bar with the 4 pages, always visible.
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from './Icons';
import { CountBubble, useUpcomingCount } from './UpcomingFound';

const ITEMS = [
  { to: '/', label: 'Home', icon: 'Home' },
  { to: '/events', label: 'Events', icon: 'Calendar' },
  { to: '/team', label: 'Team', icon: 'Users' },
  { to: '/connect', label: 'Connect', icon: 'Mail' },
];

export default function Dock() {
  const { pathname } = useLocation();
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  const upcoming = useUpcomingCount();

  useEffect(() => {
    const on = () => setShow(window.scrollY > 260);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const items = () => (ref.current ? ref.current.querySelectorAll('.s-dock-item') : []);
  const move = (e) => {
    if (window.matchMedia && window.matchMedia('(max-width: 860px), (pointer: coarse)').matches) return;
    items().forEach((el) => {
      const r = el.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      el.style.setProperty('--s', (1 + 0.5 * Math.max(0, 1 - d / 130)).toFixed(3));
    });
  };
  const leave = () => items().forEach((el) => el.style.setProperty('--s', '1'));

  return (
    <nav ref={ref} className={`s-dock ${show ? 'show' : ''}`} aria-label="Quick links" onMouseMove={move} onMouseLeave={leave}>
      {ITEMS.map((it) => {
        const IconC = Icon[it.icon];
        const on = pathname === it.to;
        return (
          <Link key={it.to} to={it.to} className={`s-dock-item ${on ? 'on' : ''}`} aria-current={on ? 'page' : undefined}>
            <span className="s-dock-ic"><IconC size={20} /></span>
            <span className="s-dock-lbl">{it.label}</span>
          </Link>
        );
      })}
      <span className="s-dock-sep" aria-hidden="true" />
      <Link to="/upcoming" className={`s-dock-item s-dock-join ${pathname === '/upcoming' ? 'on' : ''}`} aria-current={pathname === '/upcoming' ? 'page' : undefined}>
        <span className="s-dock-ic"><Icon.Sparkles size={20} /><CountBubble n={upcoming} /></span>
        <span className="s-dock-lbl">Upcoming</span>
      </Link>
    </nav>
  );
}
