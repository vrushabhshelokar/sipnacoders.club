// Admin: scheduled changes and the change history (admin only).
//   GET  /api/admin/control                      -> { now, schedule, history }
//   POST { action: 'schedule-add', at, patch, label, note }    at = 'YYYY-MM-DDTHH:MM' Indian time, in the future
//   POST { action: 'schedule-remove', id }
//   POST { action: 'undo', id }                  puts back the values a history entry changed
import crypto from 'node:crypto';
import { getAdminSecret, getRole } from '../../api-lib/adminAuth.js';
import {
  KEYS, applyPatch, getRedisClient, parseStoredSettings, readBody, sendResponse, validStamp,
} from '../../api-lib/shared.js';
import {
  addHistory, cleanItem, diffSettings, materialize, parseHistory, parseSchedule, reverseOf, trimSchedule,
} from '../../api-lib/control.js';

const MAX_PENDING = 40;

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return sendResponse(res, 405, { error: 'Method Not Allowed' });
  }
  const secret = getAdminSecret();
  if (!secret) return sendResponse(res, 401, { error: 'Admin authentication is not configured on the server.' });
  const role = getRole(req);
  if (role !== 'admin') {
    return role === 'viewer'
      ? sendResponse(res, 403, { ok: false, error: 'View-only access: you cannot change anything.' })
      : sendResponse(res, 401, { authenticated: false, error: 'Unauthorized: please log in again.' });
  }
  const redis = getRedisClient();
  if (!redis) return sendResponse(res, 503, { ok: false, error: 'Redis is not configured.' });

  try {
    const [rawSettings, rawSchedule, rawHistory] = await Promise.all([redis.get(KEYS.settings), redis.get(KEYS.schedule), redis.get(KEYS.history)]);
    const schedule = parseSchedule(rawSchedule);
    const history = parseHistory(rawHistory);

    if (req.method === 'GET') {
      const sorted = [...schedule].sort((a, b) => a.at.localeCompare(b.at));
      return sendResponse(res, 200, { now: Date.now(), schedule: sorted, history: history.slice(0, 40) });
    }

    const body = await readBody(req);

    if (body.action === 'schedule-add') {
      if (!validStamp(body.at)) return sendResponse(res, 400, { ok: false, error: 'Pick a date and time.' });
      if (Date.parse(`${body.at}:00+05:30`) < Date.now() + 30_000) return sendResponse(res, 400, { ok: false, error: 'Pick a time in the future (Indian time).' });
      if (schedule.filter((i) => !i.done).length >= MAX_PENDING) return sendResponse(res, 400, { ok: false, error: `You already have ${MAX_PENDING} waiting changes. Remove some first.` });
      const item = cleanItem({ id: crypto.randomBytes(6).toString('hex'), at: body.at, patch: body.patch, label: body.label, note: body.note });
      if (!item) return sendResponse(res, 400, { ok: false, error: 'This change is not valid.' });
      await redis.set(KEYS.schedule, JSON.stringify(trimSchedule([...schedule, item])));
      return sendResponse(res, 200, { ok: true, item });
    }

    if (body.action === 'schedule-remove') {
      const id = String(body.id || '');
      if (!schedule.some((i) => i.id === id)) return sendResponse(res, 404, { ok: false, error: 'That change is already gone.' });
      await redis.set(KEYS.schedule, JSON.stringify(schedule.filter((i) => i.id !== id)));
      return sendResponse(res, 200, { ok: true });
    }

    if (body.action === 'undo') {
      const entry = history.find((e) => e.id === String(body.id || ''));
      if (!entry) return sendResponse(res, 404, { ok: false, error: 'That history entry is gone.' });
      const patch = reverseOf(entry);
      if (!Object.keys(patch).length) return sendResponse(res, 400, { ok: false, error: 'This change has long text, so it cannot be undone from here.' });
      const stored = parseStoredSettings(rawSettings);
      const m = materialize(stored, schedule);
      const { next, rejected } = applyPatch(m.settings, patch);
      if (rejected.length) return sendResponse(res, 400, { ok: false, error: 'The old values are not valid any more.' });
      const changes = diffSettings(m.settings, next);
      let h = history;
      if (m.applied.length) h = addHistory(h, { who: 'schedule', kind: 'scheduled', changes: diffSettings(stored, m.settings), note: `${m.applied.length} scheduled change(s) came due` });
      if (changes.length) h = addHistory(h, { who: 'admin', kind: 'undo', changes, note: `Undid the change of ${entry.at.slice(0, 16).replace('T', ' ')} UTC` });
      await redis.set(KEYS.settings, JSON.stringify(next));
      if (m.applied.length) await redis.set(KEYS.schedule, JSON.stringify(trimSchedule(m.schedule)));
      if (h !== history) await redis.set(KEYS.history, JSON.stringify(h));
      return sendResponse(res, 200, { ok: true, nothing: !changes.length, settings: next });
    }

    return sendResponse(res, 400, { ok: false, error: 'Unknown action.' });
  } catch (err) {
    console.error('Control error:', err.message);
    return sendResponse(res, 500, { ok: false, error: 'Something went wrong. Try again.' });
  }
}
