import { useEffect } from 'react';
import { PageHead } from '../site/ui';

const TALLY_FORM_ID = 'VpQzav';

export default function Register() {
  useEffect(() => {
    // Load Tally embed script once; if already present, just call its load() method
    if (window.Tally) {
      window.Tally.loadEmbeds();
      return;
    }
    const existing = document.getElementById('tally-js');
    if (existing) return;
    const s = document.createElement('script');
    s.id = 'tally-js';
    s.src = 'https://tally.so/widgets/embed.js';
    s.onload = () => window.Tally?.loadEmbeds();
    document.body.appendChild(s);
  }, []);

  return (
    <>
      <PageHead
        eyebrow="Register"
        title="Register"
        sub="Fill the form below to participate. Limited seats available."
      />
      <section className="s-section s-section-first">
        <div className="s-container">
          <div className="s-register">
            <iframe
              data-tally-src={`https://tally.so/embed/${TALLY_FORM_ID}?hideTitle=1&transparentBackground=1&dynamicHeight=1`}
              width="100%"
              height="0"
              title="Registration form"
              loading="lazy"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
            />
          </div>
        </div>
      </section>
    </>
  );
}
