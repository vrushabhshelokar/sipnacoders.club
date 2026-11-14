// The Code Clash popup card. AnnouncePopup.jsx opens it (same popup system as Vibe-A-Thon: same dim backdrop, once per visit,
// Esc / focus handling). The button does NOT open the form. It only takes people to the Code Clash block on the Home page.
import { Icon } from './Icons';
import { CODE_CLASH_POPUP_TEXT as T } from './eventSwitches';
import clashPoster from '../assets/posters/code_clash.webp';
import './CodeClash.css';

export default function CodeClashPopup({ onGo, onClose, cardRef, ctaRef }) {
  return (
    <div ref={cardRef} className="cc-pop" role="dialog" aria-modal="true" aria-labelledby="s-ann-t" aria-describedby="s-ann-d">
      <button type="button" className="s-ann-x" onClick={onClose} aria-label="Close"><Icon.X size={18} /></button>
      <div className="cc-pop-art">
        <img src={clashPoster} alt="" width="702" height="881" decoding="async" />
      </div>
      <div className="cc-pop-body">
        <span className="cc-pop-flag"><i aria-hidden="true" />{T.flag}</span>
        <h2 id="s-ann-t" className="cc-pop-title">{T.title}</h2>
        <p id="s-ann-d" className="cc-pop-desc">{T.desc}</p>
        <dl className="cc-pop-facts">
          {T.facts.map((f) => (<div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>))}
        </dl>
        <button ref={ctaRef} type="button" className="s-btn s-btn-lg cc-glow cc-pop-go" onClick={onGo}>
          <span>{T.button}</span> <Icon.ArrowRight size={18} />
        </button>
        <button type="button" className="cc-pop-later" onClick={onClose}>{T.later}</button>
      </div>
    </div>
  );
}
