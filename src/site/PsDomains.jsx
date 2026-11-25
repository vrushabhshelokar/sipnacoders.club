// Vibe-A-Thon: the domains of the problem statements. Sits inside the "Problem Statement Release" section, under the PDF card.
// It is loaded ONLY after that section has unlocked (see ProblemStatement.jsx), so nothing here is visible or downloaded before.
// The words live in data/psDomains.js. Nothing in this file needs to change.
import { Reveal } from './ui';
import { PS_DOMAINS } from '../data/psDomains';
import './PsDomains.css';

export default function PsDomains({ pdf = '' }) {
  const total = PS_DOMAINS.reduce((n, d) => n + (Number(d.count) || 0), 0);
  return (
    <div className="cy-psd" aria-labelledby="cy-psd-heading">
      <Reveal className="cy-psd-head">
        <h3 id="cy-psd-heading" className="cy-psd-h">{PS_DOMAINS.length} Domains</h3>
        <p className="cy-psd-sub">
          Every problem statement belongs to one of these domains{total ? ` (${total} in all)` : ''}. Choose the area you want to build in.
        </p>
        {pdf ? (
          <a className="cy-psd-pdf" href={pdf} target="_blank" rel="noopener noreferrer">Open the full PDF in a new tab</a>
        ) : null}
      </Reveal>

      <ol className="cy-psd-grid">
        {PS_DOMAINS.map((d, i) => (
          <Reveal as="li" key={d.name} delay={Math.min(i, 4) * 70} className="cy-psd-card">
            <div className="cy-psd-top">
              <span className="cy-psd-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="cy-psd-count" aria-label={`${d.count} problem statement${d.count === 1 ? '' : 's'}`}>{d.count} PS</span>
            </div>
            <h4 className="cy-psd-name">{d.name}</h4>
            <p className="cy-psd-focus"><span>Focus</span> {d.focus}</p>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
