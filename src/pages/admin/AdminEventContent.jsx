// Events tab, "page content" part: the Timeline rows of the Vibe-A-Thon page and the detail boxes of the Upcoming card.
import { Fold } from './kit';

export const PS_ROW = 'Problem Statements Released';   // this row follows the PDF release time while that is changed in the dashboard
const ICONS = ['Calendar', 'CalendarPlus', 'ClipboardList', 'Terminal', 'Send', 'Check', 'CreditCard', 'Zap', 'Trophy', 'Users', 'Bell', 'Code', 'Sparkles', 'Globe', 'Clock', 'MapPin', 'Mail', 'Play'];
const ICON_NAMES = { Calendar: 'Calendar', CalendarPlus: 'Calendar with plus', ClipboardList: 'Clipboard', Terminal: 'Terminal', Send: 'Send', Check: 'Tick', CreditCard: 'Card (payment)', Zap: 'Lightning', Trophy: 'Trophy', Users: 'People', Bell: 'Bell', Code: 'Code', Sparkles: 'Sparkles', Globe: 'Globe', Clock: 'Clock', MapPin: 'Map pin', Mail: 'Mail', Play: 'Play' };
const MAX_ROWS = 12;

const newId = (rows) => {
  for (let i = 0; i < 50; i += 1) {
    const id = `n${Math.random().toString(36).slice(2, 7)}`;
    if (!rows.some((r) => r.id === id)) return id;
  }
  return `n${Date.now().toString(36).slice(-6)}`;
};

function TimelineEditor({ rows, onChange, psFollows, psWords, canEdit }) {
  const upd = (i, patch) => onChange(rows.map((r, k) => (k === i ? { ...r, ...patch } : r)));
  const move = (i, d) => { const j = i + d; if (j < 0 || j >= rows.length) return; const n = [...rows]; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  const remove = (i) => onChange(rows.filter((_, k) => k !== i));
  const add = () => onChange([...rows, { id: newId(rows), phase: '', milestone: '', time: '', date: '', desc: '' }]);

  return (
    <>
      <p className="ad-row-hint ad-hint-block">Change the words, add a row, re-order or remove one. The numbers 01, 02... are added by the page itself. Text like "TBD" in the date shows "Date to be announced".</p>
      <ol className="ac-rows">
        {rows.map((r, i) => {
          const ps = r.milestone === PS_ROW;
          const lock = ps && psFollows;
          return (
            <li key={r.id} className="ac-trow">
              <div className="ac-trow-head">
                <span className="ac-trow-n">{String(i + 1).padStart(2, '0')}</span>
                <b className="ac-trow-title">{r.milestone || 'New row'}</b>
                {canEdit && (
                  <span className="ac-trow-acts">
                    <button type="button" className="ad-chip" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move row ${i + 1} up`}>Up</button>
                    <button type="button" className="ad-chip" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label={`Move row ${i + 1} down`}>Down</button>
                    <button type="button" className="ad-chip ac-danger" onClick={() => remove(i)} disabled={rows.length <= 1 || lock} aria-label={`Remove row ${i + 1}`}>Remove</button>
                  </span>
                )}
              </div>
              <div className="ad-fields">
                <div className="ad-field ad-field-wide">
                  <label htmlFor={`tl-m-${r.id}`}>Milestone</label>
                  <input id={`tl-m-${r.id}`} type="text" maxLength={80} disabled={!canEdit || lock} value={r.milestone} onChange={(e) => upd(i, { milestone: e.target.value })} />
                </div>
                <div className="ad-field">
                  <label htmlFor={`tl-p-${r.id}`}>Phase tag</label>
                  <input id={`tl-p-${r.id}`} type="text" maxLength={24} disabled={!canEdit} placeholder="ROUND 1" value={r.phase} onChange={(e) => upd(i, { phase: e.target.value })} />
                </div>
                <div className="ad-field">
                  <label htmlFor={`tl-d-${r.id}`}>Date</label>
                  <input id={`tl-d-${r.id}`} type="text" maxLength={40} disabled={!canEdit || lock} placeholder="12 Dec 2026" value={lock ? psWords.date : r.date} onChange={(e) => upd(i, { date: e.target.value })} />
                </div>
                <div className="ad-field">
                  <label htmlFor={`tl-t-${r.id}`}>Time</label>
                  <input id={`tl-t-${r.id}`} type="text" maxLength={40} disabled={!canEdit || lock} placeholder="11:59 PM" value={lock ? psWords.time : r.time} onChange={(e) => upd(i, { time: e.target.value })} />
                </div>
                <div className="ad-field">
                  <label htmlFor={`tl-i-${r.id}`}>Icon</label>
                  <select id={`tl-i-${r.id}`} disabled={!canEdit} value={r.icon || ''} onChange={(e) => upd(i, { icon: e.target.value || undefined })}>
                    <option value="">Automatic</option>
                    {ICONS.map((k) => <option key={k} value={k}>{ICON_NAMES[k]}</option>)}
                  </select>
                </div>
                <div className="ad-field">
                  <label htmlFor={`tl-c-${r.id}`}>Colour</label>
                  <input id={`tl-c-${r.id}`} className="ac-color" type="color" disabled={!canEdit} value={r.accent || '#4c8dff'} onChange={(e) => upd(i, { accent: e.target.value })} />
                </div>
                <div className="ad-field ad-field-wide">
                  <label htmlFor={`tl-x-${r.id}`}>Description <span className="ac-count">{r.desc.length}/260</span></label>
                  <textarea id={`tl-x-${r.id}`} rows={2} maxLength={260} disabled={!canEdit} value={r.desc} onChange={(e) => upd(i, { desc: e.target.value.replace(/\n/g, ' ') })} />
                </div>
              </div>
              {lock && <p className="ad-field-hint ac-lock">This row follows the PDF release time ({psWords.date}, {psWords.time}). Change it under Vibe-A-Thon, Problem statements, above.</p>}
            </li>
          );
        })}
      </ol>
      {canEdit && (
        <div className="ac-row-tools">
          <button type="button" className="ad-chip" onClick={add} disabled={rows.length >= MAX_ROWS}>Add a row {rows.length >= MAX_ROWS ? `(most ${MAX_ROWS})` : ''}</button>
        </div>
      )}
    </>
  );
}

export default function AdminEventContent({ view, edit, overrides, changed, fileDefaults, psFollows, psWords, isAdmin }) {
  const mark = (k) => (changed.includes(k) ? 'unsaved changes' : k in overrides ? 'edited here' : '');
  const tlEdited = mark('timeline');
  const dtEdited = mark('details');
  const keys = Object.keys(fileDefaults.details);
  return (
    <div className="ac-content-blocks">
      <Fold title="Timeline and deadlines" badge={tlEdited} hint="The Milestone Schedule on the Vibe-A-Thon page: registration, deadlines, results, finale.">
        <TimelineEditor rows={view.timeline} onChange={(rows) => edit('timeline', rows)} psFollows={psFollows} psWords={psWords} canEdit={isAdmin} />
        {isAdmin && (
          <div className="ac-row-tools">
            <button type="button" className="ad-link" onClick={() => edit('timeline', fileDefaults.timeline)}>Put back the rows from the code file</button>
          </div>
        )}
      </Fold>

      <Fold title="Detail boxes of the Upcoming card" badge={dtEdited} hint="Format, rounds, team size, theme and prizes that open when a visitor presses Try to decrypt.">
        <p className="ad-row-hint ad-hint-block">A box you leave empty stays "Will be revealed soon". As soon as at least one box has words, the card and the popup tell visitors that new details are unlocked.</p>
        <div className="ad-fields">
          {keys.map((k) => (
            <div className="ad-field" key={k}>
              <label htmlFor={`dt-${k}`}>{k} <span className="ac-count">{(view.details[k] || '').length}/80</span></label>
              <input id={`dt-${k}`} type="text" maxLength={80} autoComplete="off" disabled={!isAdmin} value={view.details[k] || ''} onChange={(e) => edit('details', { ...view.details, [k]: e.target.value })} />
            </div>
          ))}
        </div>
        {isAdmin && (
          <div className="ac-row-tools">
            <button type="button" className="ad-link" onClick={() => edit('details', fileDefaults.details)}>Put back the words from the code file</button>
          </div>
        )}
      </Fold>
    </div>
  );
}
