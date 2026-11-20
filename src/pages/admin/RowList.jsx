// A list of short records (steps, tracks, tool names, questions, wins, quotes) that can be added, moved up and down and removed.
// fields: [{ key, label, max, kind: 'text' | 'area' | 'select' | 'color', options: [[value, label]], placeholder, wide, get(item), set(item, text) }]
// plain: the items are plain text (the tool names) and there is one field.
export default function RowList({ id, items, onChange, noun, min = 0, max, fields, blank, plain = false, empty }) {
  const setItem = (i, next) => onChange(items.map((x, k) => (k === i ? next : x)));
  const move = (i, d) => { const j = i + d; if (j < 0 || j >= items.length) return; const n = [...items]; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  const read = (it, f) => (plain ? it : f.get ? f.get(it) : it[f.key]) ?? '';
  const write = (it, f, text) => (plain ? text : f.set ? f.set(it, text) : { ...it, [f.key]: text });
  return (
    <>
      {items.length === 0 && empty && <p className="ad-empty au-empty">{empty}</p>}
      {items.length > 0 && (
        <ol className="au-points">
          {items.map((it, i) => (
            <li key={i} className="au-point">
              <div className="au-point-head">
                <span className="au-point-n">{i + 1}</span>
                <span className="au-point-acts">
                  <button type="button" className="ad-chip" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${noun} ${i + 1} up`}>Up</button>
                  <button type="button" className="ad-chip" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move ${noun} ${i + 1} down`}>Down</button>
                  <button type="button" className="ad-chip ac-danger" onClick={() => onChange(items.filter((_, k) => k !== i))} disabled={items.length <= min} aria-label={`Remove ${noun} ${i + 1}`}>Remove</button>
                </span>
              </div>
              <div className="ad-fields">
                {fields.map((f) => {
                  const fid = `${id}-${f.key || 'v'}-${i}`;
                  const val = read(it, f);
                  return (
                    <div key={f.key || 'v'} className={`ad-field ${f.wide ? 'ad-field-wide' : ''}`}>
                      <label htmlFor={fid}>{f.label}{f.max ? <> <span className="ac-count">{String(val).length}/{f.max}</span></> : null}</label>
                      {f.kind === 'area' ? (
                        <textarea id={fid} rows={3} maxLength={f.max} placeholder={f.placeholder} value={val} onChange={(e) => setItem(i, write(it, f, e.target.value.replace(/\n/g, ' ')))} />
                      ) : f.kind === 'select' ? (
                        <select id={fid} value={val} onChange={(e) => setItem(i, write(it, f, e.target.value))}>
                          {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      ) : f.kind === 'color' ? (
                        <input id={fid} type="color" value={/^#[0-9a-fA-F]{6}$/.test(val) ? val : '#4c8dff'} onChange={(e) => setItem(i, write(it, f, e.target.value))} />
                      ) : (
                        <input id={fid} type="text" maxLength={f.max} autoComplete="off" spellCheck={f.kind === 'link' ? 'false' : undefined} placeholder={f.placeholder} value={val} onChange={(e) => setItem(i, write(it, f, e.target.value))} />
                      )}
                      {f.hint && <span className="ad-field-hint">{f.hint}</span>}
                    </div>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
      )}
      <div className="ac-row-tools">
        <button type="button" className="ad-chip" onClick={() => onChange([...items, blank()])} disabled={items.length >= max}>
          {items.length >= max ? `Add ${noun} (most ${max})` : `Add ${noun}`}
        </button>
      </div>
    </>
  );
}
