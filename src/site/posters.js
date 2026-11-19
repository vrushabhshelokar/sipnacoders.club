// The posters of the upcoming event.
//   1. Banners uploaded in the admin dashboard (Upcoming event tab) win.
//   2. Otherwise the pictures in  src/assets/upcoming/  named after the event type:
//        hackathon.jpg, hackathon1.jpg, hackathon2.jpg ... (no limit)   or   workshop.jpg ...   or   online.jpg ...
//      The ones that match the event type (dashboard, else EVENT_TYPE in site/upcomingConfig.js) are shown, in number order.
// Nothing to edit here.
import { bannerUrls, eventType } from './eventLive';
import { useLiveSettings } from './liveSettings';
import * as C from './upcomingConfig';

const files = import.meta.glob('../assets/upcoming/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG,WEBP,AVIF,GIF}', { eager: true, query: '?url', import: 'default' });   // (CAPITAL letters too: phones and Windows often save .JPG)

// "hackathon" -> 0, "hackathon1" -> 1, "Hackathon-12" -> 12, "hackathon (2)" -> 2 ; anything else -> not a poster of this type
// ("hackathon.jpg.jpg" works too: Windows can hide the real .jpg, so a renamed file often ends up with two)
const order = (file, type) => {
  const base = file.replace(/(\.(jpe?g|png|webp|avif|gif))+$/i, '');
  const m = new RegExp(`^${type}[\\s_-]*\\(?(\\d*)\\)?$`, 'i').exec(base);
  return m ? (m[1] === '' ? 0 : parseInt(m[1], 10)) : null;
};

const forType = (type) => Object.entries(files)
  .map(([path, url]) => {
    const file = path.split('/').pop();
    return { n: order(file, type), file, url };
  })
  .filter((p) => p.n !== null && p.url)
  .sort((a, b) => a.n - b.n || a.file.localeCompare(b.file))
  .map((p) => p.url);

const FILE_POSTERS = { hackathon: forType('hackathon'), workshop: forType('workshop'), online: forType('online') };

// the pictures of the code file's event type (kept for anything that still reads them)
export const POSTERS = FILE_POSTERS[['hackathon', 'workshop', 'online'].includes(C.EVENT_TYPE) ? C.EVENT_TYPE : 'hackathon'];
export const HAS_POSTERS = POSTERS.length > 0;

// the pictures to show right now (an empty list = no poster, the mystery picture stays)
export function currentPosters() {
  const up = bannerUrls();
  return up.length ? up : FILE_POSTERS[eventType()];
}

// the same, and the component draws again when the dashboard values arrive
export function usePosters() {
  useLiveSettings();
  return currentPosters();
}
