import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react'; // Assuming you use Lucide icons

const events = [
  { id: '01', title: 'Code_Jam', date: '12 OCT', category: 'COMPETITION', img: 'url_to_image_1' },
  { id: '02', title: 'Tech_Talks', date: '18 NOV', category: 'SEMINAR', img: 'url_to_image_2' },
  { id: '03', title: 'Hack_Night', date: '05 DEC', category: 'HACKATHON', img: 'url_to_image_3' },
  { id: '04', title: 'Git_Workshop', date: '20 JAN', category: 'WORKSHOP', img: 'url_to_image_4' },
];

export default function EventPipeLine() {
  const [activeId, setActiveId] = useState('01');

  return (
    <section className="bg-transparent py-24 px-4 min-h-screen flex flex-col justify-center">
      
      {/* Section Header */}
      <div className="mb-12 max-w-7xl mx-auto w-full border-b border-white/10 pb-4 flex justify-between items-end">
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
          SYSTEM EVENTS <span className="text-indigo-500">.LOG</span>
        </h2>
        <span className="hidden md:block font-mono text-xs text-zinc-500">
          // HOVER_TO_EXPAND_MODULES
        </span>
      </div>

      {/* The Accordion Container */}
      <div className="flex flex-col lg:flex-row gap-4 h-[120vh] lg:h-[600px] w-full max-w-7xl mx-auto">
        {events.map((event) => {
          const isActive = activeId === event.id;
          
          return (
            <div
              key={event.id}
              onMouseEnter={() => setActiveId(event.id)}
              className={`
                relative cursor-pointer overflow-hidden rounded-2xl border border-white/10
                transition-[flex] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
                group
                ${isActive ? 'flex-[1] lg:flex-[3.5] opacity-100' : 'flex-[1] opacity-70 hover:opacity-100'}
              `}
            >
              {/* Background Image / Texture */}
              <div className="absolute inset-0 bg-zinc-900">
                <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10`} />
                {/* Replace div below with actual <img> tag */}
                <div className={`w-full h-full bg-indigo-900/20 bg-[url('${event.img}')] bg-cover bg-center transition-transform duration-700 ${isActive ? 'scale-100' : 'scale-125'}`} />
              </div>

              {/* Content Layout */}
              <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 md:p-10">
                
                {/* Top: ID & Category */}
                <div className={`flex justify-between items-start transition-all duration-500 ${isActive ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 lg:opacity-100'}`}>
                  <span className="font-mono text-xs text-indigo-400 border border-indigo-500/30 px-2 py-1 rounded bg-indigo-500/10">
                    {event.id}
                  </span>
                  {/* Vertical Text for collapsed state on Desktop */}
                  <span className={`hidden lg:block font-mono text-xs text-white/50 tracking-widest transition-all duration-500 ${isActive ? 'opacity-0' : 'opacity-100 [writing-mode:vertical-rl] rotate-180 translate-y-12'}`}>
                    {event.date}
                  </span>
                </div>

                {/* Bottom: Title & Action */}
                <div className="relative">
                  {/* Collapsed Title (Vertical on Desktop when inactive) */}
                  <h3 className={`
                    text-3xl font-bold text-white uppercase tracking-tighter
                    lg:absolute lg:bottom-0 lg:left-0 lg:origin-bottom-left lg:transition-all lg:duration-500 lg:whitespace-nowrap
                    ${isActive 
                      ? 'lg:opacity-0 lg:translate-y-4 lg:pointer-events-none' 
                      : 'lg:opacity-100 lg:-rotate-90 lg:translate-x-8 lg:translate-y-0'}
                  `}>
                    {event.title}
                  </h3>

                  {/* Expanded Content (Visible only when active) */}
                  <div className={`transition-all duration-500 delay-100 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 absolute bottom-0 left-0 w-full'}`}>
                    <p className="font-mono text-indigo-400 text-sm mb-2">{event.date} // {event.category}</p>
                    <h3 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase leading-none">
                      {event.title}
                    </h3>
                    <p className="text-zinc-400 max-w-md mb-8 hidden md:block">
                      Initialize your participation protocol. Seats are allocated on a first-commit basis.
                    </p>
                    
                    <button className="bg-white text-black px-6 py-3 font-mono text-sm font-bold uppercase hover:bg-indigo-400 transition-colors flex items-center gap-2 group/btn">
                      Register Now
                      <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}