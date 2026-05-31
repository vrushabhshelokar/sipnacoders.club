import React, { useState } from 'react';
import { Calendar, MapPin, ArrowUpRight, Code2, Cpu, Trophy, Globe, Zap } from 'lucide-react';

import Flutter_Flow from "../../assets/events/flutter_flow.png"
import Devthone from "../../assets/events/devthone.png"
import Tech_Treck from "../../assets/events/tech_treck.png"
import Treasure_X from "../../assets/events/treasure_x.png"

// Mock Data for 5 Premium Events
const events = [
  {
    id: 1,
    title: "Flutter Flow ",
    category: "Workshop",
    date: "25 OCT 2024",
    description: "A practical workshop on no-code/low-code app development using Flutter Flow, attended by 100+ students, enabling them to build basic mobile applications efficiently.",
    image: Flutter_Flow,
    icon: <Trophy className="text-yellow-400" />
  },
  {
    id: 2,
    title: "Devthon",
    category: "Hackathon",
    date: "20 MAR 2024",
    description: "A large-scale national-level hackathon that received 300+ entries with 200+ active participants, providing a competitive platform for innovation, problem-solving, and real-world project development.",
    image: Devthone,
    icon: <Cpu className="text-purple-400" />
  },
  {
    id: 3,
    title: "TreasureX",
    category: "Treasure Hunt",
    date: " 28 Aug 2025",
    description: "A fun and engaging event combining coding challenges with problem-solving activities, where 30+ students participated, making learning interactive and enjoyable.",
    image: Treasure_X,
    icon: <Globe className="text-blue-400" />
  },
  {
    id: 4,
    title: "Tech Trek",
    category: "SEMINAR",
    date: "8 Nov 2025",
    description: "An advanced continuation of the Tech Trek series, attended by 50 students, focusing on deeper insights into modern technologies and practical development guidance.",
    image: Tech_Treck,
    icon: <Code2 className="text-green-400" />
  },
  {
    id: 5,
    title: "Prompt Engineering",
    category: "Workshop",
    date: "27 Sep 2025",
    description: "A focused session on AI and prompt engineering techniques, where 40+ students participated and learned how to effectively interact with modern AI tools.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1920&auto=format&fit=crop",
    icon: <Zap className="text-orange-400" />
  }
];

const EventGallery = () => {
  const [activeEvent, setActiveEvent] = useState(events[0]);

  return (
    <section className="relative bg-transparent text-white py-24 px-4 md:px-12 w-full overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <div className="mb-16 md:mb-24">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
            Past <span className="text-gray-600">Operations</span>
          </h2>
          <div className="h-1 w-20 bg-cyan-500 rounded-full" />
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

          {/* LEFT: The "Script" (Scrollable List) */}
          <div className="lg:w-1/2 flex flex-col gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                onMouseEnter={() => setActiveEvent(event)}
                className={`group relative p-8 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
                  ${activeEvent.id === event.id
                    ? 'bg-white/5 border-cyan-500/50 shadow-lg shadow-cyan-900/20'
                    : 'bg-transparent border-white/5 hover:border-white/20'
                  }`}
              >
                {/* Hover Gradient Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent transition-opacity duration-300 ${activeEvent.id === event.id ? 'opacity-100' : 'opacity-0'}`} />

                <div className="relative z-10 flex flex-col gap-4">
                  {/* Header: Category & Date */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono tracking-widest uppercase px-2 py-1 rounded border ${activeEvent.id === event.id ? 'text-cyan-400 border-cyan-500/30' : 'text-gray-500 border-white/10'}`}>
                      {event.category}
                    </span>
                    <div className="flex items-center gap-2 text-gray-400 text-sm font-mono">
                      <Calendar size={14} />
                      {event.date}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="flex items-start justify-between">
                    <h3 className={`text-2xl font-bold transition-colors ${activeEvent.id === event.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                      {event.title}
                    </h3>
                    <div className={`transform transition-transform duration-300 ${activeEvent.id === event.id ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
                      <ArrowUpRight className="text-cyan-400" />
                    </div>
                  </div>

                  {/* Description (Visible only if active or on mobile) */}
                  <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                    {event.description}
                  </p>

                  {/* Mobile-Only Image (Visible only on small screens) */}
                  <div className="lg:hidden mt-4 rounded-lg overflow-hidden h-48 w-full border border-white/10">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: The "Screen" (Sticky Visual) - Hidden on Mobile */}
          <div className="hidden lg:block lg:w-1/2 relative">
            <div className="sticky top-24 h-[600px] w-full rounded-3xl overflow-hidden border border-white/10 bg-gray-900 shadow-2xl">

              {/* Animated Image Switcher */}
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out transform
                    ${activeEvent.id === event.id
                      ? 'opacity-100 scale-100 z-10'
                      : 'opacity-0 scale-105 z-0'
                    }`}
                >
                  {/* Image */}
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 p-10 w-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white">
                        {event.icon}
                      </div>
                      <div className="h-px w-20 bg-white/20" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-2">{event.title}</h2>
                    <p className="text-gray-300 font-light">{event.description}</p>
                  </div>
                </div>
              ))}

              {/* Decorative Tech Elements on the Frame */}
              <div className="absolute top-6 right-6 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>

              <div className="absolute bottom-6 right-6 font-mono text-[10px] text-white/30 tracking-widest">
                ID: {activeEvent.id.toString().padStart(3, '0')} // RENDER_MODE: ACTIVE
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventGallery;