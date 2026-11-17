// Admin check for the endpoints that change site content (api/admin/people.js).
// It is the same check that api/admin/analytics.js uses: the same password, the same login cookie. Logging in on the
// dashboard is enough, there is no second login.
import crypto from 'node:crypto';
import { parseCookies } from './shared.js';

const SESSION_COOKIE_NAME = 'scc_admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours

export function getAdminSecret() {
  return process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET || process.env.ADMIN_API_KEY || null;
}

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function verifySessionToken(token, secret) {
  if (!token || typeof token !== 'string') return false;
  const [timestampStr, signature] = token.split('.');
  if (!timestampStr || !signature) return false;
  const timestamp = parseInt(timestampStr, 10);
  if (Number.isNaN(timestamp)) return false;
  if (Date.now() - timestamp > SESSION_MAX_AGE_SECONDS * 1000 || timestamp > Date.now() + 60000) return false;
  const expected = crypto.createHmac('sha256', secret).update(timestampStr).digest('hex');
  return safeCompare(signature, expected);
}

export function isAdmin(req) {
  const secret = getAdminSecret();
  if (!secret) return false;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ') && safeCompare(authHeader.slice(7).trim(), secret)) return true;
  const apiKey = req.headers['x-admin-key'];
  if (apiKey && safeCompare(apiKey, secret)) return true;
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE_NAME];
  return Boolean(token && verifySessionToken(token, secret));
}
