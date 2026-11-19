// "Upcoming event" tab: everything about the next event in one place.
//   1 Which event       type (hackathon / workshop / online), name, register link, date, on or off
//   2 Details           the boxes of the chosen type (the template), opened by "Try to decrypt" on the card
//   3 Banner            the poster(s) of the event (up to 4)
//   4 Description       "what to expect" points
//   5 Popup             design number, delay, small logo, own words
// Each section is a bar you can open and close; closed, it shows one line of what is set. "Which event" and "Details" start
// open, the others closed, and the choice is remembered for this visit (sessionStorage), also when you go to another tab and back.
// Nothing here goes live until "Save changes" (the yellow bar). Pictures are uploaded when you choose them, and
// they only show on the site once the settings are saved.
import { useRef, useState } from 'react';
import * as C from '../../site/upcomingConfig';
import { DESIGNS } from '../../site/designs';
import { mediaUrl } from '../../site/eventLive';
import { Msg, Toggle, api, errorText, stampWords } from './kit';
import './AdminUpcoming.css';

export const TYPES = [
  ['hackathon', 'Hackathon', 'Rounds, teams and prizes. Shows the whole Vibe-A-Thon page (problem statements, rules, prize pool, schedule).'],
  ['workshop', 'Workshop', 'A session with a speaker and limited seats. Shows the card, the banner and the points.'],
  ['online', 'Online event', 'A webinar or contest with a joining link. Shows the card, the banner and the points.'],
];
const TEMPLATE = {
  hackathon: ['Format', 'Rounds', 'Team size', 'Theme', 'Prizes'],
  workshop: ['Topic', 'Speaker', 'Duration', 'Venue', 'Seats', 'Registration'],
  online: ['Platform', 'Host', 'Duration', 'Join link', 'Certificate', 'Registration'],
};
const FILE_TYPE = TYPES.some(([id]) => id === C.EVENT_TYPE) ? C.EVENT_TYPE : 'hackathon';
const keysFor = (t) => { const k = Object.keys((C.DETAILS && C.DETAILS[t]) || {}); return k.length ? k : TEMPLATE[t]; };
const fileDetails = (t) => Object.fromEntries(keysFor(t).map((k) => [k, String((C.DETAILS && C.DETAILS[t] && C.DETAILS[t][k]) || '')]));

/* the words of one type's boxes, as shown now: the saved ones, else the older Events-tab boxes, else the code file */
export function detailsOf(view, overrides, t) {
  const per = view.eventDetails && typeof view.eventDetails === 'object' ? view.eventDetails : {};
  const base = fileDetails(t);
  if (per[t]) return { ...base, ...per[t] };
  if (!Object.keys(per).length && t === FILE_TYPE && 'details' in overrides && view.details && typeof view.details === 'object') return { ...base, ...view.details };
  return base;
}

/* before saving: a type whose boxes are the same as the code file is not stored */
export function pruneDetails(per) {
  const out = {};
  for (const [t, d] of Object.entries(per || {})) {
    const base = fileDetails(t);
    if (!d || Object.keys(base).every((k) => String(d[k] || '') === base[k])) continue;
    out[t] = d;
  }
  return out;
}

const SLOTS = ['e-b1', 'e-b2', 'e-b3', 'e-b4'];
const BANNER = { sides: [1400, 1200, 1000, 800, 640], types: ['image/webp', 'image/jpeg'], quality: 0.84, max: 400 * 1024, fill: '#0d1016' };
const LOGO = { sides: [360, 280, 200], types: ['image/webp', 'image/png'], quality: 0.9, max: 110 * 1024, fill: null };

/* A photo from a phone can be 5 MB. This makes it small in the browser before it is uploaded. */
async function shrink(file, o) {
  if (!/^image\//.test(file.type)) throw new Error('Please choose an image file (JPG, PNG or WebP).');
  if (file.size > 25 * 1024 * 1024) throw new Error('That image is larger than 25 MB. Choose a smaller one.');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('This image could not be read. Try a JPG or PNG.'));
      el.src = url;
    });
    if (!img.naturalWidth || !img.naturalHeight) throw new Error('This image could not be read. Try a JPG or PNG.');
    for (const side of o.sides) {
      const k = Math.min(1, side / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.naturalWidth * k));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * k));
      const ctx = canvas.getContext('2d');
      if (o.fill) { ctx.fillStyle = o.fill; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      for (const type of o.types) {
        const out = canvas.toDataURL(type, o.quality);
        if (out.startsWith(`data:${type}`) && out.length * 0.75 < o.max) return out;
      }
    }
    throw new Error('Could not make this image small enough. Try a smaller picture.');
  } finally {
    URL.revokeObjectURL(url);
  }
}

const themeName = (n) => { const d = DESIGNS[n - 1]; return d ? d[0] : ''; };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const PANELS = ['which', 'details', 'banner', 'points', 'popup'];
const OPEN_KEY = 'scc-au-open-v1';
const readOpen = () => {
  try { const v = JSON.parse(sessionStorage.getItem(OPEN_KEY)); if (Array.isArray(v)) return v.filter((x) => PANELS.includes(x)); } catch { /* private mode: use the start state */ }
  return ['which', 'details'];
};

/* one section: a bar (title, "edited" mark, one line of what is set, arrow) that opens and closes the body */
function Panel({ id, title, badge, summary, sub, open, onToggle, children }) {
  return (
    <section className={`ad-panel au-panel ${open ? 'is-open' : ''}`} aria-labelledby={`au-h-${id}`}>
      <h2 id={`au-h-${id}`} className="au-h">
        <button type="button" className="au-head" aria-expanded={open} aria-controls={`au-b-${id}`} onClick={onToggle}>
          <span className="au-head-text">
            <span className="au-head-title">{title}{badge ? <em className="ac-edited">{badge}</em> : null}</span>
            {summary && <small className="au-sum">{summary}</small>}
          </span>
          <span className="ac-fold-chev" aria-hidden="true" />
        </button>
      </h2>
      {open && (
        <div id={`au-b-${id}`} className="au-body">
          {sub && <p className="ad-sub">{sub}</p>}
          {children}
        </div>
      )}
    </section>
  );
}

function SwitchLine({ id, label, hint, on, off, checked, onChange }) {
  return (
    <div className="ad-row">
      <div className="ad-row-text">
        <span id={`lbl-${id}`} className="ad-row-label">{label}</span>
        {hint && <span className="ad-row-hint">{hint}</span>}
      </div>
      <div className="ad-row-ctl">
        <span className={`ad-state ${checked ? 'is-on' : ''}`}>{checked ? on : off}</span>
        <Toggle id={`sw-${id}`} labelledBy={`lbl-${id}`} checked={checked} onChange={onChange} />
      </div>
    </div>
  );
}

export default function AdminUpcoming({ view, edit, overrides, changed }) {
  const mark = (keys) => (keys.some((k) => changed.includes(k)) ? 'unsaved changes' : keys.some((k) => k in overrides) ? 'edited here' : '');
  const type = TYPES.some(([id]) => id === view.eventType) ? view.eventType : FILE_TYPE;
  const box = detailsOf(view, overrides, type);
  const setBox = (k, v) => edit('eventDetails', { ...(view.eventDetails || {}), [type]: { ...box, [k]: v } });
  const backToFile = () => { const next = { ...(view.eventDetails || {}) }; delete next[type]; edit('eventDetails', next); };

  const banners = Array.isArray(view.eventBanners) ? view.eventBanners : [];
  const points = Array.isArray(view.eventPoints) ? view.eventPoints : [];
  const logo = view.popupLogo && view.popupLogo.v ? view.popupLogo : null;
  const theme = Number.isInteger(view.popupTheme) ? view.popupTheme : Math.round(Number(view.popupTheme)) || 0;

  const [open, setOpen] = useState(readOpen);
  const setOpenSaved = (next) => { setOpen(next); try { sessionStorage.setItem(OPEN_KEY, JSON.stringify(next)); } catch { /* not remembered */ } };
  const toggle = (id) => setOpenSaved(open.includes(id) ? open.filter((x) => x !== id) : [...open, id]);
  const panel = (id) => ({ id, open: open.includes(id), onToggle: () => toggle(id) });

  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '', at: '' });
  const fileRef = useRef(null);
  const target = useRef('');   // which picture the open file chooser is for: 'new', a banner slot, or 'logo'

  const choose = (what) => { target.current = what; setMsg({ type: '', text: '', at: '' }); if (fileRef.current) { fileRef.current.value = ''; fileRef.current.click(); } };
  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    const what = target.current;
    if (!file || !what) return;
    const id = what === 'logo' ? 'e-logo' : what === 'new' ? SLOTS.find((s) => !banners.some((b) => b.id === s)) : what;
    const at = id === 'e-logo' ? 'logo' : 'banner';
    if (!id) { setMsg({ type: 'err', text: 'There are already 4 banners. Remove one first.', at: 'banner' }); return; }
    setBusy(id);
    try {
      const data = await shrink(file, id === 'e-logo' ? LOGO : BANNER);
      const r = await api('/api/admin/people', { action: 'photo', id, data });
      if (!r.ok || !r.json.photo) { setMsg({ type: 'err', text: errorText(r, 'The picture could not be uploaded.'), at }); return; }
      if (id === 'e-logo') edit('popupLogo', { v: r.json.photo });
      else if (banners.some((b) => b.id === id)) edit('eventBanners', banners.map((b) => (b.id === id ? { id, v: r.json.photo } : b)));
      else edit('eventBanners', [...banners, { id, v: r.json.photo }]);
      setMsg({ type: 'ok', text: 'Picture uploaded. It goes live when you press Save changes.', at });
    } catch (err) {
      setMsg({ type: 'err', text: err && err.message ? err.message : 'The picture could not be used.', at });
    } finally {
      setBusy('');
    }
  };
  const moveBanner = (i, d) => { const j = i + d; if (j < 0 || j >= banners.length) return; const n = [...banners]; [n[i], n[j]] = [n[j], n[i]]; edit('eventBanners', n); };

  const setPoint = (i, patch) => edit('eventPoints', points.map((p, k) => (k === i ? { ...p, ...patch } : p)));
  const movePoint = (i, d) => { const j = i + d; if (j < 0 || j >= points.length) return; const n = [...points]; [n[i], n[j]] = [n[j], n[i]]; edit('eventPoints', n); };

  const delayShown = view.popupDelay === '' || view.popupDelay === undefined || view.popupDelay === null ? '' : view.popupDelay;
  const pickTheme = (n) => edit('popupTheme', n);

  /* the one line each closed bar shows */
  const typeLabel = TYPES.find(([id]) => id === type)[1];
  const boxKeys = keysFor(type);
  const filled = boxKeys.filter((k) => String(box[k] || '').trim()).length;
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const themeWords = theme === 0 ? 'automatic design' : theme >= 1 && theme <= DESIGNS.length ? `design ${theme} (${cap(themeName(theme))})` : 'check the design number';
  const summary = {
    which: [typeLabel, view.eventName ? view.eventName : 'no name yet', view.eventStart ? `starts ${stampWords(view.eventStart)}` : 'no start date', view.upcomingShow ? 'live' : 'switched off'].join(' \u00b7 '),
    details: `${filled} of ${boxKeys.length} boxes filled`,
    banner: banners.length ? plural(banners.length, 'picture') : 'none here: the pictures in the code folder are used, if any',
    points: points.length ? plural(points.length, 'point') : 'none: the block is not shown',
    popup: [themeWords, delayShown === '' ? 'usual delay' : `after ${delayShown} s`, logo ? 'logo set' : 'no logo', view.popupDesc ? 'own words' : '', view.vibePopup ? '' : 'popup is off'].filter(Boolean).join(' \u00b7 '),
  };

  return (
    <div className="ac-tab au">
      <input ref={fileRef} type="file" accept="image/*" className="au-file" tabIndex={-1} aria-hidden="true" onChange={onFile} />

      <div className="au-bar">
        <span>{open.length} of {PANELS.length} sections open</span>
        <button type="button" className="ad-link" onClick={() => setOpenSaved([...PANELS])} disabled={open.length === PANELS.length}>Open all</button>
        <button type="button" className="ad-link" onClick={() => setOpenSaved([])} disabled={open.length === 0}>Close all</button>
      </div>

      <Panel {...panel('which')} summary={summary.which} title="Which event is next?" badge={mark(['eventType', 'eventName', 'eventLink', 'eventStart', 'hideAfter', 'upcomingShow', 'vibePopup'])} sub="Choose the kind of event, give it a name and a date. The Upcoming page, the menu button and the popup all follow this.">
        <div className="au-types" role="radiogroup" aria-label="Kind of event">
          {TYPES.map(([id, label, text]) => (
            <button key={id} type="button" role="radio" aria-checked={type === id} className={`au-type ${type === id ? 'is-on' : ''}`} onClick={() => edit('eventType', id)}>
              <b>{label}</b>
              <small>{text}</small>
            </button>
          ))}
        </div>

        <div className="ad-fields au-gap">
          <div className="ad-field ad-field-wide">
            <label htmlFor="au-name">Event name <span className="ac-count">{String(view.eventName || '').length}/60</span></label>
            <input id="au-name" type="text" maxLength={60} autoComplete="off" placeholder="Vibe-A-Thon" value={view.eventName || ''} onChange={(e) => edit('eventName', e.target.value)} />
            <span className="ad-field-hint">Empty: the card says "Name will be announced soon" and the popup stays a mystery.</span>
          </div>
          <div className="ad-field ad-field-wide">
            <label htmlFor="au-link">Register button link</label>
            <input id="au-link" type="text" inputMode="url" autoComplete="off" spellCheck="false" placeholder="https://forms.gle/... or /register" value={view.eventLink || ''} onChange={(e) => edit('eventLink', e.target.value)} />
            <span className="ad-field-hint">Where "Register Now" goes: a form link (https://...) or a page of this site. Empty: the site's own Register page, which is the Vibe-A-Thon form.</span>
          </div>
          <div className="ad-field">
            <label htmlFor="au-start">Event starts (Indian time)</label>
            <input id="au-start" type="datetime-local" value={view.eventStart || ''} onChange={(e) => edit('eventStart', e.target.value)} />
            <span className="ad-field-hint">{view.eventStart ? `The card counts down to ${stampWords(view.eventStart)}.` : 'Empty: the timer shows dashes until you set it.'}{type === 'hackathon' ? ' The two-round look (design 21) counts down to the end of the current round instead: set those dates in the Events tab.' : ''}</span>
          </div>
          <div className="ad-field">
            <label htmlFor="au-hide">Hide the card and popup after</label>
            <input id="au-hide" type="datetime-local" value={view.hideAfter || ''} onChange={(e) => edit('hideAfter', e.target.value)} />
            <span className="ad-field-hint">Empty: they go away by themselves 2 days after the event start (or after the last round).</span>
          </div>
        </div>

        <SwitchLine id="upcomingShow" label="Upcoming card, menu number and popup" hint="Off: the Upcoming page shows the quiet 'coming soon' panel and no popup comes." on="Live" off="Off" checked={!!view.upcomingShow} onChange={(v) => edit('upcomingShow', v)} />
        <SwitchLine id="vibePopup" label="Popup for this event" hint="Only one popup shows per visit. While the Code Clash popup is on, that one wins." on="On" off="Off" checked={!!view.vibePopup} onChange={(v) => edit('vibePopup', v)} />
      </Panel>

      <Panel {...panel('details')} summary={summary.details} title={`Details of the ${TYPES.find(([id]) => id === type)[1].toLowerCase()}`} badge={mark(['eventDetails', 'details'])} sub="The boxes a visitor unlocks with Try to decrypt on the card. Each kind of event keeps its own words, so you can switch type and come back.">
        <div className="ad-fields">
          {keysFor(type).map((k) => (
            <div className="ad-field" key={`${type}-${k}`}>
              <label htmlFor={`au-d-${type}-${k}`}>{k} <span className="ac-count">{(box[k] || '').length}/80</span></label>
              <input id={`au-d-${type}-${k}`} type="text" maxLength={80} autoComplete="off" value={box[k] || ''} onChange={(e) => setBox(k, e.target.value)} />
            </div>
          ))}
        </div>
        <p className="ad-row-hint ad-hint-block">A box you leave empty stays "Will be revealed soon". As soon as one box has words, the card and the popup tell visitors that new details are unlocked.</p>
        <div className="ac-row-tools">
          <button type="button" className="ad-link" onClick={backToFile}>Put back the words from the code file</button>
        </div>
      </Panel>

      <Panel {...panel('banner')} summary={summary.banner} title="Banner" badge={mark(['eventBanners'])} sub="The poster of the event, on the Upcoming card and in the popup. It appears with a short reveal animation. Up to 4 pictures: with more than one they slide by themselves.">
        {banners.length === 0 ? (
          <p className="ad-empty au-empty">No banner uploaded here. The site uses the pictures that are in the code folder (src/assets/upcoming), if any.</p>
        ) : (
          <ol className="au-banners">
            {banners.map((b, i) => (
              <li key={b.id} className="au-banner">
                <img src={mediaUrl(b.id, b.v)} alt={`Banner ${i + 1}`} loading="lazy" decoding="async" />
                <div className="au-banner-acts">
                  <span className="au-banner-n">Banner {i + 1}</span>
                  <button type="button" className="ad-chip" onClick={() => moveBanner(i, -1)} disabled={i === 0 || !!busy} aria-label={`Move banner ${i + 1} earlier`}>Earlier</button>
                  <button type="button" className="ad-chip" onClick={() => moveBanner(i, 1)} disabled={i === banners.length - 1 || !!busy} aria-label={`Move banner ${i + 1} later`}>Later</button>
                  <button type="button" className="ad-chip" onClick={() => choose(b.id)} disabled={!!busy}>{busy === b.id ? 'Uploading...' : 'Replace'}</button>
                  <button type="button" className="ad-chip ac-danger" onClick={() => edit('eventBanners', banners.filter((x) => x.id !== b.id))} disabled={!!busy} aria-label={`Remove banner ${i + 1}`}>Remove</button>
                </div>
              </li>
            ))}
          </ol>
        )}
        <div className="ac-row-tools">
          <button type="button" className="ad-chip" onClick={() => choose('new')} disabled={banners.length >= 4 || !!busy}>
            {busy && busy !== 'e-logo' && !banners.some((b) => b.id === busy) ? 'Uploading...' : banners.length >= 4 ? 'Add a banner (most 4)' : 'Add a banner'}
          </button>
        </div>
        <p className="ad-row-hint ad-hint-block">Any JPG, PNG or WebP. A big photo from the phone gallery is fine: it is made small here before it is uploaded. The whole picture is shown, nothing is cut.</p>
        {msg.text && msg.at === 'banner' && <Msg m={msg} />}
      </Panel>

      <Panel {...panel('points')} summary={summary.points} title="Description points" badge={mark(['eventPoints'])} sub="Short points under the Upcoming card, like the steps of the membership block: a bold line and, if you want, one more line below it. Empty list: the block is not shown.">
        {points.length > 0 && (
          <ol className="au-points">
            {points.map((p, i) => (
              <li key={i} className="au-point">
                <div className="au-point-head">
                  <span className="au-point-n">{i + 1}</span>
                  <span className="au-point-acts">
                    <button type="button" className="ad-chip" onClick={() => movePoint(i, -1)} disabled={i === 0} aria-label={`Move point ${i + 1} up`}>Up</button>
                    <button type="button" className="ad-chip" onClick={() => movePoint(i, 1)} disabled={i === points.length - 1} aria-label={`Move point ${i + 1} down`}>Down</button>
                    <button type="button" className="ad-chip ac-danger" onClick={() => edit('eventPoints', points.filter((_, k) => k !== i))} aria-label={`Remove point ${i + 1}`}>Remove</button>
                  </span>
                </div>
                <div className="ad-fields">
                  <div className="ad-field ad-field-wide">
                    <label htmlFor={`au-pt-${i}`}>Point <span className="ac-count">{(p.t || '').length}/60</span></label>
                    <input id={`au-pt-${i}`} type="text" maxLength={60} autoComplete="off" placeholder="Free for all engineering students" value={p.t || ''} onChange={(e) => setPoint(i, { t: e.target.value })} />
                  </div>
                  <div className="ad-field ad-field-wide">
                    <label htmlFor={`au-pd-${i}`}>More words (optional) <span className="ac-count">{(p.d || '').length}/160</span></label>
                    <input id={`au-pd-${i}`} type="text" maxLength={160} autoComplete="off" placeholder="Students from any branch and any year can join." value={p.d || ''} onChange={(e) => setPoint(i, { d: e.target.value })} />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
        <div className="ac-row-tools">
          <button type="button" className="ad-chip" onClick={() => edit('eventPoints', [...points, { t: '', d: '' }])} disabled={points.length >= 8}>Add a point {points.length >= 8 ? '(most 8)' : ''}</button>
        </div>
      </Panel>

      <Panel {...panel('popup')} summary={summary.popup} title="Popup" badge={mark(['popupTheme', 'popupDelay', 'popupLogo', 'popupDesc'])} sub="The window that comes up when someone opens the site. Its button always takes them to the Upcoming event page.">
        <h3 className="ad-h3">Design number</h3>
        <p className="ad-row-hint ad-hint-block">Write a number or tap one. The Upcoming card gets the matching look. 0 means automatic: the site moves to the next design after every finished event.</p>
        <div className="ad-fields">
          <div className="ad-field">
            <label htmlFor="au-theme">Design number (0 to {DESIGNS.length})</label>
            <input id="au-theme" type="number" inputMode="numeric" min={0} max={DESIGNS.length} step="1" value={view.popupTheme === '' || view.popupTheme === undefined || view.popupTheme === null ? '' : view.popupTheme} onChange={(e) => edit('popupTheme', e.target.value === '' ? '' : Number(e.target.value))} />
            <span className="ad-field-hint">{theme >= 1 && theme <= DESIGNS.length ? `Design ${theme}: ${cap(themeName(theme))}.` : theme === 0 ? 'Automatic.' : `Use a whole number from 0 to ${DESIGNS.length}.`}</span>
          </div>
        </div>
        <div className="au-themes" role="group" aria-label="Pick a design">
          <button type="button" className={`au-theme ${theme === 0 ? 'is-on' : ''}`} aria-pressed={theme === 0} onClick={() => pickTheme(0)}><b>0</b><span>Automatic</span></button>
          {DESIGNS.map((d, i) => (
            <button key={d[0]} type="button" className={`au-theme ${theme === i + 1 ? 'is-on' : ''}`} aria-pressed={theme === i + 1} onClick={() => pickTheme(i + 1)}><b>{i + 1}</b><span>{cap(d[0])}</span></button>
          ))}
        </div>
        {theme >= 1 && theme <= DESIGNS.length && (
          <p className="au-prev">
            Preview (shows what is saved, with this design):{' '}
            <a className="ad-link" href={`/?design=${theme}`} target="_blank" rel="noopener noreferrer">the popup</a>{' · '}
            <a className="ad-link" href={`/upcoming?design=${theme}`} target="_blank" rel="noopener noreferrer">the Upcoming card</a>
          </p>
        )}

        <h3 className="ad-h3">When it comes</h3>
        <div className="ad-fields">
          <div className="ad-field">
            <label htmlFor="au-delay">Seconds after opening the site</label>
            <input id="au-delay" type="number" inputMode="numeric" min={0} max={120} step="1" value={delayShown} onChange={(e) => edit('popupDelay', e.target.value === '' ? '' : Number(e.target.value))} />
            <span className="ad-field-hint">0 to 120. Counted from the end of the opening animation. The popup also waits for the visitor's first touch or scroll, so it never slows the page down while it loads.</span>
          </div>
        </div>

        <h3 className="ad-h3">Small logo</h3>
        <div className="au-logo">
          <span className="au-logo-box">{logo ? <img src={mediaUrl('e-logo', logo.v)} alt="Popup logo" /> : <small>No logo</small>}</span>
          <span className="au-logo-acts">
            <button type="button" className="ad-chip" onClick={() => choose('logo')} disabled={!!busy}>{busy === 'e-logo' ? 'Uploading...' : logo ? 'Replace logo' : 'Upload logo'}</button>
            {logo && <button type="button" className="ad-chip ac-danger" onClick={() => edit('popupLogo', null)} disabled={!!busy}>Remove</button>}
          </span>
        </div>
        <p className="ad-row-hint ad-hint-block">Shown small, above the title of the popup. A PNG or WebP with a see-through background looks best.</p>

        <h3 className="ad-h3">Own words (optional)</h3>
        <div className="ad-fields">
          <div className="ad-field ad-field-wide">
            <label htmlFor="au-desc">One line under the title <span className="ac-count">{String(view.popupDesc || '').length}/120</span></label>
            <input id="au-desc" type="text" maxLength={120} autoComplete="off" placeholder="Tap below to see all the details on the Upcoming events page." value={view.popupDesc || ''} onChange={(e) => edit('popupDesc', e.target.value)} />
            <span className="ad-field-hint">Empty: the usual words are used.</span>
          </div>
        </div>
        {msg.text && msg.at === 'logo' && <Msg m={msg} />}
      </Panel>

      <p className="ad-note ad-note-tight">Changes go live only after you press <b>Save changes</b> in the yellow bar at the top. The site picks them up within about a minute.</p>
    </div>
  );
}
