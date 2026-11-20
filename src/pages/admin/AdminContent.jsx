// Site content tab: the announcement banner, pictures, links, numbers and words, the lists of the Home page, past events with photos,
// and the team + ambassadors lists. The sections are bars that open and close (the choice is remembered for the visit).
import { BannerPill } from '../../site/SiteBanner';
import PeopleManager from '../AdminPeople';
import PastEditor, { pastSummary } from './AdminPast';
import SitePanels, { SITE_PANELS, sitePanelSummaries } from './AdminSite';
import { stampWords } from './kit';
import { Panel, PanelBar, usePanels } from './Panel';

const TONES = [['info', 'Blue: news'], ['urgent', 'Red: urgent'], ['success', 'Green: good news']];
const IDS = ['banner', ...SITE_PANELS, 'past'];

export default function AdminContent({ view, edit, overrides, changed, isAdmin }) {
  const b = view.banner;
  const set = (patch) => edit('banner', { ...b, ...patch });
  const mark = (keys) => (keys.some((k) => changed.includes(k)) ? 'unsaved changes' : keys.some((k) => k in overrides) ? 'edited here' : '');
  const st = usePanels('scc-as-open-v1', IDS, ['banner']);
  const sum = sitePanelSummaries(view);
  const bannerSum = b.on ? `shown: "${String(b.text || '').slice(0, 50)}${String(b.text || '').length > 50 ? '...' : ''}"` : 'hidden';
  return (
    <div className="ac-tab au as">
      <PanelBar st={st} />

      <h2 className="as-group">Top of the site</h2>
      <Panel {...st.panel('banner')} title="Announcement banner" badge={mark(['banner'])} summary={bannerSum} sub="One line of news at the top of every page: a deadline, a result, a change of plan. Visitors can close it. It appears and disappears without a deploy.">
        <div className="ad-row">
          <div className="ad-row-text">
            <span id="lbl-banner-on" className="ad-row-label">Show the banner on the site</span>
            <span className="ad-row-hint">Off keeps your words saved, but nobody sees the banner.</span>
          </div>
          <div className="ad-row-ctl">
            <span className={`ad-state ${b.on ? 'is-on' : ''}`}>{b.on ? 'Shown' : 'Hidden'}</span>
            <button id="sw-banner-on" type="button" role="switch" aria-checked={b.on} aria-labelledby="lbl-banner-on" disabled={!isAdmin} className={`ad-toggle ${b.on ? 'is-on' : ''}`} onClick={() => set({ on: !b.on })}><i /></button>
          </div>
        </div>

        <div className="ad-fields ac-banner-fields">
          <div className="ad-field ad-field-wide">
            <label htmlFor="bn-text">What it says <span className="ac-count">{b.text.length}/200</span></label>
            <textarea id="bn-text" rows={2} maxLength={200} disabled={!isAdmin} placeholder="Registrations for Vibe-A-Thon close on 12 Dec at 11:59 PM." value={b.text} onChange={(e) => set({ text: e.target.value.replace(/\n/g, ' ') })} />
            <span className="ad-field-hint">Keep it short, about 90 letters. A phone shows two lines and cuts the rest.</span>
          </div>
          <div className="ad-field">
            <label htmlFor="bn-link">Link (optional)</label>
            <input id="bn-link" type="text" inputMode="url" autoComplete="off" spellCheck="false" disabled={!isAdmin} placeholder="/register or https://..." value={b.link} onChange={(e) => set({ link: e.target.value })} />
            <span className="ad-field-hint">A page of this site (starts with /) or a full https:// link.</span>
          </div>
          <div className="ad-field">
            <label htmlFor="bn-linktext">Button words <span className="ac-count">{b.linkText.length}/30</span></label>
            <input id="bn-linktext" type="text" maxLength={30} autoComplete="off" disabled={!isAdmin} placeholder="Register now" value={b.linkText} onChange={(e) => set({ linkText: e.target.value })} />
            <span className="ad-field-hint">Empty: it says "Learn more".</span>
          </div>
          <div className="ad-field">
            <label htmlFor="bn-tone">Colour</label>
            <select id="bn-tone" value={b.tone} disabled={!isAdmin} onChange={(e) => set({ tone: e.target.value })}>
              {TONES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </div>
          <div className="ad-field">
            <label htmlFor="bn-until">Hide by itself after (Indian time)</label>
            <input id="bn-until" type="datetime-local" disabled={!isAdmin} value={b.until} onChange={(e) => set({ until: e.target.value })} />
            <span className="ad-field-hint">{b.until ? `Disappears on ${stampWords(b.until)}.` : 'Empty: stays until you switch it off.'}</span>
          </div>
        </div>

        <h3 className="ad-h3">How it looks</h3>
        <div className="ac-preview"><BannerPill b={b} preview /></div>
      </Panel>

      <SitePanels view={view} edit={edit} st={st} mark={mark} sum={sum} />

      <h2 className="as-group">Events</h2>
      <Panel {...st.panel('past')} title="Past events and photos" badge={mark(['pastEvents'])} summary={pastSummary(view)} sub="Add an event, change its words, add or remove its photos.">
        <PastEditor view={view} edit={edit} overrides={overrides} />
      </Panel>

      <p className="ad-note ad-note-tight">Everything above goes live only after you press <b>Save changes</b> in the yellow bar that appears at the top.</p>

      <h2 className="as-group">People</h2>
      <p className="ad-note ac-people-note">The team and ambassadors below are saved on their own, with the Save button inside that box (they are stored separately from the switches above).</p>
      <PeopleManager />
    </div>
  );
}

