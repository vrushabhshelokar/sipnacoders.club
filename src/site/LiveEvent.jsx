// "Live event": a small strip right under the hero for the event that is running now (Code Clash).
// It reads the same words as the popup (CODE_CLASH_POPUP_TEXT in site/eventSwitches.js), so change them there.
// It follows the same switches as the big Code Clash block: CODE_CLASH_SECTION (and the dashboard's Site controls).
// The popup and the "Code Clash" button under the hero buttons scroll to this strip (id = CODE_CLASH_ID).
import { Icon } from './Icons';
import { Reveal } from './ui';
import { CODE_CLASH_FORM, CODE_CLASH_ID, CODE_CLASH_SECTION, CODE_CLASH_POPUP_TEXT } from './eventSwitches';
import { useSwitch } from './liveSettings';
import clashPoster from '../assets/posters/code_clash.webp';
import './CodeClash.css';
import './LiveEvent.css';

export default function LiveEvent() {
  const sectionOn = useSwitch('codeClashSection', CODE_CLASH_SECTION);   // dashboard -> Site controls
  const regOpen = useSwitch('codeClashRegistration', true);
  if (!sectionOn) return null;

  const T = CODE_CLASH_POPUP_TEXT;
  // "Full details": the big Code Clash block further down the page
  const details = (e) => {
    const el = document.getElementById(`${CODE_CLASH_ID}-details`);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
  };

  return (
    <section id={CODE_CLASH_ID} className="s-section le-section" aria-labelledby="le-label">
      <div className="s-container">
        <h2 id="le-label" className="le-label"><i className="le-dot" aria-hidden="true" /> Live event</h2>
        <Reveal className="le-card">
          <div className="le-poster">
            <img src={clashPoster} alt="Code Clash poster: 21 November 2026, 2 PM to 4 PM, on HackerRank" width="702" height="881" loading="lazy" decoding="async" />
          </div>
          <div className="le-body">
            <h3 className="le-title">Code Clash</h3>
            <p className="le-desc">{T.desc}</p>
            <ul className="le-facts">
              {T.facts.map((f) => (
                <li key={f.k}><span>{f.k}</span><b>{f.v}</b></li>
              ))}
            </ul>
          </div>
          <div className="le-actions">
            {regOpen ? (
              <a className="s-btn cc-glow" href={CODE_CLASH_FORM} target="_blank" rel="noopener noreferrer">
                <span>{T.button}</span> <Icon.ArrowUpRight size={17} />
              </a>
            ) : (
              <span className="s-btn" aria-disabled="true" style={{ opacity: 0.55, cursor: 'not-allowed' }}>
                <span>Registration closed</span>
              </span>
            )}
            <a className="s-link le-more" href={`#${CODE_CLASH_ID}-details`} onClick={details}>
              Full details <Icon.ChevronDown size={16} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
