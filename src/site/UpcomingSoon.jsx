// The calm "nothing announced yet" panel of the Upcoming events page (shown when the mystery card is switched off).
// It tells people what the club is planning, sends them to Instagram (where every event is announced first)
// and has a "See past events" button that opens the past events timeline.
import { Link } from 'react-router-dom';
import { Icon } from './Icons';
import { Reveal } from './ui';
import { LINKS } from '../data/site';
import './UpcomingPage.css';

/* ✏️ EDIT HERE: the kinds of events shown as "in the works" ------------------ */
const IN_THE_WORKS = [
  { icon: 'Code', label: 'Workshops' },
  { icon: 'Zap', label: 'Hackathons' },
  { icon: 'Sparkles', label: 'Coding contests' },
  { icon: 'Users', label: 'Seminars' },
];
/* ---------------------------------------------------------------------------- */

export default function UpcomingSoon() {
  return (
    <Reveal className="s-soon s-soon-ig">
      <div className="s-soon-glow" aria-hidden="true" />
      <span className="s-soon-ic" aria-hidden="true"><Icon.Calendar size={26} /></span>
      <span className="s-soon-tag"><i /> Coming soon</span>
      <h3>Our next event is being planned.</h3>
      <p>
        The club is lining up workshops, hackathons and coding contests.
        Nothing is announced yet, but it&apos;s on the way. Follow us on Instagram and you&apos;ll hear about it first.
      </p>

      <ul className="s-soon-works" aria-label="What the club is planning">
        {IN_THE_WORKS.map((w) => {
          const IconC = Icon[w.icon] || Icon.Code;
          return <li key={w.label}><IconC size={15} /> {w.label}</li>;
        })}
      </ul>

      <div className="s-soon-actions">
        <a className="s-btn s-btn-light" href={LINKS.instagram} target="_blank" rel="noopener noreferrer">
          <Icon.Instagram size={17} /> Get updates on Instagram
        </a>
        <Link className="s-btn s-btn-ghost" to="/events#past">
          See past events <Icon.ArrowRight size={15} />
        </Link>
        <a className="s-btn s-btn-ghost" href={LINKS.joinForm} target="_blank" rel="noopener noreferrer">
          Join Coders Community <Icon.ArrowUpRight size={15} />
        </a>
      </div>
      <p className="s-soon-note"><Icon.Bell size={14} /> Every event is announced on Instagram first.</p>
    </Reveal>
  );
}
