import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Terminal, 
  CalendarRange, 
  GitBranch, // Changed from Code2 for a more 'version control' vibe
  Users, 
  Cpu // Changed from Award for a hardware vibe
} from "lucide-react";

/**
 * Configuration Array
 */
const NAV_ITEMS = [
  { label: "@home", path: "/", icon: Terminal }, // Changed Home to "root"
  { label: "@events", path: "/events", icon: CalendarRange },
  { label: "@connect", path: "/connect", icon: GitBranch },
  { label: "@team", path: "/team", icon: Users },
];

const NavBar = () => {
  const location = useLocation();

  return (
    <>
      <nav
        className="
          fixed z-50 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
          
          /* Mobile: Cyber-Deck Bottom Bar */
          bottom-0 left-0 w-full h-20 px-6 pb-2
          flex flex-row justify-between items-center
          bg-[#050505]/90 backdrop-blur-md 
          border-t border-green-500/30
          shadow-[0_-5px_20px_rgba(34,197,94,0.15)]

          /* Desktop: Vertical 'Server Rack' Control Panel */
          lg:top-1/2 lg:left-8 lg:bottom-auto lg:-translate-y-1/2
          lg:w-24 lg:h-auto lg:flex-col lg:gap-6 lg:py-8 lg:px-4
          lg:bg-[#09090b]/95 lg:backdrop-blur-xl lg:rounded-md
          lg:border lg:border-green-500/20
          lg:shadow-[0_0_30px_rgba(0,255,0,0.1)]
        "
      >
        {/* Decorative 'Hardware' Screws for Desktop aesthetic */}
        <div className="hidden lg:block absolute top-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neutral-700" />
        <div className="hidden lg:block absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neutral-700" />

        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                group relative flex items-center justify-center
                transition-all duration-300 ease-out
                
                /* Mobile Sizing */
                w-12 h-12 rounded-md

                /* Desktop Sizing */
                lg:w-16 lg:h-16 lg:rounded-lg
                
                /* Active State Logic */
                ${
                  isActive
                    ? "bg-green-500/10 text-green-400 border border-green-500/50 shadow-[inset_0_0_10px_rgba(34,197,94,0.2)]"
                    : "text-neutral-500 border border-transparent hover:text-green-300 hover:bg-green-500/5 hover:border-green-500/30"
                }
              `}
            >
              {/* Active Indicator: The 'Cursor' Block */}
              {isActive && (
                <>
                  {/* Mobile: Bottom LED bar */}
                  <span className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-6 h-[2px] bg-green-500 shadow-[0_0_10px_#22c55e] lg:hidden" />
                  
                  {/* Desktop: Left 'Active Line' Indicator */}
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[2px] bg-green-400 shadow-[0_0_12px_#22c55e] hidden lg:block" />
                </>
              )}

              {/* Icon Container */}
              <div className="relative flex flex-col items-center gap-1 group-hover:-translate-y-1 transition-transform duration-200">
                <item.icon
                  size={24}
                  strokeWidth={isActive ? 2 : 1.5}
                  className={`
                    transition-all duration-300
                    ${isActive ? "drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]" : ""}
                  `}
                />
                
                {/* Mobile Micro-Label (Monospace) */}
                <span className={`
                  text-[9px] font-mono tracking-tighter uppercase 
                  transition-all duration-300 lg:hidden
                  ${isActive ? "text-green-400 opacity-100 translate-y-0" : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"}
                `}>
                  {item.label}
                </span>
              </div>

              {/* Desktop Tooltip: The "Comment" Block */}
              <div className="
                absolute left-full ml-5 px-3 py-1 
                bg-black border border-green-500/30 rounded-sm
                text-xs font-mono text-green-400
                opacity-0 -translate-x-4 pointer-events-none
                transition-all duration-200 ease-out
                group-hover:opacity-100 group-hover:translate-x-0
                hidden lg:flex items-center gap-2 whitespace-nowrap z-50
                shadow-[0_0_15px_rgba(34,197,94,0.2)]
              ">
                <span className="text-neutral-600">./</span>{item.label}
                
                {/* Connecting Line for Tech Feel */}
                <div className="absolute top-1/2 -left-3 w-3 h-[1px] bg-green-500/30" />
                <div className="absolute top-1/2 -left-3 w-1 h-1 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]" />
              </div>

            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default NavBar;