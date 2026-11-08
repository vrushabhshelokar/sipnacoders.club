// Extra home-page sections: tools strip, wins & projects, member voices and FAQ.
// All content comes from src/data/site.js. Voices and wins stay hidden until real entries are added there.
import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icons';
import { Reveal, SectionHead } from './ui';
import { TOOLS, FAQ, VOICES, WINS, LINKS, PROGRAMS, AMBASSADORS } from '../data/site';
import './Ambassadors.css';

const DOTS = ['#4285f4', '#34a853', '#fbbc05', '#ea4335'];

/* small icons that the shared icon set doesn't have */
const svg = (size, children) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{children}</svg>
);
const Trophy = ({ size = 20 }) => svg(size, <><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M17 5h3v2a3 3 0 0 1-3 3" /><path d="M7 5H4v2a3 3 0 0 0 3 3" /></>);
const Github = ({ size = 20 }) => svg(size, <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />);
const QuoteMark = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M10 7H6a3 3 0 0 0-3 3v4h4v4l3-4v-7Zm11 0h-4a3 3 0 0 0-3 3v4h4v4l3-4v-7Z" />
  </svg>
);

/* ---------- tools & platforms: an endless strip of names ---------- */
export function ToolStrip() {
  if (!TOOLS.length) return null;
  const row = (hidden) => (
    <ul className="s-tools-row" aria-hidden={hidden || undefined}>
      {TOOLS.map((t, i) => (
        <li key={t + i}><i style={{ background: DOTS[i % 4] }} />{t}</li>
      ))}
    </ul>
  );
  return (
    <section className="s-tools" aria-label="Tools and platforms in our sessions">
      <div className="s-container">
        <p className="s-tools-label">Tools &amp; platforms in our sessions</p>
      </div>
      <div className="s-tools-track">
        <div className="s-tools-move">{row(false)}{row(true)}</div>
      </div>
    </section>
  );
}

/* ---------- wins & projects ---------- */
export function Wins() {
  if (!WINS.length) return null;
  return (
    <section id="wins" className="s-section">
      <div className="s-container">
        <SectionHead eyebrow="Built by members" title="Wins & projects" sub="Hackathon results and things our members have shipped." />
        <div className="s-wins">
          {WINS.map((w, i) => {
            const project = (w.kind || '').toLowerCase() === 'project';
            return (
              <Reveal key={w.title + i} className="s-win" delay={(i % 3) * 80} style={{ '--c': DOTS[i % 4] }}>
                <span className="s-win-ic">{project ? <Github size={20} /> : <Trophy size={20} />}</span>
                <span className="s-chip">{project ? 'Project' : 'Award'}{w.year ? ` · ${w.year}` : ''}</span>
                <h3>{w.title}</h3>
                {w.who && <p className="s-win-who">{w.who}</p>}
                {w.desc && <p>{w.desc}</p>}
                {w.link && (
                  <a className="s-link" href={w.link} target="_blank" rel="noopener noreferrer">
                    {project ? 'View project' : 'See more'} <Icon.ArrowUpRight size={15} />
                  </a>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- member voices ---------- */
export function Voices() {
  if (!VOICES.length) return null;
  return (
    <section id="voices" className="s-section s-section-tint">
      <div className="s-container">
        <SectionHead eyebrow="Member voices" title="What members say" />
        <div className="s-voices">
          {VOICES.map((v, i) => {
            const initials = v.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
            return (
              <Reveal as="figure" key={v.name + i} className="s-voice" delay={(i % 3) * 80} style={{ '--c': DOTS[i % 4] }}>
                <span className="s-voice-mark"><QuoteMark /></span>
                <blockquote>{v.quote}</blockquote>
                <figcaption>
                  {v.img ? <img src={v.img} alt="" loading="lazy" decoding="async" /> : <span className="s-voice-ini">{initials}</span>}
                  <span><b>{v.name}</b>{v.role && <small>{v.role}</small>}</span>
                </figcaption>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- campus ambassadors (team page) ---------- */
const Tick = () => svg(14, <path d="m5 12.5 4.2 4.2L19 7" />);

/* Program logos. Drop the official logo files into src/assets/programs/ and name each one after the company,
   in lower case: google.png, hackerrank.png, microsoft.png, unstop.png, geeksforgeeks.png (.png, .svg, .webp or .jpg).
   They show up by themselves, no code change. A program with no file shows its letters on a brand-colour tile.
   (A `logo:` set in data/site.js still wins over the file.) */
const LOGO_FILES = import.meta.glob('../assets/programs/*.{png,jpg,jpeg,webp,svg}', { eager: true, import: 'default' });
const LOGOS = Object.fromEntries(
  Object.entries(LOGO_FILES).map(([path, url]) => [path.split('/').pop().replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]/g, ''), url]),
);
const logoOf = (p) => p.logo || LOGOS[String(p.org).toLowerCase().replace(/[^a-z0-9]/g, '')] || null;

/* letters shown on a program's tile while it has no logo file */
const MONO = { Google: 'G', HackerRank: 'HR', Microsoft: 'M', Unstop: 'U', GeeksforGeeks: 'GfG' };
const monoOf = (p) => MONO[p.org] || String(p.org || p.name).slice(0, 2);
// "Google Student Ambassador" -> "Student Ambassador"
const roleOf = (p) => (p.name.startsWith(p.org) ? p.name.slice(p.org.length).trim() : p.name) || p.name;

function ProgramMark({ p, big }) {
  const logo = logoOf(p);
  return logo ? (
    <span className={`s-amb-tile has-img ${big ? 'is-big' : ''}`}>
      <img src={logo} alt={`${p.org} logo`} loading="lazy" decoding="async" />
    </span>
  ) : (
    <span className={`s-amb-tile ${big ? 'is-big' : ''}`} role="img" aria-label={`${p.org} logo`}>{monoOf(p)}</span>
  );
}

/* Present or past?  In data/site.js every ambassador has  status: 'present'  or  status: 'past'.
   Present ones always come first, past ones go below by themselves (inside each group the order stays as written).
   No status = present. A word that is not recognised also counts as present, and a note appears in the browser console. */
const PAST_WORDS = ['past', 'former', 'alumni'];
const PRESENT_WORDS = ['present', 'current', 'active', 'now'];
const isPast = (a) => {
  const s = String(a.status || '').trim().toLowerCase();
  if (s && !PAST_WORDS.includes(s) && !PRESENT_WORDS.includes(s)) {
    console.warn(`[ambassadors] ${a.name}: status "${a.status}" is not "present" or "past", so it is shown as present.`);
  }
  return PAST_WORDS.includes(s);
};
const SORTED = (() => {
  const all = AMBASSADORS.map((a) => ({ a, past: isPast(a) }));
  return [...all.filter((x) => !x.past), ...all.filter((x) => x.past)];
})();

export function Ambassadors() {
  if (!AMBASSADORS.length) return null;
  const both = SORTED.some((x) => x.past) && SORTED.some((x) => !x.past);   // the two group titles show only when both groups exist
  return (
    <section id="ambassadors" className="s-section s-section-tint">
      <div className="s-container">
        <SectionHead
          eyebrow="Campus ambassadors"
          title="Meet our ambassadors"
          sub="Club members who represent global tech programs at Sipna, and bring their events, resources and opportunities to every coder here."
        />
        <div className="s-ambs">
          {SORTED.map(({ a, past }, i) => {
            const progs = a.programs.map((k) => PROGRAMS[k]).filter(Boolean);
            const c1 = progs[0] ? progs[0].color : '#4c8dff', c2 = progs[1] ? progs[1].color : c1;
            const firstOfGroup = both && (i === 0 || SORTED[i - 1].past !== past);
            return (
              <Fragment key={a.name}>
              {firstOfGroup && <p className="s-ambs-group" aria-hidden="true">{past ? 'Past ambassadors' : 'Present ambassadors'}</p>}
              <Reveal as="article" className={`s-amb ${past ? 'is-past' : 'is-present'}`} delay={(i % 2) * 90} style={{ '--c1': c1, '--c2': c2 }}>
                <div className="s-amb-top">
                  <div className="s-amb-photo"><img src={a.img} alt={a.name} loading="lazy" decoding="async" /></div>
                  <div className="s-amb-who">
                    <span className={`s-amb-st ${past ? 'is-past' : 'is-present'}`}>
                      <i aria-hidden="true" />{past ? 'Past' : 'Present'}{a.years ? <small>{a.years}</small> : null}
                    </span>
                    <h3>{a.name}</h3>
                    <p>{a.role}</p>
                    <div className="s-amb-badges">
                      {progs.map((p) => (
                        <span key={p.name} className="s-amb-badge" style={{ '--pc': p.color }}>
                          <ProgramMark p={p} />
                          <span className="s-amb-bn"><b>{p.org}</b><small>{roleOf(p)}</small></span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="s-amb-roles">
                  {progs.map((p) => (
                    <div key={p.name} className={`s-amb-role ${logoOf(p) ? 'has-logo' : ''}`} style={{ '--pc': p.color, '--logo': logoOf(p) ? `url("${logoOf(p)}")` : 'none' }}>
                      <div className="s-amb-role-top">
                        <ProgramMark p={p} big />
                        <span className="s-amb-role-h">What they do as {p.name}</span>
                      </div>
                      <ul>{p.duties.map((d) => <li key={d}><Tick />{d}</li>)}</ul>
                      {p.link && (
                        <a className="s-link" href={p.link} target="_blank" rel="noopener noreferrer">
                          About the {p.org} program <Icon.ArrowUpRight size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Reveal>
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
export function Faq() {
  const [open, setOpen] = useState(0);
  if (!FAQ.length) return null;
  return (
    <section id="faq" className="s-section">
      <div className="s-container s-faq">
        <div className="s-faq-side">
          <SectionHead eyebrow="FAQ" title="Questions, answered" sub="Everything people usually ask us before joining." />
          <Reveal className="s-faq-help">
            <b>Still have a question?</b>
            <span>We reply on email, Instagram and LinkedIn.</span>
            <a className="s-link" href={`mailto:${LINKS.email}`}>{LINKS.email} <Icon.ArrowRight size={15} /></a>
          </Reveal>
        </div>
        <div className="s-faq-list">
          {FAQ.map((f, i) => {
            const on = open === i;
            return (
              <Reveal key={f.q} className={`s-faq-item ${on ? 'on' : ''}`} delay={i * 50}>
                <h3>
                  <button type="button" aria-expanded={on} aria-controls={`faq-${i}`} id={`faq-q-${i}`} onClick={() => setOpen(on ? -1 : i)}>
                    <span>{f.q}</span>
                    <i className="s-faq-plus" aria-hidden="true" />
                  </button>
                </h3>
                <div className="s-faq-a" id={`faq-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
                  <div>
                    <p>{f.a}</p>
                    {f.link && (f.link.to
                      ? <Link className="s-link" to={f.link.to}>{f.link.label} <Icon.ArrowRight size={15} /></Link>
                      : <a className="s-link" href={f.link.href} target="_blank" rel="noopener noreferrer">{f.link.label} <Icon.ArrowUpRight size={15} /></a>)}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
