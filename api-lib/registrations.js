// Registrations: what the club's forms (Tally for Vibe-A-Thon, Google Forms for Code Clash) send to the site, kept in Redis
// so the admin dashboard can list, search, count and export them. The forms themselves are not changed.
//
// Redis: scc:reg:<event>  a hash, one field per submission (field = submission id, value = JSON). The same id twice = the same row,
// so a form that retries a delivery never creates a duplicate.
import crypto from 'node:crypto';

export const REG_EVENTS = { 'vibe-a-thon': 'Vibe-A-Thon', 'code-clash': 'Code Clash', membership: 'Membership', other: 'Other' };
export const regKey = (event) => `scc:reg:${event}`;

// The address that Tally / Google Forms call. It carries a token made from the admin password, so only the admin can see it.
export function webhookToken(secret) {
  // set REG_WEBHOOK_TOKEN in Vercel to keep the address the same even if the admin password changes
  const fixed = process.env.REG_WEBHOOK_TOKEN;
  if (fixed && /^[A-Za-z0-9_-]{16,80}$/.test(fixed)) return fixed;
  return crypto.createHmac('sha256', secret).update('scc-registration-webhook-v1').digest('hex').slice(0, 40);
}
export function tokenOk(given, secret) {
  if (typeof given !== 'string' || !secret) return false;
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(webhookToken(secret)).digest();
  return crypto.timingSafeEqual(a, b);
}

const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex');
const clip = (v, n) => String(v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ').trim().slice(0, n);
const stable = (o) => JSON.stringify(Object.keys(o).sort().map((k) => [k, o[k]]));

// one answer -> text. Multiple choice answers come as option ids: the option text is used.
function textOf(value, options) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map((x) => textOf(x, options)).filter(Boolean).join(', ');
  if (typeof value === 'object') return String(value.url || value.name || value.text || value.label || JSON.stringify(value));
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  const s = String(value);
  if (Array.isArray(options)) { const hit = options.find((o) => o && o.id === s); if (hit && hit.text) return String(hit.text); }
  return s;
}

function addField(fields, label, text) {
  const value = clip(text, 500);
  if (!value) return;
  let name = clip(label, 80) || 'Field';
  for (let n = 2; name in fields; n += 1) name = `${clip(label, 70)} (${n})`;
  if (Object.keys(fields).length < 40) fields[name] = value;
}

/* name / email / phone / college / year: found by what the question is called */
const FIND = {
  email: [/e-?mail/i],
  phone: [/phone|mobile|whats ?app|contact ?(no|number|num)?\b/i],
  college: [/college|institute|institution|university/i],
  year: [/\b(year|semester|sem)\b/i],
  name: [/^(your |full |participant'?s? |candidate |student |leader'?s? |team leader'?s? )?name$/i, /(full|your|leader|participant|student|candidate) name/i, /^name\b/i],
};
const NOT_A_PERSON = /college|team|project|event|school|father|mother|guardian|company|institute|university/i;

export function pickColumns(fields) {
  const labels = Object.keys(fields);
  const find = (rules, ok = () => true) => {
    for (const re of rules) { const l = labels.find((x) => re.test(x) && ok(fields[x], x)); if (l) return fields[l]; }
    return '';
  };
  const email = find(FIND.email, (v) => v.includes('@'));
  const phone = find(FIND.phone, (v) => v.replace(/\D/g, '').length >= 7);
  const college = find(FIND.college, (v, l) => !/year|sem/i.test(l) || /college|institute|university/i.test(l));
  const year = find(FIND.year, (v, l) => !/college|institute|university/i.test(l));
  let name = find(FIND.name, (v, l) => !NOT_A_PERSON.test(l));
  if (!name) { const l = labels.find((x) => /name/i.test(x) && !NOT_A_PERSON.test(x)); if (l) name = fields[l]; }
  return { name: clip(name, 80), email: clip(email, 120), phone: clip(phone, 40), college: clip(college, 120), year: clip(year, 40) };
}

// '19/11/2026 18:42:11' (Google Sheets, Indian settings), '2026-11-19 18:42', ISO ... -> ISO string, or null
export function parseWhen(v) {
  if (v instanceof Date) return v.toISOString();
  if (typeof v !== 'string' || !v.trim()) return null;
  const s = v.trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})[ ,T]*(?:(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i);
  if (m) {
    let [, a, b, y, hh = '0', mm = '0', ss = '0', ap] = m;
    let day = Number(a), mon = Number(b);
    if (mon > 12 && day <= 12) [day, mon] = [mon, day];       // 11/19/2026 (US order)
    let h = Number(hh);
    if (ap) { h %= 12; if (/pm/i.test(ap)) h += 12; }
    const ms = Date.UTC(Number(y), mon - 1, day, h, Number(mm), Number(ss)) - 5.5 * 3600e3;   // the sheet shows Indian time
    return Number.isFinite(ms) && mon >= 1 && mon <= 12 && day >= 1 && day <= 31 ? new Date(ms).toISOString() : null;
  }
  const ms = Date.parse(s);
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
}

function finish({ id, event, at, src, fields }, now) {
  if (!Object.keys(fields).length) return null;
  let rid = String(id || '').replace(/[^A-Za-z0-9_.:-]/g, '').slice(0, 80);
  if (!rid || /^[a-z]+-$/.test(rid)) rid = `h-${sha1(event + stable(fields)).slice(0, 20)}`;
  const when = parseWhen(at);
  const stamp = when && Date.parse(when) < now + 36e5 ? when : new Date(now).toISOString();
  return { id: rid, event, at: stamp, src, ...pickColumns(fields), fields };
}

// what a form sends: Tally ({ eventType: 'FORM_RESPONSE', data: { fields: [...] } }) or our plain format ({ id?, at?, fields: { label: value } })
export function fromPayload(body, event, now = Date.now()) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const fields = {};
  if (body.eventType !== undefined || (body.data && Array.isArray(body.data.fields))) {
    if (body.eventType !== 'FORM_RESPONSE' || !body.data || !Array.isArray(body.data.fields)) return null;
    for (const f of body.data.fields) if (f && typeof f === 'object') addField(fields, f.label || f.key, textOf(f.value, f.options));
    const d = body.data;
    return finish({ id: `tally-${clip(d.responseId || d.submissionId || '', 60)}`, event, at: d.createdAt || body.createdAt, src: 'tally', fields }, now);
  }
  const source = body.fields && typeof body.fields === 'object' && !Array.isArray(body.fields) ? body.fields : body;
  for (const [k, v] of Object.entries(source)) {
    if (source === body && ['id', 'at', 'event', 'token', 'fields'].includes(k)) continue;
    addField(fields, k, textOf(v));
  }
  return finish({ id: body.id ? `api-${clip(body.id, 60)}` : '', event, at: body.at, src: 'form', fields }, now);
}

// one row of an imported CSV: { column: value }
export function fromRow(row, event, now = Date.now()) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return null;
  const fields = {};
  let at = null;
  for (const [k, v] of Object.entries(row)) {
    if (!at && /^(submitted( at)?|submission( time| date)?|timestamp|created( at)?|date|time)$/i.test(String(k).trim())) at = v;
    addField(fields, k, textOf(v));
  }
  if (!Object.keys(fields).length) return null;
  return finish({ id: `imp-${sha1(event + stable(fields)).slice(0, 20)}`, event, at, src: 'csv', fields }, now);
}

// every submission of one event, newest first
export async function readAll(redis, event) {
  const raw = await redis.hgetall(regKey(event));
  const out = [];
  for (const v of Object.values(raw || {})) {
    let o = v;
    if (typeof v === 'string') { try { o = JSON.parse(v); } catch { continue; } }
    if (o && typeof o === 'object' && typeof o.id === 'string') out.push(o);
  }
  return out.sort((a, b) => String(b.at).localeCompare(String(a.at)));
}
