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

export default function Upcoming() {
  const list = useUpcoming();
  const quiet = !list.length && !isTeaserLive();   // nothing announced and the mystery card is switched off

  return (
    <>
      <PageHead
        eyebrow="Upcoming"
        title="Upcoming events"
        sub="Workshops, hackathons and contests. Here's what the club is planning next."
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
    </>
  );
}
