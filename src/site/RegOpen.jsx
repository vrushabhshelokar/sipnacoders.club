// RegOpen.jsx: the "Registration open" tag that lights up the Vibe-A-Thon button on the Home page hero.
// It sits INSIDE that button (Home.jsx puts <RegOpen /> right after the number bubble), so the whole button is the link.
// It follows the dashboard switch Site controls -> "Registration" (key vibeRegistration): switch it off and the button goes back to normal.
// It also stays hidden when the Vibe-A-Thon card is not live. To change the words, edit WORDS below. The look is in RegOpen.css.
import { useSwitch } from './liveSettings';
import { isTeaserLive } from './teaserCore';
import { eventType } from './eventLive';
import './RegOpen.css';

const WORDS = { tag: 'Registration open' };

/* little sparks that float up inside the button: left %, delay (s), colour, size (px) */
const SPARKS = [
  [52, 0, '#7ee787', 4], [60, 1.1, '#22d3ee', 3], [68, .5, '#ffd166', 4], [76, 1.8, '#c792ea', 3],
  [84, .9, '#ff5fa2', 4], [92, 2.3, '#7ee787', 3], [46, 2.6, '#ffd166', 3],
];

export default function RegOpen() {
  const open = useSwitch('vibeRegistration', true);   // dashboard -> Site controls
  if (!open || !isTeaserLive() || eventType() !== 'hackathon') return null;

  return (
    <>
      <span className="ro-edge" aria-hidden="true"><i className="ro-spin" /></span>
      <span className="ro-fill" aria-hidden="true">
        <i className="ro-sw" />
        {SPARKS.map(([l, d, c, s], i) => (<i key={i} className="ro-sp" style={{ '--l': `${l}%`, '--dl': `${d}s`, '--c': c, '--s': `${s}px` }} />))}
      </span>
      <span className="ro-tag"><i className="ro-dot" aria-hidden="true" />{WORDS.tag}</span>
    </>
  );
}
