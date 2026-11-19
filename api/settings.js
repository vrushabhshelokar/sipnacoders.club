// Public, read-only: the switches the admin saved on the dashboard (registration open/close, popups, countdown dates).
// The website reads this once per visit. Nothing private is in here, and nobody can change it without the admin login.
import { KEYS, getRedisClient, parseStoredSettings } from '../api-lib/shared.js';
import { materialize, parseSchedule } from '../api-lib/control.js';

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

  const payload = JSON.stringify({ settings });
  if (typeof res.status === 'function' && typeof res.send === 'function') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(payload);
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(payload);
}
