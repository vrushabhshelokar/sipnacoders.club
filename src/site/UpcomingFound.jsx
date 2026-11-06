// "1 upcoming event found" message and count bubble for the Upcoming events button on the home page.
// The number comes from the real events list plus the hackathon teaser, so it updates by itself.
import { useEffect, useState } from 'react';
import { Icon } from './Icons';
import { useIntroDone } from './ui';
import { useUpcoming } from './events';
import { isTeaserLive } from './HackathonTeaser';
import './UpcomingFound.css';

const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

/* how many upcoming events there are right now */
export function useUpcomingCount() {
  const list = useUpcoming();
  return list.length + (isTeaserLive() ? 1 : 0);
}

/* small glowing number that sits inside the button */
export function CountBubble({ n }) {
  if (!n) return null;
  return <span className="s-uf-count" aria-hidden="true">{n}</span>;
}

/* the line under the hero buttons: "scanning…" first, then "1 upcoming event found" */
export function FoundMessage({ n, onGo }) {
  const live = useIntroDone();
  const [found, setFound] = useState(() => reduced());

  useEffect(() => {
    if (!live || found) return undefined;
    const id = setTimeout(() => setFound(true), 1300);
    return () => clearTimeout(id);
  }, [live, found]);

  if (!n) return null;
  const text = `${n} upcoming event${n === 1 ? '' : 's'} found`;

  return (
    <div className={`s-uf ${found ? 'is-found' : 'is-scan'}`} aria-live="polite">
      <span className="s-uf-dot" aria-hidden="true" />
      {found ? (
        <>
          <span className="s-uf-t" key="found">{text}</span>{' '}
          <a className="s-uf-go" href="#upcoming" onClick={onGo}>View <Icon.ArrowRight size={14} /></a>
        </>
      ) : (
        <span className="s-uf-t s-uf-scan" aria-hidden="true">scanning for events<i>.</i><i>.</i><i>.</i></span>
      )}
    </div>
  );
}
