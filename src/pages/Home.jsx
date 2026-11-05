import { Link } from 'react-router-dom';
import { Icon } from '../site/Icons';
import { Odometer, Reveal, SectionHead, useInView, useIntroDone } from '../site/ui';
import HeroArt from '../site/HeroArt';
import { UpcomingBlock, PastBento } from '../site/events';
import { ToolStrip, Wins, Voices, Faq } from '../site/Sections';
import { LINKS, STATS, TRACKS, JOIN_STEPS, membershipPoster, groupPhoto } from '../data/site';

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <ToolStrip />

      <section id="upcoming" className="s-section">
        <div className="s-container">
          <SectionHead eyebrow="Upcoming events" title="What's next" sub="Workshops, hackathons and contests. Here's what the club is planning next." />
          <UpcomingBlock />
          <div className="s-more"><Link to="/events" className="s-link">See all events <Icon.ArrowRight size={16} /></Link></div>
        </div>
      </section>

      <section id="what-we-do" className="s-section s-section-tint">
        <div className="s-container">
          <SectionHead eyebrow="What we do" title="Learn by building" sub="Pick a track, learn with friends and ship something real." />
          <div className="s-tracks">
            {TRACKS.map((t, i) => {
              const IconC = Icon[t.icon] || Icon.Code;
              return (
                <Reveal key={t.id} className="s-track" delay={i * 80} style={{ '--c': t.color }}>
                  <span className="s-track-ic"><IconC size={22} /></span>
                  <h3>{t.title}</h3>
                  <p>{t.desc}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <Wins />

      <section id="join" className="s-section">
        <div className="s-container">
          <Reveal className="s-join">
            <div className="s-join-poster">
              <img src={membershipPoster} alt="Coders Club membership poster" loading="lazy" decoding="async" />
            </div>
            <div className="s-join-body">
              <span className="s-eyebrow">Membership</span>
              <h2 className="s-h2">Join Coders Community</h2>
              <p className="s-sub">Registrations are open. Three simple steps and you&apos;re in.</p>
              <ol className="s-steps">
                {JOIN_STEPS.map((s, i) => (
                  <li key={s.title}>
                    <span className="s-step-n">{i + 1}</span>
                    <div><b>{s.title}</b><p>{s.desc}</p></div>
                  </li>
                ))}
              </ol>
              <div className="s-actions">
                <a className="s-btn s-btn-light" href={LINKS.membershipForm} target="_blank" rel="noopener noreferrer">
                  Become a member <Icon.ArrowUpRight size={16} />
                </a>
                <a className="s-btn s-btn-ghost" href={LINKS.instagram} target="_blank" rel="noopener noreferrer">
                  <Icon.Instagram size={16} /> Follow us
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="recent" className="s-section s-section-tint">
        <div className="s-container">
          <SectionHead eyebrow="Past events" title="What we've done" sub="Workshops, hackathons and seminars. Tap any event to see the photos." />
          <PastBento />
        </div>
      </section>

      <Voices />
      <Faq />

      <section className="s-section">
        <div className="s-container">
          <Reveal className="s-banner">
            <img src={groupPhoto} alt="The members who started Sipna Coders Club" loading="lazy" decoding="async" />
            <div className="s-banner-body">
              <span className="s-eyebrow">Where it started</span>
              <h2 className="s-h2">The founding crew</h2>
              <p>The members who started Sipna Coders Club and built the community we have today.</p>
              <Link to="/team" className="s-btn s-btn-light">Meet the current team <Icon.ArrowRight size={16} /></Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Hero() {
  const live = useIntroDone();
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`);
    e.currentTarget.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3));
    e.currentTarget.style.setProperty('--my', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3));
  };
  const toUpcoming = (e) => {
    e.preventDefault();
    const el = document.getElementById('upcoming');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className={`s-hero ${live ? 'is-live' : ''}`} onPointerMove={move}>
      <div className="s-hero-bg" aria-hidden="true">
        <i className="o1" /><i className="o2" /><i className="o3" />
        <div className="s-hero-spot" />
      </div>
      <div className="s-container s-hero-in">
        <div className="s-hero-copy">
          <span className="s-pill"><i /> Sipna College of Engineering &amp; Technology</span>
          <h1 className="s-hero-title">
            <span>Compile your</span>
            <span><span className="s-grad">future</span><span className="s-caret">_</span></span>
          </h1>
          <p className="s-hero-sub">
            Not just a club. A runtime environment for the next generation of software engineers.
            Build, break, and ship code that matters.
          </p>
          <div className="s-actions">
            <a className="s-btn s-btn-light s-btn-lg" href={LINKS.joinForm} target="_blank" rel="noopener noreferrer">
              Join Coders Community <Icon.ArrowUpRight size={17} />
            </a>
            <a className="s-btn s-btn-ghost s-btn-lg" href="#upcoming" onClick={toUpcoming}>
              Upcoming events
            </a>
          </div>
        </div>
        <div className="s-hero-visual">
          <HeroArt />
        </div>
      </div>
    </section>
  );
}

const STAT_COLORS = ['#4285f4', '#34a853', '#fbbc05', '#ea4335'];

function Stats() {
  const [ref, inView] = useInView(0.3);
  return (
    <div className="s-container">
      <div className="s-stats" ref={ref}>
        {STATS.map((s, i) => (
          <div key={s.label} className={`s-stat rv ${inView ? 'in' : ''}`} style={{ '--d': `${i * 110}ms`, '--c': STAT_COLORS[i % 4], '--k': i }}>
            <b><Odometer value={s.value} play={inView} suffix={s.suffix} /></b>
            <span>{s.label}</span>
            <i className="s-stat-shine" aria-hidden="true" />
          </div>
        ))}
      </div>
    </div>
  );
}
