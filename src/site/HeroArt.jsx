// Animated hero illustration: two students coding on laptops.
// Code floats up from their screens into a shared hologram that "builds" their project.
// Layers move a little with the mouse (parallax) using --mx / --my set on the hero.

const TOK_A = [['</>', '#82aaff'], ['git push', '#3ddc84'], ['{ }', '#ffcb6b'], ['npm run dev', '#c792ea'], ['=>', '#89ddff']];
const TOK_B = [['print()', '#82aaff'], ['O(n)', '#f78c6c'], ['AI', '#3ddc84'], ['01', '#c3e88d'], ['fn()', '#c792ea']];
const STARS = [[86, 96], [520, 70], [552, 246], [52, 262], [160, 44], [452, 140], [300, 24], [118, 186], [492, 196]];

const star = (x, y) => `M${x},${y - 6} L${x + 1.6},${y - 1.6} L${x + 6},${y} L${x + 1.6},${y + 1.6} L${x},${y + 6} L${x - 1.6},${y + 1.6} L${x - 6},${y} L${x - 1.6},${y - 1.6} Z`;

export default function HeroArt() {
  return (
    <svg className="s-art" viewBox="0 0 600 480" role="img" aria-label="Two students coding on their laptops">
      <defs>
        <radialGradient id="artPortal">
          <stop offset="0" stopColor="#4c8dff" stopOpacity=".55" />
          <stop offset=".55" stopColor="#7c3aed" stopOpacity=".16" />
          <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="artDesk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#171c27" />
          <stop offset="1" stopColor="#07090c" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="artLid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2d3445" />
          <stop offset="1" stopColor="#151922" />
        </linearGradient>
        <radialGradient id="artGlowA"><stop offset="0" stopColor="#4c8dff" stopOpacity=".95" /><stop offset="1" stopColor="#4c8dff" stopOpacity="0" /></radialGradient>
        <radialGradient id="artGlowB"><stop offset="0" stopColor="#3ddc84" stopOpacity=".95" /><stop offset="1" stopColor="#3ddc84" stopOpacity="0" /></radialGradient>
        <linearGradient id="artBrand" x1="0" x2="1">
          <stop offset="0" stopColor="#4285f4" /><stop offset=".35" stopColor="#34a853" />
          <stop offset=".65" stopColor="#fbbc05" /><stop offset="1" stopColor="#ea4335" />
        </linearGradient>
        <filter id="artBlur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5" /></filter>
      </defs>

      {/* ---------- back: portal, rings, stars ---------- */}
      <g className="art-back">
        <circle cx="300" cy="200" r="196" fill="url(#artPortal)" />
        <g className="art-spin"><circle cx="300" cy="200" r="172" fill="none" stroke="rgba(130,170,255,.38)" strokeWidth="1.2" strokeDasharray="2 9" /></g>
        <g className="art-spin-rev"><circle cx="300" cy="200" r="142" fill="none" stroke="url(#artBrand)" strokeWidth="2.2" strokeDasharray="64 22 8 22" strokeLinecap="round" opacity=".6" /></g>
        {STARS.map(([x, y], i) => (
          <path key={i} className="art-twinkle" d={star(x, y)} fill={i % 3 === 0 ? '#ffcb6b' : i % 3 === 1 ? '#a5c8ff' : '#ffffff'} style={{ animationDelay: `${i * 0.45}s` }} />
        ))}
      </g>

      {/* ---------- beams from laptops to the hologram ---------- */}
      <g className="art-front">
        <path className="art-beam" d="M195,262 C195,200 236,168 254,134" stroke="#4c8dff" />
        <path className="art-beam b" d="M405,262 C405,200 364,168 346,134" stroke="#3ddc84" />

        {/* hologram window */}
        <g className="art-holo">
          <rect x="222" y="52" width="156" height="80" rx="11" fill="rgba(12,15,21,.94)" stroke="rgba(76,141,255,.6)" />
          <circle cx="236" cy="65" r="3" fill="#ff5f56" /><circle cx="246" cy="65" r="3" fill="#ffbd2e" /><circle cx="256" cy="65" r="3" fill="#27c93f" />
          <rect className="art-line l1" x="234" y="80" width="98" height="5" rx="2.5" fill="#c792ea" />
          <rect className="art-line l2" x="244" y="92" width="76" height="5" rx="2.5" fill="#82aaff" />
          <rect className="art-line l3" x="244" y="104" width="108" height="5" rx="2.5" fill="#c3e88d" />
          <rect className="art-line l4" x="234" y="116" width="42" height="5" rx="2.5" fill="#89ddff" />
          <g className="art-badge">
            <rect x="254" y="140" width="92" height="22" rx="11" fill="#3ddc84" />
            <text x="300" y="155" textAnchor="middle" className="art-badge-t">&#10004; build passed</text>
          </g>
        </g>

        {/* code floating up from the screens */}
        {TOK_A.map(([t, c], i) => (
          <text key={`a${i}`} className="art-tok" x={150 + (i % 3) * 34} y="258" fill={c} style={{ animationDelay: `${i * 1.15}s`, '--dx': `${(i % 2 ? 1 : -1) * 14}px` }}>{t}</text>
        ))}
        {TOK_B.map(([t, c], i) => (
          <text key={`b${i}`} className="art-tok" x={372 + (i % 3) * 30} y="258" fill={c} style={{ animationDelay: `${0.55 + i * 1.15}s`, '--dx': `${(i % 2 ? -1 : 1) * 14}px` }}>{t}</text>
        ))}
      </g>

      {/* ---------- student A (left, headphones) ---------- */}
      <g className="art-person a">
        <rect x="143" y="226" width="104" height="112" rx="24" fill="#141924" stroke="rgba(255,255,255,.04)" />
        <path d="M133,336 C133,282 158,256 195,256 C232,256 257,282 257,336 Z" fill="#2f6fe0" />
        <path d="M171,260 C181,276 209,276 219,260" stroke="#2457c2" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M188,270 L186,292 M202,270 L204,292" stroke="#dbe7ff" strokeWidth="2" strokeLinecap="round" />
        <g className="art-head">
          <rect x="185" y="234" width="20" height="26" rx="7" fill="#a8693f" />
          <circle cx="165" cy="214" r="6" fill="#b8744a" /><circle cx="225" cy="214" r="6" fill="#b8744a" />
          <circle cx="195" cy="211" r="30" fill="#c58252" />
          <path d="M164,207 C160,174 232,168 228,205 C220,191 200,187 184,194 C176,197 168,202 164,207 Z" fill="#1d1410" />
          <path d="M180,205 L190,203.5 M200,203.5 L210,205" stroke="#1d1410" strokeWidth="2.2" strokeLinecap="round" />
          <g className="art-blink"><circle cx="185" cy="214" r="2.8" fill="#1b120d" /><circle cx="205" cy="214" r="2.8" fill="#1b120d" /></g>
          <path d="M188,225 Q195,231 202,225" stroke="#6b3a22" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M161,212 A34,34 0 0 1 229,212" stroke="#3ddc84" strokeWidth="5" fill="none" strokeLinecap="round" />
          <rect x="155" y="203" width="11" height="21" rx="4.5" fill="#3ddc84" /><rect x="224" y="203" width="11" height="21" rx="4.5" fill="#3ddc84" />
          <ellipse className="art-glow" cx="195" cy="222" rx="34" ry="28" fill="url(#artGlowA)" />
        </g>
        <path d="M141,300 Q152,326 180,334" stroke="#2f6fe0" strokeWidth="15" fill="none" strokeLinecap="round" />
        <path d="M249,300 Q238,326 210,334" stroke="#2f6fe0" strokeWidth="15" fill="none" strokeLinecap="round" />
      </g>

      {/* ---------- student B (right, glasses + bun) ---------- */}
      <g className="art-person b">
        <rect x="353" y="226" width="104" height="112" rx="24" fill="#141924" stroke="rgba(255,255,255,.04)" />
        <path d="M374,214 C367,168 443,166 436,214 L443,262 C425,251 385,251 367,262 Z" fill="#1d1410" />
        <path d="M343,336 C343,282 368,256 405,256 C442,256 467,282 467,336 Z" fill="#8b5cf6" />
        <path d="M381,260 C391,276 419,276 429,260" stroke="#6d3fe0" strokeWidth="6" fill="none" strokeLinecap="round" />
        <g className="art-head">
          <rect x="395" y="234" width="20" height="26" rx="7" fill="#b07448" />
          <circle cx="405" cy="211" r="30" fill="#d0956a" />
          <circle cx="405" cy="176" r="13" fill="#1d1410" />
          <path d="M374,207 C376,180 434,178 436,205 C424,192 404,189 390,195 C382,198 377,202 374,207 Z" fill="#1d1410" />
          <circle cx="376" cy="228" r="2.2" fill="#fbbc05" /><circle cx="434" cy="228" r="2.2" fill="#fbbc05" />
          <g className="art-blink"><circle cx="395.5" cy="214.5" r="2.4" fill="#1b120d" /><circle cx="414.5" cy="214.5" r="2.4" fill="#1b120d" /></g>
          <rect x="387.5" y="208" width="16" height="12.5" rx="4.5" fill="rgba(160,210,255,.14)" stroke="#e6edf3" strokeWidth="1.6" />
          <rect x="406.5" y="208" width="16" height="12.5" rx="4.5" fill="rgba(160,210,255,.14)" stroke="#e6edf3" strokeWidth="1.6" />
          <path d="M403.5,213 L406.5,213" stroke="#e6edf3" strokeWidth="1.6" />
          <path d="M398,226 Q405,231.5 412,226" stroke="#7a3f25" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <ellipse className="art-glow b" cx="405" cy="222" rx="34" ry="28" fill="url(#artGlowB)" />
        </g>
        <path d="M351,300 Q362,326 390,334" stroke="#8b5cf6" strokeWidth="15" fill="none" strokeLinecap="round" />
        <path d="M459,300 Q448,326 420,334" stroke="#8b5cf6" strokeWidth="15" fill="none" strokeLinecap="round" />
      </g>

      {/* ---------- desk + laptops + props ---------- */}
      <ellipse cx="300" cy="458" rx="250" ry="16" fill="url(#artPortal)" opacity=".6" />
      <rect x="46" y="342" width="508" height="112" fill="url(#artDesk)" />
      <rect x="30" y="331" width="540" height="13" rx="6.5" fill="#232a37" />
      <rect x="40" y="331" width="520" height="1.5" rx=".75" fill="rgba(255,255,255,.14)" />

      <ellipse className="art-glow" cx="195" cy="340" rx="74" ry="9" fill="url(#artGlowA)" filter="url(#artBlur)" />
      <ellipse className="art-glow b" cx="405" cy="340" rx="74" ry="9" fill="url(#artGlowB)" filter="url(#artBlur)" />

      <g className="art-laptop">
        <path d="M140,334 L147,266 Q148,262 152,262 L238,262 Q242,262 243,266 L250,334 Z" fill="url(#artLid)" stroke="rgba(255,255,255,.1)" />
        <path d="M152,262.8 L238,262.8" stroke="rgba(255,255,255,.22)" strokeWidth="1.2" />
        <text x="195" y="306" textAnchor="middle" className="art-logo-t" fill="#4c8dff" filter="url(#artBlur)" opacity=".8">&lt;/&gt;</text>
        <text x="195" y="306" textAnchor="middle" className="art-logo-t" fill="url(#artBrand)">&lt;/&gt;</text>
        <rect x="124" y="331" width="142" height="7" rx="3.5" fill="#3b4354" />
        <rect x="185" y="335" width="20" height="3" rx="1.5" fill="#262c38" />
      </g>
      <g className="art-laptop">
        <path d="M350,334 L357,266 Q358,262 362,262 L448,262 Q452,262 453,266 L460,334 Z" fill="url(#artLid)" stroke="rgba(255,255,255,.1)" />
        <path d="M362,262.8 L448,262.8" stroke="rgba(255,255,255,.22)" strokeWidth="1.2" />
        <g className="art-chev" filter="url(#artBlur)" opacity=".7">
          <path d="M398,288 L386,300 L398,312" stroke="#fbbc05" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M420,282 L402,300 L420,318" stroke="#4285f4" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <path d="M398,288 L392,294" stroke="#ea4335" strokeWidth="5" strokeLinecap="round" />
        <path d="M392,294 L386,300 L392,306" stroke="#fbbc05" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M392,306 L398,312" stroke="#34a853" strokeWidth="5" strokeLinecap="round" />
        <path d="M420,282 L402,300 L420,318" stroke="#4285f4" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="334" y="331" width="142" height="7" rx="3.5" fill="#3b4354" />
        <rect x="395" y="335" width="20" height="3" rx="1.5" fill="#262c38" />
      </g>

      {/* coffee mug with steam */}
      <g>
        <path className="art-steam" d="M84,298 C78,288 90,282 84,272" />
        <path className="art-steam s2" d="M94,298 C88,288 100,282 94,272" />
        <path className="art-steam s3" d="M104,298 C98,288 110,282 104,272" />
        <rect x="78" y="303" width="32" height="29" rx="6" fill="#e6edf3" />
        <path d="M110,309 C123,309 123,326 110,326" stroke="#e6edf3" strokeWidth="4.5" fill="none" />
        <text x="94" y="322" textAnchor="middle" className="art-mug-t">&lt;/&gt;</text>
      </g>

      {/* plant */}
      <g className="art-plant">
        <path d="M530,312 C514,296 512,276 520,262 C530,276 534,292 530,312 Z" fill="#34a853" />
        <path d="M532,312 C544,294 556,288 566,286 C562,302 550,312 532,312 Z" fill="#3ddc84" />
        <path d="M528,312 C514,304 504,302 494,304 C502,316 516,318 528,312 Z" fill="#2c8f47" />
      </g>
      <path d="M512,334 L516,312 L544,312 L548,334 Z" fill="#1f2633" stroke="rgba(255,255,255,.08)" />
    </svg>
  );
}
