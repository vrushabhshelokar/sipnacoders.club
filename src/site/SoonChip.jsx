// SoonChip.jsx: the amber "Publishing soon" label. The words are ROUND2_SOON in data/vibeathonData.js ('' = no label, the full Round 2 content is shown).
import { ROUND2_SOON } from '../data/vibeathonData';
import './SoonChip.css';

export default function SoonChip({ className = '' }) {
  if (!ROUND2_SOON) return null;
  return (
    <span className={('soon-chip ' + className).trim()}>
      <i aria-hidden="true" />{ROUND2_SOON}
    </span>
  );
}
