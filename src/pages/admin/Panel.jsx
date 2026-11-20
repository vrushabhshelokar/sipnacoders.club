// A bar that opens and closes a section, with one line of what is set. Used by the Site content tab.
// Which sections are open is remembered for the visit (sessionStorage), like the Upcoming event tab.
import { useState } from 'react';

export function usePanels(storageKey, ids, initial) {
  const read = () => {
    try { const v = JSON.parse(sessionStorage.getItem(storageKey)); if (Array.isArray(v)) return v.filter((x) => ids.includes(x)); } catch { /* private mode: use the start state */ }
    return initial;
  };
  const [open, setOpen] = useState(read);
  const save = (next) => { setOpen(next); try { sessionStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* not remembered */ } };
  const toggle = (id) => save(open.includes(id) ? open.filter((x) => x !== id) : [...open, id]);
  return { open, total: ids.length, panel: (id) => ({ id, open: open.includes(id), onToggle: () => toggle(id) }), all: () => save([...ids]), none: () => save([]) };
}

export function PanelBar({ st }) {
  return (
    <div className="au-bar">
      <span>{st.open.length} of {st.total} sections open</span>
      <button type="button" className="ad-link" onClick={st.all} disabled={st.open.length === st.total}>Open all</button>
      <button type="button" className="ad-link" onClick={st.none} disabled={st.open.length === 0}>Close all</button>
    </div>
  );
}

export function Panel({ id, title, badge, summary, sub, open, onToggle, children }) {
  return (
    <section className={`ad-panel au-panel ${open ? 'is-open' : ''}`} aria-labelledby={`as-h-${id}`}>
      <h2 id={`as-h-${id}`} className="au-h">
        <button type="button" className="au-head" aria-expanded={open} aria-controls={`as-b-${id}`} onClick={onToggle}>
          <span className="au-head-text">
            <span className="au-head-title">{title}{badge ? <em className="ac-edited">{badge}</em> : null}</span>
            {summary && <small className="au-sum">{summary}</small>}
          </span>
          <span className="ac-fold-chev" aria-hidden="true" />
        </button>
      </h2>
      {open && (
        <div id={`as-b-${id}`} className="au-body">
          {sub && <p className="ad-sub">{sub}</p>}
          {children}
        </div>
      )}
    </section>
  );
}

export const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
