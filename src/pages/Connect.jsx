import { useState } from 'react';
import { Icon } from '../site/Icons';
import { PageHead, Reveal } from '../site/ui';
import { LINKS } from '../data/site';

export default function Connect() {
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', message: '' });

  const copy = async () => {
    try { await navigator.clipboard.writeText(LINKS.email); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const send = (e) => {
    e.preventDefault();
    const body = `${form.message}\n\n- ${form.name}`;
    window.location.href = `mailto:${LINKS.email}?subject=${encodeURIComponent(form.subject || 'Hello Coders Club')}&body=${encodeURIComponent(body)}`;
  };

  return (
    <>
      <PageHead eyebrow="Connect" title="Get in touch" sub="Facing an issue or looking to collaborate? We usually reply within 24 hours." />
      <section className="s-section s-section-first">
        <div className="s-container s-connect">
          <div className="s-contacts">
            <Reveal className="s-contact" style={{ '--c': '#4c8dff' }}>
              <span className="s-contact-ic"><Icon.Mail size={20} /></span>
              <div className="s-contact-txt"><small>Email</small><b>{LINKS.email}</b></div>
              <div className="s-contact-act">
                <button className="s-btn s-btn-ghost s-btn-sm" onClick={copy}>
                  {copied ? <><Icon.Check size={14} /> Copied</> : <><Icon.Copy size={14} /> Copy</>}
                </button>
                <a className="s-btn s-btn-light s-btn-sm" href={`mailto:${LINKS.email}`}>Send</a>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <a className="s-contact" href={LINKS.instagram} target="_blank" rel="noopener noreferrer" style={{ '--c': '#ec4899' }}>
                <span className="s-contact-ic"><Icon.Instagram size={20} /></span>
                <div className="s-contact-txt"><small>Instagram</small><b>@sipnacoders.club</b></div>
                <Icon.ArrowUpRight size={18} />
              </a>
            </Reveal>
            <Reveal delay={160}>
              <a className="s-contact" href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" style={{ '--c': '#3b82f6' }}>
                <span className="s-contact-ic"><Icon.Linkedin size={20} /></span>
                <div className="s-contact-txt"><small>LinkedIn</small><b>Sipna Coders Club</b></div>
                <Icon.ArrowUpRight size={18} />
              </a>
            </Reveal>
            <Reveal className="s-contact" delay={240} style={{ '--c': '#3ddc84' }}>
              <span className="s-contact-ic"><Icon.MapPin size={20} /></span>
              <div className="s-contact-txt"><small>Find us at</small><b>Sipna COET</b></div>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <form className="s-form" onSubmit={send}>
              <h3>Send us a message</h3>
              <label>
                <span>Your name</span>
                <input required value={form.name} onChange={set('name')} placeholder="Full name" autoComplete="name" />
              </label>
              <label>
                <span>Subject</span>
                <input value={form.subject} onChange={set('subject')} placeholder="Collaboration, event, question..." />
              </label>
              <label>
                <span>Message</span>
                <textarea required rows={5} value={form.message} onChange={set('message')} placeholder="Write your message..." />
              </label>
              <button type="submit" className="s-btn s-btn-light">Send message <Icon.Send size={15} /></button>
              <p className="s-form-note">This opens your email app with the message ready to send.</p>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
