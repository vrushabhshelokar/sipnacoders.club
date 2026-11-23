// "1 upcoming event found" message and count bubble for the Upcoming events button on the home page.
// The number comes from the real events list plus the hackathon teaser, so it updates by itself.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icons';
import { useIntroDone } from './ui';
import { useUpcoming } from './events';
import { hasDetailsNow, isTeaserLive } from './teaserCore';
import { eventName } from './eventLive';
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
  const name = eventName();
  return name && isTeaserLive() && n === 1 ? name : plain;
}

/* true while the mystery card is on AND you have filled in some details (site/upcomingConfig.js -> DETAILS) */
const hasFresh = () => hasDetailsNow() && isTeaserLive();

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

/* how long (ms) the strip glows after it shows up, to pull the eye to it. (The glow is 3 pulses of 1 s in UpcomingFound.css -> keep them in step.) */
const GLOW_MS = 3000;

/* the Vibe-A-Thon section lives on the Upcoming page (id "upcoming"). The page is downloaded on the first visit, so wait until
   that section exists, then slide down to it (the Layout already scrolls the page to the top first). */
function scrollToSection(id, tries = 50) {
  const el = document.getElementById(id);
  if (el) { setTimeout(() => el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' }), 60); return; }
  if (tries > 0) setTimeout(() => scrollToSection(id, tries - 1), 60);
}
const plainClick = (e) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

/* the line under the hero buttons: "scanning…" first, then "Vibe-A-Thon alert found  [View]".
   It glows for the first GLOW_MS after it shows up. View opens the Vibe-A-Thon section of the Upcoming page. */
export function FoundMessage({ n }) {
  const live = useIntroDone();
  const [found, setFound] = useState(() => reduced());
  const [glowDone, setGlowDone] = useState(false);

  useEffect(() => {
    if (!live || found) return undefined;
    const id = setTimeout(() => setFound(true), 1300);
    return () => clearTimeout(id);
  }, [live, found]);

  // the strip glows for 3 seconds from the moment it shows up, then goes calm
  useEffect(() => {
    if (!found) return undefined;
    const id = setTimeout(() => setGlowDone(true), GLOW_MS);
    return () => clearTimeout(id);
  }, [found]);

  if (!n) return null;
  const name = eventName();
  const alert = isTeaserLive();   // the Vibe-A-Thon card is on: show the alert. Otherwise the plain "N upcoming events found".
  const title = alert ? `${name || 'New event'} alert found` : `${n} upcoming event${n === 1 ? '' : 's'} found${hasFresh() ? ' · new details unlocked' : ''}`;

  return (
    <div className={`s-uf ${found ? 'is-found' : 'is-scan'}${found && !glowDone ? ' is-glow' : ''}`} aria-live="polite">
      <span className="s-uf-dot" aria-hidden="true" />
      {found ? (
        <>
          <span className="s-uf-t" key="found">
            <b className="s-uf-ttl">{title}</b>
          </span>{' '}
          <Link className="s-uf-go" to="/upcoming" onClick={(e) => { if (plainClick(e)) scrollToSection('upcoming'); }}>View <Icon.ArrowRight size={14} /></Link>
        </>
      ) : (
        <span className="s-uf-t s-uf-scan" aria-hidden="true">scanning for events<i>.</i><i>.</i><i>.</i></span>
      )}
    </div>
  );
}
