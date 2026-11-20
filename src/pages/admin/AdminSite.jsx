// Site content tab, part 2: pictures, links, numbers, words and the lists of the Home page.
// Nothing here goes live until "Save changes" (the yellow bar). Pictures are uploaded when you choose them and go live on Save.
import { useRef, useState } from 'react';
import * as D from '../../data/site';
import FitPoster from '../../site/FitPoster';
import { SITE_TEXT_DEFAULTS, picturesFrom } from '../../site/siteLive';
import { Msg, same } from './kit';
import { BIG, uploadPicture } from './media';
import { Panel, plural } from './Panel';
import RowList from './RowList';
import { ICONS, LINK_FIELDS, ROW_LIMITS, SITE_DEFAULTS, TEXT_FIELDS, newTrackId } from './siteKeys';

const AREAS = [['0', 'Top'], ['25', 'Upper part'], ['50', 'Middle'], ['75', 'Lower part'], ['100', 'Bottom']];

/* ---------- pictures ---------- */
function Pictures({ view, edit }) {
  const pics = view.sitePictures && typeof view.sitePictures === 'object' ? view.sitePictures : {};
  const P = picturesFrom(pics);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '', at: '' });
  const fileRef = useRef(null);
  const target = useRef('');
  const choose = (which) => { target.current = which; setMsg({ type: '', text: '', at: '' }); if (fileRef.current) { fileRef.current.value = ''; fileRef.current.click(); } };
  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    const which = target.current;
    if (!file || !which) return;
    setBusy(which);
    const r = await uploadPicture(file, which === 'membership' ? 's-membership' : 's-group', BIG);
    setBusy('');
    if (!r.ok) { setMsg({ type: 'err', text: r.error, at: which }); return; }
    const entry = which === 'group' ? { v: r.version, r: r.ratio, pos: pics.group && typeof pics.group.pos === 'number' ? pics.group.pos : 50 } : { v: r.version, r: r.ratio };
    edit('sitePictures', { ...pics, [which]: entry });
    setMsg({ type: 'ok', text: 'Picture uploaded. It goes live when you press Save changes.', at: which });
  };
  const back = (which) => { const n = { ...pics }; delete n[which]; edit('sitePictures', n); setMsg({ type: '', text: '', at: '' }); };
  const pos = P.group.pos;
  const objPos = `50% ${pos}%`;
  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" className="au-file" tabIndex={-1} aria-hidden="true" onChange={onFile} />

      <h3 className="ad-h3">Membership poster</h3>
      <p className="ad-row-hint ad-hint-block">The poster in the "Join Coders Community" block on the Home page. The frame takes the shape of the poster, so the whole poster is always visible: tall, wide or square. A poster put in the code folder (src/assets/posters/membership.webp) is shown in exactly the same way.</p>
      <div className="as-pic">
        <div className="as-pic-poster"><FitPoster src={P.membership.src} ratio={P.membership.ratio} alt="Membership poster as it shows on the site" /></div>
        <div className="as-pic-side">
          <span className="as-pic-state">{P.membership.admin ? 'Uploaded here' : 'The poster from the code folder'}</span>
          <div className="au-logo-acts">
            <button type="button" className="ad-chip" onClick={() => choose('membership')} disabled={!!busy}>{busy === 'membership' ? 'Uploading...' : P.membership.admin ? 'Replace the poster' : 'Upload a poster'}</button>
            {P.membership.admin && <button type="button" className="ad-chip" onClick={() => back('membership')} disabled={!!busy}>Use the code folder poster</button>}
          </div>
          {msg.text && msg.at === 'membership' && <Msg m={msg} />}
        </div>
      </div>

      <h3 className="ad-h3 au-gap">Founding crew photo</h3>
      <p className="ad-row-hint ad-hint-block">The wide banner on the Home page and at the top of the Team page. A banner is wider than a normal photo, so a part of the picture is cut off: choose which part stays. A wide photo (like 16:7) shows fully. Words sit on the left, so keep faces in the middle or on the right.</p>
      <div className="as-pic as-pic-wide">
        <div className="as-pic-frames">
          <figure className="as-frame as-frame-laptop"><img src={P.group.src} alt="Founding crew photo as it shows on a laptop" style={{ objectPosition: objPos }} /><figcaption>On a laptop</figcaption></figure>
          <figure className="as-frame as-frame-phone"><img src={P.group.src} alt="Founding crew photo as it shows on a phone" style={{ objectPosition: objPos }} /><figcaption>On a phone</figcaption></figure>
        </div>
        <div className="as-pic-side">
          <span className="as-pic-state">{P.group.admin ? 'Uploaded here' : 'The photo from the code folder'}</span>
          <div className="ad-field">
            <label htmlFor="as-group-pos">Part of the picture to keep</label>
            <select id="as-group-pos" value={String(pos)} onChange={(e) => edit('sitePictures', { ...pics, group: { ...(pics.group || {}), pos: Number(e.target.value) } })} disabled={!P.group.admin}>
              {AREAS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <span className="ad-field-hint">{P.group.admin ? 'Applies to the Home page and the Team page.' : 'Upload a photo first to choose the part.'}</span>
          </div>
          <div className="au-logo-acts">
            <button type="button" className="ad-chip" onClick={() => choose('group')} disabled={!!busy}>{busy === 'group' ? 'Uploading...' : P.group.admin ? 'Replace the photo' : 'Upload a photo'}</button>
            {P.group.admin && <button type="button" className="ad-chip" onClick={() => back('group')} disabled={!!busy}>Use the code folder photo</button>}
          </div>
          {msg.text && msg.at === 'group' && <Msg m={msg} />}
        </div>
      </div>
      <p className="ad-row-hint ad-hint-block">Any JPG, PNG or WebP. A big photo from the phone gallery is fine: it is made small here before it is uploaded.</p>
    </>
  );
}

/* ---------- links ---------- */
function Links({ view, edit }) {
  const links = view.siteLinks;
  return (
    <div className="ad-fields">
      {LINK_FIELDS.map(([k, label, ph]) => {
        const changed = String(links[k] || '').trim() !== D.LINKS[k];
        return (
          <div key={k} className="ad-field ad-field-wide">
            <label htmlFor={`as-ln-${k}`}>{label}</label>
            <input id={`as-ln-${k}`} type="text" inputMode={k === 'email' ? 'email' : 'url'} autoComplete="off" spellCheck="false" placeholder={ph} value={links[k] || ''} onChange={(e) => edit('siteLinks', { ...links, [k]: e.target.value })} />
            <span className="ad-field-hint">
              {changed ? <>Written in the code: {D.LINKS[k]} </> : 'Same as the code file. '}
              {changed && <button type="button" className="ad-link" onClick={() => edit('siteLinks', { ...links, [k]: D.LINKS[k] })}>Use the code value</button>}
              {!changed && k === 'membershipForm' && 'Also used by the buttons in the questions section.'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- the four numbers ---------- */
function Numbers({ view, edit }) {
  const stats = Array.isArray(view.siteStats) ? view.siteStats : [];
  const set = (i, patch) => edit('siteStats', stats.map((s, k) => (k === i ? { ...s, ...patch } : s)));
  return (
    <>
      <ol className="au-points as-stats">
        {stats.map((s, i) => (
          <li key={i} className="au-point">
            <div className="au-point-head"><span className="au-point-n">{i + 1}</span><span className="as-stat-prev">{String(s.value)}{s.suffix} {s.label}</span></div>
            <div className="ad-fields">
              <div className="ad-field">
                <label htmlFor={`as-st-v-${i}`}>Number</label>
                <input id={`as-st-v-${i}`} type="number" inputMode="numeric" min={0} max={999999} step="1" value={s.value === '' ? '' : s.value} onChange={(e) => set(i, { value: e.target.value === '' ? '' : Number(e.target.value) })} />
              </div>
              <div className="ad-field">
                <label htmlFor={`as-st-s-${i}`}>Sign after it</label>
                <select id={`as-st-s-${i}`} value={s.suffix || ''} onChange={(e) => set(i, { suffix: e.target.value })}>
                  {[['', 'None'], ['+', '+ (more than)'], ['k', 'k (thousand)'], ['%', '%']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="ad-field ad-field-wide">
                <label htmlFor={`as-st-l-${i}`}>What it counts <span className="ac-count">{(s.label || '').length}/24</span></label>
                <input id={`as-st-l-${i}`} type="text" maxLength={24} autoComplete="off" value={s.label || ''} onChange={(e) => set(i, { label: e.target.value })} />
              </div>
            </div>
          </li>
        ))}
      </ol>
      {!same(stats, SITE_DEFAULTS.siteStats) && <div className="ac-row-tools"><button type="button" className="ad-chip" onClick={() => edit('siteStats', SITE_DEFAULTS.siteStats)}>Use the numbers from the code</button></div>}
    </>
  );
}

/* ---------- headings and sentences ---------- */
function Words({ view, edit }) {
  const text = view.siteText;
  const groups = [...new Set(TEXT_FIELDS.map((f) => f[3]))];
  return (
    <>
      {groups.map((g) => (
        <div key={g} className="as-words">
          <h3 className="ad-h3">{g}</h3>
          <div className="ad-fields">
            {TEXT_FIELDS.filter((f) => f[3] === g).map(([k, label, max]) => {
              const val = text[k] ?? '';
              const changed = String(val).trim() !== SITE_TEXT_DEFAULTS[k];
              return (
                <div key={k} className="ad-field ad-field-wide">
                  <label htmlFor={`as-tx-${k}`}>{label} <span className="ac-count">{String(val).length}/{max}</span></label>
                  {max > 100
                    ? <textarea id={`as-tx-${k}`} rows={2} maxLength={max} value={val} onChange={(e) => edit('siteText', { ...text, [k]: e.target.value.replace(/\n/g, ' ') })} />
                    : <input id={`as-tx-${k}`} type="text" maxLength={max} autoComplete="off" value={val} onChange={(e) => edit('siteText', { ...text, [k]: e.target.value })} />}
                  {changed && <span className="ad-field-hint">Usual words: {SITE_TEXT_DEFAULTS[k]} <button type="button" className="ad-link" onClick={() => edit('siteText', { ...text, [k]: SITE_TEXT_DEFAULTS[k] })}>Use them again</button></span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

/* ---------- lists ---------- */
const setFaqLink = (it, p) => {
  const cur = it.link || {};
  const label = p.label !== undefined ? p.label : cur.label || '';
  const addr = p.addr !== undefined ? p.addr : (cur.to || cur.href || '');
  const { link, ...rest } = it;   // eslint-disable-line no-unused-vars
  if (!label && !addr) return rest;
  return { ...rest, link: addr.startsWith('/') ? { label, to: addr } : { label, href: addr } };
};
const FAQ_FIELDS = [
  { key: 'q', label: 'Question', max: 140, wide: true, placeholder: 'Is membership free?' },
  { key: 'a', label: 'Answer', max: 700, wide: true, kind: 'area' },
  { key: 'bl', label: 'Button words (optional)', max: 30, placeholder: 'Become a member', get: (it) => (it.link && it.link.label) || '', set: (it, v) => setFaqLink(it, { label: v }) },
  { key: 'ba', label: 'Button address (optional)', kind: 'link', placeholder: 'https://... or /connect', get: (it) => (it.link && (it.link.to || it.link.href)) || '', set: (it, v) => setFaqLink(it, { addr: v }) },
];
const WIN_FIELDS = [
  { key: 'kind', label: 'Kind', kind: 'select', options: [['Award', 'Award'], ['Project', 'Project']] },
  { key: 'year', label: 'Year', max: 10, placeholder: '2026' },
  { key: 'title', label: 'Title', max: 100, wide: true, placeholder: 'Winners: Some Hackathon 2026' },
  { key: 'who', label: 'Who', max: 80, wide: true, placeholder: 'Team name or member names' },
  { key: 'desc', label: 'Description', max: 220, wide: true, kind: 'area' },
  { key: 'link', label: 'Link (optional)', kind: 'link', wide: true, placeholder: 'https://github.com/...' },
];
const VOICE_FIELDS = [
  { key: 'quote', label: 'What they said', max: 300, wide: true, kind: 'area' },
  { key: 'name', label: 'Name', max: 60, placeholder: 'Full name' },
  { key: 'role', label: 'Role', max: 60, placeholder: '2nd year IT, member' },
];
const STEP_FIELDS = [
  { key: 'title', label: 'Step', max: 60, wide: true, placeholder: 'Fill the membership form' },
  { key: 'desc', label: 'More words', max: 160, wide: true },
];
const TRACK_FIELDS = [
  { key: 'icon', label: 'Icon', kind: 'select', options: ICONS.map((x) => [x, x]) },
  { key: 'color', label: 'Colour', kind: 'color' },
  { key: 'title', label: 'Name', max: 40, wide: true, placeholder: 'Web Development' },
  { key: 'desc', label: 'One line about it', max: 140, wide: true },
];
const TOOL_FIELDS = [{ key: null, label: 'Name', max: 40, wide: true, placeholder: 'GitHub' }];

export const SITE_PANELS = ['pictures', 'links', 'numbers', 'words', 'join', 'tracks', 'tools', 'wins', 'voices', 'faq'];

export function sitePanelSummaries(view) {
  const links = LINK_FIELDS.filter(([k]) => String(view.siteLinks[k] || '').trim() !== D.LINKS[k]).length;
  const words = TEXT_FIELDS.filter(([k]) => String(view.siteText[k] || '').trim() !== SITE_TEXT_DEFAULTS[k]).length;
  const pics = picturesFrom(view.sitePictures);
  const n = (k) => (Array.isArray(view[k]) ? view[k].length : 0);
  return {
    pictures: `membership poster: ${pics.membership.admin ? 'uploaded here' : 'from the code folder'} · founding crew photo: ${pics.group.admin ? 'uploaded here' : 'from the code folder'}`,
    links: links ? `${links} changed here` : 'as written in the code',
    numbers: (view.siteStats || []).map((s) => `${s.value}${s.suffix || ''} ${s.label}`).join(' · '),
    words: words ? `${plural(words, 'text')} changed here` : 'the usual words',
    join: plural(n('joinSteps'), 'step'),
    tracks: plural(n('tracks'), 'track'),
    tools: n('tools') ? plural(n('tools'), 'name') : 'none: the strip is not shown',
    wins: n('wins') ? plural(n('wins'), 'win') : 'none: the section is not shown',
    voices: n('voices') ? plural(n('voices'), 'quote') : 'none: the section is not shown',
    faq: n('faq') ? plural(n('faq'), 'question') : 'none: the section is not shown',
  };
}

export default function SitePanels({ view, edit, st, mark, sum }) {
  const list = (key, props) => (
    <RowList id={`as-${key}`} items={Array.isArray(view[key]) ? view[key] : []} onChange={(v) => edit(key, v)} min={ROW_LIMITS[key][0]} max={ROW_LIMITS[key][1]} {...props} />
  );
  const back = (key) => (!same(view[key], SITE_DEFAULTS[key]) ? <div className="ac-row-tools"><button type="button" className="ad-chip" onClick={() => edit(key, SITE_DEFAULTS[key])}>Use the list from the code</button></div> : null);
  return (
    <>
      <h2 className="as-group">Pictures, links and numbers</h2>
      <Panel {...st.panel('pictures')} title="Pictures" badge={mark(['sitePictures'])} summary={sum.pictures} sub="The two big pictures of the Home page. A picture uploaded here and a picture put in the code folder with git are shown the same way."><Pictures view={view} edit={edit} /></Panel>
      <Panel {...st.panel('links')} title="Links" badge={mark(['siteLinks'])} summary={sum.links} sub="The buttons and contact details on every page. Change one here and every button that uses it changes."><Links view={view} edit={edit} /></Panel>
      <Panel {...st.panel('numbers')} title="Numbers on the Home page" badge={mark(['siteStats'])} summary={sum.numbers} sub="The four number tiles (participants, events and so on)."><Numbers view={view} edit={edit} /></Panel>
      <Panel {...st.panel('words')} title="Headings and sentences" badge={mark(['siteText'])} summary={sum.words} sub="The words at the top of the Home page and above each section. Leave a box as it is to keep the usual words."><Words view={view} edit={edit} /></Panel>

      <h2 className="as-group">Home page sections</h2>
      <Panel {...st.panel('join')} title="Steps to join" badge={mark(['joinSteps'])} summary={sum.join} sub="The numbered steps next to the membership poster.">
        {list('joinSteps', { noun: 'step', fields: STEP_FIELDS, blank: () => ({ title: '', desc: '' }) })}{back('joinSteps')}
      </Panel>
      <Panel {...st.panel('tracks')} title="What we do (tracks)" badge={mark(['tracks'])} summary={sum.tracks} sub="The coloured cards of the What we do section.">
        {list('tracks', { noun: 'track', fields: TRACK_FIELDS, blank: () => ({ id: newTrackId(), icon: 'Code', color: '#4c8dff', title: '', desc: '' }) })}{back('tracks')}
      </Panel>
      <Panel {...st.panel('tools')} title="Tools and platforms" badge={mark(['tools'])} summary={sum.tools} sub="The names that scroll under the numbers. Only list tools that were really used. Empty: the strip is not shown.">
        {list('tools', { noun: 'name', plain: true, fields: TOOL_FIELDS, blank: () => '' })}{back('tools')}
      </Panel>
      <Panel {...st.panel('wins')} title="Wins and projects" badge={mark(['wins'])} summary={sum.wins} sub="Hackathon results and things members built. Empty: the section is not shown.">
        {list('wins', { noun: 'win', fields: WIN_FIELDS, blank: () => ({ kind: 'Award', title: '', who: '', year: '', desc: '', link: '' }), empty: 'Nothing here, so the section is not shown on the site.' })}
      </Panel>
      <Panel {...st.panel('voices')} title="Member voices" badge={mark(['voices'])} summary={sum.voices} sub="Quotes from members. Add real quotes only, with the person's permission. Empty: the section is not shown.">
        {list('voices', { noun: 'quote', fields: VOICE_FIELDS, blank: () => ({ quote: '', name: '', role: '' }), empty: 'Nothing here, so the section is not shown on the site.' })}
      </Panel>
      <Panel {...st.panel('faq')} title="Questions and answers" badge={mark(['faq'])} summary={sum.faq} sub="The questions that open and close on the Home page. Each can have a button under its answer. Empty: the section is not shown.">
        {list('faq', { noun: 'question', fields: FAQ_FIELDS, blank: () => ({ q: '', a: '' }) })}{back('faq')}
      </Panel>
    </>
  );
}
