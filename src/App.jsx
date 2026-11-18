import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './site/Layout';
import Home from './pages/Home';
import { getDesign, isTeaserLive } from './site/teaserCore';
import NotFound from './pages/NotFound';
import { PageLoader } from './site/TeaserLoader';
import { onFirstInteraction } from './site/interaction';

// Register (Lottie player) and the admin dashboard are only needed on their own pages, so they are downloaded when opened.
// If a page file cannot be fetched (an old tab left open across a new deploy, or no network), the site reloads once to get the
// new version; if that does not help either, a small message shows instead of a blank screen.
const LoadFailed = () => (
  <section className="s-404">
    <div className="s-container">
      <h1>Couldn&apos;t load this page</h1>
      <p>Check your connection and <a href="" onClick={(e) => { e.preventDefault(); window.location.reload(); }}>reload</a>.</p>
    </div>
  </section>
);
const safeImport = (load) => () => load().then((m) => {
  try { window.sessionStorage.removeItem('scc-chunk-reload'); } catch { /* storage blocked */ }
  return m;
}, () => {
  try {
    if (!window.sessionStorage.getItem('scc-chunk-reload')) {
      window.sessionStorage.setItem('scc-chunk-reload', '1');
      window.location.reload();
      return new Promise(() => {});
    }
  } catch { /* storage blocked: just show the message */ }
  return { default: LoadFailed };
});
// Register starts loading as soon as someone points at, touches or tabs to a link to it, so the click feels instant.
const loadRegister = () => import('./pages/Register');
const Register = lazy(safeImport(loadRegister));
// The other pages are downloaded when they are opened (the home page does not carry them). Each starts downloading as soon as someone
// points at, touches or tabs to its link, so the click still feels instant. The Vibe-A-Thon page also starts its big card early.
const loadUpcoming = () => import('./pages/Upcoming');
const loadEvent = () => import('./pages/Event');
const loadTeam = () => import('./pages/Team');
const loadConnect = () => import('./pages/Connect');
const Upcoming = lazy(safeImport(loadUpcoming));
const Event = lazy(safeImport(loadEvent));
const Team = lazy(safeImport(loadTeam));
const Connect = lazy(safeImport(loadConnect));
const startCards = () => {
  if (!isTeaserLive()) return; // the card is switched off: nothing to download
  (getDesign().card <= 5 ? import('./site/TeaserCards') : import('./site/TeaserCardsNew')).catch(() => { /* the page shows its own Reload message */ });
};
const PAGE_LOADERS = { '/upcoming': () => { loadUpcoming().catch(() => {}); startCards(); }, '/events': loadEvent, '/team': loadTeam, '/connect': loadConnect };
const AdminAnalytics = lazy(safeImport(() => import('./pages/AdminAnalytics')));
if (typeof window !== 'undefined') {
  const warm = (e) => {
    const t = e.target;
    const a = t && t.closest && t.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href === '/register') loadRegister().catch(() => {});
    else if (PAGE_LOADERS[href]) { const r = PAGE_LOADERS[href](); if (r && r.catch) r.catch(() => {}); }
  };
  ['pointerover', 'touchstart', 'focusin'].forEach((ev) => window.addEventListener(ev, warm, { passive: true, capture: true }));
  // the Register button is on /upcoming, so while someone reads that page the sign-up page is fetched quietly in the background
  // (not on Data Saver or a 2G line)
  // /upcoming is the page the club shares most: its download starts now, before React has drawn anything
  if (/^\/upcoming\/?$/.test(window.location.pathname)) PAGE_LOADERS['/upcoming']();
  // everywhere else the other pages are fetched quietly once someone starts using the page (touch, scroll, key), or after 60 seconds
  // (not on Data Saver or a 2G line). The first picture of the page never has to wait for them.
  const net = navigator.connection;
  const saving = net && (net.saveData || /(^|-)2g$/.test(net.effectiveType || ''));
  if (!saving) {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500));
    // after the first touch / key / scroll (or 60 s, see site/interaction.js). Never while the page is still loading: Google's speed test counts that.
    onFirstInteraction(() => {
      idle(() => Object.values(PAGE_LOADERS).forEach((f) => { try { const r = f(); if (r && r.catch) r.catch(() => {}); } catch { /* ignore */ } }), { timeout: 4000 });
    });
  }
  if (/^\/upcoming\/?$/.test(window.location.pathname) && !saving) {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 3000));
    window.addEventListener('load', () => idle(() => loadRegister().catch(() => {}), { timeout: 8000 }), { once: true });
  }
}

function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upcoming" element={<Upcoming />} />
          <Route path="/events" element={<Event />} />
          <Route path="/team" element={<Team />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/visitor-analytics" element={<AdminAnalytics />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
