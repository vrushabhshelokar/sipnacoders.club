import React from 'react';
import { Calendar, Clock, MapPin, Trophy, ArrowRight, Zap } from 'lucide-react';

import { useNavigate } from "react-router-dom";

import membership from "../../assets/posters/membership.png"

const Membership = () => {
  const navigate = useNavigate(); 
  return (
    <section className="relative w-full py-24 bg-transparent overflow-hidden text-neutral-200 selection:bg-purple-500/30">

      {/* 1. Background Ambient Glows (Performance Optimized) */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Injecting custom keyframes for the button shimmer effect */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(150%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear; 
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center relative z-10">
        
        {/* --- LEFT COLUMN: The Artifact (Poster) [Previously Right] --- */}
        <div className="lg:col-span-5 relative perspective-1000">
          
          {/* Decorative Back Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-full blur-3xl -z-10" />

          {/* 3D Poster Container */}
          <div className="group relative w-full aspect-[3/4] rounded-2xl transition-all duration-500 hover:rotate-y-6 hover:scale-[1.02] perspective-origin-center">
            
            {/* The Border/Glow Wrapper */}
            <div className="absolute -inset-[1px] bg-gradient-to-b from-neutral-700 to-neutral-900 rounded-2xl z-0 group-hover:from-purple-500/50 group-hover:to-blue-500/50 transition-colors duration-500" />
            
            {/* The Image Wrapper */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-neutral-900 z-10">
              {/* Placeholder Image: Use an abstract tech image */}
              <img 
                src={membership}
                alt="Codexia Event Poster" 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 scale-100 group-hover:scale-105"
              />
              
              {/* Overlay Gradient (Vignette) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

              {/* Poster Content Overlay (Text on Poster) */}
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                  <Zap className="w-4 h-4 fill-current" />
                  <span className="text-xs font-mono uppercase tracking-widest">Sipna Coders Club</span>
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Coders Community</h3>
              </div>

              {/* Glass Reflection Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          </div>

          {/* Floating Decorative Elements behind poster */}
          <div className="absolute -top-6 -right-6 w-24 h-24 border border-neutral-800 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite] opacity-50">
             <div className="w-2 h-2 bg-neutral-600 rounded-full" />
          </div>

        </div>

        {/* --- RIGHT COLUMN: The Briefing (Content) [Previously Left] --- */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          
          {/* Status Badge */}
          <div className="w-fit mb-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-mono tracking-wider">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              REGISTRATIONS LIVE
            </div>
          </div>

          {/* Headline Typography */}
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 leading-[0.9]">
            Join Coders Community <span className="text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-indigo-500"></span>
          </h2>

          {/* <p className="text-neutral-400 text-lg md:text-xl leading-relaxed max-w-2xl mb-10 font-light">
            CONFUSED ABOUT WHICH TECH DOMAIN TO CHOOSE?,
            Your technology journey starts with exploring the right path.
          </p> */}

          {/* HUD Data Grid: The "Technical" Details */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <InfoCard 
              icon={<Calendar className="w-4 h-4 text-purple-400" />} 
              label="DATE" 
              value="26 Sep" 
            />
            <InfoCard 
              icon={<Clock className="w-4 h-4 text-blue-400" />} 
              label="DURATION" 
              value="1:30hr" 
            />
            <InfoCard 
              icon={<Trophy className="w-4 h-4 text-yellow-400" />} 
              label="PRIZE POOL" 
              value="₹3,500 INR + Certificate" 
            />
             <InfoCard 
              icon={<MapPin className="w-4 h-4 text-emerald-400" />} 
              label="VENUE" 
              value="CSE Seminar Hall, Block B" 
            />
          </div> */}

          {/* Magnetic Call To Action */}
          <div className="flex flex-wrap gap-4">
            <button 
            onClick={() =>
  window.open(
    "https://forms.gle/JJd8cno31C1ExZMh8",
    "_blank",
    "noopener,noreferrer"
  )
}
            className="group relative px-8 py-4 bg-white text-black font-bold text-sm tracking-wide rounded-lg overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <span className="relative z-10 flex items-center gap-2">
                Become The Part Of Community <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-200/50 to-transparent w-full h-full -translate-x-full group-hover:animate-shimmer z-0 pointer-events-none" />
            </button>
            
            {/* <button className="px-8 py-4 text-neutral-300 font-medium text-sm hover:text-white transition-colors flex items-center gap-2">
               DOWNLOAD RULEBOOK
            </button> */}
          </div>
        </div>

      </div>
    </section>
  );
};

// Reusable "HUD" Card Component
const InfoCard = ({ icon, label, value }) => (
  <div className="flex flex-col p-4 border border-neutral-800 bg-neutral-900/40 rounded-lg hover:border-purple-500/30 transition-colors duration-300 group">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-1.5 rounded bg-neutral-800 text-neutral-400 group-hover:bg-neutral-800/80 group-hover:text-white transition-colors">
        {icon}
      </div>
      <span className="text-xs font-mono text-neutral-500 tracking-wider group-hover:text-neutral-400 transition-colors">{label}</span>
    </div>
    <span className="text-sm font-semibold text-neutral-200 group-hover:text-white transition-colors">{value}</span>
  </div>
);



export default Membership;