// Registrations tab: everybody who submitted the Tally / Google form, kept by the site so you can search, count and export them.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Fold, Msg, api, errorText, isoWords } from './kit';

const EVENTS = [
  ['vibe-a-thon', 'Vibe-A-Thon'],
  ['code-clash', 'Code Clash'],
  ['membership', 'Membership'],
  ['other', 'Other'],
];
const PAGE = 50;

/* ------------------------------------------------ CSV in / out ------------------------------------------------ */

// a spreadsheet would run a cell that starts with = + - @ as a formula: a leading ' keeps it plain text
const safeCell = (v) => {
  const s = String(v ?? '');
  const t = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};

function toCsv(entries) {
  const labels = [];
  for (const e of entries) for (const k of Object.keys(e.fields || {})) if (!labels.includes(k)) labels.push(k);
  const head = ['Submitted (IST)', 'Source', ...labels];
  const lines = [head.map(safeCell).join(',')];
  for (const e of entries) lines.push([isoWords(e.at), e.src || '', ...labels.map((k) => (e.fields || {})[k] || '')].map(safeCell).join(','));
  return `﻿${lines.join('\r\n')}`;
}

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// RFC 4180 style: quotes, doubled quotes, line breaks inside a cell. Comma, tab or semicolon between cells.
function parseCsv(input) {
  let text = String(input || '');
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const first = text.split(/\r?\n/, 1)[0] || '';
  const delim = [',', '\t', ';'].map((d) => [d, first.split(d).length]).sort((a, b) => b[1] - a[1])[0][0];
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quoted) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i += 1; } else quoted = false; } else cell += c;
    } else if (c === '"' && cell === '') quoted = true;
    else if (c === delim) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cell); cell = ''; rows.push(row); row = [];
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  const full = rows.filter((r) => r.some((x) => String(x).trim() !== ''));
  if (full.length < 2) return [];
  const names = [];
  full[0].forEach((h, i) => {
    let n = String(h).trim() || `Column ${i + 1}`;
    for (let k = 2; names.includes(n); k += 1) n = `${String(h).trim() || `Column ${i + 1}`} (${k})`;
    names.push(n);
  });
  return full.slice(1).map((r) => Object.fromEntries(names.map((n, i) => [n, String(r[i] ?? '').trim()])));
}

/* ------------------------------------------------ helpers ------------------------------------------------ */

const istDay = (iso) => new Date(Date.parse(iso) + 5.5 * 3600e3).toISOString().slice(0, 10);
const digits = (p) => String(p || '').replace(/\D/g, '').slice(-10);

// ids that share an email or a phone number with another row
function findDuplicates(entries) {
  const seen = new Map();
  const dup = new Set();
  for (const e of entries) {
    for (const key of [e.email && `m:${e.email.toLowerCase()}`, digits(e.phone).length >= 8 && `p:${digits(e.phone)}`]) {
      if (!key) continue;
      if (seen.has(key)) { dup.add(e.id); dup.add(seen.get(key)); } else seen.set(key, e.id);
    }
  }
  return dup;
}

function lastDays(entries, n) {
  const out = [];
  for (let i = n - 1; i >= 0; i -= 1) out.push({ date: new Date(Date.now() + 5.5 * 3600e3 - i * 864e5).toISOString().slice(0, 10), n: 0 });
  const at = Object.fromEntries(out.map((d, i) => [d.date, i]));
  for (const e of entries) { const i = at[istDay(e.at)]; if (i !== undefined) out[i].n += 1; }
  return out;
}

function DayBars({ days }) {
  const max = Math.max(...days.map((d) => d.n), 1);
  const total = days.reduce((s, d) => s + d.n, 0);
  return (
    <div className="ac-days" role="img" aria-label={`Registrations per day, last ${days.length} days: ${total} in total`}>
      {days.map((d) => (
        <span key={d.date} className="ac-day" title={`${Number(d.date.slice(8))}/${Number(d.date.slice(5, 7))}: ${d.n}`}>
          <i style={{ height: `${d.n ? Math.max(8, (d.n / max) * 100) : 3}%` }} className={d.n ? '' : 'is-zero'} />
          <small>{Number(d.date.slice(8))}</small>
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------ connect the forms ------------------------------------------------ */

const APPS_SCRIPT = (url) => `function onFormSubmit(e) {
  var fields = {};
  e.response.getItemResponses().forEach(function (r) {
    fields[r.getItem().getTitle()] = r.getResponse();
  });
  UrlFetchApp.fetch('${url}', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      id: e.response.getId(),
      at: e.response.getTimestamp().toISOString(),
      fields: fields
    }),
    muteHttpExceptions: true
  });
}`;

function CopyBox({ label, value, multiline }) {
  const [done, setDone] = useState('');
  const ref = useRef(null);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setDone('Copied.');
    } catch {
      if (ref.current) { ref.current.focus(); ref.current.select(); }
      setDone('Press Ctrl+C to copy.');
    }
    setTimeout(() => setDone(''), 2500);
  };
  return (
    <div className="ac-copy">
      <label className="ac-copy-label">{label}</label>
      <div className="ac-copy-row">
        {multiline
          ? <textarea ref={ref} readOnly rows={12} value={value} spellCheck="false" onFocus={(e) => e.target.select()} />
          : <input ref={ref} readOnly value={value} spellCheck="false" onFocus={(e) => e.target.select()} />}
        <button type="button" className="ad-chip" onClick={copy}>Copy</button>
      </div>
      <span className="ac-copy-done" role="status">{done}</span>
    </div>
  );
}

function ConnectForms({ event, token }) {
  const url = `${window.location.origin}/api/registrations?event=${encodeURIComponent(event)}&token=${token}`;
  return (
    <Fold title="Connect your forms (one-time setup)" hint="Tally and Google Forms stay exactly as they are. They just also tell the site when somebody submits.">
      <p className="ad-row-hint">This address is a secret key: anyone who has it can add rows to this list. Share it with nobody. It works for <b>{(EVENTS.find((x) => x[0] === event) || [])[1]}</b>; pick another event above to get its own address.</p>
      <CopyBox label="Address for this event" value={url} />

      <h4 className="ad-h3">Tally (Vibe-A-Thon form)</h4>
      <ol className="ac-steps">
        <li>Open your form in Tally, then <b>Integrations</b>, then <b>Webhooks</b>, then <b>Connect</b>.</li>
        <li>Paste the address above as the <b>Endpoint URL</b> and save.</li>
        <li>Press <b>Send test request</b>. A test row can appear here: delete it with the checkbox.</li>
      </ol>

      <h4 className="ad-h3">Google Forms (Code Clash form)</h4>
      <ol className="ac-steps">
        <li>Open the form, then the three dots, then <b>Apps Script</b>. Delete what is in the editor and paste the code below. Save.</li>
        <li>On the left press <b>Triggers</b> (clock icon), then <b>Add Trigger</b>. Choose function <b>onFormSubmit</b>, event source <b>From form</b>, event type <b>On form submit</b>. Save and allow the permissions it asks for.</li>
        <li>Submit the form once yourself to test. The row appears here within a few seconds.</li>
      </ol>
      <CopyBox label="Apps Script code (already contains the address for this event)" value={APPS_SCRIPT(url)} multiline />

      <p className="ad-note ad-note-tight">People who registered <b>before</b> you connected the form are not sent automatically. Download the responses as a CSV (Tally: <b>Submissions</b>, <b>Export</b>. Google Forms: <b>Responses</b>, <b>Link to Sheets</b>, <b>File</b>, <b>Download</b>, <b>CSV</b>) and use <b>Import CSV</b> below the list.</p>
    </Fold>
  );
}

/* ------------------------------------------------ the tab ------------------------------------------------ */

export default function AdminRegistrations({ isAdmin }) {
  const [event, setEvent] = useState('vibe-a-thon');
  const [state, setState] = useState({ loading: true, error: '', list: null });
  const [totals, setTotals] = useState({});
  const [q, setQ] = useState('');
  const [onlyDup, setOnlyDup] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [picked, setPicked] = useState(() => new Set());
  const [confirmDel, setConfirmDel] = useState(false);
  const [open, setOpen] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  const loadTotals = async () => {
    const r = await api('/api/admin/registrations?summary=1');
    if (alive.current && r.ok && r.json.events) setTotals(Object.fromEntries(Object.entries(r.json.events).map(([k, v]) => [k, v.total])));
  };
  const load = async (ev = event) => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    const r = await api(`/api/admin/registrations?event=${encodeURIComponent(ev)}`);
    if (!alive.current) return;
    setState(r.ok ? { loading: false, error: '', list: r.json } : { loading: false, error: errorText(r, 'Could not load the list. Try again.'), list: null });
    if (r.ok) setTotals((t) => ({ ...t, [ev]: r.json.total }));
  };
  useEffect(() => { loadTotals(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(event); loadTotals(); setPicked(new Set()); setConfirmDel(false); setOpen(null); setShown(PAGE); setMsg({ type: '', text: '' }); }, [event]); // eslint-disable-line react-hooks/exhaustive-deps

  const entries = useMemo(() => (state.list && state.list.entries) || [], [state.list]);
  const dups = useMemo(() => findDuplicates(entries), [entries]);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return entries.filter((e) => {
      if (onlyDup && !dups.has(e.id)) return false;
      if (!needle) return true;
      return [e.name, e.email, e.phone, e.college, e.year, ...Object.values(e.fields || {})].some((v) => String(v || '').toLowerCase().includes(needle));
    });
  }, [entries, q, onlyDup, dups]);

  const today = istDay(new Date().toISOString());
  const stats = useMemo(() => {
    const week = Date.now() - 7 * 864e5;
    return { today: entries.filter((e) => istDay(e.at) === today).length, week: entries.filter((e) => Date.parse(e.at) >= week).length };
  }, [entries, today]);
  const days = useMemo(() => lastDays(entries, 14), [entries]);

  const togglePick = (id) => setPicked((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const visible = filtered.slice(0, shown);
  const allVisiblePicked = visible.length > 0 && visible.every((e) => picked.has(e.id));

  const removePicked = async () => {
    if (!confirmDel) { setConfirmDel(true); return; }
    setConfirmDel(false);
    setBusy(true);
    const ids = [...picked];
    let gone = 0;
    for (let i = 0; i < ids.length; i += 200) {
      const r = await api('/api/admin/registrations', { action: 'delete', event, ids: ids.slice(i, i + 200) });
      if (!r.ok) { setMsg({ type: 'err', text: `${errorText(r)} ${gone ? `${gone} deleted before that.` : ''}` }); break; }
      gone += r.json.deleted || 0;
      if (i + 200 >= ids.length) setMsg({ type: 'ok', text: `${gone} deleted.` });
    }
    setPicked(new Set());
    setBusy(false);
    load(event);
    loadTotals();
  };

  const importFile = async (file) => {
    if (!file) return;
    setMsg({ type: '', text: '' });
    if (file.size > 4 * 1024 * 1024) { setMsg({ type: 'err', text: 'That file is bigger than 4 MB. Split it into smaller files.' }); return; }
    let rows;
    try { rows = parseCsv(await file.text()); } catch { rows = []; }
    if (!rows.length) { setMsg({ type: 'err', text: 'No rows found. The first line must be the column names, and the file must be a CSV.' }); return; }
    if (rows.length > 5000) { setMsg({ type: 'err', text: `The file has ${rows.length} rows. Import at most 5000 at a time.` }); return; }
    setBusy(true);
    let added = 0;
    let skipped = 0;
    for (let i = 0; i < rows.length; i += 400) {
      setMsg({ type: '', text: `Importing... ${Math.min(i + 400, rows.length)} of ${rows.length}` });
      const r = await api('/api/admin/registrations', { action: 'import', event, rows: rows.slice(i, i + 400) });
      if (!r.ok) { setMsg({ type: 'err', text: `${errorText(r)} ${added} rows were added before that.` }); setBusy(false); load(event); loadTotals(); return; }
      added += r.json.added || 0;
      skipped += r.json.skipped || 0;
    }
    setBusy(false);
    setMsg({ type: 'ok', text: `Imported ${added} rows${skipped ? `, skipped ${skipped} empty rows` : ''}. Rows that were already in the list are not doubled.` });
    load(event);
    loadTotals();
  };

  const eventName = (EVENTS.find((x) => x[0] === event) || [])[1];
  const empty = !state.loading && !state.error && entries.length === 0;

  return (
    <div className="ac-tab">
      <section className="ad-panel">
        <h2>Registrations</h2>
        <p className="ad-sub">Everybody who submitted a form, in one list. {isAdmin ? 'Connect the forms once (below), then new people appear by themselves.' : 'You have view-only access.'}</p>

        <div className="ac-chips" role="radiogroup" aria-label="Event">
          {EVENTS.map(([k, name]) => (
            <button key={k} type="button" role="radio" aria-checked={event === k} className={`ad-chip ${event === k ? 'is-on' : ''}`} onClick={() => setEvent(k)}>
              {name}<b>{totals[k] === undefined ? '' : totals[k]}</b>
            </button>
          ))}
        </div>

        {state.error && <div className="ad-alert ad-alert-err">{state.error} <button type="button" className="ad-link" onClick={() => load(event)}>Try again</button></div>}

        {!state.error && (
          <>
            <div className="ac-stats">
              <div><span>Total</span><b>{state.loading ? '...' : entries.length}</b></div>
              <div><span>Today</span><b>{state.loading ? '...' : stats.today}</b></div>
              <div><span>Last 7 days</span><b>{state.loading ? '...' : stats.week}</b></div>
              <div><span>Possible duplicates</span><b>{state.loading ? '...' : dups.size}</b></div>
            </div>
            {entries.length > 0 && <DayBars days={days} />}
            {state.list && state.list.capped && <p className="ad-note ad-note-tight">Showing the newest 5000 only. Export keeps the same limit.</p>}

            {empty && (
              <div className="ac-empty">
                <b>No registrations for {eventName} yet.</b>
                <span>{isAdmin ? 'Connect the form (the section just below), or bring the old ones in with Import CSV.' : 'Nothing has arrived yet.'}</span>
              </div>
            )}

            {entries.length > 0 && (
              <>
                <div className="ac-tools">
                  <div className="ad-field ac-search">
                    <label htmlFor="reg-search">Search</label>
                    <input id="reg-search" type="search" placeholder="Name, email, phone, college..." value={q} onChange={(e) => { setQ(e.target.value); setShown(PAGE); }} />
                  </div>
                  <label className="ac-check"><input type="checkbox" checked={onlyDup} onChange={(e) => { setOnlyDup(e.target.checked); setShown(PAGE); }} /> Only possible duplicates</label>
                  <button type="button" className="ad-chip" onClick={() => download(`${event}-registrations-${today}.csv`, toCsv(filtered))} disabled={!filtered.length}>
                    Export CSV ({filtered.length})
                  </button>
                </div>

                {isAdmin && picked.size > 0 && (
                  <div className="ac-bulk" role="status">
                    <span>{picked.size} selected</span>
                    <button type="button" className="ad-chip ac-danger" onClick={removePicked} disabled={busy}>{confirmDel ? `Click again: delete ${picked.size} for good` : 'Delete selected'}</button>
                    <button type="button" className="ad-link" onClick={() => { setPicked(new Set()); setConfirmDel(false); }}>Clear</button>
                  </div>
                )}

                <div className="ac-tablewrap">
                  <table className="ac-table">
                    <thead>
                      <tr>
                        {isAdmin && (
                          <th className="ac-pick">
                            <input type="checkbox" aria-label="Select everyone shown" checked={allVisiblePicked} onChange={() => setPicked((s) => { const n = new Set(s); visible.forEach((e) => (allVisiblePicked ? n.delete(e.id) : n.add(e.id))); return n; })} />
                          </th>
                        )}
                        <th>When (IST)</th><th>Name</th><th>Email</th><th>Phone</th><th>College</th><th>Year</th><th><span className="ac-sr">Details</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((e) => (
                        <FragmentRow key={e.id} e={e} isAdmin={isAdmin} picked={picked.has(e.id)} onPick={() => togglePick(e.id)} dup={dups.has(e.id)} open={open === e.id} onOpen={() => setOpen(open === e.id ? null : e.id)} />
                      ))}
                      {!visible.length && <tr><td colSpan={isAdmin ? 8 : 7} className="ac-none">Nobody matches this search.</td></tr>}
                    </tbody>
                  </table>
                </div>
                {filtered.length > shown && (
                  <button type="button" className="ad-chip ac-more" onClick={() => setShown(shown + PAGE)}>Show {Math.min(PAGE, filtered.length - shown)} more ({filtered.length - shown} left)</button>
                )}
              </>
            )}
          </>
        )}

        {isAdmin && (
          <div className="ac-import">
            <div>
              <b>Import CSV into {eventName}</b>
              <span>For people who registered before the form was connected. The first line of the file must be the column names. Doing it twice does not double anyone.</span>
            </div>
            <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,text/csv" hidden onChange={(e) => { importFile(e.target.files && e.target.files[0]); e.target.value = ''; }} />
            <button type="button" className="ad-chip" disabled={busy} onClick={() => fileRef.current && fileRef.current.click()}>{busy ? 'Working...' : 'Choose CSV file'}</button>
          </div>
        )}
        <Msg m={msg} />
      </section>

      {isAdmin && state.list && state.list.token && (
        <section className="ad-panel">
          <ConnectForms event={event} token={state.list.token} />
        </section>
      )}
    </div>
  );
}

function FragmentRow({ e, isAdmin, picked, onPick, dup, open, onOpen }) {
  const fields = Object.entries(e.fields || {});
  return (
    <>
      <tr className={`${picked ? 'is-picked' : ''} ${open ? 'is-open' : ''}`}>
        {isAdmin && <td className="ac-pick" data-label=""><input type="checkbox" aria-label={`Select ${e.name || e.email || 'this row'}`} checked={picked} onChange={onPick} /></td>}
        <td data-label="When" className="ac-when">{isoWords(e.at)}</td>
        <td data-label="Name" className="ac-name">{e.name || <span className="ac-dash">-</span>}{dup && <em className="ac-dup" title="Same email or phone number as another row">duplicate?</em>}</td>
        <td data-label="Email">{e.email || <span className="ac-dash">-</span>}</td>
        <td data-label="Phone">{e.phone || <span className="ac-dash">-</span>}</td>
        <td data-label="College">{e.college || <span className="ac-dash">-</span>}</td>
        <td data-label="Year">{e.year || <span className="ac-dash">-</span>}</td>
        <td className="ac-more-cell"><button type="button" className="ad-link" aria-expanded={open} onClick={onOpen}>{open ? 'Hide' : 'All answers'}</button></td>
      </tr>
      {open && (
        <tr className="ac-detail">
          <td colSpan={isAdmin ? 8 : 7}>
            <dl>
              {fields.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
              <div><dt>Came from</dt><dd>{e.src === 'tally' ? 'Tally form' : e.src === 'csv' ? 'CSV import' : 'Google / other form'}</dd></div>
            </dl>
          </td>
        </tr>
      )}
    </>
  );
}
