import { PageHead, SectionHead } from '../site/ui';
import Timeline from '../site/Timeline';

export default function Event() {
  return (
    <>
      <PageHead
        eyebrow="Events"
        title="Events"
        sub="Workshops, hackathons, seminars and build nights. Everything we've done so far, event by event."
      />
      <section id="past" className="s-section s-section-tint s-section-first">
        <div className="s-container">
          <SectionHead eyebrow="Past events" title="What we've done" sub="Our story so far, event by event. Tap any event to open its photos." />
          <Timeline />
        </div>
      </section>
    </>
  );
}
