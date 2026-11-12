// Upcoming events page.
// - Real events from `upcomingEvents` (data/site.js) show as cards, with the mystery card on top while it is live.
// - Nothing announced + SHOW_UPCOMING = true  (site/upcomingConfig.js) -> the mystery card (hackathon / workshop / online, 5 looks).
// - Nothing announced + SHOW_UPCOMING = false                          -> a "coming soon" panel with Instagram + "See past events" buttons.
import { Link } from 'react-router-dom';
import { Icon } from '../site/Icons';
import { PageHead } from '../site/ui';
import { UpcomingBlock, useUpcoming } from '../site/events';
import { isTeaserLive } from '../site/HackathonTeaser';
import UpcomingSoon from '../site/UpcomingSoon';
import { getDesign, EVENT_NAME, TYPE } from '../site/teaserCore';
import { FLOW } from '../site/upcomingConfig';
import '../site/Cyber.css';

export default function Upcoming() {
  const list = useUpcoming();
  const quiet = !list.length && !isTeaserLive();   // nothing announced and the mystery card is switched off
  const cyber = getDesign().card === 16;           // the Cyber design (21) gives the whole page its cyberpunk look
  // Cyber design + EVENT_NAME written: the page is all about that one event (its name replaces "Upcoming events")
  const named = cyber && !quiet && !!EVENT_NAME;

  return (
    <div className={cyber ? `up-cy${named ? ' up-cy-named' : ''}` : undefined}>
      <PageHead
        eyebrow={named ? 'Sipna Coders Club' : 'Upcoming'}
        title={named ? EVENT_NAME : 'Upcoming events'}
        sub={named ? (TYPE === 'hackathon' ? FLOW.sub : '') : "Workshops, hackathons and contests. Here's what the club is planning next."}
      />
      <section id="upcoming" className="s-section s-section-first">
        <div className="s-container">
          {quiet ? <UpcomingSoon /> : <UpcomingBlock />}
          {!quiet && (
            <div className="s-more">
              <Link to="/events#past" className="s-link">See what we&apos;ve done so far <Icon.ArrowRight size={16} /></Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
