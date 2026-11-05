import { Icon } from '../site/Icons';
import { PageHead, Reveal } from '../site/ui';
import { Ambassadors } from '../site/Sections';
import { LINKS, TEAM, groupPhoto } from '../data/site';

export default function Team() {
  const toTeam = (e) => {
    e.preventDefault();
    const el = document.getElementById('current-team');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <>
      <PageHead eyebrow="Our team" title="Meet the team" sub="The current core team: the people who plan the events, run the workshops and keep the club shipping." />

      {/* founding crew photo (same banner as on the home page) */}
      <section className="s-section s-section-first s-team-founders">
        <div className="s-container">
          <Reveal className="s-banner">
            <img src={groupPhoto} alt="The members who started Sipna Coders Club" loading="lazy" decoding="async" />
            <div className="s-banner-body">
              <span className="s-eyebrow">Where it started</span>
              <h2 className="s-h2">The founding crew</h2>
              <p>The members who started Sipna Coders Club and built the community we have today.</p>
              <a href="#current-team" onClick={toTeam} className="s-btn s-btn-light">
                Meet the current team <Icon.ArrowRight size={16} style={{ transform: 'rotate(90deg)' }} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="current-team" className="s-section s-team-current">
        <div className="s-container">
          <div className="s-team">
            {TEAM.map((m, i) => <Member key={m.name} m={m} i={i} />)}
          </div>
        </div>
      </section>

      <Ambassadors />

      <section className="s-section s-team-join">
        <div className="s-container">
          <Reveal className="s-callout">
            <h3>Want to be part of the team?</h3>
            <p>Join the community, come to events and grow with us.</p>
            <a className="s-btn s-btn-light" href={LINKS.membershipForm} target="_blank" rel="noopener noreferrer">
              Become a member <Icon.ArrowUpRight size={16} />
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Member({ m, i }) {
  const year = m.status && m.status !== '—' ? m.status : null;
  return (
    <Reveal className="s-member" delay={(i % 4) * 70}>
      <div className="s-member-photo">
        <img src={m.img} alt={m.name} loading="lazy" decoding="async" />
      </div>
      <div className="s-member-body">
        <span className="s-member-role">{m.role}</span>
        <h3>{m.name}</h3>
        <div className="s-member-foot">
          <span>{year || 'Sipna COET'}</span>
          <span className="s-member-social">
            {m.socials.linkedin && (
              <a href={m.socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`}><Icon.Linkedin size={15} /></a>
            )}
            {m.socials.instagram && (
              <a href={m.socials.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on Instagram`}><Icon.Instagram size={15} /></a>
            )}
          </span>
        </div>
      </div>
    </Reveal>
  );
}
