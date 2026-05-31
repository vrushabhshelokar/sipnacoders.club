import React from 'react';
import TeamCard from '../components/common/TeamCards';

import pranav from "../assets/people/pranav.jpg"
import preet from "../assets/people/preet.jpg"
import vrushabh from "../assets/people/vrush.jpg"
import shreya from "../assets/people/shreya.jpg"
import vaishnavi from "../assets/people/vaishnavi.jpg"
import nandita from "../assets/people/nandita.jpg"
import ritesh from "../assets/people/ritesh.jpg"
import sakshi from "../assets/people/sakshi.jpg"
import harshdeep from "../assets/people/harshdeep.jpg"
import disha from "../assets/people/disha.jpg"

import images from "../assets/people/images.jpg"

import Footer from '../components/footer/Footer';
import NavBar from "../components/navbars/NavBar";

// Sample Data Structure
const CORE_TEAM = [
  {
    name: "Pranav Raut",
    role: "President",
    img: pranav,
    status: "3rd CSE",
    socials: {
      linkedin: "https://www.linkedin.com/in/rautpranav13/",
      instagram: "https://www.instagram.com/raut.pranav13/",
    },
  },
  {
    name: "Prit Thombare",
    role: "Vice President",
    img: preet,
    status: "3rd CSE",
    socials: {
      linkedin: "https://www.linkedin.com/in/pritthombare/",
      instagram: "https://www.instagram.com/gaauureeee/",
    },
  },
  {
    name: "Vrushabh Shelokar",
    role: "Technical Head (Frontend & UI)",
    img: vrushabh,
    status: "2nd CSE",
    socials: {
      linkedin: "https://www.linkedin.com/in/vrushabhshelokar/",
      instagram: "https://www.instagram.com/vrush_1337/",
    },
  },
  {
    name: "Vaishnavi Jaiswal",
    role: "Secretary",
    img: vaishnavi,
    status: "—",
    socials: {},
  },
  {
    name: "Shreya Gulhane",
    role: "Public Relation Officer",
    img: shreya,
    status: "—",
    socials: {},
  },
  {
    name: "Nandita Sahu",
    role: "Public Relation Officer",
    img: nandita,
    status: "—",
    socials: {},
  },
  {
    name: "Uday Shivarkar",
    role: "Treasurer",
    img: images,
    status: "—",
    socials: {},
  },
  {
    name: "Ritesh Pawar",
    role: "Executive Head",
    img: ritesh,
    status: "—",
    socials: {},
  },
  {
    name: "Sakshi Bawankar",
    role: "Executive Member",
    img: sakshi,
    status: "—",
    socials: {},
  },
  {
    name: "Harshdip Patil",
    role: "Executive Member",
    img: harshdeep,
    status: "—",
    socials: {},
  },
  {
    name: "Amrita Dahake",
    role: "Executive Member",
    img: images,
    status: "—",
    socials: {},
  },
  {
    name: "Disha Deshmukh",
    role: "Executive Member",
    img: disha,
    status: "—",
    socials: {},
  },
];


const Team = () => {
  return (
    <div className="relative min-h-screen w-full bg-transparent text-white selection:bg-emerald-500/30">



      {/* 🧭 Navigation */}
      <NavBar active="/" />
      {/* 1. Global Noise Overlay (Consistency with Home) */}
         {/* --- GLOBAL BACKGROUND GRID --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
      </div>

      {/* 2. Header Section */}
      <header className="flex flex-col items-center mt-32 mb-24 relative px-4 select-none">
        {/* 1. Background Atmosphere & Depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12)_0%,transparent_70%)] blur-3xl -z-10" />

        {/* 2. Top Metadata Layer */}
        <div className="flex items-center gap-4 mb-6 animate-fade-in">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-cyan-500/50" />
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-cyan-500/70">
            Directory_v2.0
          </span>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-cyan-500/50" />
        </div>

        {/* 3. Main Heading with Optical Refinement */}
        <div className="relative group">
          {/* Corner Accents */}
          <div className="absolute -top-4 -left-8 w-4 h-4 border-t border-l border-cyan-500/30 group-hover:border-cyan-400 transition-colors" />
          <div className="absolute -bottom-4 -right-8 w-4 h-4 border-b border-r border-cyan-500/30 group-hover:border-cyan-400 transition-colors" />

          <h1 className="text-6xl md:text-8xl lg:text-[11rem] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20 uppercase">
            Core<span className="text-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">.</span>Lead
          </h1>
        </div>

        {/* 4. Bottom Technical Subtext */}
        <div className="mt-8 flex flex-col items-center">
          <div className="h-12 w-px bg-gradient-to-b from-cyan-500 to-transparent mb-4" />
          <p className="max-w-md text-center text-zinc-500 text-xs md:text-sm leading-relaxed font-light tracking-wide italic">
            Architecting the digital frontier through collective intelligence
            <span className="block mt-1 text-[10px] font-mono not-italic text-zinc-600 uppercase tracking-widest">
              [ 44.4091° N, 110.5017° W ]
            </span>
          </p>
        </div>
      </header>

      {/* 3. Core Committee Grid */}
      <section className="relative z-10 px-6 md:px-12 max-w-7xl mx-auto mb-24 ">


        {/* The Grid Wrapper */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-t border-l border-zinc-800">
          {CORE_TEAM.map((member, idx) => (
            <TeamCard key={idx} index={idx} {...member} />
          ))}
        </div>
      </section>
      <div className="relative w-full h-24 flex items-center justify-center overflow-hidden bg-transparent">

        {/* 1. The Main Gradient Line (Fades out at edges) */}
        <div className="absolute w-full max-w-6xl h-[1px] bg-gradient-to-r from-transparent via-cyan-900 to-transparent opacity-50"></div>

        {/* 2. The Glowing Core Line (Shorter, Brighter) */}
        <div className="absolute w-1/3 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>

        {/* 3. Central Node (Diamond Shape) */}
        <div className="relative z-10 w-4 h-4 bg-black border border-cyan-500/50 rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
        </div>

        {/* 4. Decorative Brackets (Left & Right) */}
        <div className="absolute left-1/2 -translate-x-[200px] text-cyan-900/40 text-xs font-mono select-none">
        //
        </div>
        <div className="absolute right-1/2 translate-x-[200px] text-cyan-900/40 text-xs font-mono select-none">
        //
        </div>

      </div>

      <Footer />

    </div>
  );
};

export default Team;