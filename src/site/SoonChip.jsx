// SoonChip.jsx: the amber "Publishing soon" label. The words are ROUND2_SOON in data/vibeathonData.js; the "Round 2 details" switch in the dashboard hides it and shows the full Round 2 content.
import { useRound2Soon } from './round2';
import './SoonChip.css';

export default function SoonChip({ className = '' }) {
  const soon = useRound2Soon();
  if (!soon) return null;
  return (
    <span className={('soon-chip ' + className).trim()}>
      <i aria-hidden="true" />{soon}
    </span>
  );
}
