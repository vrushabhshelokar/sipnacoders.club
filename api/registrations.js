// The address that the club's forms call when someone submits (Tally webhook, or the Google Forms script).
// POST /api/registrations?event=vibe-a-thon&token=...   The admin dashboard (Registrations tab) shows the exact address.
// Nothing here is public: a call without the right token is refused, and nothing is returned except "ok".
import { getAdminSecret } from '../api-lib/adminAuth.js';
import { getRedisClient, readBody, sendResponse } from '../api-lib/shared.js';
import { REG_EVENTS, fromPayload, regKey, tokenOk } from '../api-lib/registrations.js';
import { clientIp, memoryHit } from '../api-lib/ratelimit.js';

function queryOf(req) {
  if (req.query && typeof req.query === 'object') return req.query;
  try { return Object.fromEntries(new URL(req.url || '/', 'http://x').searchParams); } catch { return {}; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }
  const secret = getAdminSecret();
  if (!secret) return sendResponse(res, 503, { ok: false, error: 'Not configured.' });

  const q = queryOf(req);
  if (!tokenOk(String(q.token || ''), secret)) return sendResponse(res, 401, { ok: false, error: 'Wrong or missing token.' });
  const event = String(q.event || '');
  if (!REG_EVENTS[event]) return sendResponse(res, 400, { ok: false, error: 'Unknown event.' });

  const hit = memoryHit(`reg:${clientIp(req)}`, 120, 60_000);
  if (hit.limited) return sendResponse(res, 429, { ok: false }, { 'Retry-After': String(hit.retryAfter) });

  const redis = getRedisClient();
  if (!redis) return sendResponse(res, 503, { ok: false, error: 'Storage not configured.' });

  const entry = fromPayload(await readBody(req), event);
  if (!entry) return sendResponse(res, 400, { ok: false, error: 'No answers found in this request.' });
  try {
    await redis.hset(regKey(event), { [entry.id]: JSON.stringify(entry) });
    return sendResponse(res, 200, { ok: true });
  } catch (err) {
    console.error('Registration save error:', err.message);
    return sendResponse(res, 500, { ok: false, error: 'Could not save.' });
  }
}
