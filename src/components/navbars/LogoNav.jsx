import React from 'react';

import coders_club_logo from "../../assets/coders_club_logo.png"

const LogoNav = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full pt-6 pointer-events-none">
      
      {/* MAIN CONTAINER 
        - pointer-events-auto: restores interaction
        - overflow-hidden: Key to the 'border beam' effect (crops the spinning gradient)
      */}
      <div className="relative group w-[90%] md:w-[600px] h-16 md:h-20 pointer-events-auto rounded-full overflow-hidden p-[1px]">
        
        {/* 1. ANIMATED BORDER LAYER (The Moving Neon)
           - We create a conic gradient that is much larger (w-[200%]) than the container.
           - animate-spin rotates this large gradient.
           - Because of the overflow-hidden on the parent and the padding, 
             only a thin moving line is visible.
        */}
        <div className="absolute inset-[-50%] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#0ea5e9_80%,#a855f7_100%)] animate-[spin_4s_linear_infinite]" />

        {/* 2. GLASS CONTENT LAYER
           - bg-slate-950/90: Darker background for higher contrast.
           - backdrop-blur-xl: Heavy blur for the premium look.
           - rounded-full: Matches parent.
        */}
        <div className="relative flex items-center justify-between w-full h-full px-4 border shadow-2xl bg-slate-950/80 backdrop-blur-xl border-white/10 rounded-full md:px-6 shadow-purple-500/10">
          
          {/* Inner Highlight (The 'Lip' of the glass) */}
          <div className="absolute inset-0 pointer-events-none rounded-full ring-1 ring-inset ring-white/10" />

          {/* Left Logo / Icon */}
         <div className="flex-shrink-0 cursor-pointer">
            <img
                src={coders_club_logo}
                alt="Sipna Logo"
                className="
                h-9 w-9 md:h-14 md:w-14
                object-contain
                transition-transform
                hover:scale-110
                drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]
                "
            />
         </div>


          {/* Center Text Block */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 font-bold tracking-widest uppercase text-[12px] md:text-xl font-mono whitespace-nowrap">
                Sipna Coders Club
            </h1>
            
          </div>


          {/* Right Logo / Icon */}
          {/* <div className="flex-shrink-0 cursor-pointer">
            <img
                src={Sipna_a_pluse}
                alt="Sipna A+ Logo"
                className="
                h-9 w-9 md:h-20 md:w-20
                object-contain
                transition-transform
                hover:scale-110
                drop-shadow-[0_0_12px_rgba(168,85,247,0.45)]
                "
            />
          </div> */}


        </div>
      </div>
    </div>
  );
};

export default LogoNav;