
import { useEffect, useState } from 'react';
import { DotLottieReact, setWasmUrl } from '@lottiefiles/dotlottie-react';
import { Reveal } from '../site/ui';
import { useSwitch } from '../site/liveSettings';
import { usePosters, POSTERS } from '../site/posters';
import RegistrationClosed from '../site/RegistrationClosed';
import formAnimation from '../assets/form.lottie';
import formAnimation1 from '../assets/form1.lottie';
// The animation player needs a 500 KB engine file. By default it comes from a public CDN (a third party, and slow on some phones);
// this makes it come from our own site and be cached like the other files.
import wasmUrl from '@lottiefiles/dotlottie-web/dist/dotlottie-player.wasm?url';

const TALLY_FORM_ID = 'VpQzav';
setWasmUrl(wasmUrl);

// the animation only starts after the form (or after a few seconds), so the form gets the bandwidth first
const Anim = ({ on, src }) => (on ? <DotLottieReact src={src} autoplay loop /> : null);

export default function Register() {
  const open = useSwitch('vibeRegistration', true);   // dashboard -> Site controls
  const poster = usePosters()[0] || POSTERS[0];       // the same Vibe-A-Thon poster as the popup and the Upcoming card (src/assets/upcoming/)
  const [formReady, setFormReady] = useState(false);   // true when the form has appeared
  const [slow, setSlow] = useState(false);              // true when it is taking long
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 7000);
    return () => clearTimeout(t);
  }, []);
  const animOn = formReady || slow;

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  if (!open) return <RegistrationClosed />;

  return (
    <>
      <header className="s-pagehead s-register-pagehead">
        <div className="s-pagehead-glow" aria-hidden="true" />
        <div className="s-container">
          <Reveal>
            <h1 className="sr-only">Register — Vibe-A-Thon</h1>
            <div className="s-register-visual-wrap">
              {poster && (
                <img
                  src={poster}
                  alt="Vibe-A-Thon — The 18-Hour AI Build-A-Thon"
                  className="s-register-visual-img"
                  width={900}
                  height={300}
                />
              )}
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

            {!formReady && (
              <p className="s-form-wait" role="status">
                <span className="tl-spin" aria-hidden="true" />
                <span>
                  {slow
                    ? <>The form is taking a while. <a href={`https://tally.so/r/${TALLY_FORM_ID}`} target="_blank" rel="noopener noreferrer">Open the registration form in a new tab</a>.</>
                    : 'Loading the registration form…'}
                </span>
              </p>
            )}
            <iframe
              onLoad={() => setFormReady(true)}
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
              <Anim on={animOn} src={formAnimation1} />
            </div>

            <div className="s-form-animation block sm:hidden">
              <Anim on={animOn} src={formAnimation} />
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
