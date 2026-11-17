// Public, read-only: the team and ambassador lists the admin saved on the dashboard, and their photos.
//   GET /api/people                 -> { team: [...] | null, ambassadors: [...] | null }   (null = the website uses src/data/site.js)
//   GET /api/people?photo=<id>&v=<version>  -> the photo itself
// Nothing private is in here (it is what the website shows anyway), and nobody can change it without the admin login.
import { getRedisClient } from '../api-lib/shared.js';
import { ID_RE, PEOPLE_KEY, parseStored, parseStoredPhoto, photoKey, queryOf } from '../api-lib/peopleData.js';

function sendJson(res, status, data, cache) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', cache);
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  const q = queryOf(req);
  const redis = getRedisClient();

  /* ---- one photo ---- */
  if (q.photo !== undefined) {
    const id = String(q.photo).toLowerCase();
    let photo = null;
    if (redis && ID_RE.test(id)) {
      try { photo = parseStoredPhoto(await redis.get(photoKey(id))); } catch (err) { console.error('Photo read error:', err.message); }
    }
    if (!photo) {
      res.statusCode = 404;
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=20');
      return res.end('Not found');
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', photo.mime);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // the link carries the version of the photo (&v=...), so a new photo is a new link and an old one can be kept for a year
    res.setHeader('Cache-Control', q.v ? 'public, max-age=31536000, immutable' : 'public, max-age=300');
    res.setHeader('Content-Length', String(photo.buf.length));
    return res.end(req.method === 'HEAD' ? undefined : photo.buf);
  }

  /* ---- the lists ---- */
  // A few seconds of caching at Vercel's edge keeps Redis calls low when many people open the site at once.
  const cache = 'public, max-age=0, s-maxage=30, stale-while-revalidate=120';
  let lists = { team: null, ambassadors: null };
  if (redis) {
    try {
      lists = parseStored(await redis.get(PEOPLE_KEY));
    } catch (err) {
      console.error('People read error:', err.message);
    }
  }
  return sendJson(res, 200, lists, cache);
}
