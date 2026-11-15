import { useEffect, useState } from 'react';

/**
 * Preloader component that reuses the existing first‑visit intro animation
 * (`public/intro/intro.js`). It loads the script, waits for the intro to finish
 * (the `#scc-intro` element is removed), then renders its children – typically the
 * whole app.
 *
 * Behaviour:
 *   • The animation appears immediately on page load.
 *   • While it plays, the React app is bootstrapped in the background.
 *   • Once the intro signals completion, we smoothly transition to the app.
 *   • If the intro never finishes (e.g., script error or blocked resources), a
 *     sensible timeout forces the loader to disappear.
 */
export default function Preloader({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const originalOverflow = html.style.overflow;

    // If intro already finished (no element), skip loading.
    if (!document.getElementById('scc-intro')) {
      setReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = '/intro/intro.js';
    script.async = true;
    document.body.appendChild(script);

    const observer = new MutationObserver(() => {
      const intro = document.getElementById('scc-intro');
      if (!intro) {
        observer.disconnect();
        setReady(true);
        html.style.overflow = originalOverflow;
        if (script.parentNode) script.parentNode.removeChild(script);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const fallback = setTimeout(() => {
      observer.disconnect();
      const intro = document.getElementById('scc-intro');
      if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
      setReady(true);
      html.style.overflow = originalOverflow;
      if (script.parentNode) script.parentNode.removeChild(script);
    }, 10000);

    return () => {
      clearTimeout(fallback);
      observer.disconnect();
      if (script.parentNode) script.parentNode.removeChild(script);
      html.style.overflow = originalOverflow;
    };
  }, []);

  return ready ? <>{children}</> : null;
}
