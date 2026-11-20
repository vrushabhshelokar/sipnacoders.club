import { Link } from 'react-router-dom';
import { Icon } from '../site/Icons';
import { Odometer, Reveal, SectionHead, useInView, useIntroDone } from '../site/ui';
import HeroArt from '../site/HeroArt';
import { PastBento } from '../site/events';
import { ToolStrip, Wins, Voices, Faq, Ambassadors } from '../site/Sections';
import CodeClash from '../site/CodeClash';
import LiveEvent from '../site/LiveEvent';
import { CountBubble, FoundMessage, upcomingLabel, useUpcomingCount } from '../site/UpcomingFound';
import FitPoster from '../site/FitPoster';
import { useJoinSteps, useLinks, usePictures, useStats, useText, useTracks } from '../site/siteLive';

export default function Home() {
  const LINKS = useLinks();
  const T = useText();
  const pics = usePictures();
  const TRACKS = useTracks();
  const JOIN_STEPS = useJoinSteps();
  return (
    <>
      <Hero />

      <LiveEvent />

      <Ambassadors />

      <CodeClash />

      <section id="join" className="s-section">
        <div className="s-container">
          <Reveal className="s-join">
            <FitPoster src={pics.membership.src} ratio={pics.membership.ratio} alt="Coders Club membership poster" />
            <div className="s-join-body">
              <span className="s-eyebrow">Membership</span>
              <h2 className="s-h2">{T.joinTitle}</h2>
              <p className="s-sub">{T.joinSub}</p>
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
          <SectionHead eyebrow="Past events" title={T.pastTitle} sub={T.pastSub} />
          <PastBento />
        </div>
      </section>

      <section id="what-we-do" className="s-section">
        <div className="s-container">
          <SectionHead eyebrow="What we do" title={T.doTitle} sub={T.doSub} />
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

      <Stats />

      <ToolStrip />

      <Wins />

      <Voices />

      <Faq />

      <section className="s-section">
        <div className="s-container">
          <Reveal className="s-banner">
            <img src={pics.group.src} style={{ objectPosition: `50% ${pics.group.pos}%` }} alt="The members who started Sipna Coders Club" loading="lazy" decoding="async" />
            <div className="s-banner-body">
              <span className="s-eyebrow">Where it started</span>
              <h2 className="s-h2">{T.crewTitle}</h2>
              <p>{T.crewText}</p>
              <Link to="/team" className="s-btn s-btn-light">Meet the current team <Icon.ArrowRight size={16} /></Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Hero() {
  const LINKS = useLinks();
  const T = useText();
  const live = useIntroDone();
  const found = useUpcomingCount();
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`);
    e.currentTarget.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3));
    e.currentTarget.style.setProperty('--my', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3));
  };

  return (
    <section className={`s-hero ${live ? 'is-live' : ''}`} onPointerMove={move}>
      <div className="s-hero-bg" aria-hidden="true">
        <i className="o1" /><i className="o2" /><i className="o3" />
        <div className="s-hero-spot" />
      </div>
      <div className="s-container s-hero-in">
        <div className="s-hero-copy">
          <span className="s-pill"><i /> {T.heroPill}</span>
          <h1 className="s-hero-title">
            <span>{T.heroLine1}</span>
            <span><span className="s-grad">{T.heroGrad}</span><span className="s-caret">_</span></span>
          </h1>
          <p className="s-hero-sub">{T.heroSub}</p>
          <div className="s-actions">
            <a className="s-btn s-btn-light s-btn-lg" href={LINKS.joinForm} target="_blank" rel="noopener noreferrer">
              Join Coders Community <Icon.ArrowUpRight size={17} />
            </a>
            <Link className={`s-btn s-btn-ghost s-btn-lg ${found ? 'has-found' : ''}`} to="/upcoming">
              {upcomingLabel(found)} <CountBubble n={found} />
            </Link>
          </div>
          <FoundMessage n={found} />
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
  const STATS = useStats();
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
