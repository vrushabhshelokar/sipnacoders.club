import { Link } from 'react-router-dom';
import { Icon } from '../site/Icons';

export default function NotFound() {
  return (
    <section className="s-404">
      <div className="s-container">
        <span className="s-eyebrow">Error 404</span>
        <h1>Page not found</h1>
        <p>This page doesn&apos;t exist, or it&apos;s still compiling.</p>
        <Link to="/" className="s-btn s-btn-light"><Icon.Home size={16} /> Back to home</Link>
      </div>
    </section>
  );
}
