// Section 2: Why Participate? — Vibe-A-Thon
import { Reveal } from './ui';
import { Icon } from './Icons';
import { WHY_PARTICIPATE } from '../data/vibeathonData';
import './WhyParticipate.css';

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export default function WhyParticipate() {
  return (
    <section className="cy-why" aria-labelledby="cy-why-heading">
      <Reveal className="cy-why-head">
        <span className="cy-why-eyebrow">Advantage Protocol</span>
        <h2 id="cy-why-heading" className="cy-why-h">
          Why Participate?
        </h2>
        <p className="cy-why-sub">
          Stop passive learning. Ship real code, master AI-accelerated workflows, and test your mettle in an 18-hour arena.
        </p>
      </Reveal>

      <div className="cy-why-grid">
        {WHY_PARTICIPATE.map((item, index) => {
          const IconComponent = Icon[item.icon] || Icon.Code;
          const rgb = hexToRgb(item.accent);

          return (
            <Reveal
              key={item.num}
              as="article"
              className="cy-why-card"
              delay={index * 80}
              style={{
                '--card-accent': item.accent,
                '--card-rgb': rgb,
              }}
            >
              <span className="cy-why-ghost" aria-hidden="true">
                {item.num}
              </span>

              <div className="cy-why-tele">
                <span className="cy-why-idx">[SYS.{item.num}]</span>
                <span className="cy-why-tag">{item.tag}</span>
              </div>

              <div className="cy-why-icon-wrap" aria-hidden="true">
                <IconComponent size={22} />
              </div>

              <h3 className="cy-why-title">{item.title}</h3>
              <p className="cy-why-desc">{item.desc}</p>
              <div className="cy-why-corner" aria-hidden="true" />
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
