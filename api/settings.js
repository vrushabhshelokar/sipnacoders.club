// Public, read-only: the switches the admin saved on the dashboard (registration open/close, popups, countdown dates).
// The website reads this once per visit. Nothing private is in here, and nobody can change it without the admin login.
import { KEYS, getRedisClient, parseStoredSettings } from '../api-lib/shared.js';

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
      settings = parseStoredSettings(await redis.get(KEYS.settings));
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
