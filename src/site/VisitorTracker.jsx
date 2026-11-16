import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LINKS } from '../data/site';
import { CODE_CLASH_FORM } from './eventSwitches';

// Anonymous visit statistics for the private dashboard (/admin/visitor-analytics). No names, no personal data.
// - when a page is opened:  one visit (+ the page, the device, and where the person came from)
// - on every page change:   one page view
// - on a register button:   one click
let lastPath = null;

function send(body) {
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
  if (LINKS.membershipForm && href.startsWith(LINKS.membershipForm)) return 'membership';
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
