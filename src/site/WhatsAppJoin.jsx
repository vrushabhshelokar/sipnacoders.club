// "Stay connected" band on the Vibe-A-Thon page: a Join button that opens the Vibe-A-Thon WhatsApp group.
// The group link lives in src/data/site.js (LINKS.whatsappGroup). It can also be changed from the dashboard
// (Site content -> Links -> Vibe-A-Thon WhatsApp group), so a reset invite link needs no new deploy.
// If the link is empty the band hides itself. To remove the band, delete <WhatsAppJoin /> in HackathonTeaser.jsx.
import { Icon } from './Icons';
import { useLinks } from './siteLive';
import './WhatsAppJoin.css';

export default function WhatsAppJoin() {
  const href = String(useLinks().whatsappGroup || '').trim();
  if (!href) return null;
  return (
    <section className="wa-band" aria-labelledby="wa-band-t">
      <div className="wa-card">
        <span className="wa-badge" aria-hidden="true"><Icon.Users size={22} /></span>
        <div className="wa-copy">
          <span className="wa-tag">Stay connected</span>
          <h3 id="wa-band-t" className="wa-title">Join our WhatsApp group for updates</h3>
          <p className="wa-sub">Problem statements, deadlines and announcements are shared in the Vibe-A-Thon group.</p>
        </div>
        <a className="wa-btn" href={href} target="_blank" rel="noopener noreferrer">
          Join group <Icon.ArrowUpRight size={16} />
        </a>
      </div>
    </section>
  );
}
