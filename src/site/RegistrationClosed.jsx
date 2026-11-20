// Shown on /register while the admin has Vibe-A-Thon registration switched off (dashboard -> Site controls).
import { Link } from 'react-router-dom';
import { useLinks } from './siteLive';

export default function RegistrationClosed() {
  const LINKS = useLinks();
  return (
    <header className="s-pagehead s-register-pagehead">
      <div className="s-pagehead-glow" aria-hidden="true" />
      <div className="s-container" style={{ textAlign: 'center', paddingBottom: 90 }}>
        <h1 className="s-h2">Registrations are closed</h1>
        <p className="s-sub s-sub-lg" style={{ marginInline: 'auto' }}>
          Thank you for the response. Follow us on Instagram to hear about the next event first.
        </p>
        <div className="s-actions" style={{ justifyContent: 'center' }}>
          <a className="s-btn s-btn-light" href={LINKS.instagram} target="_blank" rel="noopener noreferrer">Follow on Instagram</a>
          <Link className="s-btn s-btn-ghost" to="/">Back to home</Link>
        </div>
      </div>
    </header>
  );
}
