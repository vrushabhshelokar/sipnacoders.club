// What the visitor sees while a part of the site is still being downloaded (slow phone or slow internet).
//   TeaserLoader  the Vibe-A-Thon card on /upcoming: a card-shaped placeholder with a spinner and a message.
//   TeaserFailed  the same place, if the card could not be downloaded at all (no internet): says so, with a Reload button.
//   PageLoader    a whole page that is downloaded when opened (Register, the admin dashboard).
// Nothing here needs editing. The look is in TeaserLoader.css.
import { useEffect, useState } from 'react';
import { eventName } from './eventLive';
import './TeaserLoader.css';

// 0 = just started, 1 = taking a while, 2 = taking far too long
function useWaitStage(afterSlow = 7000, afterLong = 18000) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const a = setTimeout(() => setStage(1), afterSlow);
    const b = setTimeout(() => setStage(2), afterLong);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [afterSlow, afterLong]);
  return stage;
}

const reload = () => window.location.reload();

export function TeaserLoader() {
  const stage = useWaitStage();
  const what = eventName() || 'the event details';
  const text = stage === 0
    ? `Loading ${what}...`
    : stage === 1
      ? 'Slow connection. Still loading, please wait...'
      : 'This is taking too long. Check your internet connection and reload.';
  return (
    <div className="tl-wait" role="status" aria-live="polite">
      <div className="tl-sk" aria-hidden="true">
        <i className="tl-b tl-flag" />
        <i className="tl-b tl-t1" />
        <i className="tl-b tl-t2" />
        <i className="tl-b tl-lede" />
        <div className="tl-cd"><i className="tl-b" /><i className="tl-b" /><i className="tl-b" /><i className="tl-b" /></div>
        <div className="tl-fields"><i className="tl-b" /><i className="tl-b" /></div>
      </div>
      <div className="tl-msg">
        <span className="tl-spin" aria-hidden="true" />
        <span className="tl-txt">{text}</span>
        {stage === 2 && <button type="button" className="tl-btn" onClick={reload}>Reload</button>}
      </div>
    </div>
  );
}

export function TeaserFailed() {
  return (
    <div className="tl-wait tl-failed" role="alert">
      <div className="tl-msg">
        <span className="tl-txt">
          {eventName() ? `${eventName()} could not be loaded.` : 'This section could not be loaded.'} Check your internet connection and reload.
        </span>
        <button type="button" className="tl-btn" onClick={reload}>Reload</button>
      </div>
    </div>
  );
}

export function PageLoader() {
  const stage = useWaitStage(8000, 20000);
  return (
    <div className="tl-page" role="status" aria-live="polite">
      <span className="tl-spin tl-spin-lg" aria-hidden="true" />
      <p className="tl-txt">{stage === 0 ? 'Loading...' : stage === 1 ? 'Slow connection. Still loading, please wait...' : 'This is taking too long. Check your internet connection.'}</p>
      {stage === 2 && <button type="button" className="tl-btn" onClick={reload}>Reload</button>}
    </div>
  );
}
