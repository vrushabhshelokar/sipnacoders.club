// Automation tab: changes that happen by themselves at a time you choose, and the history of every change (with Undo).
import { useMemo, useState } from 'react';
import { Fold, KEY_LABELS, Msg, api, describeValue, errorText, istStamp, isoWords, stampWords, useLoad } from './kit';

/* the things that can be scheduled. Each one is a patch of site switches. `banner:` actions use the banner words saved at that moment. */
function buildActions(banner) {
  const list = [];
  list.push(
    { group: 'Registration', id: 'vr-on', label: 'Open Vibe-A-Thon registration', patch: { vibeRegistration: true } },
    { group: 'Registration', id: 'vr-off', label: 'Close Vibe-A-Thon registration', patch: { vibeRegistration: false } },
    { group: 'Popups', id: 'vp-on', label: 'Turn the Vibe-A-Thon popup on', patch: { vibePopup: true } },
    { group: 'Popups', id: 'vp-off', label: 'Turn the Vibe-A-Thon popup off', patch: { vibePopup: false } },
    { group: 'Round 2', id: 'r2-show', label: 'Show the Round 2 details', patch: { round2Details: true } },
    { group: 'Round 2', id: 'r2-hide', label: 'Put Round 2 back to "Publishing soon"', patch: { round2Details: false } },
    { group: 'Problem statements', id: 'ps-show', label: 'Show the Problem Statement section', patch: { psShow: true } },
    { group: 'Problem statements', id: 'ps-hide', label: 'Hide the Problem Statement section', patch: { psShow: false } },
    { group: 'Problem statements', id: 'ps-open', label: 'Open the problem statement buttons (needs a PDF link)', patch: { psUnlockNow: true } },
    { group: 'Problem statements', id: 'ps-sched', label: 'Lock the problem statement buttons', patch: { psUnlockNow: false } },
    { group: 'Announcement banner', id: 'bn-show', label: 'Show the banner (with the words saved now)', patch: { banner: { ...banner, on: true } }, needs: banner.text ? '' : 'Write the banner words first (Site content tab) and save them.' },
    { group: 'Announcement banner', id: 'bn-hide', label: 'Hide the banner', patch: { banner: { ...banner, on: false } } },
  );
  return list;
}

const WHO = { admin: 'You', schedule: 'Schedule' };
const KIND = { save: 'Saved changes', reset: 'Reset to the code files', scheduled: 'Scheduled change', undo: 'Undo' };

export default function AdminAutomation({ banner, locked, onSettingsChanged }) {
  const [state, reload] = useLoad(() => api('/api/admin/control'));
  const actions = useMemo(() => buildActions(banner), [banner]);
  const [actionId, setActionId] = useState('');
  const [at, setAt] = useState(() => istStamp(60));
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState('');
  const [undoMsg, setUndoMsg] = useState({ type: '', text: '' });

  const pending = (state.data && state.data.schedule ? state.data.schedule : []).filter((i) => !i.done);
  const done = (state.data && state.data.schedule ? state.data.schedule : []).filter((i) => i.done).reverse();
  const history = (state.data && state.data.history) || [];
  const chosen = actions.find((a) => a.id === actionId);
  const groups = [...new Set(actions.map((a) => a.group))];

  const add = async () => {
    setMsg({ type: '', text: '' });
    if (!chosen) { setMsg({ type: 'err', text: 'Choose what should happen.' }); return; }
    if (chosen.needs) { setMsg({ type: 'err', text: chosen.needs }); return; }
    if (!at) { setMsg({ type: 'err', text: 'Pick the date and time.' }); return; }
    setBusy('add');
    const r = await api('/api/admin/control', { action: 'schedule-add', at, patch: chosen.patch, label: chosen.label });
    setBusy('');
    if (!r.ok) { setMsg({ type: 'err', text: errorText(r, 'Could not add this change.') }); return; }
    setMsg({ type: 'ok', text: `Added. It will happen by itself on ${stampWords(at)} (Indian time), even if nobody is online.` });
    setActionId('');
    reload();
  };

  const remove = async (id) => {
    setBusy(id);
    const r = await api('/api/admin/control', { action: 'schedule-remove', id });
    setBusy('');
    if (!r.ok && r.status !== 404) { setMsg({ type: 'err', text: errorText(r) }); return; }
    setMsg({ type: 'ok', text: 'Removed. It will not happen.' });
    reload();
  };

  const undo = async (id) => {
    setBusy(id);
    setUndoMsg({ type: '', text: '' });
    const r = await api('/api/admin/control', { action: 'undo', id });
    setBusy('');
    if (!r.ok) { setUndoMsg({ type: 'err', text: errorText(r, 'Could not undo this.') }); return; }
    setUndoMsg({ type: 'ok', text: r.json.nothing ? 'Nothing to undo: the values are already like that.' : 'Done. The old values are back.' });
    if (onSettingsChanged) onSettingsChanged(r.json.settings || {});
    reload();
  };

  return (
    <div className="ac-tab">
      <section className="ad-panel">
        <h2>Scheduled changes</h2>
        <p className="ad-sub">Pick a change and a time. It happens by itself at that moment (Indian time), even if you are asleep. Nothing here needs a deploy.</p>

        <div className="ac-sched">
          <div className="ad-field">
            <label htmlFor="sch-action">What should happen</label>
            <select id="sch-action" value={actionId} onChange={(e) => { setActionId(e.target.value); setMsg({ type: '', text: '' }); }}>
              <option value="">Choose...</option>
              {groups.map((g) => (
                <optgroup key={g} label={g}>
                  {actions.filter((a) => a.group === g).map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="ad-field">
            <label htmlFor="sch-at">When (Indian time)</label>
            <input id="sch-at" type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)} />
          </div>
          <button type="button" className="s-btn s-btn-light" onClick={add} disabled={busy === 'add'}>{busy === 'add' ? 'Adding...' : 'Add to schedule'}</button>
        </div>
        {chosen && <p className="ad-row-hint">{chosen.needs || 'This changes: '}{!chosen.needs && Object.keys(chosen.patch).map((k) => `${KEY_LABELS[k] || k} (${describeValue(k, chosen.patch[k])})`).join(', ')}</p>}
        <Msg m={msg} />

        <h3 className="ad-h3">Waiting ({pending.length})</h3>
        {state.loading && !state.data && <p className="ad-empty">Loading...</p>}
        {state.error && <div className="ad-alert ad-alert-err">{state.error}</div>}
        {!state.loading && !state.error && !pending.length && <p className="ad-empty">Nothing is scheduled. Add a change above.</p>}
        {pending.length > 0 && (
          <ul className="ac-list">
            {pending.map((i) => (
              <li key={i.id}>
                <span className="ac-when-big">{stampWords(i.at)}</span>
                <span className="ac-list-main">{i.label || Object.keys(i.patch).map((k) => KEY_LABELS[k] || k).join(', ')}</span>
                <button type="button" className="ad-link" onClick={() => remove(i.id)} disabled={busy === i.id}>Remove</button>
              </li>
            ))}
          </ul>
        )}

        {done.length > 0 && (
          <Fold title="Already happened" badge={String(done.length)}>
            <ul className="ac-list">
              {done.map((i) => (
                <li key={i.id}>
                  <span className="ac-when-big">{stampWords(i.at)}</span>
                  <span className="ac-list-main">{i.label || Object.keys(i.patch).map((k) => KEY_LABELS[k] || k).join(', ')}</span>
                  <span className="ac-tag">done</span>
                </li>
              ))}
            </ul>
          </Fold>
        )}
      </section>

      <section className="ad-panel">
        <h2>Change history</h2>
        <p className="ad-sub">Every change to the site switches, newest first. Undo puts the old values back (it saves right away).</p>
        {locked && <p className="ad-row-hint">You have unsaved changes on another tab. Save or discard them first, then Undo works again.</p>}
        <Msg m={undoMsg} />
        {!state.loading && !state.error && !history.length && <p className="ad-empty">No changes yet. They show up here after the first save.</p>}
        {history.length > 0 && (
          <ul className="ac-history">
            {history.map((h) => {
              const undoable = h.changes.some((c) => !c.big);
              return (
                <li key={h.id}>
                  <div className="ac-hist-head">
                    <span className="ac-when-big">{isoWords(h.at)}</span>
                    <span className="ac-tag">{WHO[h.who] || h.who}</span>
                    <span className="ac-hist-kind">{KIND[h.kind] || h.kind}</span>
                    {h.kind !== 'undo' && undoable && <button type="button" className="ad-chip" onClick={() => undo(h.id)} disabled={busy === h.id || locked}>{busy === h.id ? 'Undoing...' : 'Undo'}</button>}
                  </div>
                  {h.note && <p className="ad-row-hint">{h.note}</p>}
                  <ul className="ac-changes">
                    {h.changes.map((c) => (
                      <li key={c.key}>
                        <b>{KEY_LABELS[c.key] || c.key}</b>
                        {c.big
                          ? <span> was edited (long text: it can be seen on the site but not undone from here)</span>
                          : <span>: {describeValue(c.key, c.from)} <i aria-hidden="true">&rarr;</i><span className="ac-sr"> changed to </span> {describeValue(c.key, c.to)}</span>}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
