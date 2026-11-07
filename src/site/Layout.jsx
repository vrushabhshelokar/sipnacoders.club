// Navbar + dock + footer around every page, plus the animated background and extras.
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from './Icons';
import Background from './Background';
import Dock from './Dock';
import { MatrixEgg, ScrollProgress } from './Extras';
import AnnouncePopup from './AnnouncePopup';
import { CountBubble, NewTag, useUpcomingCount } from './UpcomingFound';
import './NavFix.css';
import './UpcomingPage.css';
import { LINKS, logo } from '../data/site';

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/events', label: 'Events' },
  { to: '/team', label: 'Team' },
  { to: '/connect', label: 'Connect' },
];
const TITLES = { '/': 'Home', '/upcoming': 'Upcoming events', '/events': 'Events', '/team': 'Team', '/connect': 'Connect', '/register': 'Register' };
const FOOTER_LINKS = [...NAV, { to: '/upcoming', label: 'Upcoming' }];

// load the fonts once
if (typeof document !== 'undefined' && !document.getElementById('s-fonts')) {
  const l = document.createElement('link');
  l.id = 's-fonts';
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
  document.head.appendChild(l);
}

export default function Layout({ children }) {
  const { pathname, hash } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const taps = useRef([]);
  const upcoming = useUpcomingCount();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 16);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  // title + scroll position on page change
  useEffect(() => {
    document.title = pathname === '/'
      ? 'Sipna Coders Club | Coding club of Sipna COET, Amravati'
      : TITLES[pathname] ? `${TITLES[pathname]} | Sipna Coders Club` : 'Page not found | Sipna Coders Club';
    if (hash) {
      const id = hash.slice(1);
      setTimeout(() => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 80);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  // tapping the logo 5 times quickly also triggers the easter egg (for phones)
  const logoTap = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 2000), now];
    if (taps.current.length >= 5) { taps.current = []; window.dispatchEvent(new window.Event('scc:egg')); }
  };

  return (
    <>
      <Background />
      <ScrollProgress />
      <header className={`s-nav ${scrolled ? 'is-solid' : ''}`}>
        <div className="s-container s-nav-in">
          <Link to="/" className="s-brand" aria-label="Sipna Coders Club home" onClick={logoTap}>
            <img src={logo} alt="" width="34" height="34" />
            <span>Sipna <b>Coders</b> Club</span>
          </Link>
          <nav className="s-links" aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className={pathname === n.to ? 'on' : ''}>{n.label}</Link>
            ))}
          </nav>
          <Link className="s-btn s-btn-light s-btn-sm s-nav-cta" to="/upcoming">
            Upcoming events <CountBubble n={upcoming} /><NewTag /> <Icon.ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <main className="s-main s-page" key={pathname}>{children}</main>

      <footer className="s-footer">
        <div className="s-container">
          <div className="s-footer-top">
            <div className="s-footer-brand">
              <img src={logo} alt="" width="44" height="44" loading="lazy" />
              <div>
                <b>Sipna Coders Club</b>
                <p>Build, break, and ship code that matters.</p>
              </div>
            </div>
            <nav className="s-footer-links" aria-label="Footer">
              {FOOTER_LINKS.map((n) => <Link key={n.to} to={n.to}>{n.label}</Link>)}
            </nav>
            <div className="s-footer-social">
              <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Icon.Instagram size={18} /></a>
              <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Icon.Linkedin size={18} /></a>
              <a href={`mailto:${LINKS.email}`} aria-label="Email"><Icon.Mail size={18} /></a>
            </div>
          </div>
          <div className="s-footer-bottom">
            <span>&copy; {new Date().getFullYear()} Sipna Coders Club &middot; Sipna COET</span>
            <span>Dev: <b>Vrushabh Shelokar</b>, <b>Ashay Deshpande</b></span>
          </div>
        </div>
      </footer>

      <Dock />
      <MatrixEgg />
      <AnnouncePopup />
    </>
  );
}
