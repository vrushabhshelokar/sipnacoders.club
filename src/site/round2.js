// round2.js: is the "Round 2 details" switch on? (dashboard -> Events tab -> Vibe-A-Thon -> Round 2; it changes live, no deploy)
//   OFF (the usual): every Round 2 block of the page says "Publishing soon" (the words are ROUND2_SOON in data/vibeathonData.js)
//   ON: the full Round 2 details show instead
// You never edit this file.
import { ROUND2_SOON } from '../data/vibeathonData';
import { useSwitch } from './liveSettings';

export const useRound2On = () => useSwitch('round2Details', false);

// the "Publishing soon" words, or '' once the details are on (or ROUND2_SOON itself is '')
export function useRound2Soon() {
  const on = useRound2On();
  return on ? '' : ROUND2_SOON;
}
