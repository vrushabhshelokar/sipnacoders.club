// "1 upcoming event found" message and count bubble for the Upcoming events button on the home page.
// The number comes from the real events list plus the hackathon teaser, so it updates by itself.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icons';
import { useIntroDone } from './ui';
import { useUpcoming } from './events';
import { isTeaserLive } from './HackathonTeaser';
import { EVENT_NAME, HAS_DETAILS } from './teaserCore';
import './UpcomingFound.css';

const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

/* how many upcoming events there are right now */
export function useUpcomingCount() {
  const list = useUpcoming();
  return list.length + (isTeaserLive() ? 1 : 0);
}

/* the words on the Upcoming button. While the hackathon card is the ONLY upcoming event and EVENT_NAME is written
   (site/upcomingConfig.js), the button shows the event name. Otherwise it keeps the plain words. The link stays /upcoming. */
export function upcomingLabel(n, plain = 'Upcoming events') {
  return EVENT_NAME && isTeaserLive() && n === 1 ? EVENT_NAME : plain;
}

/* true while the mystery card is on AND you have filled in some details (site/upcomingConfig.js -> DETAILS) */
const hasFresh = () => HAS_DETAILS && isTeaserLive();

/* small glowing number that sits inside the button (turns green while there are new details to unlock) */
export function CountBubble({ n }) {
  if (!n) return null;
  return <span className={`s-uf-count ${hasFresh() ? 'is-new' : ''}`} aria-hidden="true">{n}</span>;
}

/* green "NEW" tag next to the number in the top menu, shown while there are new details to unlock */
export function NewTag() {
  if (!hasFresh()) return null;
  return <span className="s-uf-new" aria-hidden="true">New</span>;
}

/* the line under the hero buttons: "scanning…" first, then "1 upcoming event found" */
export function FoundMessage({ n }) {
  const live = useIntroDone();
  const [found, setFound] = useState(() => reduced());

  useEffect(() => {
    if (!live || found) return undefined;
    const id = setTimeout(() => setFound(true), 1300);
    return () => clearTimeout(id);
  }, [live, found]);

  if (!n) return null;
  const text = `${n} upcoming event${n === 1 ? '' : 's'} found${hasFresh() ? ' · new details unlocked' : ''}`;

  return (
    <div className={`s-uf ${found ? 'is-found' : 'is-scan'}`} aria-live="polite">
      <span className="s-uf-dot" aria-hidden="true" />
      {found ? (
        <>
          <span className="s-uf-t" key="found">{text}</span>{' '}
          <Link className="s-uf-go" to="/upcoming">View <Icon.ArrowRight size={14} /></Link>
        </>
      ) : (
        <span className="s-uf-t s-uf-scan" aria-hidden="true">scanning for events<i>.</i><i>.</i><i>.</i></span>
      )}
    </div>
  );
}
