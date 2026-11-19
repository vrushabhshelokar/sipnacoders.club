// Access tab: who is logged in, how to give coordinators a view-only login, sign out.
export default function AdminAccess({ role, viewerEnabled, onLogout }) {
  const isAdmin = role === 'admin';
  return (
    <div className="ac-tab">
      <section className="ad-panel">
        <h2>Your access</h2>
        <p className="ad-sub">You are logged in as <b>{isAdmin ? 'Admin (can change everything)' : 'Viewer (can only look)'}</b>. A login lasts 24 hours.</p>
        <button type="button" className="s-btn s-btn-light" onClick={onLogout}>Sign out</button>
      </section>

      {isAdmin && (
        <section className="ad-panel">
          <h2>View-only login for coordinators</h2>
          <p className="ad-sub">Give a teammate a second password that lets them see visitors and the registration list, but never change or delete anything. They log in on the same page.</p>
          <div className={`ac-status ${viewerEnabled ? 'is-on' : ''}`}>
            <span className="ac-status-dot" aria-hidden="true" />
            <b>{viewerEnabled ? 'On: a view-only password is set.' : 'Off: no view-only password is set yet.'}</b>
          </div>
          <ol className="ac-steps">
            <li>Open your project in <b>Vercel</b>, then <b>Settings</b>, then <b>Environment Variables</b>.</li>
            <li>Add a variable named <code>ADMIN_VIEW_PASSWORD</code> with the password you want to share. It must be different from the admin password.</li>
            <li>Press <b>Redeploy</b> on the latest deployment. To switch it off later, delete the variable and redeploy.</li>
          </ol>
          <p className="ad-note ad-note-tight">Viewers see the Overview and Registrations tabs only. Their contact details list is visible to them, so share the password only with people who may see it. Wrong passwords never lock anyone out.</p>
        </section>
      )}

      {isAdmin && (
        <section className="ad-panel">
          <h2>Keep the form address steady (optional)</h2>
          <p className="ad-sub">The address you paste into Tally and Google Forms (Registrations tab) is made from the admin password. If you ever change the admin password, that address changes too, and the forms must be updated.</p>
          <p className="ad-row-hint">To avoid that, add a variable <code>REG_WEBHOOK_TOKEN</code> in Vercel (16 to 80 letters, digits, - or _) and redeploy. The address then uses it and stays the same.</p>
        </section>
      )}
    </div>
  );
}
