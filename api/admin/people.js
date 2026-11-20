// Admin only: add, edit, delete and re-order the team members and the campus ambassadors, and upload their photos.
// Same login as the dashboard (api/admin/analytics.js). Nothing here runs without it.
//   GET   -> { team: [...] | null, ambassadors: [...] | null }
//   POST  { action: 'photo', id, data: 'data:image/webp;base64,...' }   -> { ok, photo: '<version>' }
//   POST  { action: 'save',  list: 'team' | 'ambassadors', people: [...] } -> { ok, people }   (the whole list, in the new order)
//   POST  { action: 'reset', list }                                       -> { ok }          (back to the list in src/data/site.js)
import { getRedisClient, sendResponse } from '../../api-lib/shared.js';
import { isAdmin } from '../../api-lib/adminAuth.js';
import {
  EVENT_MEDIA_IDS, GALLERY_ID_RE, ID_RE, LISTS, MAX_BANNER_BYTES, MAX_GALLERY_BYTES, MAX_LOGO_BYTES, MAX_SITE_BYTES, PEOPLE_KEY, SITE_MEDIA_IDS, cleanList, parseDataUrl, parseStored, photoKey, readJson, sameOrigin,
} from '../../api-lib/peopleData.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return sendResponse(res, 405, { error: 'Method Not Allowed' });
  }
  if (!isAdmin(req)) {
    return sendResponse(res, 401, { authenticated: false, error: 'Unauthorized: please log in again.' });
  }
  const redis = getRedisClient();
  if (!redis) {
    return sendResponse(res, 503, { ok: false, error: 'Redis is not configured, so nothing can be saved.' });
  }

  try {
    if (req.method === 'GET') {
      return sendResponse(res, 200, parseStored(await redis.get(PEOPLE_KEY)));
    }

    if (!sameOrigin(req)) return sendResponse(res, 403, { ok: false, error: 'Request refused.' });
    const { body, tooBig } = await readJson(req);
    if (tooBig) return sendResponse(res, 413, { ok: false, error: 'That request is too large.' });
    if (!body || typeof body !== 'object') return sendResponse(res, 400, { ok: false, error: 'Invalid request.' });

    /* ---- upload one photo (already made small by the dashboard) ---- */
    if (body.action === 'photo') {
      const id = typeof body.id === 'string' ? body.id.toLowerCase() : '';
      // e-b1 .. e-b4 (banners) and e-logo (popup logo): Upcoming event tab. s-membership, s-group, g-<event>-<n>: Site content tab.
      const limit = EVENT_MEDIA_IDS.includes(id) ? (id === 'e-logo' ? MAX_LOGO_BYTES : MAX_BANNER_BYTES)
        : SITE_MEDIA_IDS.includes(id) ? MAX_SITE_BYTES
          : GALLERY_ID_RE.test(id) ? MAX_GALLERY_BYTES : null;   // null = a team / ambassador photo
      if (!ID_RE.test(id) || (limit === null && !Object.values(LISTS).some((p) => id.startsWith(p)))) {
        return sendResponse(res, 400, { ok: false, error: 'Invalid id.' });
      }
      const img = parseDataUrl(body.data, limit === null ? undefined : limit);
      if (img.error) return sendResponse(res, 400, { ok: false, error: img.error });
      const version = Date.now().toString(36);
      await redis.set(photoKey(id), JSON.stringify({ v: version, t: img.mime, d: img.b64 }));
      return sendResponse(res, 200, { ok: true, photo: version });
    }

    /* ---- save one whole list ---- */
    if (body.action === 'save') {
      const checked = cleanList(body.list, body.people);
      if (checked.error) return sendResponse(res, 400, { ok: false, error: checked.error });
      const { people } = checked;

      // a person can only point to a photo that really is stored
      const withPhoto = people.filter((p) => p.photo);
      if (withPhoto.length) {
        const q = redis.pipeline();
        withPhoto.forEach((p) => q.exists(photoKey(p.id)));
        const found = await q.exec();
        withPhoto.forEach((p, i) => { if (!found[i]) p.photo = null; });
      }

      const stored = parseStored(await redis.get(PEOPLE_KEY));
      await redis.set(PEOPLE_KEY, JSON.stringify({ ...stored, [body.list]: people }));

      // photos of people who were taken out of the list are removed
      const keep = new Set(people.map((p) => p.id));
      const gone = (stored[body.list] || []).filter((p) => p.photo && !keep.has(p.id));
      if (gone.length) {
        const q = redis.pipeline();
        gone.forEach((p) => q.del(photoKey(p.id)));
        await q.exec();
      }
      return sendResponse(res, 200, { ok: true, people });
    }

    /* ---- back to the list written in the code ---- */
    if (body.action === 'reset') {
      if (!LISTS[body.list]) return sendResponse(res, 400, { ok: false, error: 'Unknown list.' });
      const stored = parseStored(await redis.get(PEOPLE_KEY));
      const gone = (stored[body.list] || []).filter((p) => p.photo);
      const next = { ...stored, [body.list]: null };
      await redis.set(PEOPLE_KEY, JSON.stringify(next));
      if (gone.length) {
        const q = redis.pipeline();
        gone.forEach((p) => q.del(photoKey(p.id)));
        await q.exec();
      }
      return sendResponse(res, 200, { ok: true });
    }

    return sendResponse(res, 400, { ok: false, error: 'Unknown action.' });
  } catch (err) {
    console.error('Admin people error:', err.message);
    return sendResponse(res, 500, { ok: false, error: 'Something went wrong on the server. Try again.' });
  }
}
