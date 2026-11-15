
import { useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Reveal } from '../site/ui';
import formAnimation from '../assets/form.lottie';
import formAnimation1 from '../assets/form1.lottie';

const TALLY_FORM_ID = 'VpQzav';

export default function Register() {
  useEffect(() => {
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
      <header className="s-pagehead s-register-pagehead">
        <div className="s-pagehead-glow" aria-hidden="true" />
        <div className="s-container">
          <Reveal>
            <h1 className="sr-only">Register — Vibe-A-Thon</h1>
            <div className="s-register-visual-wrap">
              <img
                src="/register-visual.webp"
                alt="Vibe-A-Thon — The 18-Hour AI Build-A-Thon"
                className="s-register-visual-img"
                width={458}
                height={200}
              />
            </div>
            <p className="s-sub s-sub-lg s-register-sub">
              Fill the form below to participate. Limited seats available.
            </p>
          </Reveal>
        </div>
      </header>

      <section className="s-section s-section-first">
        <div className="s-container">
          <div className="s-register">

            <iframe
              data-tally-src={`https://tally.so/embed/VpQzav?hideTitle=1&transparentBackground=1&dynamicHeight=1`}
              width="100%"
              height="0"
              title="Registration form"
              loading="lazy"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
            />

            {/* Bottom Lottie Overlay */}
            <div className="s-form-animation hidden sm:block">
              <DotLottieReact
                src={formAnimation1}
                autoplay
                loop
              />
            </div>

            <div className="s-form-animation block sm:hidden">
              <DotLottieReact
                src={formAnimation}
                autoplay
                loop
              />
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
