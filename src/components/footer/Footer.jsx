import React from 'react';
import { ArrowRight, Github, Twitter, Instagram, Terminal, Zap } from 'lucide-react';

import { Link, useLocation } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative bg-zinc-950 text-zinc-400 py-10 overflow-hidden border-t border-zinc-900 font-sans">
      
      {/* Background Decor: Subtler Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Main Control Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start mb-10">
          
          {/* 1. Identity Module (Col 1-4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-zinc-100">
              <div className="p-1.5 bg-zinc-900 rounded border border-zinc-800 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <Terminal size={18} className="text-cyan-500" />
              </div>
              <span className="text-lg font-bold tracking-tight">CODERS CLUB</span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              Optimized for performance. Built for builders. The central hub for algorithmic excellence.
            </p>
          </div>

          {/* 2. Navigation Module (Col 5-8) */}
          <div className="lg:col-span-4 flex gap-8 md:gap-12 text-sm">
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold text-zinc-100 text-xs uppercase tracking-wider mb-1">Index</h4>
              <a href="/" className="hover:text-cyan-400 transition-colors">Home</a>
              <a href="/events" className="hover:text-cyan-400 transition-colors">Events</a>
              <a href="/connect" className="hover:text-cyan-400 transition-colors">Connect</a>
              <a href="/team" className="hover:text-cyan-400 transition-colors">Team</a>
            </div>
            {/* <div className="flex flex-col gap-2">
              <h4 className="font-semibold text-zinc-100 text-xs uppercase tracking-wider mb-1">System</h4>
              <a href="#" className="hover:text-cyan-400 transition-colors">Docs</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">API</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Status</a>
            </div> */}
          </div>

          {/* 3. Input Module (Col 9-12) */}
          <div className="lg:col-span-4">
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-zinc-100 text-xs uppercase tracking-wider">Join Network</h4>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="init_email_sequence..." 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-zinc-600"
                />
                <button className="absolute right-1 top-1 p-1 bg-zinc-800 hover:bg-cyan-500 hover:text-white rounded text-zinc-400 transition-colors">
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar / Copyright */}
        <div className="pt-6 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          
          <div className="flex items-center gap-6 text-zinc-500">
            <span>© 2026 Coders Club</span>
            <span className="hidden md:inline">v2.0 (Stable)</span>
          </div>

          <div className="flex items-center gap-2 group cursor-default">
            <span className="text-[20px] uppercase tracking-[0.2em] text-zinc-600">Dev:</span>
            <span className="font-mono text-[17px] text-zinc-400 group-hover:text-cyan-400 transition-colors duration-300">
              vrushabh shelokar
            </span>
          </div>

          <div className="flex items-center gap-4">
             {/* Live Status Indicator */}
            <div className="flex items-center gap-2 bg-zinc-900/50 px-2 py-1 rounded border border-zinc-800/50">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[10px] text-emerald-500 tracking-widest">ONLINE</span>
            </div>

            {/* Compact Socials */}
            <div className="flex gap-3">
              {/* <a href="#" className="hover:text-white transition-colors"><Github size={14} /></a>
              <a href="#" className="hover:text-white transition-colors"><Twitter size={14} /></a> */}
              <a href="https://www.instagram.com/sipnacoders.club?igsh=NnJkNHFzcXM0dnF0" className="hover:text-white transition-colors"><Instagram size={14} /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Background Text - Cropped for Compact Height */}
      <h1 className="absolute -bottom-6 -right-6 text-[120px] font-bold text-zinc-900/30 select-none pointer-events-none z-0 tracking-tighter leading-none overflow-hidden">
        DEV
      </h1>
    </footer>
  );
};

export default Footer;