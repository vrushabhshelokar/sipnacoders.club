// Scheduled changes + change history for the admin dashboard (api/admin/control.js, api/admin/analytics.js, api/settings.js).
//
// A scheduled change is "at this Indian time, apply this patch to the site switches". Nothing runs on a timer:
// whoever reads the switches (the public site, the dashboard) applies the changes that are already due, in order,
// so a change happens on time even if nobody is online. When the admin saves something, the due changes are written
// into the saved switches first, so the admin's own save always comes after them.
import { ALL_SETTING_KEYS, applyPatch, validStamp } from './shared.js';

const stampMs = (at) => Date.parse(`${at}:00+05:30`);
const asArray = (raw) => {
  let v = raw;
  if (typeof v === 'string') { try { v = JSON.parse(v); } catch { return []; } }
  return Array.isArray(v) ? v : [];
};
const text = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '');

/* ---------------------------------------------- schedule ---------------------------------------------- */

// { id, at, patch, label, note, done, doneAt }
export function cleanItem(it) {
  if (!it || typeof it !== 'object') return null;
  if (typeof it.id !== 'string' || !/^[a-z0-9]{6,24}$/.test(it.id)) return null;
  if (!validStamp(it.at)) return null;
  if (!it.patch || typeof it.patch !== 'object' || Array.isArray(it.patch)) return null;
  const { next, rejected } = applyPatch({}, it.patch);
  if (rejected.length) return null;
  // keep the patch itself (null = go back to the code file), only with known keys
  const patch = {};
  for (const k of ALL_SETTING_KEYS) {
    if (!(k in it.patch)) continue;
    if (it.patch[k] === null || it.patch[k] === '') patch[k] = null;
    else if (k in next) patch[k] = next[k];
  }
  if (!Object.keys(patch).length) return null;
  const out = { id: it.id, at: it.at, patch, label: text(it.label, 80), note: text(it.note, 80), done: it.done === true };
  if (out.done && typeof it.doneAt === 'string') out.doneAt = it.doneAt.slice(0, 30);
  return out;
}

export function parseSchedule(raw) {
  return asArray(raw).map(cleanItem).filter(Boolean).slice(0, 80);
}

// keep every waiting change and the 15 newest finished ones
export function trimSchedule(list) {
  const pending = list.filter((i) => !i.done);
  const done = list.filter((i) => i.done).sort((a, b) => String(b.doneAt || b.at).localeCompare(String(a.doneAt || a.at))).slice(0, 15);
  return [...pending, ...done].sort((a, b) => stampMs(a.at) - stampMs(b.at));
}

// apply every change that is due, oldest first. Returns the new switches, the schedule with those marked done, and which ones came due.
export function materialize(settings, schedule, now = Date.now()) {
  let current = { ...settings };
  const due = schedule.filter((i) => !i.done && stampMs(i.at) <= now)
    .sort((a, b) => stampMs(a.at) - stampMs(b.at) || a.id.localeCompare(b.id));
  const applied = [];
  for (const it of due) {
    current = applyPatch(current, it.patch).next;
    applied.push(it.id);
  }
  const iso = new Date(now).toISOString();
  return {
    settings: current,
    schedule: schedule.map((i) => (applied.includes(i.id) ? { ...i, done: true, doneAt: iso } : i)),
    applied,
  };
}

/* ---------------------------------------------- history ---------------------------------------------- */

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// what changed between two sets of switches: [{ key, from?, to? }]  (a missing from / to means "not set": the code file decides)
export function diffSettings(before, after) {
  const out = [];
  for (const key of ALL_SETTING_KEYS) {
    if (same(before[key], after[key])) continue;
    const row = { key };
    if (before[key] !== undefined) row.from = before[key];
    if (after[key] !== undefined) row.to = after[key];
    out.push(row);
  }
  return out;
}

export function parseHistory(raw) {
  return asArray(raw).filter((e) => e && typeof e === 'object' && typeof e.id === 'string' && Array.isArray(e.changes)).slice(0, 80);
}

// newest first, 80 entries. A long value (timeline text) is not kept in full: that change can be seen but not undone.
export function addHistory(list, { who, kind, changes, note = '' }, now = Date.now()) {
  const slim = changes.map((c) => {
    const big = JSON.stringify(c.from ?? '').length > 1800 || JSON.stringify(c.to ?? '').length > 1800;
    return big ? { key: c.key, big: true } : c;
  });
  const entry = {
    id: Math.random().toString(36).slice(2, 10) + now.toString(36).slice(-4),
    at: new Date(now).toISOString(),
    who: ['admin', 'schedule'].includes(who) ? who : 'admin',
    kind: ['save', 'reset', 'scheduled', 'undo'].includes(kind) ? kind : 'save',
    note: text(note, 120),
    changes: slim,
  };
  return [entry, ...list].slice(0, 80);
}

// the patch that puts every value of that entry back as it was
export function reverseOf(entry) {
  const patch = {};
  for (const c of entry.changes || []) {
    if (!c || c.big || !ALL_SETTING_KEYS.includes(c.key)) continue;
    patch[c.key] = c.from === undefined ? null : c.from;
  }
  return patch;
}
