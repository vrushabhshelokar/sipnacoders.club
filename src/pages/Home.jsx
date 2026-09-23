import React, { useState, useEffect } from 'react';

import { useNavigate } from "react-router-dom";

import { Terminal, Cpu, Globe, Code2, ArrowRight, ChevronRight, Layers, Zap } from 'lucide-react';

import NavBar from '../components/navbars/NavBar';

import CodexiaEventSection from '../components/upcomingEvent/CodexiaEventSection';
import Membership from '../components/upcomingEvent/Membership';

import LogoNav from '../components/navbars/LogoNav';

import Border from '../components/common/Border';

import Section3GroupPhoto from '../components/common/Section3GroupPhoto';

import Footer from '../components/footer/Footer';

import SplashCursor from '../blocks/Splash/SplashCursor';

/* DESIGN SYSTEM CONFIGURATION
  - Background: #050505 (Void)
  - Primary Accent: Emerald-500 (Success/Compile)
  - Secondary Accent: Cyan-400 (Runtime)
  - Surface: White/5 (Glass)
*/

const HomePage = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Handle scroll for navbar glass effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden">
      <LogoNav />
      <SplashCursor />
      {/* --- GLOBAL BACKGROUND GRID --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
      </div>


      {/* --- NAVIGATION: The Floating Console --- */}
      <NavBar />
      {/* <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-[#050505]/80 backdrop-blur-md border-white/5 py-4' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 font-mono font-bold text-xl tracking-tighter">
            <span className="text-emerald-500">./</span>CODERS<span className="text-neutral-500">_CLUB</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-mono text-sm text-neutral-400">
            {['Events', 'Tracks', 'Projects', 'Leaderboard'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-emerald-400 transition-colors">
                {item}
              </a>
            ))}
          </div>
          <button className="hidden md:flex items-center gap-2 px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-mono text-xs transition-all group">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            JOIN_SERVER
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </nav> */}

      {/* --- HERO SECTION: The Compiler --- */}
      <section className="relative z-10 pt-40 pb-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 pt-0 pb-0 px-0 sm:pt-40 sm:pb-24 sm:px-6 max-w-7xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs">
            <Terminal className="w-3 h-3" />
            <span>v2.0 System Online</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-500">
              Compile Your
            </span>
            <br />
            <span className="font-mono text-emerald-400">Future_</span>
          </h1>

          <p className="text-lg text-neutral-400 max-w-lg leading-relaxed">
            Not just a club. A runtime environment for the next generation of software engineers. Build, break, and ship code that matters.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() =>
  window.open(
    "https://forms.gle/5a85cYhy9zy8Jw5s9",
    "_blank",
    "noopener,noreferrer"
  )
}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition-all flex items-center gap-2 group">
              Join Coders Community
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                document
                  .getElementById("section2")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-4 bg-transparent border border-white/10 hover:border-white/30 text-white rounded-lg transition-all font-mono"
            >
              View_Documentation
            </button>
          </div>
        </div>

        {/* Hero Visual: The "Glass Terminal" Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-[#0A0A0B] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
              <div className="text-xs font-mono text-neutral-500">main.tsx — bash</div>
            </div>
            {/* Terminal Body */}
            <div className="p-6 font-mono text-sm space-y-4 text-neutral-300">
              <div className="flex">
                <span className="text-emerald-500 mr-2">➜</span>
                <span className="text-cyan-400">~</span>
                <span className="ml-2">init coders_club</span>
              </div>
              <div className="text-neutral-500">
                Loaded modules:<br />
                - Creative_Computing<br />
                - Data_Structures<br />
                - System_Design
              </div>
              <div className="flex">
                <span className="text-emerald-500 mr-2">➜</span>
                <span className="text-cyan-400">~</span>
                <span className="ml-2 animate-pulse">_</span>
              </div>
            </div>
          </div>
        </div>
        <Border />
      </section>



      {/* --- BENTO GRID: Tracks & Focus --- */}
      <section id="section2"
        className="
            relative
            w-full
            overflow-visible
        "
      >
        <CodexiaEventSection />
      </section>

      <section id="section2"
        className="
            relative
            w-full
            overflow-visible
        "
      >
        <Membership />
      </section>

      <section
        className="
            relative
            w-full
            overflow-visible
        "
      >
        <Section3GroupPhoto />
      </section>

      {/* <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-4">Core_Modules</h2>
            <p className="text-neutral-400 max-w-md">Select a specialization track to begin your journey.</p>
          </div>
          <div className="hidden md:block font-mono text-xs text-neutral-600">
            // INDEX: 01-04
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-4 h-auto md:h-[600px]">
          
          Main Large Card 
          <div className="md:col-span-2 md:row-span-2 p-8 rounded-2xl bg-neutral-900/40 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 group relative overflow-hidden flex flex-col justify-end">
             <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
             <div className="relative z-10">
                <div className="bg-emerald-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-emerald-500/20 text-emerald-400">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">Full Stack Engineering</h3>
                <p className="text-neutral-400 mb-6">Master the modern web. From React & Tailwind to Node & Postgres. Build scalable applications from scratch.</p>
                <div className="flex gap-2">
                   {['React', 'Next.js', 'PostgreSQL'].map(tag => (
                     <span key={tag} className="text-xs font-mono px-2 py-1 rounded bg-white/5 border border-white/10 text-neutral-300">{tag}</span>
                   ))}
                </div>
             </div>
          </div>

          Secondary Card 1 
          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-white/5 hover:border-cyan-500/30 transition-all duration-300 group flex flex-col justify-between">
            <div className="bg-cyan-500/10 w-10 h-10 rounded-lg flex items-center justify-center border border-cyan-500/20 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold mt-4 mb-1 group-hover:text-cyan-400 transition-colors">Systems & Cloud</h3>
              <p className="text-sm text-neutral-500">Docker, Kubernetes, and low-level architecture.</p>
            </div>
          </div>

          Secondary Card 2 
          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-white/5 hover:border-purple-500/30 transition-all duration-300 group flex flex-col justify-between">
             <div className="bg-purple-500/10 w-10 h-10 rounded-lg flex items-center justify-center border border-purple-500/20 text-purple-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold mt-4 mb-1 group-hover:text-purple-400 transition-colors">DSA & Competitive</h3>
              <p className="text-sm text-neutral-500">Ace the interview. Master algorithms and optimization.</p>
            </div>
          </div>

        </div>
      </section> */}

      {/* --- STATS TICKER: Minimalist --- */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Participants', value: '400+' },
            { label: 'Event_Conducted', value: '5+' },
            { label: 'Lines_Of_Code', value: '' },
            { label: 'Workshops', value: '2' }
          ].map((stat, i) => (
            <div key={i} className="text-center md:text-left">
              <div className="text-3xl font-mono font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs font-mono text-neutral-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FOOTER: Simple Command Line --- */}
      <Footer />

    </div>
  );
};

export default HomePage;