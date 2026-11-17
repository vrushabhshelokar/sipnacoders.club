// Small anti-flood helper for the API routes. Lives in /api-lib on purpose (Vercel does not turn it into an endpoint).
//
// memoryHit(): a plain per-instance counter ("at most N requests per minute from one address"), used by /api/visitors.
// It uses no Redis at all, it never touches the admin login, and nobody is ever locked out of anything for longer than
// the rest of the current minute. It is best-effort (each Vercel instance counts for itself), enough to stop a simple script.

export function clientIp(req) {
  const h = (req && req.headers) || {};
  // Vercel sets these two itself, so a visitor cannot fake them
  const raw = h['x-real-ip'] || String(h['x-forwarded-for'] || '').split(',')[0] || (req.socket && req.socket.remoteAddress) || '';
  return String(raw).trim() || 'unknown';
}

const mem = new Map();   // key -> { n, reset }

function trim(now) {
  if (mem.size > 5000) for (const [k, v] of mem) if (v.reset <= now) mem.delete(k);
  if (mem.size > 20000) mem.clear();   // never let this grow without end
}

// Counts one request for `key`. limited = true once more than `limit` requests came in within `windowMs`.
export function memoryHit(key, limit, windowMs, now = Date.now()) {
  trim(now);
  let e = mem.get(key);
  if (!e || e.reset <= now) { e = { n: 0, reset: now + windowMs }; mem.set(key, e); }
  e.n += 1;
  return { limited: e.n > limit, retryAfter: Math.max(1, Math.ceil((e.reset - now) / 1000)) };
}
