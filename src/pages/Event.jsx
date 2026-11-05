import { PageHead, SectionHead } from '../site/ui';
import { UpcomingBlock } from '../site/events';
import Timeline from '../site/Timeline';

export default function Event() {
  return (
    <>
      <PageHead
        eyebrow="Events"
        title="Events"
        sub="Workshops, hackathons, seminars and build nights. Here's what's coming up and everything we've done so far."
      />
      <section id="upcoming" className="s-section s-section-first">
        <div className="s-container">
          <SectionHead eyebrow="Upcoming" title="Coming up" />
          <UpcomingBlock />
        </div>
      </section>
      <section id="past" className="s-section s-section-tint">
        <div className="s-container">
          <SectionHead eyebrow="Past events" title="What we've done" sub="Our story so far, event by event. Tap any event to open its photos." />
          <Timeline />
        </div>
      </section>
    </>
  );
}
