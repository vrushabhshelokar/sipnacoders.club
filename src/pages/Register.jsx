import { PageHead } from '../site/ui';
import { LINKS } from '../data/site';

export default function Register() {
  return (
    <>
      <PageHead eyebrow="Register" title="Register" sub="Fill the form below to participate. Limited seats available." />
      <section className="s-section s-section-first">
        <div className="s-container hidden sm:block">
          <div className="s-register">
            <iframe src={LINKS.registerForm} title="Registration form" loading="lazy" />
          </div>
        </div>
        
          <div className="s-register block sm:hidden">
            <iframe src={LINKS.registerForm} title="Registration form" loading="lazy" />
          </div>
        
      </section>
    </>
  );
}
