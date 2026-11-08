// The posters of the upcoming event.
// Drop images into  src/assets/upcoming/  and name them after the event type:
//   hackathon.jpg, hackathon1.jpg, hackathon2.jpg ... (no limit)   or   workshop.jpg ...   or   online.jpg ...
// The ones that match EVENT_TYPE (site/upcomingConfig.js) are shown, in number order. Nothing to edit here.
import { TYPE } from './teaserCore';

const files = import.meta.glob('../assets/upcoming/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG,WEBP,AVIF,GIF}', { eager: true, query: '?url', import: 'default' });   // (CAPITAL letters too: phones and Windows often save .JPG)

// "hackathon" -> 0, "hackathon1" -> 1, "Hackathon-12" -> 12, "hackathon (2)" -> 2 ; anything else -> not a poster of this type
// ("hackathon.jpg.jpg" works too: Windows can hide the real .jpg, so a renamed file often ends up with two)
const order = (file) => {
  const base = file.replace(/(\.(jpe?g|png|webp|avif|gif))+$/i, '');
  const m = new RegExp(`^${TYPE}[\\s_-]*\\(?(\\d*)\\)?$`, 'i').exec(base);
  return m ? (m[1] === '' ? 0 : parseInt(m[1], 10)) : null;
};

export const POSTERS = Object.entries(files)
  .map(([path, url]) => {
    const file = path.split('/').pop();
    return { n: order(file), file, url };
  })
  .filter((p) => p.n !== null && p.url)
  .sort((a, b) => a.n - b.n || a.file.localeCompare(b.file))
  .map((p) => p.url);

export const HAS_POSTERS = POSTERS.length > 0;
