// Site content tab, part 3: past events and their photos (the Home page tiles, the Events page and its timeline).
// Photos are made small in the browser and uploaded when you choose them; they go live when you press "Save changes" (the yellow bar).
import { useEffect, useRef, useState } from 'react';
import * as D from '../../data/site';
import { mediaUrl } from '../../site/eventLive';
import { MONTHS, Msg, same } from './kit';
import { GALLERY, uploadPicture } from './media';
import { newPastId, SITE_DEFAULTS, seedPast } from './siteKeys';

const MAX_PHOTOS = 8;
const KINDS = ['Workshop', 'Hackathon', 'Seminar', 'Online Contest', 'Online Workshop', 'Treasure Hunt', 'Talk', 'Meetup'];
const autoText = (iso) => {
  const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(iso || '');
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1].toUpperCase()} ${m[1]}` : '';
};
const slotOf = (id) => Number(String(id).split('-').pop());

export function pastSummary(view) {
  const list = Array.isArray(view.pastEvents) ? view.pastEvents : [];
  const withPhotos = list.filter((e) => (e.images || []).length).length;
  const waiting = list.length - withPhotos;
  return `${list.length} event${list.length === 1 ? '' : 's'}, ${withPhotos} with photos${waiting ? `, ${waiting} without (shown as "coming soon" in the timeline)` : ''}`;
}

export default function PastEditor({ view, edit, overrides }) {
  const list = Array.isArray(view.pastEvents) ? view.pastEvents : [];
  const savedList = Array.isArray(overrides.pastEvents) ? overrides.pastEvents : [];
  const latest = useRef(list);
  useEffect(() => { latest.current = list; });
  const [openId, setOpenId] = useState('');
  const [confirmDel, setConfirmDel] = useState('');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '', at: '' });
  const fileRef = useRef(null);
  const target = useRef('');

  const sorted = [...list].sort((a, b) => String(b.sortDate || '9999-99-99').localeCompare(String(a.sortDate || '9999-99-99')) || String(a.title).localeCompare(String(b.title)));   // an event with no date yet (a new one) is first
  const set = (id, patch) => edit('pastEvents', list.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const codeOf = (e) => (e.key ? D.pastEvents.find((c) => c.id === e.key) : null);
  const urlOf = (e, im) => (im.c !== undefined ? ((codeOf(e) || { images: [] }).images[im.c] || '') : mediaUrl(im.id, im.v));

  const addEvent = () => {
    const id = newPastId();
    edit('pastEvents', [...list, { id, key: null, title: '', category: 'Workshop', date: '', sortDate: '', description: '', images: [] }]);
    setOpenId(id); setConfirmDel('');
  };
  const removeEvent = (id) => {
    if (confirmDel !== id) { setConfirmDel(id); return; }
    edit('pastEvents', list.filter((e) => e.id !== id));
    setConfirmDel(''); if (openId === id) setOpenId('');
  };
  const setDate = (e, iso) => set(e.id, { sortDate: iso, date: !e.date || e.date === autoText(e.sortDate) ? autoText(iso) : e.date });
  const movePhoto = (e, i, d) => { const j = i + d; if (j < 0 || j >= e.images.length) return; const n = [...e.images]; [n[i], n[j]] = [n[j], n[i]]; set(e.id, { images: n }); };

  const choose = (id) => { target.current = id; setMsg({ type: '', text: '', at: '' }); if (fileRef.current) { fileRef.current.value = ''; fileRef.current.click(); } };
  const onFiles = async (ev) => {
    const files = Array.from((ev.target.files) || []);
    const id = target.current;
    const first = latest.current.find((x) => x.id === id);
    if (!files.length || !first) return;
    // a slot that the live site (or this draft) uses right now is not overwritten
    const savedUsed = new Set(((savedList.find((x) => x.id === id) || {}).images || []).filter((i) => i.id).map((i) => slotOf(i.id)));
    const used = new Set(first.images.filter((i) => i.id).map((i) => slotOf(i.id)));
    const room = MAX_PHOTOS - first.images.length;
    if (room <= 0) { setMsg({ type: 'err', text: `An event can have ${MAX_PHOTOS} photos. Remove one first.`, at: id }); return; }
    setBusy(id);
    const added = [];
    let failed = '';
    for (const file of files.slice(0, room)) {
      let slot = 0;
      for (let n = 1; n <= MAX_PHOTOS && !slot; n += 1) if (!used.has(n) && !savedUsed.has(n)) slot = n;
      for (let n = 1; n <= MAX_PHOTOS && !slot; n += 1) if (!used.has(n)) slot = n;
      if (!slot) break;
      const r = await uploadPicture(file, `g-${id}-${slot}`, GALLERY);
      if (!r.ok) { failed = r.error; break; }
      used.add(slot);
      added.push({ id: `g-${id}-${slot}`, v: r.version });
    }
    setBusy('');
    if (added.length) edit('pastEvents', latest.current.map((x) => (x.id === id ? { ...x, images: [...x.images, ...added] } : x)));
    const skipped = files.length > room ? ` ${files.length - room} more were not added (most ${MAX_PHOTOS} photos).` : '';
    setMsg(failed
      ? { type: 'err', text: `${added.length ? `${added.length} uploaded. ` : ''}${failed}`, at: id }
      : { type: 'ok', text: `${added.length} photo${added.length === 1 ? '' : 's'} uploaded. They go live when you press Save changes.${skipped}`, at: id });
  };

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" multiple className="au-file" tabIndex={-1} aria-hidden="true" onChange={onFiles} />
      <p className="ad-row-hint ad-hint-block">These events fill the tiles on the Home page, the Events page and its timeline. An event shows its photos only when it has at least one photo; until then it appears as a "coming soon" line in the timeline. On the tiles a photo is cut to fill its square; tapping an event shows every photo whole.</p>
      {list.length === 0 && <p className="ad-empty au-empty">No past events. Add one below.</p>}
      <ul className="as-evs">
        {sorted.map((e) => {
          const open = openId === e.id;
          return (
            <li key={e.id} className={`as-ev ${open ? 'is-open' : ''}`}>
              <button type="button" className="as-ev-head" aria-expanded={open} aria-controls={`as-ev-${e.id}`} onClick={() => setOpenId(open ? '' : e.id)}>
                <span className="as-ev-text">
                  <b>{e.title || 'New event (no title yet)'}</b>
                  <small>{[e.date || 'no date', e.category, `${e.images.length} photo${e.images.length === 1 ? '' : 's'}`].filter(Boolean).join(' · ')}</small>
                </span>
                <span className="ac-fold-chev" aria-hidden="true" />
              </button>
              {open && (
                <div id={`as-ev-${e.id}`} className="as-ev-body">
                  <div className="ad-fields">
                    <div className="ad-field ad-field-wide">
                      <label htmlFor={`as-e-t-${e.id}`}>Title <span className="ac-count">{e.title.length}/90</span></label>
                      <input id={`as-e-t-${e.id}`} type="text" maxLength={90} autoComplete="off" value={e.title} onChange={(x) => set(e.id, { title: x.target.value })} />
                    </div>
                    <div className="ad-field">
                      <label htmlFor={`as-e-k-${e.id}`}>Kind of event <span className="ac-count">{e.category.length}/30</span></label>
                      <input id={`as-e-k-${e.id}`} type="text" list="as-kinds" maxLength={30} autoComplete="off" value={e.category} onChange={(x) => set(e.id, { category: x.target.value })} />
                    </div>
                    <div className="ad-field">
                      <label htmlFor={`as-e-d-${e.id}`}>Date</label>
                      <input id={`as-e-d-${e.id}`} type="date" value={e.sortDate || ''} onChange={(x) => setDate(e, x.target.value)} />
                      <span className="ad-field-hint">Newest events show first.</span>
                    </div>
                    <div className="ad-field">
                      <label htmlFor={`as-e-x-${e.id}`}>Date as shown <span className="ac-count">{e.date.length}/30</span></label>
                      <input id={`as-e-x-${e.id}`} type="text" maxLength={30} autoComplete="off" placeholder="26 JUL 2026" value={e.date} onChange={(x) => set(e.id, { date: x.target.value })} />
                      <span className="ad-field-hint">Filled in from the date. You can write something else, like 26-27 DEC 2026.</span>
                    </div>
                    <div className="ad-field ad-field-wide">
                      <label htmlFor={`as-e-s-${e.id}`}>What happened <span className="ac-count">{e.description.length}/320</span></label>
                      <textarea id={`as-e-s-${e.id}`} rows={3} maxLength={320} value={e.description} onChange={(x) => set(e.id, { description: x.target.value.replace(/\n/g, ' ') })} />
                    </div>
                  </div>

                  <h3 className="ad-h3">Photos ({e.images.length} of {MAX_PHOTOS})</h3>
                  {e.images.length === 0 ? <p className="ad-empty au-empty">No photos yet.</p> : (
                    <ol className="au-banners as-photos">
                      {e.images.map((im, i) => (
                        <li key={im.id || `c${im.c}`} className="au-banner">
                          <img src={urlOf(e, im)} alt={`Photo ${i + 1} of ${e.title || 'the event'}`} loading="lazy" decoding="async" />
                          <div className="au-banner-acts">
                            <span className="au-banner-n">Photo {i + 1}{i === 0 ? ' (the cover)' : ''}</span>
                            <button type="button" className="ad-chip" onClick={() => movePhoto(e, i, -1)} disabled={i === 0 || !!busy} aria-label={`Move photo ${i + 1} earlier`}>Earlier</button>
                            <button type="button" className="ad-chip" onClick={() => movePhoto(e, i, 1)} disabled={i === e.images.length - 1 || !!busy} aria-label={`Move photo ${i + 1} later`}>Later</button>
                            <button type="button" className="ad-chip ac-danger" onClick={() => set(e.id, { images: e.images.filter((_, k) => k !== i) })} disabled={!!busy} aria-label={`Remove photo ${i + 1}`}>Remove</button>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                  <div className="ac-row-tools">
                    <button type="button" className="ad-chip" onClick={() => choose(e.id)} disabled={e.images.length >= MAX_PHOTOS || !!busy}>
                      {busy === e.id ? 'Uploading...' : e.images.length >= MAX_PHOTOS ? `Add photos (most ${MAX_PHOTOS})` : 'Add photos'}
                    </button>
                    <button type="button" className={`ad-chip ac-danger ${confirmDel === e.id ? 'is-sure' : ''}`} onClick={() => removeEvent(e.id)} disabled={!!busy}>
                      {confirmDel === e.id ? 'Sure? Remove this event' : 'Remove this event'}
                    </button>
                  </div>
                  {msg.text && msg.at === e.id && <Msg m={msg} />}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <datalist id="as-kinds">{KINDS.map((k) => <option key={k} value={k} />)}</datalist>
      <div className="ac-row-tools">
        <button type="button" className="ad-chip" onClick={addEvent} disabled={list.length >= 40 || !!busy}>{list.length >= 40 ? 'Add an event (most 40)' : 'Add an event'}</button>
        {!same(view.pastEvents, SITE_DEFAULTS.pastEvents) && <button type="button" className="ad-chip" onClick={() => { edit('pastEvents', seedPast()); setOpenId(''); setConfirmDel(''); }} disabled={!!busy}>Use the list from the code</button>}
      </div>
      <p className="ad-row-hint ad-hint-block">Once you save a change here, this list is the master list: new events are added here, not in src/data/site.js. "Use the list from the code" and Save brings the code list back.</p>
    </>
  );
}
