import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

let hasRecordedVisit = false;

export default function VisitorTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Never track admin dashboard visits as public site visits
    if (pathname.startsWith('/admin')) return;
    if (hasRecordedVisit) return;

    hasRecordedVisit = true;

    fetch('/api/visitors', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    }).catch(() => {
      // Background tracking failures fail silently without impacting user experience
    });
  }, [pathname]);

  return null;
}
