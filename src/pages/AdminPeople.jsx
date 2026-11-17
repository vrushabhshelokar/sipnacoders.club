// Admin dashboard panel: add, edit, delete and re-order the team members and the campus ambassadors.
// It sits at the bottom of /admin/visitor-analytics (same login). Nothing is saved until "Save changes" is pressed.
// Until a list is saved the website shows the list written in src/data/site.js; after that the saved list wins.
import { useEffect, useMemo, useRef, useState } from 'react';
import './AdminPeople.css';
import { PROGRAMS } from '../data/site';
import { newPerson, photoSrc, seedList } from '../site/peopleStore';

const TABS = [
  { key: 'team', label: 'Team', one: 'team member', add: 'Add team member', page: '/team', pageLabel: 'Open the Team page' },
  { key: 'ambassadors', label: 'Ambassadors', one: 'ambassador', add: 'Add ambassador', page: '/#ambassadors', pageLabel: 'Open the ambassadors section' },
];

const MAX_PHOTO_BYTES = 240 * 1024;   // the server accepts up to 250 KB

async function request(method, body) {
  const res = await fetch('/api/admin/people', {
    method,
    headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* no JSON in the answer */ }
  return { status: res.status, ok: res.ok, json: json || {} };
}

const EXPIRED = 'Your login expired. Open the admin page in a new tab, log in, then press Save here again. Your changes on this screen are kept as long as you do not refresh.';

/* A photo from the phone gallery can be 5 MB. This makes it small in the browser (about 40-80 KB) before it is uploaded. */
async function shrinkImage(file) {
  if (!/^image\//.test(file.type)) throw new Error('Please choose an image file (JPG, PNG or WebP).');
  if (file.size > 20 * 1024 * 1024) throw new Error('That image is too large (more than 20 MB). Choose a smaller one.');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('This image could not be read. Try a JPG or PNG.'));
      el.src = url;
    });
    for (const side of [720, 560, 420, 320]) {
      const k = Math.min(1, side / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.naturalWidth * k));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * k));
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0d1016';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      for (const type of ['image/webp', 'image/jpeg']) {
        const out = canvas.toDataURL(type, 0.82);
        if (out.startsWith(`data:${type}`) && out.length * 0.75 < MAX_PHOTO_BYTES) return out;
      }
    }
    throw new Error('Could not make this image small enough. Try a smaller photo.');
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function PeopleManager() {
  const [tab, setTab] = useState('team');
  const [server, setServer] = useState(null);   // { team: [...] | null, ambassadors: [...] | null }  (null = still the code list)
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    request('GET')
      .then((r) => {
        if (!alive) return;
        if (r.ok) setServer({ team: r.json.team ?? null, ambassadors: r.json.ambassadors ?? null });
        else setError(r.status === 401 ? 'Your login expired. Refresh this page and log in again.' : (r.json.error || 'Could not load the lists.'));
      })
      .catch(() => { if (alive) setError('Could not load the lists. Check your connection and refresh.'); });
    return () => { alive = false; };
  }, []);

  return (
    <section className="ad-panel ap" aria-labelledby="ad-h-people">
      <h2 id="ad-h-people">Team and ambassadors</h2>
      <p className="ad-sub">
        Add people, change their name, designation, year or photo, remove them, and set the order they appear in on the website.
        Nothing changes on the live site until you press Save, and no deploy is needed.
      </p>
      {error && <div className="ad-alert ad-alert-err">{error}</div>}
      {!server && !error && <p className="ad-empty">Loading the lists...</p>}
      {server && (
        <>
          <div className="ap-tabs" role="tablist" aria-label="Which list">
            {TABS.map((t) => (
              <button
                key={t.key} type="button" role="tab" id={`ap-tab-${t.key}`}
                aria-selected={tab === t.key} aria-controls={`ap-pane-${t.key}`}
                className={tab === t.key ? 'is-on' : ''} onClick={() => setTab(t.key)}
              >{t.label}</button>
            ))}
          </div>
          {TABS.map((t) => (
            <div key={t.key} id={`ap-pane-${t.key}`} role="tabpanel" aria-labelledby={`ap-tab-${t.key}`} hidden={tab !== t.key}>
              <PeopleList tab={t} initial={server[t.key]} />
            </div>
          ))}
        </>
      )}
    </section>
  );
}

function PeopleList({ tab, initial }) {
  const list = tab.key;
  const [items, setItems] = useState(() => initial ?? seedList(list));
  const [base, setBase] = useState(items);               // what is saved (or, before the first save, the list from the code)
  const [saved, setSaved] = useState(initial !== null);
  const [open, setOpen] = useState(null);                // the person whose editor is open
  const [armed, setArmed] = useState(null);              // the person whose Delete was clicked once
  const [armReset, setArmReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const focusNext = useRef(null);

  const dirty = useMemo(() => JSON.stringify(items) !== JSON.stringify(base), [items, base]);

  // leaving the page with unsaved work asks first
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // after a move the buttons jump to a new place in the page: keep the keyboard focus on the same person
  useEffect(() => {
    if (!focusNext.current) return;
    const [id, dir] = focusNext.current;
    focusNext.current = null;
    const first = document.getElementById(`ap-${dir}-${id}`);
    const other = document.getElementById(`ap-${dir === 'up' ? 'down' : 'up'}-${id}`);
    const el = first && !first.disabled ? first : other;
    if (el && !el.disabled) el.focus();
  }, [items]);

  const update = (id, patch) => setItems((arr) => arr.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const moveTo = (id, to, dir) => {
    focusNext.current = dir ? [id, dir] : null;
    setItems((arr) => {
      const from = arr.findIndex((p) => p.id === id);
      const target = Math.max(0, Math.min(arr.length - 1, to));
      if (from < 0 || from === target) return arr;
      const next = [...arr];
      const [p] = next.splice(from, 1);
      next.splice(target, 0, p);
      return next;
    });
    setMsg({ type: '', text: '' });
  };

  const add = () => {
    const p = newPerson(list);
    setItems((arr) => [...arr, p]);
    setOpen(p.id);
    setMsg({ type: '', text: '' });
  };

  const remove = (p) => {
    if (armed !== p.id) { setArmed(p.id); return; }
    setItems((arr) => arr.filter((x) => x.id !== p.id));
    if (open === p.id) setOpen(null);
    setArmed(null);
    setMsg({ type: '', text: `${p.name || 'The entry'} was removed from the list. Press Save changes to make it live.` });
  };

  const onPhoto = async (p, file) => {
    if (!file) return;
    try {
      const data = await shrinkImage(file);
      update(p.id, { photoData: data });
      setMsg({ type: '', text: '' });
    } catch (e) {
      setMsg({ type: 'err', text: e.message });
    }
  };

  const save = async () => {
    const blank = items.find((p) => !p.name.trim());
    if (blank) {
      setOpen(blank.id);
      setMsg({ type: 'err', text: 'Every person needs a name. Fill in the name, or delete the empty entry.' });
      return;
    }
    setBusy(true);
    setMsg({ type: '', text: '' });
    try {
      const out = [];
      for (const p of items) {
        const { photoData, ...rest } = p;
        if (photoData) {
          const r = await request('POST', { action: 'photo', id: p.id, data: photoData });
          if (r.status === 401) throw new Error(EXPIRED);
          if (!r.ok) throw new Error(r.json.error || `Could not upload the photo of ${p.name}.`);
          rest.photo = r.json.photo;
        }
        out.push(rest);
      }
      const r = await request('POST', { action: 'save', list, people: out });
      if (r.status === 401) throw new Error(EXPIRED);
      if (!r.ok) throw new Error(r.json.error || 'Could not save. Try again.');
      setItems(r.json.people);
      setBase(r.json.people);
      setSaved(true);
      setArmReset(false);
      setMsg({ type: 'ok', text: 'Saved. The live site shows this within a minute or two.' });
    } catch (e) {
      setMsg({ type: 'err', text: e.message || 'Could not save. Check your connection and try again.' });
    } finally {
      setBusy(false);
    }
  };

  const discard = () => { setItems(base); setOpen(null); setArmed(null); setMsg({ type: '', text: '' }); };

  const reset = async () => {
    if (!armReset) { setArmReset(true); return; }
    setBusy(true);
    try {
      const r = await request('POST', { action: 'reset', list });
      if (r.status === 401) throw new Error(EXPIRED);
      if (!r.ok) throw new Error(r.json.error || 'Could not reset. Try again.');
      const seed = seedList(list);
      setItems(seed); setBase(seed); setSaved(false); setOpen(null); setArmReset(false);
      setMsg({ type: 'ok', text: 'Back to the list written in the code files. The live site follows within a minute or two.' });
    } catch (e) {
      setMsg({ type: 'err', text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const status = msg.text || (dirty
    ? 'You have unsaved changes.'
    : saved ? 'This is the list you saved. The website shows it.' : 'This is the list from the code files. Change anything, then press Save.');

  return (
    <div className="ap-pane">
      <div className="ap-top">
        <span className="ap-count">{items.length} {items.length === 1 ? tab.one : `${tab.one}s`}, in the order shown on the website</span>
        <span className="ap-top-acts">
          <a className="ad-link" href={tab.page} target="_blank" rel="noopener noreferrer">{tab.pageLabel}</a>
          {dirty && <button type="button" className="s-btn s-btn-light" onClick={save} disabled={busy}>{busy ? 'Saving...' : 'Save changes'}</button>}
          <button type="button" className="s-btn s-btn-ghost ap-add" onClick={add} disabled={busy}>+ {tab.add}</button>
        </span>
      </div>

      {list === 'ambassadors' && (
        <p className="ad-row-hint ap-note">
          Present ambassadors are always shown above past ones. Inside each group, the order below is the order on the website.
        </p>
      )}

      {items.length === 0 && <p className="ad-empty">The list is empty. Add the first {tab.one} with the button above.</p>}

      <ol className="ap-list">
        {items.map((p, i) => {
          const isOpen = open === p.id;
          const nm = p.name || 'this person';
          return (
            <li key={p.id} className={`ap-row${isOpen ? ' is-open' : ''}`}>
              <div className="ap-main">
                <span className="ap-pos" aria-hidden="true">{i + 1}</span>
                <img className="ap-thumb" src={photoSrc(list, p)} alt="" width="48" height="56" />
                <div className="ap-sum">
                  <b>{p.name || 'New person (no name yet)'}</b>
                  <span>{[p.role, p.year].filter(Boolean).join(' · ') || 'No designation yet'}</span>
                  {list === 'ambassadors' && (
                    <span className="ap-chips">
                      <em className={p.status === 'past' ? 'is-past' : 'is-present'}>{p.status === 'past' ? 'Past' : 'Present'}</em>
                      {(p.programs || []).map((k) => <em key={k}>{PROGRAMS[k] ? PROGRAMS[k].org : k}</em>)}
                    </span>
                  )}
                </div>
                <div className="ap-acts">
                  <button type="button" id={`ap-up-${p.id}`} className="ap-btn" aria-label={`Move ${nm} up`} title="Move up"
                    disabled={busy || i === 0} onClick={() => moveTo(p.id, i - 1, 'up')}>↑</button>
                  <button type="button" id={`ap-down-${p.id}`} className="ap-btn" aria-label={`Move ${nm} down`} title="Move down"
                    disabled={busy || i === items.length - 1} onClick={() => moveTo(p.id, i + 1, 'down')}>↓</button>
                  <button type="button" className="ap-btn ap-btn-text" aria-expanded={isOpen} aria-controls={`ap-ed-${p.id}`}
                    onClick={() => setOpen(isOpen ? null : p.id)}>{isOpen ? 'Done' : 'Edit'}<span className="ap-sr"> {nm}</span></button>
                  <button type="button" className={`ap-btn ap-btn-text is-danger${armed === p.id ? ' is-armed' : ''}`} disabled={busy}
                    onClick={() => remove(p)} onBlur={() => setArmed((a) => (a === p.id ? null : a))}>
                    {armed === p.id ? 'Click again' : 'Delete'}<span className="ap-sr"> {nm}</span>
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="ap-edit" id={`ap-ed-${p.id}`}>
                  <div className="ap-fields">
                    <label className="ad-field"><span>Name</span>
                      <input type="text" value={p.name} maxLength={60} autoFocus={!p.name} placeholder="Full name"
                        onChange={(e) => update(p.id, { name: e.target.value })} />
                    </label>
                    <label className="ad-field"><span>Designation</span>
                      <input type="text" value={p.role} maxLength={60} placeholder="e.g. Executive Member"
                        onChange={(e) => update(p.id, { role: e.target.value })} />
                    </label>
                    <label className="ad-field"><span>Year</span>
                      <input type="text" value={p.year} maxLength={30} placeholder="e.g. 3rd CSE"
                        onChange={(e) => update(p.id, { year: e.target.value })} />
                    </label>
                    <label className="ad-field"><span>Position on the website</span>
                      <select value={i + 1} onChange={(e) => moveTo(p.id, Number(e.target.value) - 1)}>
                        {items.map((_, n) => <option key={n} value={n + 1}>{n === 0 ? '1 (first)' : n === items.length - 1 ? `${n + 1} (last)` : n + 1}</option>)}
                      </select>
                    </label>
                  </div>

                  <div className="ap-photo">
                    <img src={photoSrc(list, p)} alt={`Photo of ${nm}`} width="72" height="84" />
                    <div className="ap-photo-ctl">
                      <div className="ap-photo-btns">
                        <label className="ap-btn ap-btn-text ap-file">
                          Choose photo
                          <input type="file" accept="image/*" className="ap-sr"
                            onChange={(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ''; onPhoto(p, f); }} />
                        </label>
                        {(p.photoData || p.photo) && (
                          <button type="button" className="ap-btn ap-btn-text" onClick={() => update(p.id, { photoData: undefined, photo: null })}>
                            Use the default photo
                          </button>
                        )}
                      </div>
                      <p className="ad-row-hint">
                        JPG, PNG or WebP from the gallery is fine; it is made small automatically. A portrait with the face near the top looks best.
                        {p.photoData ? ' New photo chosen: it is uploaded when you press Save changes.' : ''}
                      </p>
                    </div>
                  </div>

                  {list === 'team' ? (
                    <div className="ap-fields">
                      <label className="ad-field"><span>LinkedIn link (optional)</span>
                        <input type="url" value={p.linkedin || ''} maxLength={300} placeholder="https://www.linkedin.com/in/..."
                          onChange={(e) => update(p.id, { linkedin: e.target.value })} />
                      </label>
                      <label className="ad-field"><span>Instagram link (optional)</span>
                        <input type="url" value={p.instagram || ''} maxLength={300} placeholder="https://www.instagram.com/..."
                          onChange={(e) => update(p.id, { instagram: e.target.value })} />
                      </label>
                    </div>
                  ) : (
                    <>
                      <div className="ap-fields">
                        <label className="ad-field"><span>Status</span>
                          <select value={p.status} onChange={(e) => update(p.id, { status: e.target.value })}>
                            <option value="present">Present ambassador</option>
                            <option value="past">Past ambassador</option>
                          </select>
                        </label>
                        {p.status === 'past' && (
                          <label className="ad-field"><span>Period (optional)</span>
                            <input type="text" value={p.years || ''} maxLength={20} placeholder="e.g. 2024-25"
                              onChange={(e) => update(p.id, { years: e.target.value })} />
                          </label>
                        )}
                      </div>
                      <fieldset className="ap-programs">
                        <legend>Ambassador programs</legend>
                        <div className="ap-checks">
                          {Object.entries(PROGRAMS).map(([k, pr]) => {
                            const on = (p.programs || []).includes(k);
                            return (
                              <label key={k} className={`ap-check${on ? ' is-on' : ''}`}>
                                <input type="checkbox" checked={on}
                                  onChange={() => update(p.id, { programs: on ? p.programs.filter((x) => x !== k) : [...(p.programs || []), k] })} />
                                <span>{pr.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="ad-savebar ap-savebar">
        <button type="button" className="s-btn s-btn-light" onClick={save} disabled={!dirty || busy}>
          {busy ? 'Saving...' : 'Save changes'}
        </button>
        <button type="button" className="s-btn s-btn-ghost" onClick={discard} disabled={!dirty || busy}>Discard</button>
        <button type="button" className="ad-link" onClick={reset} onBlur={() => setArmReset(false)} disabled={busy || !saved}>
          {armReset ? 'Click again to go back to the code list' : 'Go back to the list in the code'}
        </button>
        <span className="ad-savemsg" role="status" data-type={msg.type}>{status}</span>
      </div>
    </div>
  );
}
