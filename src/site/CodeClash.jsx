// The Code Clash block on the Home page (sits above Membership). Same layout as Membership: poster left, details right.
// Everything you may want to change (form link, on/off) is in site/eventSwitches.js.
import { Icon } from './Icons';
import { Reveal } from './ui';
import { CODE_CLASH_FORM, CODE_CLASH_ID, CODE_CLASH_SECTION } from './eventSwitches';
import clashPoster from '../assets/posters/code_clash.webp';
import './CodeClash.css';

const DETAILS = [
  { icon: 'Calendar', title: '21 Nov 2026, 2 PM to 4 PM', desc: 'Online on HackerRank. Two rounds, and every round counts.' },
  { icon: 'Code', title: 'Use any language you like', desc: 'Java, C++, Python and every other language HackerRank supports.' },
  { icon: 'Users', title: 'Open to all engineering students', desc: 'Solo entry. The registration fee is ₹49.' },
  { icon: 'Sparkles', title: 'Exclusive HackerRank rewards', desc: 'HackerRank Infinity Plan, mock interview credits and 1,500+ AI tools. Every participant gets a certificate.' },
];

export default function CodeClash() {
  if (!CODE_CLASH_SECTION) return null;
  return (
    <section id={CODE_CLASH_ID} className="s-section cc-section">
      <div className="s-container">
        <Reveal className="s-join cc-join">
          <div className="s-join-poster cc-poster">
            <img src={clashPoster} alt="Code Clash coding competition poster: 21 November 2026, 2 PM to 4 PM, on HackerRank" width="702" height="881" loading="lazy" decoding="async" />
          </div>
          <div className="s-join-body">
            <span className="s-eyebrow cc-eyebrow">Coding competition</span>
            <h2 className="s-h2">Code Clash</h2>
            <p className="s-sub">Under HackerRank Campus Crew, in association with Sipna Coders Club. Think fast. Code smart.</p>
            <ul className="s-steps cc-list">
              {DETAILS.map((d) => {
                const I = Icon[d.icon];
                return (
                  <li key={d.title}>
                    <span className="s-step-n cc-ic" aria-hidden="true"><I size={16} /></span>
                    <div><b>{d.title}</b><p>{d.desc}</p></div>
                  </li>
                );
              })}
            </ul>
            <div className="s-actions cc-actions">
              <a className="s-btn s-btn-lg cc-glow" href={CODE_CLASH_FORM} target="_blank" rel="noopener noreferrer">
                <span>Register now</span> <Icon.ArrowUpRight size={18} />
              </a>
              <span className="cc-note">Registration fee ₹49 · Solo entry</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
