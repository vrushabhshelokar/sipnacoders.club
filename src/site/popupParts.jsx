// Small pieces every popup design uses (title, description, buttons, the window itself).
// You never edit this file.
import { Icon } from './Icons';
import NameReveal from './NameReveal';
import './EventLogo.css';

export const Close = ({ onClose }) => (
  <button type="button" className="pp-x" onClick={onClose} aria-label="Close"><Icon.X size={18} /></button>
);
// once the event name is written (text.name) the heading is the animated NameReveal, with this design's own effect (fx)
// the small logo of the popup (Upcoming event tab of the dashboard), above the title
export const Logo = ({ text }) => (text.logo ? <img className="pp-logo" src={text.logo} alt="" decoding="async" /> : null);
export const Title = ({ text, extra, fx }) => (
  <>
    <Logo text={text} />
    {text.name
      ? <NameReveal as="h2" id="s-ann-t" className="pp-title" text={text.name} rest={text.rest} effect={fx} {...extra} />
      : <h2 id="s-ann-t" className="pp-title" {...extra}>{text.title}</h2>}
  </>
);
export const Desc = ({ text }) => <p id="s-ann-d" className="pp-desc">{text.desc}</p>;
export const Actions = ({ text, p }) => (
  <div className="pp-actions">
    <button ref={p.ctaRef} type="button" className="pp-go" onClick={p.onGo}>
      <span>{text.button}</span><Icon.ArrowRight size={17} />
    </button>
    <button type="button" className="pp-later" onClick={p.onClose}>{text.later}</button>
  </div>
);
// extra: more class names for the window (the new designs add "pq")
export function Shell({ name, p, children, extra = '' }) {
  return (
    <div ref={p.cardRef} className={`pp pp-${name} ${extra}`.trim()} role="dialog" aria-modal="true" aria-labelledby="s-ann-t" aria-describedby="s-ann-d">
      <Close onClose={p.onClose} />
      {children}
    </div>
  );
}
export const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
