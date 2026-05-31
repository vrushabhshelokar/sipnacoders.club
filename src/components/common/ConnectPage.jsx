import React, { useState } from 'react';

// --- Icon Assets ---
const MailIcon = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg fill="currentColor" viewBox="0 0 24 24" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.225-.149-4.771-1.664-4.919-4.919-.058-1.265-.069-1.644-.069-4.849 0-3.204.012-3.584.069-4.849.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg fill="currentColor" viewBox="0 0 24 24" className={className}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const CopyIcon = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

// --- Component: Contact Hub ---
const ConnectPage = () => {
  const [copied, setCopied] = useState(false);
  const email = "team@sipnacoders.club";

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen w-full relative bg-transparent flex flex-col items-center justify-center p-6 overflow-hidden font-sans">
      
      

      {/* 2. Header Section */}
      <div className="relative z-10 text-center mb-12 max-w-2xl">
        <div className="inline-block px-3 py-1 mb-4 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono tracking-wider">
          :: STATUS: ONLINE ::
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
          Establish Connection
        </h1>
        <p className="text-white/50 text-lg">
          Facing an issue or looking to collaborate? <br className="hidden md:block"/>
          Access our communication channels below.
        </p>
      </div>

      {/* 3. The Bento Grid */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* CARD 1: Support (Large Focus) - Spans 2 cols on Large screens */}
        <div
  onClick={handleCopy}
  className="group lg:col-span-2 relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 cursor-pointer overflow-hidden transition-all hover:border-white/20 hover:bg-white/10 active:scale-[0.99]"
>
  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
    <span className="text-xs text-white/40 font-mono flex items-center gap-1">
      {copied ? "COPIED" : "CLICK_TO_COPY"}
      {copied ? (
        <CheckIcon className="w-3 h-3 text-emerald-400" />
      ) : (
        <CopyIcon className="w-3 h-3" />
      )}
    </span>
  </div>

  <div className="flex flex-col h-full justify-between">
    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
      <MailIcon className="w-6 h-6" />
    </div>

    <div>
      <h3 className="text-white/60 text-sm font-medium mb-1">
        General Support & Inquiries
      </h3>

      <p className="text-2xl md:text-3xl text-white font-semibold tracking-tight group-hover:text-blue-200 transition-colors">
        {email}
      </p>

      <p
        className={`text-sm mt-2 transition-colors ${
          copied ? "text-emerald-400" : "text-blue-400/60"
        }`}
      >
        {copied ? "Address copied to clipboard!" : "Typical reply time: < 24 hours"}
      </p>

      {/* MAIL BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // IMPORTANT
          window.location.href = `mailto:${email}`;
        }}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-500/30 transition"
      >
        <MailIcon className="w-4 h-4" />
        Send Mail
      </button>
    </div>
  </div>
</div>


        {/* CARD 2: Instagram */}
        <a 
          href="https://www.instagram.com/sipnacoders.club/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(236,72,153,0.3)] transition-all duration-300"
        >
          {/* Gradient Hover Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/20 rounded-2xl transition-all duration-500" />
          
          <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 mb-6 group-hover:bg-pink-500 group-hover:text-white transition-all">
            <InstagramIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl text-white font-bold mb-1">Instagram</h3>
            <p className="text-white/40 text-sm">Event highlights & club vibes</p>
          </div>
        </a>

        {/* CARD 3: LinkedIn */}
        <a 
          href="https://www.linkedin.com/company/sipna-coders-club/posts/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.3)] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-cyan-600/0 group-hover:from-blue-600/10 group-hover:to-cyan-600/20 rounded-2xl transition-all duration-500" />

          <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <LinkedinIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl text-white font-bold mb-1">LinkedIn</h3>
            <p className="text-white/40 text-sm">Professional network & alumni</p>
          </div>
        </a>

        {/* CARD 4: Location (Wide Bottom) */}
        <div className="lg:col-span-2 relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex items-center gap-6 group hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 shrink-0 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
             <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
               <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
               <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
             </svg>
          </div>
          <div>
             <h3 className="text-white font-bold">Club Headquarters</h3>
             <p className="text-white/50 text-sm">Sipna COET</p>
          </div>
          {/* <div className="ml-auto hidden md:block px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/40 font-mono">
            OPEN: 09:00 - 18:00
          </div> */}
        </div>

      </div>
    </div>
  );
};

export default ConnectPage;