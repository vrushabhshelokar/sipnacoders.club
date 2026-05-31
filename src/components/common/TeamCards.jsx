

import { useEffect, useRef, useState } from 'react';
import { FaLinkedinIn, FaInstagram } from "react-icons/fa";

const TeamCard = ({
  name,
  role,
  img,
  index,
  socials = {},
  status = "Available",
}) => {

  // ✅ Hooks go HERE
  const imgRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      className="group relative w-full max-w-[280px] sm:max-w-[300px] lg:max-w-[320px] mx-auto rounded-xl"
      // Staggered fade-in animation maintained
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* --- ORBITAL LIGHTING ENGINE --- */}
      {/* This layer spins behind the content to create the moving border effect */}
      <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-b from-transparent via-transparent to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -inset-[1px] rounded-xl overflow-hidden">
        <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#10b981_360deg)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-[spin_4s_linear_infinite]" />
      </div>

      {/* --- MAIN CARD CONTAINER --- */}
      {/* High-tech matte finish, inset by 1px to reveal the orbital glow behind */}
      <div className="relative h-full w-full bg-zinc-950/90 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden transition-all duration-500 group-hover:bg-zinc-900/90">
        
        {/* Futuristic Grid Overlay (Subtle Texture) */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {/* 1. Image Layer with Glitch/Zoom Effect (PRESERVED) */}
        <div className="relative aspect-[2/3] sm:aspect-[4/5] w-full overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 z-10 bg-zinc-950/20 group-hover:bg-transparent transition-colors duration-500 mix-blend-multiply" />
          
          <img
  ref={imgRef}
  src={isVisible ? img : undefined}
  alt={name}
  loading="lazy"
  decoding="async"
  className={`
    h-full w-full object-cover
    transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
    ${isVisible ? 'opacity-80 scale-100' : 'opacity-0 scale-95'}
    grayscale
    group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105
  `}
/>

          {/* Cinematic Gradient Overlay */}
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-80" />
        </div>

        {/* 2. Content Layer (PRESERVED LAYOUT) */}
        <div className="absolute bottom-0 left-0 w-full z-30 p-6 flex flex-col justify-end h-full pointer-events-none">
          
          {/* Decorative ID Number - Tech Font Update */}
          <div className="absolute top-4 right-4 overflow-hidden pointer-events-auto">
             <div className="flex flex-col items-end">
                <span className="font-mono text-[8px] text-emerald-500/50 uppercase tracking-wider mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  SYS_ID
                </span>
                <span className="font-mono text-[10px] text-zinc-500 tracking-widest translate-y-[-100%] group-hover:translate-y-0 transition-transform duration-500 delay-100 block border-r-2 border-emerald-500/50 pr-2">
                    0{index + 1}
                </span>
             </div>
          </div>

          {/* Role Badge */}
          <div className="transform translate-y-4 transition-transform duration-500 group-hover:translate-y-0 pointer-events-auto items-start text-left">
 <div className="inline-flex items-center gap-2 mb-3">
               <div className="flex space-x-0.5">
                  <span className="w-0.5 h-2 bg-emerald-500/50 rounded-sm"></span>
                  <span className="w-0.5 h-1.5 bg-emerald-500/30 rounded-sm"></span>
               </div>
               <span className="font-mono text-[12px] text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-sm border border-emerald-500/10 backdrop-blur-md">
                 {role}
               </span>
            </div>
            
            {/* Name */}
            <h3 className="text-2xl text-white font-medium tracking-tight leading-tight mb-1 group-hover:text-emerald-50 transition-colors">
              {name}
            </h3>
          </div>

          {/* 3. Hidden Interaction Layer (PRESERVED LOGIC) */}
          <div className="max-h-0 overflow-hidden group-hover:max-h-16 transition-[max-height] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] pointer-events-auto">
            <div className="pt-4 flex items-center justify-between border-t border-white/10 mt-4 opacity-0 group-hover:opacity-100 transition-opacity delay-100 duration-500">
              {/* <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Online
              </span>
              
              <a href={socialLink} className="flex items-center gap-2 text-xs font-mono text-zinc-300 hover:text-white transition-colors group/link">
                <span>[CONNECT]</span>
              </a> */}
              <span className="flex items-center gap-2 text-[13px] font-mono text-zinc-100 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                {status}
              </span>


              <div className="flex items-center gap-3">
                {socials.linkedin && (
                  <a
                    href={socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md border border-white/10 text-zinc-400 hover:text-white hover:border-emerald-500/40 transition"
                  >
                    <FaLinkedinIn size={14} />
                  </a>
                )}

                {socials.instagram && (
                  <a
                    href={socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md border border-white/10 text-zinc-400 hover:text-white hover:border-pink-500/40 transition"
                  >
                    <FaInstagram size={14} />
                  </a>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* 4. Tech Accents (Refined Corner Brackets) */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-40">
          {/* Top Right - Digital Notch */}
          <div className="absolute top-0 right-0 p-3">
             <svg width="20" height="20" viewBox="0 0 20 20" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <path d="M0 0 H20 V20" fill="none" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.5" />
             </svg>
          </div>
          {/* Bottom Left - Digital Notch */}
          <div className="absolute bottom-0 left-0 p-3">
            <svg width="20" height="20" viewBox="0 0 20 20" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <path d="M20 20 H0 V0" fill="none" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.5" />
             </svg>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default TeamCard;