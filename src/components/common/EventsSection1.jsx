import React, { useState, useEffect } from 'react';
import { Calendar, ArrowUpRight, Code2, Cpu, Trophy, Globe, Zap, GitBranch, Sparkles, Palette } from 'lucide-react';

import Flutter_Flow from "../../assets/events/flutter_flow.png"
import Devthone from "../../assets/events/devthone.png"
import Tech_Treck from "../../assets/events/tech_treck.png"
import Treasure_X from "../../assets/events/treasure_x.png"
import TechTrek26_1 from "../../assets/events/tech_trek_2026_1.jpg"
import TechTrek26_2 from "../../assets/events/tech_trek_2026_2.jpg"
import TechTrek26_3 from "../../assets/events/tech_trek_2026_3.jpg"
import GitGithub_1 from "../../assets/events/git_github_1.jpg"
import GitGithub_2 from "../../assets/events/git_github_2.jpg"
import GitGithub_3 from "../../assets/events/git_github_3.jpg"
import BuildNight_1 from "../../assets/events/gemini_buildnight_1.jpg"
import BuildNight_2 from "../../assets/events/gemini_buildnight_2.jpg"
import BuildNight_3 from "../../assets/events/gemini_buildnight_3.jpg"
import FunNight_1 from "../../assets/events/gemini_funnight_1.jpg"
import FunNight_2 from "../../assets/events/gemini_funnight_2.jpg"
import FunNight_3 from "../../assets/events/gemini_funnight_3.jpg"
import FunNight_4 from "../../assets/events/gemini_funnight_4.jpg"


// ---------------------------------------------------------------
// HOW TO ADD MORE PHOTOS TO AN EVENT (carousel):
// 1. Copy the photos into src/assets/events/
// 2. Import them above, e.g.
//      import Flutter_2 from "../../assets/events/flutter_2.png"
// 3. Add them to that event's `images` list, e.g.
//      images: [Flutter_Flow, Flutter_2, Flutter_3],
// An event with only one photo simply shows that photo (no sliding).
// ---------------------------------------------------------------

// `sortDate` is used only for ordering (YYYY-MM-DD). Newest event shows first.
// When you add a new event, give it a correct sortDate and it will land in the right place.
const eventList = [
    {
    id: 8,
    title: "Fund My Crazy – Build Night with Gemini",
    category: "Online Build Night",
    date: "30 AUG 2026",
    sortDate: "2026-08-30",
    description: "An online build night with Google Gemini where 32 students picked one of five elements, reimagined it, turned the idea into a visual using AI, and pitched it.",
    images: [BuildNight_1, BuildNight_2, BuildNight_3],
    icon: <Sparkles className="text-cyan-400" />
  },
  {
    id: 9,
    title: "Gemini Campus Fun Night & AI Art Challenge",
    category: "Online Workshop",
    date: "26 JUL 2026",
    sortDate: "2026-07-26",
    description: "A hands-on online session on creating AI art with Google Gemini, where 26 students designed a Freshers Party Night poster and pitched their creative ideas.",
    images: [FunNight_1, FunNight_2, FunNight_3],
    icon: <Palette className="text-pink-400" />
  },
    {
    id: 6,
    title: "Tech Trek 2026",
    category: "SEMINAR",
    date: "25 OCT 2026",
    sortDate: "2026-10-25",
    description: "The latest edition of our Tech Trek series, giving students insights into modern technologies and practical guidance for building a career in tech.",
    images: [TechTrek26_1, TechTrek26_2, TechTrek26_3],
    icon: <Code2 className="text-green-400" />
  },
    {
    id: 7,
    title: "Git & GitHub Workshop",
    category: "Workshop",
    date: "9 SEP 2026",
    sortDate: "2026-09-09",
    description: "A hands-on workshop on Git and GitHub, where students learned version control, branching and collaborating on code with their teams.",
    images: [GitGithub_1, GitGithub_2, GitGithub_3],
    icon: <GitBranch className="text-orange-400" />
  },
  {
    id: 2,
    title: "Devthon",
    category: "Hackathon",
    date: "20 MAR 2025",
    sortDate: "2025-03-20",
    description: "A large-scale national-level hackathon that received 300+ entries with 200+ active participants, providing a competitive platform for innovation, problem-solving, and real-world project development.",
    images: [Devthone],
    icon: <Cpu className="text-purple-400" />
  },
  {
    id: 3,
    title: "TreasureX",
    category: "Treasure Hunt",
    date: "28 Aug 2025",
    sortDate: "2025-08-28",
    description: "A fun and engaging event combining coding challenges with problem-solving activities, where 30+ students participated, making learning interactive and enjoyable.",
    images: [Treasure_X],
    icon: <Globe className="text-blue-400" />
  },
  {
    id: 4,
    title: "Tech Trek",
    category: "SEMINAR",
    date: "8 Nov 2025",
    sortDate: "2025-11-08",
    description: "An advanced continuation of the Tech Trek series, attended by 50 students, focusing on deeper insights into modern technologies and practical development guidance.",
    images: [Tech_Treck],
    icon: <Code2 className="text-green-400" />
  },
  {
    id: 5,
    title: "Prompt Engineering",
    category: "Workshop",
    date: "27 Sep 2025",
    sortDate: "2025-09-27",
    description: "A focused session on AI and prompt engineering techniques, where 40+ students participated and learned how to effectively interact with modern AI tools.",
    images: ["https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1920&auto=format&fit=crop"],
    icon: <Zap className="text-orange-400" />
  },
  {
    id: 1,
    title: "Flutter Flow",
    category: "Workshop",
    date: "25 OCT 2024",
    sortDate: "2024-10-25",
    description: "A practical workshop on no-code/low-code app development using Flutter Flow, attended by 100+ students, enabling them to build basic mobile applications efficiently.",
    images: [Flutter_Flow],
    icon: <Trophy className="text-yellow-400" />
  }
];

// Newest first: 2025 events (latest month on top), then 2024 at the bottom
const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

// Turns "25 OCT 2024" into a real date
const parseEventDate = (text) => {
  const [day, month, year] = text.trim().split(/\s+/);
  return new Date(Number(year), MONTHS[month.toLowerCase().slice(0, 3)], Number(day));
};

const today = new Date();
today.setHours(0, 0, 0, 0);

const events = [...eventList]
  .filter((e) => parseEventDate(e.date) <= today)                    // hide future events
  .sort((a, b) => parseEventDate(b.date) - parseEventDate(a.date));  // newest first

// Auto-sliding image carousel. Slides only when `active` is true.
const ImageCarousel = ({ images, alt, active = true, interval = 3000 }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || images.length < 2) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [active, images.length, interval]);

  // Start from the first photo again whenever this carousel becomes inactive
  useEffect(() => {
    if (!active) setIndex(0);
  }, [active]);

  return (
    <div className="absolute inset-0">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`${alt} ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${i === index ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}

      {images.length > 1 && (
        <div className="absolute top-6 left-6 z-20 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show photo ${i + 1}`}
              onClick={(e) => { e.stopPropagation(); setIndex(i); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-cyan-400' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

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

          {/* LEFT: Event list (hover a card to show its photos on the right) */}
          <div className="lg:w-1/2 flex flex-col gap-6">
            {events.map((event) => {
              const isActive = activeEvent.id === event.id;

              return (
                <div
                  key={event.id}
                  onMouseEnter={() => setActiveEvent(event)}
                  className={`group relative p-8 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
                    ${isActive
                      ? 'bg-white/5 border-cyan-500/50 shadow-lg shadow-cyan-900/20'
                      : 'bg-transparent border-white/5 hover:border-white/20'
                    }`}
                >
                  {/* Hover Gradient Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />

                  <div className="relative z-10 flex flex-col gap-4">
                    {/* Header: Category & Date */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono tracking-widest uppercase px-2 py-1 rounded border ${isActive ? 'text-cyan-400 border-cyan-500/30' : 'text-gray-500 border-white/10'}`}>
                        {event.category}
                      </span>
                      <div className="flex items-center gap-2 text-gray-400 text-sm font-mono">
                        <Calendar size={14} />
                        {event.date}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="flex items-start justify-between">
                      <h3 className={`text-2xl font-bold transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                        {event.title}
                      </h3>
                      <div className={`transform transition-transform duration-300 ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
                        <ArrowUpRight className="text-cyan-400" />
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                      {event.description}
                    </p>

                    {/* Mobile-only photos (carousel) */}
                    <div className="lg:hidden relative mt-4 rounded-lg overflow-hidden h-48 w-full border border-white/10">
                      <ImageCarousel images={event.images} alt={event.title} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Sticky visual with photo carousel - hidden on mobile */}
          <div className="hidden lg:block lg:w-1/2 relative">
            <div className="sticky top-24 h-[600px] w-full rounded-3xl overflow-hidden border border-white/10 bg-gray-900 shadow-2xl">

              {events.map((event) => {
                const isActive = activeEvent.id === event.id;
                return (
                  <div
                    key={event.id}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out transform
                      ${isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0 pointer-events-none'}`}
                  >
                    {/* Photos (auto-slide when this event is active) */}
                    <ImageCarousel images={event.images} alt={event.title} active={isActive} />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 p-10 w-full pointer-events-none">
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
                );
              })}

              {/* Decorative Tech Elements on the Frame */}
              <div className="absolute top-6 right-6 flex gap-2 z-20">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>

              <div className="absolute bottom-6 right-6 z-20 font-mono text-[10px] text-white/30 tracking-widest">
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
