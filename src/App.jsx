import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './site/Layout';
import Home from './pages/Home';
import Event from './pages/Event';
import Upcoming from './pages/Upcoming';
import Team from './pages/Team';
import Connect from './pages/Connect';
import NotFound from './pages/NotFound';
import { PageLoader } from './site/TeaserLoader';

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
const AdminAnalytics = lazy(safeImport(() => import('./pages/AdminAnalytics')));
if (typeof window !== 'undefined') {
  const warm = (e) => {
    const t = e.target;
    if (t && t.closest && t.closest('a[href="/register"]')) loadRegister().catch(() => {});
  };
  ['pointerover', 'touchstart', 'focusin'].forEach((ev) => window.addEventListener(ev, warm, { passive: true, capture: true }));
  // the Register button is on /upcoming, so while someone reads that page the sign-up page is fetched quietly in the background
  // (not on Data Saver or a 2G line)
  const net = navigator.connection;
  if (/^\/upcoming\/?$/.test(window.location.pathname) && !(net && (net.saveData || /(^|-)2g$/.test(net.effectiveType || '')))) {
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
