// Public, read-only: the switches the admin saved on the dashboard (registration open/close, popups, countdown dates).
// The website reads this once per visit. Nobody can change it without the admin login.
// The one thing kept back: the problem statement PDF link is NOT given out while the problem statement buttons are Locked.
// Once they are Open and the admin left the PDF link box empty, the Round 1 PDF (DEFAULT_PS_PDF, in the public folder) is used.
import { KEYS, getRedisClient, parseStoredSettings } from '../api-lib/shared.js';
import { materialize, parseSchedule } from '../api-lib/control.js';

const DEFAULT_PS_PDF = '/ps-vibeathon-r1-61aeb47606.pdf';   // the Round 1 problem statements PDF (public/ folder). The admin PDF link box overrides it.

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  // A few seconds of caching at Vercel's edge keeps Redis calls low when many people open the site at once.
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=30');

  let settings = {};
  const redis = getRedisClient();
  if (redis) {
    try {
      const [saved, scheduled] = await Promise.all([redis.get(KEYS.settings), redis.get(KEYS.schedule)]);
      // changes the admin scheduled for a time that has passed are applied here, so they happen on time even if nobody is logged in
      settings = materialize(parseStoredSettings(saved), parseSchedule(scheduled)).settings;
    } catch (err) {
      console.error('Settings read error:', err.message);
    }
  }

  // the PDF link stays private until the admin switches the problem statement buttons to Open; then the default PDF is used if the box is empty
  if (!settings.psUnlockNow) delete settings.psPdf;
  else if (!String(settings.psPdf || '').trim()) settings.psPdf = DEFAULT_PS_PDF;

  const payload = JSON.stringify({ settings });
  if (typeof res.status === 'function' && typeof res.send === 'function') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(payload);
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(payload);
}
