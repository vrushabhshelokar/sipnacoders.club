import React, { useState, useRef } from 'react';

import group1 from "../../assets/group1.jpg"

const Section3GroupPhoto = () => {
  // State for parallax effect
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to center of the container
    // Dividing by 25 creates a subtle "dampening" effect (higher number = slower movement)
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    
    setCoords({ x, y });
  };

  const handleMouseLeave = () => {
    // Reset position when mouse leaves to avoid "stuck" angles
    setCoords({ x: 0, y: 0 });
  };

  return (
    <section className="relative w-full py-24 px-4 md:px-8 bg-black flex justify-center items-center overflow-hidden">
      
      {/* Background Decorative Grid - Low Opacity for Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Main Viewport Container */}
      <div 
        ref={containerRef}
        className="relative group w-full max-w-6xl aspect-[4/3] md:aspect-[16/9] bg-gray-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan-900/10"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        
        {/* --- LAYER 1: The Parallax Image --- */}
        {/* Scale-110 ensures edges don't show when panning */}
        <div 
          className="absolute inset-0 transition-transform duration-300 ease-out will-change-transform"
          style={{ 
            transform: `translate(${-coords.x}px, ${-coords.y}px) scale(1.1)` 
          }}
        >
          <img 
            src={group1}
            alt="Coders Club Team"
            className="w-full h-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0"
          />
        </div>

        {/* --- LAYER 2: Digital Noise / Scanline Overlay --- */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

        {/* --- LAYER 3: HUD / UI Elements --- */}
        
        {/* Top Left: System Status */}
        <div className="absolute top-6 left-6 z-20 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-ping" />
            <span className="text-[10px] font-mono tracking-widest text-cyan-400/80">LIVE_FEED</span>
          </div>
          <span className="text-[10px] font-mono text-white/40">SEC_03 // ARCHITECTS</span>
        </div>

        {/* Top Right: Decorative Bracket */}
        <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-white/20 rounded-tr-lg" />
        
        {/* Bottom Left: The Content (Typography) */}
        <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 z-30 max-w-2xl">
          
          {/* Animated Tags */}
          <div className="flex items-center gap-3 mb-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out delay-75">
            <span className="px-2 py-1 bg-white/5 backdrop-blur-md text-xs font-mono text-cyan-300 border border-white/10 rounded">
              :: CORE_UNIT
            </span>
            <span className="text-[10px] font-mono text-gray-400">
              EST. 2024
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-2">
            The Architects
          </h2>
          
          {/* Subtext */}
          <p className="text-sm md:text-base text-gray-400 max-w-lg leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity duration-300">
            Beyond the code, we are the minds shaping the digital infrastructure. 
            <span className="hidden md:inline"> A collective of innovators, debuggers, and creators pushing the boundaries of what's possible.</span>
          </p>
        </div>

        {/* Bottom Right: Coordinates / Tech Detail */}
        <div className="absolute bottom-8 right-8 z-20 hidden md:block text-right">
          <div className="text-[10px] font-mono text-white/30 space-y-1">
            <p>X: {coords.x.toFixed(2)}</p>
            <p>Y: {coords.y.toFixed(2)}</p>
            <p>Z: 0</p>
          </div>
          {/* Decorative Corner */}
          <div className="absolute bottom-[-8px] right-[-8px] w-8 h-8 border-b-2 border-r-2 border-white/20 rounded-br-lg" />
        </div>

      </div>
    </section>
  );
};

export default Section3GroupPhoto;