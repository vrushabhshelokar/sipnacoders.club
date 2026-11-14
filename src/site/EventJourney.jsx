// Section 3: Have Any Questions? — Event Journey
// Four connected stages explaining the Vibe-A-Thon participant flow.
import { Reveal } from './ui';
import { Icon } from './Icons';
import { EVENT_JOURNEY } from '../data/vibeathonData';
import './EventJourney.css';

function StageCard({ stage }) {
  const IconC = Icon[stage.icon] || Icon.Terminal;
  return (
    <div
      className="ej-stage"
      style={{
        '--sa': stage.accent,
        '--sa-rgb': stage.accentRgb ||
          (stage.accent === '#7cf2d4' ? '124,242,212'
            : stage.accent === '#4c8dff' ? '76,141,255'
            : stage.accent === '#fbbc05' ? '251,188,5'
            : '255,84,104'),
      }}
    >
      {/* Numbered node badge */}
      <div className="ej-node" aria-hidden="true">{stage.stage}</div>

      {/* Card body */}
      <article className="ej-card">
        <span className="ej-ghost" aria-hidden="true">{stage.stage}</span>

        <span className="ej-tag">{stage.tag}</span>

        <div className="ej-icon" aria-hidden="true">
          <div className="ej-icon-box">
            <IconC size={18} />
          </div>
        </div>

        <h3 className="ej-title">{stage.title}</h3>
        <p className="ej-summary">{stage.summary}</p>

        <ul className="ej-points" aria-label={`Steps for ${stage.title}`}>
          {stage.points.map((pt) => (
            <li key={pt}>{pt}</li>
          ))}
        </ul>

        <div className="ej-corner" aria-hidden="true" />
      </article>
    </div>
  );
}

export default function EventJourney() {
  return (
    <section
      className="ej-section"
      aria-labelledby="ej-heading"
      style={{
        '--ej-c1': '#7cf2d4',
        '--ej-c2': '#4c8dff',
        '--ej-c3': '#fbbc05',
        '--ej-c4': '#ff5468',
      }}
    >
      <Reveal className="ej-head">
        <span className="ej-eyebrow">Participant Roadmap</span>
        <h2 id="ej-heading" className="ej-h">Have Any Questions?</h2>
        <p className="ej-sub">
          Wondering how Vibe-A-Thon works? Here&apos;s your journey — from registration to the final stage.
        </p>
      </Reveal>

      <div className="ej-pipeline" role="list" aria-label="Vibe-A-Thon event journey stages">
        {EVENT_JOURNEY.map((stage, i) => (
          <Reveal key={stage.stage} delay={i * 100} role="listitem">
            <StageCard stage={stage} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
