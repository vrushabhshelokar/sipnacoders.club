// Upcoming events page.
// - Real events from `upcomingEvents` (data/site.js) show as cards, with the mystery card on top while it is live.
// - Nothing announced + SHOW_TEASER = true  (site/HackathonTeaser.jsx, line 14) -> the "Signal detected" mystery card.
// - Nothing announced + SHOW_TEASER = false                                   -> a "coming soon" panel with an Instagram button.
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
          <div className="s-more">
            <Link to="/events#past" className="s-link">See what we&apos;ve done so far <Icon.ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
