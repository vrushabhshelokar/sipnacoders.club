// Admin: the list of registrations. summary counts: admin or view-only (numbers only). The list itself, delete, import: admin only.
//   GET  /api/admin/registrations?summary=1            counts per event and per day (for the Overview tab)
//   GET  /api/admin/registrations?event=vibe-a-thon    every submission of one event + the webhook token (admin only)
//   POST { action: 'delete', event, ids: [...] }
//   POST { action: 'import', event, rows: [{ column: value }] }   rows from a CSV (Tally / Google Sheets export)
import { getAdminSecret, getRole } from '../../api-lib/adminAuth.js';
import { getRedisClient, istDay, readBody, sendResponse } from '../../api-lib/shared.js';
import { REG_EVENTS, fromRow, readAll, regKey, webhookToken } from '../../api-lib/registrations.js';

const LIST_CAP = 5000;

function queryOf(req) {
  if (req.query && typeof req.query === 'object') return req.query;
  try { return Object.fromEntries(new URL(req.url || '/', 'http://x').searchParams); } catch { return {}; }
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return sendResponse(res, 405, { error: 'Method Not Allowed' });
  }
  const secret = getAdminSecret();
  if (!secret) return sendResponse(res, 401, { error: 'Admin authentication is not configured on the server.' });
  const role = getRole(req);
  if (!role) return sendResponse(res, 401, { authenticated: false, error: 'Unauthorized: please log in again.' });

  const redis = getRedisClient();
  if (!redis) return sendResponse(res, 503, { ok: false, error: 'Redis is not configured, so registrations cannot be stored.' });

  try {
    if (req.method === 'GET') {
      const q = queryOf(req);
      if (q.summary) {
        const events = {};
        const today = istDay();
        const from = istDay(29);
        for (const event of Object.keys(REG_EVENTS)) {
          const list = await readAll(redis, event);
          const days = {};
          for (const e of list) {
            const d = new Date(Date.parse(e.at) + 5.5 * 3600e3).toISOString().slice(0, 10);
            if (d >= from && d <= today) days[d] = (days[d] || 0) + 1;
          }
          events[event] = { total: list.length, days };
        }
        return sendResponse(res, 200, { events });
      }
      if (role !== 'admin') return sendResponse(res, 403, { ok: false, error: 'View-only access cannot open the list of names.' });
      const event = String(q.event || '');
      if (!REG_EVENTS[event]) return sendResponse(res, 400, { ok: false, error: 'Unknown event.' });
      const list = await readAll(redis, event);
      return sendResponse(res, 200, {
        event, total: list.length, capped: list.length > LIST_CAP, entries: list.slice(0, LIST_CAP),
        token: role === 'admin' ? webhookToken(secret) : undefined,
      });
    }

    if (role !== 'admin') return sendResponse(res, 403, { ok: false, error: 'View-only access: you cannot change anything.' });
    const body = await readBody(req);
    const event = String(body.event || '');
    if (!REG_EVENTS[event]) return sendResponse(res, 400, { ok: false, error: 'Unknown event.' });

    if (body.action === 'delete') {
      const ids = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === 'string' && x.length <= 80).slice(0, 200) : [];
      if (!ids.length) return sendResponse(res, 400, { ok: false, error: 'Nothing to delete.' });
      await redis.hdel(regKey(event), ...ids);
      return sendResponse(res, 200, { ok: true, deleted: ids.length });
    }

    if (body.action === 'import') {
      const rows = Array.isArray(body.rows) ? body.rows.slice(0, 500) : [];
      const fresh = {};
      let skipped = 0;
      for (const row of rows) {
        const entry = fromRow(row, event);
        if (entry) fresh[entry.id] = JSON.stringify(entry); else skipped += 1;
      }
      const added = Object.keys(fresh).length;
      if (added) await redis.hset(regKey(event), fresh);
      return sendResponse(res, 200, { ok: true, added, skipped });
    }

    return sendResponse(res, 400, { ok: false, error: 'Unknown action.' });
  } catch (err) {
    console.error('Registrations error:', err.message);
    return sendResponse(res, 500, { ok: false, error: 'Something went wrong. Try again.' });
  }
}
