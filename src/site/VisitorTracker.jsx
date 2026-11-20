import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { currentLinks } from './siteLive';
import { CODE_CLASH_FORM } from './eventSwitches';

// Anonymous visit statistics for the private dashboard (/admin/visitor-analytics). No names, no personal data.
// - when a page is opened:  one visit (+ the page, the device, and where the person came from)
// - on every page change:   one page view
// - on a register button:   one click
let lastPath = null;

// Speed: the statistics calls wait until the page has finished loading and the browser is idle (or until the visitor leaves the page), so
// they never compete with the first draw of the page. Nothing is lost: they are only sent a moment later.
let queue = [];
let ready = false;

function flush() {
  ready = true;
  const q = queue;
  queue = [];
  q.forEach(post);
}

if (typeof window !== 'undefined') {
  const go = () => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(flush, { timeout: 3000 });
    else setTimeout(flush, 1500);
  };
  if (document.readyState === 'complete') go();
  else window.addEventListener('load', go, { once: true });
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}

function send(body) {
  if (ready) post(body);
  else queue.push(body);
}

function post(body) {
  try {
    fetch('/api/visitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {
      // Background tracking failures fail silently without impacting user experience
    });
  } catch {
    // ignore
  }
}

// links you share can carry a tag: sipnacoders.club/?src=poster1  (utm_source and ref work too)
function sourceTag() {
  try {
    const q = new URLSearchParams(window.location.search);
    return q.get('src') || q.get('utm_source') || q.get('ref') || '';
  } catch {
    return '';
  }
}

// which button was it? (null = not one we count)
function clickKind(href) {
  if (!href) return null;
  if (CODE_CLASH_FORM && href.startsWith(CODE_CLASH_FORM)) return 'register-codeclash';
  const membership = currentLinks().membershipForm;
  if (membership && href.startsWith(membership)) return 'membership';
  if (/^(https?:\/\/(www\.)?sipnacoders\.club)?\/register([?#/]|$)/.test(href)) return 'register-vibeathon';
  return null;
}

export default function VisitorTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Never track admin dashboard visits as public site visits
    if (pathname.startsWith('/admin')) return;
    if (pathname === lastPath) return;

    if (lastPath === null) {
      send({ t: 'visit', path: pathname, src: sourceTag(), ref: document.referrer || '' });
    } else {
      send({ t: 'pv', path: pathname });
    }
    lastPath = pathname;
  }, [pathname]);

  // count clicks on the register / membership buttons (one listener for the whole site)
  useEffect(() => {
    const onClick = (e) => {
      if (window.location.pathname.startsWith('/admin')) return;
      const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      const kind = a ? clickKind(a.getAttribute('href')) : null;
      if (kind) send({ t: 'click', k: kind });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
