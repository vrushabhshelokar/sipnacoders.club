/*!
 * Sipna Coders Club - opening animation
 * ------------------------------------------------------------------
 * Plain JavaScript, no libraries, no React. It draws a full-screen
 * intro on top of the site, then removes itself completely, so the
 * existing app is never touched.
 *
 * Sequence (about 6.5 seconds, click / tap / any key skips):
 *   1. Code rain. A 3D laptop rises and swings round, the lid (club logo
 *      glowing on the back) opens and the screen powers on like an old TV
 *   2. It types "sudo login", then "sipna coders club" - every key on the
 *      keyboard lights up as its letter is typed (RGB in the logo colours)
 *   3. A loading line runs to 100%, then "ACCESS GRANTED" glitches in,
 *      the keyboard flashes green and the laptop shakes
 *   4. The camera dives into the laptop screen...
 *   5. ...and thousands of particles spiral in and build the club logo:
 *      flash, shockwave, HUD rings, "SIPNA CODERS CLUB" decrypts
 *   6. Warp jump: the screen opens from the logo into the website
 *
 * Loaded by ONE line in index.html, just above the main.jsx script:
 *   <script src="/intro/intro.js"></script>
 *
 * It plays only on a visitor's FIRST visit (remembered in the browser).
 * Every later visit - refresh, new tab, next day - opens the website directly.
 * Replay any time by adding ?intro to the URL (or clear the "scc-intro-seen" key in the browser).
 */
(function () {
  'use strict';

  /* ---------------- settings ---------------- */
  var ONCE_EVER = true;                   // true = each visitor sees the intro only ONE time (first visit), after that the site opens directly; false = plays on every load / refresh
  var SEEN_KEY = 'scc-intro-seen';        // change this name (e.g. 'scc-intro-seen-2') if you make a new intro and want everybody to see it once more
  var LOGO_SRC = '/coders_club_logo.png'; // the logo in /public
  var MAX_WAIT = 7000;                    // ms - never hide the site longer than this

  /* ---------------- play only once per visitor ---------------- */
  // The "seen" mark is saved in the visitor's browser (localStorage), so it is remembered for good:
  // new tab, refresh, closing the browser, coming back next week - the site opens directly.
  // If the browser blocks localStorage, it falls back to "once per visit" (sessionStorage).
  function seenBefore() {
    try { if (localStorage.getItem(SEEN_KEY)) return true; } catch (e) { /* storage blocked */ }
    try { if (sessionStorage.getItem(SEEN_KEY)) return true; } catch (e) { /* storage blocked */ }
    return false;
  }
  function markSeen() {
    try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* storage blocked */ }
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* storage blocked */ }
  }

  var forced = /[?&]intro(=|&|$)/.test(location.search);
  if (!forced && ONCE_EVER && seenBefore()) return; // seen already: do nothing, the website opens directly
  markSeen();                                       // first time: play it and remember

  function mq(q) { return !!(window.matchMedia && window.matchMedia(q).matches); }
  var REDUCED = mq('(prefers-reduced-motion: reduce)');
  var COARSE = mq('(pointer: coarse)');

  /* ---------------- timeline (ms) ---------------- */
  var T = {
    lid: 320,       // laptop lid starts opening (closed lid shows the glowing logo first)
    screenOn: 800,  // display powers on
    cmd: 970,       // types "sudo login"
    name: 1330,     // types "sipna coders club"
    load: 2050,     // loading line 0 -> 100%
    granted: 2720,  // ACCESS GRANTED
    dive: 3220,     // camera dives into the laptop screen
    assemble: 3420, // particles start spiralling in
    lock: 4720,     // real logo locks in
    title: 4770,    // SIPNA CODERS CLUB decrypts
    tag: 5170,      // tagline types
    exit: 5700      // warp out (waits for the page to finish loading)
  };
  var LID_MS = 680, CMD_STEP = 30, NAME_STEP = 40, LOAD_MS = 620, DIVE_MS = 560;
  var GATE_T = T.lid - 20; // where the timeline waits for "tap to power on"
  var GATE_WAIT = 6000;    // ms - if nobody taps, carry on silently after this
  var EXIT_MS = 1000;
  var SKIP_AFTER = 600; // ignore accidental clicks in the first moment

  var TITLE = 'SIPNA CODERS CLUB';
  var TAG_A = '> Compile Your ';
  var TAG_B = 'Future_';
  var GLYPHS = '01<>/{}[]();=+*#$&%!?ABCDEFabcdef'.split('');

  // what the laptop types
  var CMD = 'sudo login';
  var ASK = '> enter club name:';
  var NAME = 'sipna coders club';
  var MSGS = [[0, '> compiling future_'], [24, '> linking 600+ coders'], [50, '> mounting /events'], [72, '> deploying vibes'], [100, '> ready ✓']];

  // keyboard layout ("label:width")
  var KEYROWS = [
    '1 2 3 4 5 6 7 8 9 0 -',
    'tab:1.5 q w e r t y u i o p',
    'caps:1.8 a s d f g h j k l enter:2',
    'shift:2.3 z x c v b n m . / shift2:1.6',
    'fn ctrl alt cmd:1.3 space:6 cmd2:1.3 < >'
  ];
  var KEY_COLORS = [[66, 133, 244], [52, 168, 83], [251, 188, 5], [234, 67, 53]]; // the logo's blue, green, yellow, red

  /* ---------------- styles ---------------- */
  var CSS = [
    '#scc-intro{position:fixed;inset:0;z-index:2147483647;background:#050505;overflow:hidden;cursor:pointer;',
    '-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;color:#e4e4e7;',
    'font-family:ui-monospace,SFMono-Regular,"JetBrains Mono","Fira Code",Menlo,Consolas,monospace}',
    '#scc-intro *{box-sizing:border-box;margin:0;padding:0}',
    '#scc-intro .scc-canvas{position:absolute;inset:0;width:100%;height:100%;display:block}',

    /* chrome: grid, vignette, CRT lines, scan beam, corners, labels */
    '#scc-intro .scc-chrome{position:absolute;inset:0;pointer-events:none;transition:opacity .5s ease}',
    '#scc-intro .scc-grid{position:absolute;inset:0;opacity:0;animation:scc-in .9s ease .1s forwards;',
    'background-image:linear-gradient(to right,rgba(128,128,128,.07) 1px,transparent 1px),',
    'linear-gradient(to bottom,rgba(128,128,128,.07) 1px,transparent 1px);background-size:24px 24px}',
    '#scc-intro .scc-vignette{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 35%,rgba(0,0,0,.8) 100%)}',
    '#scc-intro .scc-crt{position:absolute;inset:0;opacity:.5;background:repeating-linear-gradient(0deg,rgba(255,255,255,.028) 0 1px,transparent 1px 3px)}',
    '#scc-intro .scc-scan{position:absolute;left:0;right:0;top:-160px;height:160px;',
    'background:linear-gradient(to bottom,transparent,rgba(34,211,238,.07),transparent);animation:scc-scan 2.6s linear infinite}',
    '#scc-intro .scc-corner{position:absolute;width:26px;height:26px;border:0 solid rgba(34,211,238,.55);opacity:0;animation:scc-in .5s ease .25s forwards}',
    '#scc-intro .tl{top:18px;left:18px;border-top-width:2px;border-left-width:2px}',
    '#scc-intro .tr{top:18px;right:18px;border-top-width:2px;border-right-width:2px}',
    '#scc-intro .bl{bottom:18px;left:18px;border-bottom-width:2px;border-left-width:2px}',
    '#scc-intro .br{bottom:18px;right:18px;border-bottom-width:2px;border-right-width:2px}',
    '#scc-intro .scc-meta{position:absolute;font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:rgba(34,211,238,.6);opacity:0;animation:scc-in .6s ease .35s forwards;white-space:nowrap}',
    '#scc-intro .m-tl{top:24px;left:56px}#scc-intro .m-tr{top:24px;right:56px}',
    '#scc-intro .m-bl{bottom:24px;left:56px;display:flex;align-items:center;gap:8px}',
    '#scc-intro .m-bl i{width:6px;height:6px;border-radius:50%;background:#10b981;box-shadow:0 0 8px #10b981;animation:scc-blink 1s steps(1) infinite}',
    '#scc-intro .scc-skip{position:absolute;left:0;right:0;bottom:calc(24px + env(safe-area-inset-bottom,0px));text-align:center;',
    'font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:rgba(255,255,255,.35);opacity:0;animation:scc-in .6s ease .9s forwards}',
    '#scc-intro.scc-sm .scc-meta{display:none}#scc-intro.scc-sm .scc-skip{bottom:calc(30px + env(safe-area-inset-bottom,0px))}',

    /* ---- the 3D laptop (sizes come from JS: --fs = 1% of the screen width) ---- */
    '#scc-intro .scc-lap{position:absolute;left:0;top:0;--fs:6px;--bz:14px;--r:16px}',
    '#scc-intro .scc-lap-glow{position:absolute;left:-40%;right:-40%;top:45%;height:130%;border-radius:50%;opacity:0;',
    'background:radial-gradient(closest-side,rgba(34,211,238,.30),rgba(168,85,247,.14) 55%,rgba(0,0,0,0));transition:opacity .8s ease}',
    '#scc-intro .scc-lap-glow.g{background:radial-gradient(closest-side,rgba(52,211,153,.5),rgba(34,211,238,.18) 55%,rgba(0,0,0,0))}',
    '#scc-intro .scc-lap.on .scc-lap-glow{opacity:1}',
    '#scc-intro .scc-lap-rise{position:absolute;inset:0;opacity:0;animation:scc-lap-in .85s cubic-bezier(.2,.9,.3,1) forwards}',
    '#scc-intro .scc-lap.out .scc-lap-rise{animation:scc-lap-out .35s ease-in forwards}',
    '#scc-intro .scc-lap-3d{position:absolute;inset:0}',
    '#scc-intro .scc-lap.shake .scc-lap-3d{animation:scc-shake .45s ease-out}',
    '#scc-intro .scc-lap-body{position:absolute;inset:0;transform-style:preserve-3d;transform:rotateX(-20deg) rotateY(-26deg)}',
    '#scc-intro .scc-lid{position:absolute;inset:0;transform-style:preserve-3d;transform-origin:50% 100%;transform:rotateX(-87deg)}',
    '#scc-intro .scc-face{position:absolute;inset:0;border-radius:var(--r) var(--r) 3px 3px;-webkit-backface-visibility:hidden;backface-visibility:hidden}',
    '#scc-intro .scc-front{padding:var(--bz) var(--bz) calc(var(--bz) * 1.3);background:linear-gradient(180deg,#151821,#0b0d11);',
    'box-shadow:inset 0 0 0 1px #2c3240,inset 0 1px 0 rgba(255,255,255,.09)}',
    '#scc-intro .scc-back{transform:rotateX(180deg);display:flex;align-items:center;justify-content:center;',
    'background:linear-gradient(160deg,#363c4b,#1b1e26 70%);box-shadow:inset 0 0 0 1px #444b5e}',
    '#scc-intro .scc-back img{width:26%;height:auto;max-width:none;border-radius:50%;filter:drop-shadow(0 0 18px rgba(34,211,238,.85))}',
    '#scc-intro .scc-cam{position:absolute;left:50%;top:calc(var(--bz) / 2 - 3px);width:6px;height:6px;margin-left:-3px;border-radius:50%;',
    'background:#1c222c;transition:background .3s,box-shadow .3s}',
    '#scc-intro .scc-lap.on .scc-cam{background:#34d399;box-shadow:0 0 8px #34d399}',

    /* screen */
    '#scc-intro .scc-scr{position:relative;width:100%;height:100%;overflow:hidden;border-radius:4px;background:#000;transition:background .5s ease}',
    '#scc-intro .scc-lap.on .scc-scr{background:radial-gradient(120% 95% at 50% 0%,#0c1b2c,#03060a 70%)}',
    '#scc-intro .scc-scr-in{position:absolute;inset:0;display:flex;flex-direction:column;padding:calc(var(--fs) * 3.4) calc(var(--fs) * 4.6);',
    'opacity:0;transition:opacity .3s ease .28s}',
    '#scc-intro .scc-lap.on .scc-scr-in{opacity:1}',
    '#scc-intro .scc-sbar{display:flex;align-items:center;gap:calc(var(--fs) * 1.1)}',
    '#scc-intro .scc-sbar i{display:block;width:calc(var(--fs) * 1.5);height:calc(var(--fs) * 1.5);border-radius:50%;background:#ef4444}',
    '#scc-intro .scc-sbar i:nth-child(2){background:#eab308}#scc-intro .scc-sbar i:nth-child(3){background:#22c55e}',
    '#scc-intro .scc-sbar span{margin-left:auto;font-size:clamp(7px,calc(var(--fs) * 1.9),13px);color:#5b6475}',
    '#scc-intro .scc-mid{flex:1;display:flex;flex-direction:column;justify-content:center}',
    '#scc-intro .scc-cmd{font-size:clamp(8px,calc(var(--fs) * 2.7),18px);line-height:1.55;white-space:pre;color:#71717a;min-height:3.1em}',
    '#scc-intro .scc-cmd .p{color:#10b981}#scc-intro .scc-cmd .w{color:#f4f4f5}',
    '#scc-intro .scc-name{margin-top:calc(var(--fs) * 1.2);font-size:calc(var(--fs) * 7.3);font-weight:800;line-height:1.15;',
    'letter-spacing:-.02em;white-space:pre;color:#fff;min-height:1.15em}',
    '#scc-intro .scc-name .c{background:linear-gradient(90deg,#4285f4,#22d3ee 50%,#a855f7);-webkit-background-clip:text;background-clip:text;color:transparent}',
    '#scc-intro .caret{display:inline-block;width:.5em;height:1.05em;background:#34d399;vertical-align:-.15em;margin-left:.06em;animation:scc-blink .7s steps(1) infinite}',
    '#scc-intro .scc-name .caret{width:.42em;height:.95em;vertical-align:-.1em}',
    '#scc-intro .scc-load{margin-top:calc(var(--fs) * 3);opacity:0;transition:opacity .25s ease}',
    '#scc-intro .scc-load.on{opacity:1}',
    '#scc-intro .scc-msg{font-size:clamp(8px,calc(var(--fs) * 2.2),15px);color:#22d3ee;margin-bottom:calc(var(--fs) * 1.3);min-height:1.3em}',
    '#scc-intro .scc-msg.ok{color:#34d399}',
    '#scc-intro .scc-lrow{display:flex;align-items:center;gap:calc(var(--fs) * 2)}',
    '#scc-intro .scc-track{flex:1;height:max(3px,calc(var(--fs) * .9));border-radius:9px;background:rgba(255,255,255,.08);overflow:hidden}',
    '#scc-intro .scc-fill{height:100%;width:0;background:linear-gradient(90deg,#10b981,#22d3ee,#a855f7);box-shadow:0 0 12px #22d3ee}',
    '#scc-intro .scc-pct{min-width:3.2em;text-align:right;font-size:clamp(8px,calc(var(--fs) * 2.4),16px);color:#22d3ee;font-weight:700}',
    '#scc-intro .scc-granted{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;',
    'gap:calc(var(--fs) * 1.6);opacity:0;color:#34d399;font-weight:800;text-shadow:0 0 18px rgba(52,211,153,.75);',
    'background:radial-gradient(circle at 50% 50%,#0d3a2b,#03100b 62%,#010604)}',
    '#scc-intro .scc-granted span{display:inline-block;font-size:calc(var(--fs) * 6.4);letter-spacing:.16em;padding-left:.16em}',
    '#scc-intro .scc-granted small{font-size:clamp(7px,calc(var(--fs) * 2.2),15px);font-weight:500;letter-spacing:.32em;padding-left:.32em;',
    'text-transform:uppercase;color:#a7f3d0;opacity:.85;text-shadow:none}',
    '#scc-intro .scc-granted.on{opacity:1}',
    '#scc-intro .scc-granted.on span{animation:scc-glitch .55s linear}',
    '#scc-intro .scc-pw{position:absolute;left:0;right:0;top:50%;height:2px;margin-top:-1px;opacity:0;transform:scaleX(0);',
    'background:#e0fbff;box-shadow:0 0 14px #67e8f9,0 0 30px #22d3ee}',
    '#scc-intro .scc-lap.on .scc-pw{animation:scc-pw .5s ease-out forwards}',
    '#scc-intro .scc-glass{position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,rgba(255,255,255,.08),rgba(255,255,255,0) 40%)}',
    '#scc-intro .scc-white{position:absolute;inset:0;opacity:0;background:radial-gradient(circle,#ffffff,#a5f3fc 45%,#22d3ee 80%)}',

    /* keyboard deck */
    '#scc-intro .scc-deck{position:absolute;left:-2.5%;width:105%;top:100%;transform-origin:50% 0;transform:rotateX(90deg);',
    'transform-style:preserve-3d;border-radius:3px 3px var(--r) var(--r);',
    'background:linear-gradient(180deg,#272c38,#1b1f27 55%,#15181e);box-shadow:inset 0 0 0 1px #363c4a}',
    '#scc-intro .scc-keys{position:absolute;left:5%;right:5%;top:7%;height:55%;display:flex;flex-direction:column;justify-content:space-between}',
    '#scc-intro .scc-krow{height:17%;display:flex;gap:1.1%}',
    '#scc-intro .scc-key{flex:1;min-width:0;border-radius:3px;background:#0d1015;box-shadow:inset 0 -1px 0 rgba(255,255,255,.05);',
    'transition:background .35s ease,box-shadow .35s ease}',
    '#scc-intro .scc-lap.on .scc-key{background:var(--kb);box-shadow:0 0 7px var(--kg)}',
    '#scc-intro .scc-lap .scc-key.hit{background:#fff;box-shadow:0 0 10px #fff,0 0 22px var(--kc),0 0 44px var(--kc);transition:none}',
    '#scc-intro .scc-lap.granted .scc-key{background:#34d399;box-shadow:0 0 14px #34d399}',
    '#scc-intro .scc-pad{position:absolute;left:34%;right:34%;top:68%;height:24%;border-radius:8px;',
    'background:rgba(255,255,255,.035);box-shadow:inset 0 0 0 1px rgba(255,255,255,.07)}',
    '#scc-intro .scc-lip{position:absolute;left:0;right:0;top:100%;transform-origin:50% 0;transform:rotateX(-90deg);',
    'border-radius:0 0 8px 8px;background:linear-gradient(180deg,#22262f,#0c0e12)}',

    /* logo stage */
    '#scc-intro .scc-fx{position:absolute;inset:0;pointer-events:none}',
    '#scc-intro .scc-stage{position:absolute;transform-origin:50% 50%}',
    '#scc-intro .scc-hud{position:absolute;inset:-17%;opacity:0;transform:scale(.7) rotate(-40deg);',
    'transition:opacity .6s ease,transform 1s cubic-bezier(.2,.9,.3,1)}',
    '#scc-intro .scc-hud svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}',
    '#scc-intro .r1{animation:scc-spin 16s linear infinite}',
    '#scc-intro .r2{animation:scc-spin-rev 9s linear infinite}',
    '#scc-intro .r3{animation:scc-spin 4.5s linear infinite;filter:drop-shadow(0 0 4px #10b981)}',
    '#scc-intro .scc-badge{position:absolute;inset:0;opacity:0;transform:scale(.55);',
    'transition:transform .75s cubic-bezier(.2,1.5,.4,1),opacity .3s ease}',
    '#scc-intro .scc-tilt{position:absolute;inset:0;transform-style:preserve-3d}',
    '#scc-intro .scc-disc{position:absolute;left:11%;top:11%;width:78%;height:78%;border-radius:50%;background:#fff;',
    'animation:scc-pulse 1.6s ease-in-out infinite alternate}',
    '#scc-intro .scc-logo{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:contain;',
    'filter:drop-shadow(0 0 10px rgba(34,211,238,.55))}',
    '#scc-intro .scc-sheen-box{position:absolute;left:9%;top:9%;width:82%;height:82%;border-radius:50%;overflow:hidden}',
    '#scc-intro .scc-sheen{position:absolute;top:-25%;bottom:-25%;left:35%;width:30%;opacity:.75;',
    'background:linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent);transform:translateX(-260%) rotate(20deg)}',
    '#scc-intro .scc-shock{position:absolute;inset:0;border-radius:50%;opacity:0;border:2px solid rgba(34,211,238,.95);',
    'box-shadow:0 0 30px rgba(34,211,238,.65),inset 0 0 30px rgba(34,211,238,.4)}',
    '#scc-intro .scc-shock.s2{border-color:rgba(168,85,247,.95);box-shadow:0 0 30px rgba(168,85,247,.6),inset 0 0 30px rgba(168,85,247,.35)}',
    '#scc-intro .scc-flash{position:absolute;inset:0;opacity:0;pointer-events:none;',
    'background:radial-gradient(circle at var(--cx,50%) var(--cy,50%),rgba(186,246,255,.6),rgba(255,255,255,0) 60%)}',
    '#scc-intro .scc-title{position:absolute;left:0;right:0;text-align:center;white-space:pre;font-weight:800;',
    'letter-spacing:.3em;padding-left:.3em;color:#fafafa;text-shadow:0 0 18px rgba(34,211,238,.35)}',
    '#scc-intro .scc-title .c{color:#22d3ee;text-shadow:0 0 22px rgba(34,211,238,.85)}',
    '#scc-intro .scc-title .s{color:rgba(34,211,238,.5)}#scc-intro .scc-title .h{visibility:hidden}',
    '#scc-intro .scc-tag{position:absolute;left:0;right:0;text-align:center;white-space:pre;color:#a1a1aa;',
    'letter-spacing:.08em}',
    '#scc-intro .scc-tag b{color:#34d399;font-weight:700;text-shadow:0 0 12px rgba(52,211,153,.6)}',
    '#scc-intro .scc-title,#scc-intro .scc-tag{transition:opacity .3s ease,transform .3s ease}',

    /* "tap to power on" */
    '#scc-intro .scc-power{position:absolute;left:0;right:0;display:flex;flex-direction:column;align-items:center;gap:14px;',
    'pointer-events:none;opacity:0;transform:translateY(8px);transition:opacity .3s ease,transform .3s ease;isolation:isolate}',
    '#scc-intro .scc-power::before{content:"";position:absolute;left:50%;top:-40px;width:min(560px,100%);height:250px;z-index:-1;',
    'transform:translateX(-50%);background:radial-gradient(closest-side,rgba(5,5,5,.9),rgba(5,5,5,.6) 55%,rgba(5,5,5,0))}',
    '#scc-intro.scc-gate .scc-power{opacity:1;transform:none;transition:opacity .6s ease .75s,transform .6s ease .75s}',
    '#scc-intro .scc-pbtn{position:relative;width:66px;height:66px;border-radius:50%;display:flex;align-items:center;justify-content:center;',
    'color:#a5f3fc;border:1.5px solid rgba(34,211,238,.75);background:radial-gradient(circle,rgba(34,211,238,.2),rgba(4,10,12,.9) 70%);',
    'box-shadow:0 0 26px rgba(34,211,238,.5),inset 0 0 18px rgba(34,211,238,.25)}',
    '#scc-intro .scc-pbtn::before,#scc-intro .scc-pbtn::after{content:"";position:absolute;inset:-2px;border-radius:50%;',
    'border:1.5px solid rgba(34,211,238,.6);animation:scc-pring 2s ease-out infinite}',
    '#scc-intro .scc-pbtn::after{animation-delay:1s}',
    '#scc-intro .scc-pbtn svg{width:28px;height:28px;filter:drop-shadow(0 0 6px #22d3ee)}',
    '#scc-intro .scc-power b{font-size:12.5px;font-weight:700;letter-spacing:.34em;padding-left:.34em;text-transform:uppercase;',
    'color:#e0fbff;text-shadow:0 0 14px rgba(34,211,238,.8);animation:scc-soft 1.6s ease-in-out infinite alternate}',
    '#scc-intro .scc-power small{font-size:10px;letter-spacing:.26em;padding-left:.26em;text-transform:uppercase;color:rgba(255,255,255,.5)}',
    '#scc-intro.scc-gate .scc-skip{visibility:hidden}',
    '#scc-intro .scc-lap-3d{transition:transform .9s cubic-bezier(.2,.9,.3,1)}',
    '#scc-intro.scc-gate .scc-lap-3d{transform:translateY(var(--gshift,0px))}',
    '#scc-intro.scc-gate .scc-back img{animation:scc-logo-glow 1.2s ease-in-out infinite alternate}',

    /* sound button */
    '#scc-intro .scc-snd{position:absolute;right:22px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:5;display:none;',
    'align-items:center;gap:9px;padding:9px 14px 9px 12px;border-radius:999px;border:1px solid rgba(34,211,238,.5);',
    'background:rgba(4,10,12,.75);color:#cffafe;cursor:pointer;opacity:0;-webkit-tap-highlight-color:transparent;',
    'font:600 10px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.22em;text-transform:uppercase;',
    'animation:scc-in .5s ease .5s forwards,scc-ring 1.8s ease-out 1s infinite}',
    '#scc-intro.scc-sm .scc-snd{bottom:auto;top:calc(16px + env(safe-area-inset-top,0px));right:16px}',
    '#scc-intro .scc-snd.show{display:inline-flex}',
    '#scc-intro .scc-snd.on{animation:scc-in .3s ease forwards;border-color:rgba(52,211,153,.55);color:#a7f3d0}',
    '#scc-intro .scc-eq{display:flex;align-items:flex-end;gap:2px;height:12px}',
    '#scc-intro .scc-eq i{display:block;width:2px;height:30%;border-radius:1px;background:currentColor;opacity:.55}',
    '#scc-intro .scc-snd.on .scc-eq i{opacity:1;animation:scc-eq .7s ease-in-out infinite alternate}',
    '#scc-intro .scc-snd.on .scc-eq i:nth-child(2){animation-delay:-.3s}',
    '#scc-intro .scc-snd.on .scc-eq i:nth-child(3){animation-delay:-.55s}',
    '#scc-intro .scc-snd.on .scc-eq i:nth-child(4){animation-delay:-.15s}',
    '#scc-intro.scc-exiting .scc-snd{opacity:0 !important;transition:opacity .3s}',

    /* lock-in moment */
    '#scc-intro.scc-locked .scc-hud{opacity:1;transform:none}',
    '#scc-intro.scc-locked .scc-badge{opacity:1;transform:none}',
    '#scc-intro.scc-locked .scc-sheen{animation:scc-sheen 1s cubic-bezier(.3,.6,.3,1) .25s forwards}',
    '#scc-intro.scc-locked .scc-shock{animation:scc-shock .85s cubic-bezier(.1,.7,.2,1) forwards}',
    '#scc-intro.scc-locked .scc-shock.s2{animation-delay:.13s}',
    '#scc-intro.scc-locked .scc-flash{animation:scc-flash .6s ease-out forwards}',
    '#scc-intro.scc-locked .scc-fx{animation:scc-shake .42s ease-out}',

    /* exit */
    '#scc-intro.scc-exiting{cursor:default}',
    '#scc-intro.scc-exiting .scc-chrome{opacity:0}',
    '#scc-intro.scc-exiting .scc-hud{opacity:0;transform:scale(1.4)}',
    '#scc-intro.scc-exiting .scc-title,#scc-intro.scc-exiting .scc-tag{opacity:0;transform:translateY(-10px)}',

    /* reduced motion: a calm version */
    '#scc-intro.scc-reduced .scc-lap,#scc-intro.scc-reduced .scc-canvas,#scc-intro.scc-reduced .scc-shock,',
    '#scc-intro.scc-reduced .scc-flash,#scc-intro.scc-reduced .scc-scan,#scc-intro.scc-reduced .scc-sheen-box{display:none}',
    '#scc-intro.scc-reduced .scc-fx,#scc-intro.scc-reduced .scc-disc,#scc-intro.scc-reduced .r1,',
    '#scc-intro.scc-reduced .r2,#scc-intro.scc-reduced .r3{animation:none}',
    '#scc-intro.scc-reduced .scc-badge,#scc-intro.scc-reduced .scc-hud{transform:none;transition:opacity .4s ease}',
    '#scc-intro.scc-reduced{transition:opacity .45s ease}',

    /* keyframes */
    '@keyframes scc-in{to{opacity:1}}',
    '@keyframes scc-eq{from{height:20%}to{height:100%}}',
    '@keyframes scc-pring{0%{transform:scale(1);opacity:.9}100%{transform:scale(2.2);opacity:0}}',
    '@keyframes scc-soft{from{opacity:.6}to{opacity:1}}',
    '@keyframes scc-logo-glow{from{filter:drop-shadow(0 0 8px rgba(34,211,238,.45))}to{filter:drop-shadow(0 0 30px rgba(34,211,238,1))}}',
    '@keyframes scc-ring{0%{box-shadow:0 0 0 0 rgba(34,211,238,.45)}100%{box-shadow:0 0 0 14px rgba(34,211,238,0)}}',
    '@keyframes scc-blink{50%{opacity:0}}',
    '@keyframes scc-scan{from{top:-160px}to{top:100%}}',
    '@keyframes scc-lap-in{from{opacity:0;transform:translateY(22%) scale(.82);filter:blur(10px)}to{opacity:1;transform:none;filter:none}}',
    '@keyframes scc-lap-out{from{opacity:1;transform:none}to{opacity:0;transform:scale(1.12);filter:blur(10px)}}',
    '@keyframes scc-pw{0%{opacity:1;transform:scaleX(0) scaleY(1)}45%{opacity:1;transform:scaleX(1) scaleY(1)}',
    '100%{opacity:0;transform:scaleX(1) scaleY(90)}}',
    '@keyframes scc-glitch{0%{transform:translate(0);clip-path:inset(0 0 0 0);text-shadow:3px 0 #f0f,-3px 0 #0ff}',
    '15%{transform:translate(-4px,2px);clip-path:inset(15% 0 55% 0)}',
    '30%{transform:translate(4px,-2px);clip-path:inset(60% 0 8% 0);text-shadow:-4px 0 #f0f,4px 0 #0ff}',
    '45%{transform:translate(-3px,0);clip-path:inset(35% 0 40% 0)}',
    '60%{transform:translate(3px,1px);clip-path:inset(0 0 70% 0);text-shadow:2px 0 #f0f,-2px 0 #0ff}',
    '75%{transform:translate(-1px,-1px);clip-path:inset(70% 0 0 0)}',
    '100%{transform:translate(0);clip-path:inset(0 0 0 0);text-shadow:0 0 18px rgba(52,211,153,.75)}}',
    '@keyframes scc-spin{to{transform:rotate(360deg)}}',
    '@keyframes scc-spin-rev{to{transform:rotate(-360deg)}}',
    '@keyframes scc-pulse{from{box-shadow:0 0 30px rgba(34,211,238,.45),0 0 90px rgba(59,130,246,.25)}',
    'to{box-shadow:0 0 55px rgba(34,211,238,.8),0 0 150px rgba(168,85,247,.45)}}',
    '@keyframes scc-sheen{from{transform:translateX(-260%) rotate(20deg)}to{transform:translateX(260%) rotate(20deg)}}',
    '@keyframes scc-shock{0%{opacity:1;transform:scale(.5)}100%{opacity:0;transform:scale(3.4)}}',
    '@keyframes scc-flash{0%{opacity:0}15%{opacity:1}100%{opacity:0}}',
    '@keyframes scc-shake{0%,100%{transform:translate(0,0)}12%{transform:translate(-7px,3px)}',
    '26%{transform:translate(6px,-4px)}40%{transform:translate(-4px,-2px)}55%{transform:translate(3px,3px)}',
    '70%{transform:translate(-2px,1px)}85%{transform:translate(1px,-1px)}}'
  ].join('\n');

  /* ---------------- markup ---------------- */
  var HTML = [
    '<canvas class="scc-canvas"></canvas>',
    '<div class="scc-chrome">',
    '  <div class="scc-grid"></div><div class="scc-vignette"></div><div class="scc-crt"></div><div class="scc-scan"></div>',
    '  <div class="scc-corner tl"></div><div class="scc-corner tr"></div><div class="scc-corner bl"></div><div class="scc-corner br"></div>',
    '  <div class="scc-meta m-tl">SCC:// boot_sequence</div>',
    '  <div class="scc-meta m-tr"><span class="scc-clock">--:--:--</span> // v2.0</div>',
    '  <div class="scc-meta m-bl"><i></i>sys.status: online</div>',
    '  <div class="scc-skip"></div>',
    '</div>',
    '<div class="scc-lap">',
    '  <div class="scc-lap-glow"></div>',
    '  <div class="scc-lap-rise"><div class="scc-lap-3d"><div class="scc-lap-body">',
    '    <div class="scc-lid">',
    '      <div class="scc-face scc-back"><img class="scc-back-logo" alt="" draggable="false"></div>',
    '      <div class="scc-face scc-front"><i class="scc-cam"></i>',
    '        <div class="scc-scr">',
    '          <div class="scc-scr-in">',
    '            <div class="scc-sbar"><i></i><i></i><i></i><span>sipnacoders.club — zsh</span></div>',
    '            <div class="scc-mid">',
    '              <div class="scc-cmd"></div>',
    '              <div class="scc-name"></div>',
    '              <div class="scc-load"><div class="scc-msg"></div>',
    '                <div class="scc-lrow"><div class="scc-track"><div class="scc-fill"></div></div><div class="scc-pct">0%</div></div>',
    '              </div>',
    '            </div>',
    '          </div>',
    '          <div class="scc-granted"><span>ACCESS GRANTED</span><small>welcome to the club</small></div>',
    '          <div class="scc-pw"></div><div class="scc-glass"></div><div class="scc-white"></div>',
    '        </div>',
    '      </div>',
    '    </div>',
    '    <div class="scc-deck"><div class="scc-keys"></div><div class="scc-pad"></div><div class="scc-lip"></div></div>',
    '  </div></div></div>',
    '</div>',
    '<div class="scc-fx">',
    '  <div class="scc-stage">',
    '    <div class="scc-hud">',
    '      <svg class="r1" viewBox="0 0 200 200"><circle cx="100" cy="100" r="98" fill="none" stroke="rgba(34,211,238,.55)" stroke-width=".7" stroke-dasharray="1.5 4.5"/></svg>',
    '      <svg class="r2" viewBox="0 0 200 200"><circle cx="100" cy="100" r="92" fill="none" stroke="rgba(168,85,247,.75)" stroke-width="1.3" stroke-linecap="round" stroke-dasharray="58 16 6 16"/></svg>',
    '      <svg class="r3" viewBox="0 0 200 200"><circle cx="100" cy="100" r="86" fill="none" stroke="#34d399" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="14 526"/></svg>',
    '      <svg viewBox="0 0 200 200"><g stroke="rgba(34,211,238,.7)" stroke-width="1.4">',
    '        <line x1="100" y1="-6" x2="100" y2="2"/><line x1="100" y1="198" x2="100" y2="206"/>',
    '        <line x1="-6" y1="100" x2="2" y2="100"/><line x1="198" y1="100" x2="206" y2="100"/></g></svg>',
    '    </div>',
    '    <div class="scc-shock"></div><div class="scc-shock s2"></div>',
    '    <div class="scc-badge"><div class="scc-tilt">',
    '      <div class="scc-disc"></div><img class="scc-logo" alt="" draggable="false">',
    '      <div class="scc-sheen-box"><div class="scc-sheen"></div></div>',
    '    </div></div>',
    '  </div>',
    '  <div class="scc-title"></div>',
    '  <div class="scc-tag"></div>',
    '</div>',
    '<div class="scc-flash"></div>',
    '<div class="scc-power"><div class="scc-pbtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">',
    '<path d="M12 3v8"/><path d="M6.3 6.8a8 8 0 1 0 11.4 0"/></svg></div><b></b><small></small></div>',
    '<button class="scc-snd" type="button" tabindex="-1"><span class="scc-eq"><i></i><i></i><i></i><i></i></span><span class="scc-snd-tx">tap for sound</span></button>'
  ].join('');

  /* ---------------- helpers ---------------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function easeOutCubic(k) { return 1 - Math.pow(1 - k, 3); }
  function easeOutQuart(k) { return 1 - Math.pow(1 - k, 4); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function glyph() { return GLYPHS[(Math.random() * GLYPHS.length) | 0]; }

  /* SOUND-START */
  /* ---------------- soundtrack + sound effects ----------------
   * Everything is synthesised live with the Web Audio API: no music files, nothing to
   * download, no copyright. A dark synthwave track in A minor at 120 BPM:
   *   build (laptop + typing): bass pulse, arpeggio whose filter opens up, hi-hats creep in
   *   drop  (ACCESS GRANTED):  four-on-the-floor kick, snare, offbeat bass
   *   final (logo locks in):   brighter arpeggio an octave up, big hit
   * plus effects: whoosh, lid hinge, CRT power-on, key clicks, riser, glitch, boom, blips. */
  var STEP = 60 / 120 / 4; // one 16th note at 120 BPM
  function makeSound(ctx) {
    var sr = ctx.sampleRate;
    var out = ctx.createGain();
    out.gain.value = 0;
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
    out.connect(comp); comp.connect(ctx.destination);

    // shared white noise, a small reverb and an echo
    var noiseBuf = ctx.createBuffer(1, sr, sr), nd = noiseBuf.getChannelData(0);
    for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    var irLen = Math.floor(sr * 2.2), ir = ctx.createBuffer(2, irLen, sr);
    for (var ch = 0; ch < 2; ch++) {
      var d = ir.getChannelData(ch);
      for (var j = 0; j < irLen; j++) d[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / irLen, 2.6);
    }
    var rev = ctx.createConvolver(); rev.buffer = ir;
    var revIn = ctx.createGain(); revIn.gain.value = 0.3;
    revIn.connect(rev); rev.connect(out);
    var dly = ctx.createDelay(1), fb = ctx.createGain(), dlyIn = ctx.createGain(), dlyLp = ctx.createBiquadFilter();
    dly.delayTime.value = STEP * 3; fb.gain.value = 0.3; dlyIn.gain.value = 0.26;
    dlyLp.type = 'lowpass'; dlyLp.frequency.value = 2600;
    dlyIn.connect(dly); dly.connect(dlyLp); dlyLp.connect(fb); fb.connect(dly); dlyLp.connect(out);

    function osc(type, f, t) { var o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); return o; }
    function amp(v) { var g = ctx.createGain(); g.gain.value = v; return g; }
    function filt(type, f, q) { var b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; if (q) b.Q.value = q; return b; }
    function noise(t, dur) { var s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05); return s; }
    function perc(g, t, peak, decay) { // quick attack, exponential decay
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    }

    /* drums */
    function kick(t, v) {
      var o = osc('sine', 150, t), g = amp(0);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.13);
      perc(g, t, v || 0.85, 0.42);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.45);
    }
    function hat(t, v) {
      var n = noise(t, 0.06), f = filt('highpass', 7500), g = amp(0);
      perc(g, t, v || 0.05, 0.05);
      n.connect(f); f.connect(g); g.connect(out);
    }
    function snare(t) {
      var n = noise(t, 0.22), f = filt('bandpass', 1800, 0.8), g = amp(0);
      perc(g, t, 0.15, 0.18);
      n.connect(f); f.connect(g); g.connect(out); g.connect(revIn);
    }
    /* synths */
    function bass(t, f, dur, cut, v) {
      var o = osc('sawtooth', f * 2, t), s = osc('sine', f, t), lp = filt('lowpass', cut, 6), g = amp(0);
      lp.frequency.setValueAtTime(cut * 2.2, t);
      lp.frequency.exponentialRampToValueAtTime(cut, t + 0.12);
      perc(g, t, v || 0.16, dur);
      o.connect(lp); lp.connect(g); s.connect(g); g.connect(out);
      o.start(t); s.start(t); o.stop(t + dur + 0.02); s.stop(t + dur + 0.02);
    }
    function pluck(t, f, cut, v) {
      var o = osc('square', f, t), lp = filt('lowpass', cut, 2), g = amp(0);
      perc(g, t, v, 0.16);
      o.connect(lp); lp.connect(g); g.connect(out); g.connect(dlyIn);
      o.start(t); o.stop(t + 0.2);
    }
    function pad(t, freqs, v) { // long chord; returns a handle to fade it out
      var lp = filt('lowpass', 1100, 0.5), g = amp(0), oscs = [];
      for (var i = 0; i < freqs.length; i++) {
        for (var k = -1; k <= 1; k += 2) {
          var o = osc('sawtooth', freqs[i], t); o.detune.value = k * 8;
          o.connect(lp); o.start(t); oscs.push(o);
        }
      }
      lp.connect(g); g.connect(out); g.connect(revIn);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + 0.9);
      return {
        stop: function (at, rel) {
          if (g.gain.cancelAndHoldAtTime) g.gain.cancelAndHoldAtTime(at); else g.gain.cancelScheduledValues(at);
          g.gain.setTargetAtTime(0.0001, at, rel / 4);
          for (var i = 0; i < oscs.length; i++) oscs[i].stop(at + rel + 0.2);
        }
      };
    }
    function stab(t, freqs, v, dec) {
      var lp = filt('lowpass', 5200, 1), g = amp(0);
      lp.frequency.setValueAtTime(5200, t);
      lp.frequency.exponentialRampToValueAtTime(700, t + dec);
      perc(g, t, v, dec);
      for (var i = 0; i < freqs.length; i++) {
        for (var k = -1; k <= 1; k += 2) {
          var o = osc('sawtooth', freqs[i], t); o.detune.value = k * 9;
          o.connect(lp); o.start(t); o.stop(t + dec + 0.05);
        }
      }
      lp.connect(g); g.connect(out); g.connect(revIn);
    }
    /* effects */
    function keyClick(t, heavy) {
      var n = noise(t, 0.05), bp = filt('bandpass', 2600 + Math.random() * 2200, 1.4), g = amp(0);
      perc(g, t, heavy ? 0.2 : 0.13, 0.035);
      n.connect(bp); bp.connect(g); g.connect(out);
      var n2 = noise(t, 0.08), lp = filt('lowpass', heavy ? 260 : 420), g2 = amp(0); // the "thock"
      perc(g2, t, heavy ? 0.4 : 0.22, heavy ? 0.08 : 0.05);
      n2.connect(lp); lp.connect(g2); g2.connect(out);
    }
    function whoosh(t, dur, f0, f1, v) {
      var n = noise(t, dur), bp = filt('bandpass', f0, 0.9), g = amp(0);
      bp.frequency.setValueAtTime(f0, t);
      bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + dur * 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      n.connect(bp); bp.connect(g); g.connect(out); g.connect(revIn);
    }
    function zap(t) { // CRT switching on
      var o = osc('sine', 1400, t), g = amp(0);
      o.frequency.exponentialRampToValueAtTime(60, t + 0.28);
      perc(g, t, 0.16, 0.32);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.35);
      var n = noise(t, 0.15), hp = filt('highpass', 3000), g2 = amp(0);
      perc(g2, t, 0.08, 0.12);
      n.connect(hp); hp.connect(g2); g2.connect(out);
    }
    function riser(t, dur) {
      var o = osc('sawtooth', 110, t), lp = filt('lowpass', 400, 4), g = amp(0);
      o.frequency.exponentialRampToValueAtTime(880, t + dur);
      lp.frequency.setValueAtTime(400, t);
      lp.frequency.exponentialRampToValueAtTime(5000, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.06, t + dur);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
      o.connect(lp); lp.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.1);
      whoosh(t, dur, 400, 7000, 0.07);
    }
    function glitch(t) {
      for (var i = 0; i < 7; i++) {
        var tt = t + i * 0.045, o = osc('square', 200 + Math.random() * 1800, tt), g = amp(0);
        perc(g, tt, 0.045, 0.03);
        o.connect(g); g.connect(out); o.start(tt); o.stop(tt + 0.04);
      }
    }
    function boom(t, v) {
      var o = osc('sine', 90, t), g = amp(0);
      o.frequency.exponentialRampToValueAtTime(30, t + 1);
      perc(g, t, v, 1.5);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + 1.6);
      var n = noise(t, 1.4), hp = filt('highpass', 2500), g2 = amp(0);
      perc(g2, t, 0.1, 1.3);
      n.connect(hp); hp.connect(g2); g2.connect(out); g2.connect(revIn);
    }
    function blip(t, f) {
      var o = osc('triangle', f, t), g = amp(0);
      perc(g, t, 0.05, 0.09);
      o.connect(g); g.connect(out); g.connect(dlyIn); o.start(t); o.stop(t + 0.1);
    }

    /* the track */
    var A1 = 55, F1 = 43.65;
    var ARP_AM = [220, 261.63, 329.63, 440, 493.88, 440, 329.63, 261.63];
    var ARP_F = [174.61, 220, 261.63, 349.23, 392, 349.23, 261.63, 220];
    var ARP_HI = [440, 523.25, 659.25, 880, 987.77, 880, 659.25, 523.25];
    var BLIPS = [880, 987.77, 1046.5, 1318.5, 1567.98, 1760];
    function step(n, t, sec, bright) { // one 16th note; sec 0 build, 1 drop, 2 final
      var s = n % 16;
      if (sec === 0) {
        if (s % 2 === 0) bass(t, A1, 0.2, 160 + bright * 420, 0.13);
        pluck(t, ARP_AM[n % 8], 450 + bright * 3300, 0.025 + bright * 0.025);
        if (bright > 0.3 && s % 4 === 2) hat(t, 0.035);
        if (bright > 0.65 && s % 2 === 1) hat(t, 0.02);
      } else {
        var fin = sec === 2;
        if (s % 4 === 0) kick(t, 0.8);
        if (s % 8 === 4) snare(t);
        hat(t, s % 2 ? 0.05 : 0.022);
        if (s % 4 !== 0) bass(t, fin ? A1 : F1, 0.11, 700, 0.15);
        pluck(t, (fin ? ARP_HI : ARP_F)[n % 8], 4200, 0.045);
      }
    }
    return {
      ctx: ctx, out: out, step: step,
      padFor: function (t, sec) {
        return pad(t, sec === 0 ? [110, 130.81, 164.81, 246.94] : sec === 1 ? [87.31, 110, 130.81, 164.81] : [110, 164.81, 220, 261.63, 329.63, 493.88], sec === 2 ? 0.03 : 0.035);
      },
      fadeIn: function (t) { out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(out.gain.value, t); out.gain.linearRampToValueAtTime(0.8, t + 0.25); },
      fadeOut: function (t, dur) { if (out.gain.cancelAndHoldAtTime) out.gain.cancelAndHoldAtTime(t); else out.gain.cancelScheduledValues(t); out.gain.setTargetAtTime(0, t, dur / 4); },
      // named moments of the intro
      arrive: function (t) { whoosh(t, 0.75, 120, 1200, 0.12); },
      power: function (t) { // power button pressed: click + rising power-up sweep
        keyClick(t, true);
        var o = osc('sine', 80, t), g = amp(0);
        o.frequency.exponentialRampToValueAtTime(720, t + 0.4);
        perc(g, t, 0.14, 0.55);
        o.connect(g); g.connect(out); g.connect(revIn); o.start(t); o.stop(t + 0.6);
        whoosh(t, 0.6, 200, 2400, 0.08);
      },
      lidOpen: function (t, dur) { whoosh(t, dur, 300, 1800, 0.05); },
      lidClick: function (t) { keyClick(t, true); },
      screenOn: function (t) { zap(t); },
      key: function (t, heavy) { keyClick(t, heavy); },
      load: function (t, dur) { riser(t, dur); },
      granted: function (t) { boom(t, 0.5); stab(t, [440, 523.25, 659.25, 987.77], 0.1, 1.1); glitch(t + 0.02); },
      dive: function (t, dur) { whoosh(t, dur, 200, 9000, 0.22); },
      lock: function (t) { boom(t, 0.9); stab(t, [220, 329.63, 440, 523.25, 659.25, 987.77], 0.12, 1.6); },
      blip: function (t, i) { blip(t, BLIPS[i % BLIPS.length]); },
      warp: function (t) { whoosh(t, 0.9, 6000, 150, 0.16); }
    };
  }
  /* SOUND-END */

  function start() {
    var html = document.documentElement;
    var style = document.createElement('style');
    style.id = 'scc-intro-style';
    style.textContent = CSS;
    (document.head || html).appendChild(style);

    var root = document.createElement('div');
    root.id = 'scc-intro';
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML = HTML;
    document.body.appendChild(root);

    var prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';

    function $(sel) { return root.querySelector(sel); }
    var canvas = $('.scc-canvas'), ctx = canvas.getContext('2d');
    var lap = $('.scc-lap'), lap3d = $('.scc-lap-3d'), lapBody = $('.scc-lap-body'), lid = $('.scc-lid');
    var lapGlow = $('.scc-lap-glow'), scr = $('.scc-scr'), white = $('.scc-white'), deck = $('.scc-deck'), lip = $('.scc-lip');
    var cmdEl = $('.scc-cmd'), nameEl = $('.scc-name'), loadEl = $('.scc-load'), msgEl = $('.scc-msg');
    var fill = $('.scc-fill'), pct = $('.scc-pct');
    var granted = $('.scc-granted'), stage = $('.scc-stage'), tilt = $('.scc-tilt');

    // build the keyboard; remember which key belongs to which character
    var keyEls = {};
    (function buildKeys() {
      var keysBox = $('.scc-keys'), html2 = '';
      for (var r = 0; r < KEYROWS.length; r++) {
        var row = KEYROWS[r].split(' '), cells = '';
        for (var k = 0; k < row.length; k++) {
          var bits = row[k].split(':'), w = bits[1] || 1;
          var c = KEY_COLORS[Math.min(3, Math.floor((k / row.length) * 4))], rgb = c.join(',');
          cells += '<i class="scc-key" data-k="' + bits[0] + '" style="flex:' + w + ';--kc:rgb(' + rgb + ');--kb:rgba(' + rgb + ',.2);--kg:rgba(' + rgb + ',.35)"></i>';
        }
        html2 += '<div class="scc-krow">' + cells + '</div>';
      }
      keysBox.innerHTML = html2;
      var all = keysBox.querySelectorAll('.scc-key');
      for (var i = 0; i < all.length; i++) keyEls[all[i].getAttribute('data-k')] = all[i];
    })();
    function press(ch) {
      var el = keyEls[ch === ' ' ? 'space' : ch === '\n' ? 'enter' : ch];
      sfx('key', ch === '\n');
      if (!el) return;
      el.classList.add('hit');
      clearTimeout(el._t);
      el._t = setTimeout(function () { el.classList.remove('hit'); }, 150);
    }
    var logo = $('.scc-logo'), titleEl = $('.scc-title'), tagEl = $('.scc-tag'), clockEl = $('.scc-clock');
    $('.scc-skip').textContent = COARSE ? 'tap to skip' : 'click or press any key to skip';

    var finished = false, raf = 0, failsafe = 0;
    var loaded = document.readyState === 'complete';
    function onLoad() { loaded = true; }
    window.addEventListener('load', onLoad);

    function finish() {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      clearTimeout(failsafe);
      window.removeEventListener('load', onLoad);
      window.removeEventListener('resize', layout);
      if (window.visualViewport) window.visualViewport.removeEventListener('resize', layout);
      window.removeEventListener('keydown', onSkip, true);
      window.removeEventListener('keydown', onGateKey, true);
      window.removeEventListener('wheel', onSkip);
      sndStop(0.6);
      if (root.parentNode) root.parentNode.removeChild(root);
      if (style.parentNode) style.parentNode.removeChild(style);
      html.style.overflow = prevOverflow;
    }
    failsafe = setTimeout(finish, MAX_WAIT + GATE_WAIT + 6000); // absolute safety net

    /* ----- reduced motion: calm fade ----- */
    if (REDUCED) {
      root.classList.add('scc-reduced');
      logo.src = LOGO_SRC;
      fitRoot();
      placeStage();
      titleEl.innerHTML = titleHTML(1e9);
      tagEl.innerHTML = TAG_A + '<b>' + TAG_B + '</b>';
      requestAnimationFrame(function () { root.classList.add('scc-locked'); });
      var fadeOut = function () { root.style.opacity = '0'; setTimeout(finish, 480); };
      var timer = setTimeout(fadeOut, 1400);
      root.addEventListener('pointerdown', function () { clearTimeout(timer); fadeOut(); });
      return;
    }

    /* ----- sound ----- */
    // Browsers only allow sound after the visitor has interacted with the site. If it's allowed,
    // the music starts with the intro; if not, the "tap for sound" button starts it (without skipping).
    // The visitor's choice is remembered.
    var AC = window.AudioContext || window.webkitAudioContext;
    var snd = null, sndOn = false, sndN = 0, sndNext = 0, sndSec = -1, sndPad = null;
    var sndBtn = $('.scc-snd'), sndTx = $('.scc-snd-tx');
    function sndPref() { try { return localStorage.getItem('scc-intro-sound'); } catch (e) { return null; } }
    function setSndPref(v) { try { localStorage.setItem('scc-intro-sound', v); } catch (e) { /* storage blocked */ } }
    function sfx(name, a, b) {
      if (!sndOn || !snd) return;
      try { snd[name](snd.ctx.currentTime + 0.005, a, b); } catch (e) { /* never let sound break the intro */ }
    }
    function engage() {
      if (!snd || exiting) return;
      sndOn = true;
      snd.fadeIn(snd.ctx.currentTime);
      sndSec = -1; // the music loop picks up the current section on the next frame
      sndBtn.classList.add('show', 'on');
      sndTx.textContent = 'sound on';
    }
    function mute() {
      sndOn = false;
      if (snd) {
        snd.fadeOut(snd.ctx.currentTime, 0.3);
        if (sndPad) { sndPad.stop(snd.ctx.currentTime, 0.3); sndPad = null; }
      }
      sndBtn.classList.remove('on');
      sndTx.textContent = 'sound off';
    }
    function musicTick() {
      if (!sndOn || exiting) return;
      var now = snd.ctx.currentTime, sec = t < T.granted ? 0 : t < T.lock ? 1 : 2;
      if (sec !== sndSec) { // new section: new chord, and the bar restarts right on the hit
        if (sndPad) sndPad.stop(now, 0.5);
        sndPad = snd.padFor(now + 0.01, sec);
        sndSec = sec; sndN = 0; sndNext = now + 0.01;
      }
      if (sndNext < now - 0.25) sndNext = now + 0.01; // tab was in the background
      var bright = clamp(t / T.granted, 0, 1);
      while (sndNext < now + 0.12) { snd.step(sndN, sndNext, sec, bright); sndN++; sndNext += STEP; }
    }
    function sndStop(fade) {
      if (!snd) return;
      var c = snd.ctx;
      try { snd.fadeOut(c.currentTime, fade); if (sndPad) sndPad.stop(c.currentTime, fade); } catch (e) { /* ignore */ }
      sndOn = false;
      setTimeout(function () { try { c.close(); } catch (e) { /* ignore */ } }, fade * 1000 + 600);
    }
    // "Tap to power on": if the browser won't let sound start by itself, the closed laptop waits
    // for one tap/click/key. That tap powers it on with full sound from the first second.
    // If the browser already allows sound (e.g. a returning visitor), there is no wait.
    // If nobody taps within GATE_WAIT, it carries on silently so the site is never stuck.
    var gated = false, wall = 0, powerEl = $('.scc-power');
    powerEl.querySelector('b').textContent = COARSE ? 'tap to power on' : 'click to power on';
    powerEl.querySelector('small').textContent = (COARSE ? '' : 'or press any key · ') + 'best with sound 🔊';
    function openGate(withSound) {
      if (!gated) return;
      gated = false;
      root.classList.remove('scc-gate');
      if (!withSound) return;
      setSndPref('1');
      try { if (!snd) snd = makeSound(new AC()); snd.ctx.resume(); } catch (e) { snd = null; return; }
      engage();
      sfx('power');
    }
    function onGateTap(e) { if (gated) { if (e) e.stopPropagation(); openGate(true); } }
    function onGateKey(e) { if (gated && !e.metaKey && !e.ctrlKey && !e.altKey) openGate(true); }
    if (AC) {
      if (sndPref() === '0') { sndBtn.classList.add('show'); sndTx.textContent = 'sound off'; } // they muted it last time
      else {
        try { snd = makeSound(new AC()); } catch (e) { snd = null; }
        if (snd && snd.ctx.state === 'running') { engage(); sfx('arrive'); } // sound allowed: no need to wait
        else { gated = true; root.classList.add('scc-gate'); }
      }
      root.addEventListener('click', onGateTap);
      window.addEventListener('keydown', onGateKey, true);
      sndBtn.addEventListener('pointerdown', function (e) { e.stopPropagation(); }); // tapping it must not skip
      sndBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (sndOn) { mute(); setSndPref('0'); return; }
        setSndPref('1');
        try { if (!snd) snd = makeSound(new AC()); } catch (err) { return; }
        var p = snd.ctx.resume();
        if (p && p.then) p.then(engage, function () { /* still blocked */ }); else engage();
      });
    }

    /* ----- layout ----- */
    var W, H, dpr, L, cx, cy, maxR, titleFs;
    var fs, cols, drops;

    // Size the overlay to the area the visitor actually sees. On phones, a page that is
    // wider than the screen makes the browser report a bigger "window" than is visible.
    function fitRoot() {
      var vv = window.visualViewport;
      W = vv ? vv.width : (html.clientWidth || window.innerWidth);
      H = vv ? vv.height : (html.clientHeight || window.innerHeight);
      var x = vv ? vv.offsetLeft : 0, y = vv ? vv.offsetTop : 0;
      var rs = root.style;
      rs.right = 'auto'; rs.bottom = 'auto';
      rs.left = x + 'px'; rs.top = y + 'px'; rs.width = W + 'px'; rs.height = H + 'px';
      root.classList.toggle('scc-sm', W < 720);
      root.classList.toggle('scc-xs', W < 480);
    }

    function placeStage() {
      L = Math.round(clamp(Math.min(W * 0.52, H * 0.42, 340), 140, 340));
      cx = W / 2;
      cy = H / 2 - L * 0.16;
      maxR = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) + 40;
      stage.style.left = (cx - L / 2) + 'px';
      stage.style.top = (cy - L / 2) + 'px';
      stage.style.width = L + 'px';
      stage.style.height = L + 'px';
      titleFs = clamp(W * 0.044, 18, 46);
      var titleTop = cy + L / 2 + Math.max(20, L * 0.13);
      titleEl.style.fontSize = titleFs + 'px';
      tagEl.style.fontSize = clamp(W * 0.015, 12, 16) + 'px';
      titleEl.style.top = titleTop + 'px';
      tagEl.style.top = (titleTop + titleFs * 1.75) + 'px';
      root.style.setProperty('--cx', cx + 'px');
      root.style.setProperty('--cy', cy + 'px');
    }

    // laptop size: as big as fits (lid + keyboard deck seen from slightly above)
    var LW = 0, LH = 0;
    function placeLaptop() {
      var narrow = W < 640; // phones: flatter perspective + shallower deck so the keyboard's near edge fits
      LW = Math.round(clamp(Math.min(W * (narrow ? 0.74 : 0.88), H * 0.84, 720), 230, 720));
      LH = Math.round(LW * 0.63);
      var bz = Math.max(7, LW * 0.03);
      var sw = LW - bz * 2;
      var ls = lap.style;
      ls.width = LW + 'px';
      ls.height = LH + 'px';
      var lapTop = Math.round(H / 2 - LW * 0.12 - LH / 2);
      ls.left = Math.round(W / 2 - LW / 2) + 'px';
      ls.top = lapTop + 'px';
      // while waiting for "tap to power on", the closed laptop is lifted to the upper middle
      // with the power button under it; it glides down as the lid opens
      var closedY = lapTop + LH + LW * 0.12, target = H * 0.4;
      ls.setProperty('--gshift', Math.round(target - closedY) + 'px');
      powerEl.style.top = Math.round(target + LW * 0.25 + 26) + 'px';
      ls.setProperty('--bz', bz.toFixed(1) + 'px');
      ls.setProperty('--r', Math.max(8, LW * 0.028).toFixed(1) + 'px');
      ls.setProperty('--fs', (sw / 100).toFixed(2) + 'px');
      lap3d.style.perspective = Math.round(LW * (narrow ? 3 : 2.3)) + 'px';
      deck.style.height = Math.round(LW * (narrow ? 0.55 : 0.6)) + 'px';
      lip.style.height = Math.max(4, Math.round(LW * 0.022)) + 'px';
    }

    function layout() {
      fitRoot();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, W, H);
      placeStage();
      if (!diving) placeLaptop();
      // code rain columns
      fs = W < 640 ? 13 : 16;
      cols = Math.ceil(W / fs);
      drops = [];
      for (var i = 0; i < cols; i++) {
        drops.push({ y: -Math.random() * H * 0.9, v: rnd(380, 900), cell: -1, ch: '0', hue: Math.random() });
      }
    }

    /* ----- particles: sample the logo's pixels ----- */
    var S = 200, parts = [], pSize = 2, logoOk = false, targetsReady = false, waitTargets = 0;

    function addParticle(x, y, col) {
      var nx = x / S - 0.5, ny = y / S - 0.5;
      var ta = Math.atan2(ny, nx);
      parts.push({
        nx: nx, ny: ny, tn: Math.hypot(nx, ny), ta: ta, col: col,
        delay: ((ta + Math.PI) / (Math.PI * 2)) * 220 + Math.random() * 120, // sweep around the circle
        dur: rnd(850, 1100), spin: rnd(1.8, 4.2), sr: rnd(0.55, 1.2), seed: Math.random() * 100,
        x: -99, y: -99, ox: 0, oy: 0, vox: 0, voy: 0, vx: 0, vy: 0, a: 0, mode: 0, life: 1, fade: 1
      });
    }

    function sample(draw, colorFor) {
      var c = document.createElement('canvas');
      c.width = c.height = S;
      var g = c.getContext('2d');
      draw(g);
      var d;
      try { d = g.getImageData(0, 0, S, S).data; } catch (e) { return false; }
      var opaque = 0;
      for (var i = 3; i < d.length; i += 4) if (d[i] > 140) opaque++;
      if (opaque < 50) return false;
      var target = (COARSE || W < 640) ? 800 : 1700;
      var step = clamp(Math.round(Math.sqrt(opaque / target)), 1, 6);
      for (var y = 0; y < S; y += step) {
        for (var x = 0; x < S; x += step) {
          var k = (y * S + x) * 4;
          if (d[k + 3] > 140) addParticle(x, y, colorFor(d[k], d[k + 1], d[k + 2], x));
        }
      }
      parts.sort(function (a, b) { return a.col < b.col ? -1 : 1; }); // fewer colour switches
      pSize = Math.max(1.3, (L / S) * step * 0.78);
      return true;
    }

    var RING = ['#67e8f9', '#22d3ee', '#22d3ee', '#a5f3fc', '#e0f2fe', '#a5b4fc'];
    function logoColor(r, g, b) {
      var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      if (mx - mn < 45 && mx < 120) return RING[(Math.random() * RING.length) | 0]; // dark ring -> neon cyan
      var q = function (v) { return Math.min(255, Math.round((v + (255 - v) * 0.24) / 16) * 16); };
      return 'rgb(' + q(r) + ',' + q(g) + ',' + q(b) + ')';
    }

    function buildFromLogo(img) {
      targetsReady = sample(function (g) { g.drawImage(img, 0, 0, S, S); }, logoColor);
      logoOk = targetsReady;
      if (!targetsReady) buildFromText();
    }
    function buildFromText() { // fallback if the logo cannot load: </> in particles
      parts = [];
      targetsReady = sample(function (g) {
        g.fillStyle = '#fff';
        g.font = '800 ' + Math.round(S * 0.36) + 'px ui-monospace, Menlo, Consolas, monospace';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText('</>', S / 2, S / 2);
      }, function (r, g, b, x) { return x < S * 0.4 ? '#34d399' : x < S * 0.6 ? '#22d3ee' : '#a855f7'; });
      targetsReady = true;
    }

    /* ----- text renderers ----- */
    var CARET = '<span class="caret"></span>';
    function renderScreen(cmdN, entered, nameN) {
      cmdEl.innerHTML = '<span class="p">$ </span><span class="w">' + CMD.slice(0, cmdN) + '</span>' +
        (entered ? '\n' + ASK : CARET);
      var s = '';
      for (var i = 0; i < nameN; i++) {
        var ch = NAME[i];
        s += (i >= 6 && i <= 11) ? '<span class="c">' + ch + '</span>' : ch;
      }
      nameEl.innerHTML = entered ? s + CARET : '';
    }

    // loading line: quick start, gets "stuck" around 72% for a moment, then rushes to 100
    function loadCurve(k) {
      if (k < 0.5) return 0.72 * easeOutCubic(k / 0.5);
      if (k < 0.68) return 0.72 + 0.04 * ((k - 0.5) / 0.18);
      var q = (k - 0.68) / 0.32;
      return 0.76 + 0.24 * q * q;
    }
    function easeOutBack(k) { var c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); }

    var scrambleTick = 0, scrambleCache = [];
    function titleHTML(lt) {
      var out = '';
      for (var i = 0; i < TITLE.length; i++) {
        var ch = TITLE[i];
        if (ch === ' ') { out += ' '; continue; }
        var cls = (i >= 6 && i <= 11) ? 'c' : 'w';
        if (lt >= 260 + i * 38) out += '<span class="' + cls + '">' + ch + '</span>';
        else if (lt >= i * 18) out += '<span class="s">' + (scrambleCache[i] || glyph()) + '</span>';
        else out += '<span class="h">' + ch + '</span>';
      }
      return out;
    }

    function renderTag(n) {
      var a = TAG_A.slice(0, n), b = n > TAG_A.length ? TAG_B.slice(0, n - TAG_A.length) : '';
      tagEl.innerHTML = a + (b ? '<b>' + b + '</b>' : '') + '<span class="caret"></span>';
    }

    /* ----- input ----- */
    var mx = 0, my = 0, mouseOn = false, rx = 0, ry = 0;
    root.addEventListener('pointermove', function (e) { var b = root.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top; mouseOn = true; });
    root.addEventListener('pointerleave', function () { mouseOn = false; });
    function onSkip() { if (t > SKIP_AFTER) startExit(); }
    root.addEventListener('pointerdown', onSkip);
    window.addEventListener('keydown', onSkip, true);
    window.addEventListener('wheel', onSkip, { passive: true });
    window.addEventListener('resize', layout);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', layout);

    /* ----- phases ----- */
    var t = 0, last = performance.now();
    var isGranted = false, locked = false, exiting = false, exitAt = 0;
    var titleDone = false, tagShown = -1, stars = [], lastSec = -1;
    // laptop state
    var screenOn = false, cmdN = 0, entered = false, nameN = 0, loadOn = false, lastPr = -1, lastMsg = '';
    var diving = false, lapGone = false, dvx = 0, dvy = 0, diveS = 1, lrx = 0, lry = 0;
    var lidSnd = 0, blipN = 0;

    // work out how to zoom so the laptop screen fills the whole display
    function startDive() {
      diving = true;
      var rr = root.getBoundingClientRect(), sr = scr.getBoundingClientRect(), lr = lap.getBoundingClientRect();
      var scx = sr.left + sr.width / 2, scy = sr.top + sr.height / 2;
      lap.style.transformOrigin = (scx - lr.left).toFixed(1) + 'px ' + (scy - lr.top).toFixed(1) + 'px';
      dvx = rr.left + W / 2 - scx;
      dvy = rr.top + H / 2 - scy;
      diveS = Math.max(W / Math.max(1, sr.width), H / Math.max(1, sr.height)) * 1.3;
    }

    function lock() {
      locked = true;
      root.classList.add('scc-locked');
      sfx('lock');
      if (!logoOk) return; // fallback text stays as particles
      for (var i = 0; i < parts.length; i++) { // the swarm shatters into glitter
        var p = parts[i];
        var ang = Math.atan2(p.y - cy, p.x - cx) + rnd(-0.35, 0.35), sp = rnd(30, 190);
        p.mode = 1; p.vx = Math.cos(ang) * sp; p.vy = Math.sin(ang) * sp; p.fade = 1 / rnd(0.45, 0.95);
      }
    }

    function startExit() {
      if (exiting) return;
      exiting = true;
      exitAt = t;
      root.classList.add('scc-exiting');
      if (!lapGone) lap.classList.add('out');
      sfx('warp');
      if (sndOn) { // music fades out with the warp
        var sn = snd.ctx.currentTime;
        snd.fadeOut(sn + 0.2, 0.9);
        if (sndPad) sndPad.stop(sn + 0.2, 0.9);
      }
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (p.a < 0.02 || (p.mode === 1 && p.life <= 0)) { p.mode = 3; continue; }
        var ang = Math.atan2(p.y - cy, p.x - cx), sp = rnd(260, 900);
        p.mode = 2; p.vx = Math.cos(ang) * sp; p.vy = Math.sin(ang) * sp; p.life = Math.max(p.life, 0.9);
      }
      var n = COARSE ? 130 : 240, cs = ['#a5f3fc', '#22d3ee', '#ffffff', '#c4b5fd', '#34d399'];
      for (var k = 0; k < n; k++) { // warp-speed star streaks
        var a = Math.random() * Math.PI * 2, r = Math.random() * L * 0.35, s = rnd(380, 1300);
        stars.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          c: cs[(Math.random() * cs.length) | 0], w: rnd(0.8, 2.2) });
      }
    }

    /* ----- drawing ----- */
    function drawRain(dts, spawn, alpha) {
      if (alpha <= 0.01) return;
      ctx.globalAlpha = alpha;
      ctx.font = '600 ' + fs + 'px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
      ctx.textBaseline = 'top';
      for (var i = 0; i < cols; i++) {
        var d = drops[i];
        if (d.y > H + fs) {
          if (!spawn) continue;
          d.y = -Math.random() * 220; d.v = rnd(380, 900); d.cell = -1;
        }
        d.y += d.v * dts;
        var cell = Math.floor(d.y / fs);
        if (cell !== d.cell && d.y >= 0) {
          var base = d.hue < 0.15 ? '#22d3ee' : d.hue < 0.21 ? '#a855f7' : '#10b981';
          if (d.cell >= 0) { ctx.fillStyle = base; ctx.fillText(d.ch, i * fs, d.cell * fs); } // trail
          d.cell = cell; d.ch = glyph();
          ctx.fillStyle = '#ecfeff'; // bright head
          ctx.fillText(d.ch, i * fs, cell * fs);
        }
      }
      ctx.globalAlpha = 1;
    }

    function drawParticles(dts) {
      var R = 90, R2 = R * R, lastCol = '';
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (p.mode === 3) continue;
        if (p.mode === 0) {
          var k = clamp((t - T.assemble - p.delay) / p.dur, 0, 1);
          if (k <= 0) { p.a = 0; continue; }
          var e1 = easeOutCubic(k), e2 = easeOutQuart(k);
          var tr = p.tn * L, sr = p.sr * maxR;
          var r = sr + (tr - sr) * e1, a = p.ta - p.spin * (1 - e2);
          var jitter = k >= 1 ? Math.sin(t * 0.004 + p.seed) * 0.5 : 0;
          // mouse pushes particles, a spring pulls them back
          if (mouseOn) {
            var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
            if (d2 < R2) { var dd = Math.sqrt(d2) || 1, f = (1 - dd / R) * 2600; p.vox += dx / dd * f * dts; p.voy += dy / dd * f * dts; }
          }
          p.vox += (-140 * p.ox - 13 * p.vox) * dts; p.voy += (-140 * p.oy - 13 * p.voy) * dts;
          p.ox += p.vox * dts; p.oy += p.voy * dts;
          p.x = cx + Math.cos(a) * r + p.ox + jitter;
          p.y = cy + Math.sin(a) * r + p.oy;
          p.a = Math.min(1, k * 3);
        } else if (p.mode === 1) { // glitter burst after lock
          p.x += p.vx * dts; p.y += p.vy * dts; p.vx *= 0.97; p.vy *= 0.97;
          p.life -= p.fade * dts; p.a = Math.max(0, p.life);
          if (p.a <= 0) continue;
        } else { // mode 2: warp out
          p.x += p.vx * dts; p.y += p.vy * dts; p.vx *= 1 + 2.6 * dts; p.vy *= 1 + 2.6 * dts;
          p.life -= 0.9 * dts; p.a = Math.max(0, p.life);
          if (p.a <= 0) { p.mode = 3; continue; }
        }
        if (p.col !== lastCol) { ctx.fillStyle = p.col; lastCol = p.col; }
        ctx.globalAlpha = p.a;
        ctx.fillRect(p.x - pSize / 2, p.y - pSize / 2, pSize, pSize);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    function drawStars(dts) {
      if (!stars.length) return;
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i], px = s.x, py = s.y;
        s.x += s.vx * dts; s.y += s.vy * dts; s.vx *= 1 + 3 * dts; s.vy *= 1 + 3 * dts;
        ctx.strokeStyle = s.c; ctx.lineWidth = s.w;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(s.x, s.y); ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    function drawRing(r, e) {
      if (r < 2) return;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 1 - e * 0.4;
      ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 28;
      ctx.strokeStyle = '#a5f3fc'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, r + 3, 0, Math.PI * 2); ctx.stroke();
      ctx.shadowColor = '#a855f7';
      ctx.strokeStyle = 'rgba(196,181,253,.7)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, r + 14, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    function setMask(r) {
      var m = 'radial-gradient(circle at ' + cx + 'px ' + cy + 'px, transparent ' + r + 'px, #000 ' + (r + 1.5) + 'px)';
      root.style.webkitMaskImage = m;
      root.style.maskImage = m;
    }

    /* ----- main loop ----- */
    function frame(now) {
      if (finished) return;
      try {
        var dt = Math.min(50, now - last);
        last = now;
        // hold the timeline if the logo is still loading (fallback after 1.5s)
        if (!targetsReady && t >= T.assemble && !exiting) {
          waitTargets += dt;
          if (waitTargets > 1500) buildFromText();
        } else {
          // waiting for "tap to power on": the laptop sits closed, the timeline holds just before the lid opens
          t = gated ? Math.min(t + dt, GATE_T) : t + dt;
        }
        wall += dt;
        if (gated && wall > GATE_WAIT) openGate(false); // nobody tapped: carry on silently
        var dts = dt / 1000;

        // motion trails: fade the previous frame (frame-rate independent)
        var fadeBase = exiting ? 0.22 : t < T.assemble ? 0.09 : t < T.lock ? 0.2 : 0.3;
        ctx.globalAlpha = 1 - Math.pow(1 - fadeBase, dt / 16.67);
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;

        musicTick();

        var rainAlpha = t < T.assemble ? 1 : 1 - (t - T.assemble) / 600;
        drawRain(dts, t < T.assemble && !exiting, exiting ? 0 : rainAlpha);

        // ---------- the laptop ----------
        if (!lapGone && !exiting) {
          // swing round + lid opening (with a little overshoot), laptop follows the mouse
          var sk = easeOutCubic(clamp(wall / 1300, 0, 1));
          var px = 0, py = 0;
          if (mouseOn && !COARSE) { px = (mx - W / 2) / W * 18; py = (my - H / 2) / H * -9; }
          else px = Math.sin(t * 0.0011) * (W < 640 ? 2.5 : 4);
          lrx += (py - lrx) * Math.min(1, dts * 4);
          lry += (px - lry) * Math.min(1, dts * 4);
          var swing = W < 640 ? -15 : -26;
          lapBody.style.transform = 'rotateX(' + (-20 + lrx).toFixed(2) + 'deg) rotateY(' + (swing * (1 - sk) + lry).toFixed(2) + 'deg)';
          var lk = clamp((t - T.lid) / LID_MS, 0, 1);
          lid.style.transform = 'rotateX(' + (-87 + 91 * easeOutBack(lk)).toFixed(2) + 'deg)';
          if (lidSnd === 0 && lk > 0) { lidSnd = 1; sfx('lidOpen', LID_MS / 1000); }
          if (lidSnd === 1 && lk >= 0.72) { lidSnd = 2; sfx('lidClick'); }

          if (!screenOn && t >= T.screenOn) { screenOn = true; lap.classList.add('on'); renderScreen(0, false, 0); sfx('screenOn'); }

          // typing: every new character lights up its key
          var dirty = false;
          var nc = t < T.cmd ? 0 : clamp(Math.floor((t - T.cmd) / CMD_STEP) + 1, 0, CMD.length);
          while (cmdN < nc) { press(CMD[cmdN]); cmdN++; dirty = true; }
          if (!entered && t >= T.cmd + CMD.length * CMD_STEP + 40) { entered = true; press('\n'); dirty = true; }
          var nn = t < T.name ? 0 : clamp(Math.floor((t - T.name) / NAME_STEP) + 1, 0, NAME.length);
          while (nameN < nn) { press(NAME[nameN]); nameN++; dirty = true; }
          if (dirty) renderScreen(cmdN, entered, nameN);

          // loading line
          if (t >= T.load) {
            if (!loadOn) { loadOn = true; loadEl.classList.add('on'); sfx('load', (T.granted - T.load) / 1000); }
            var pr = Math.round(loadCurve(clamp((t - T.load) / LOAD_MS, 0, 1)) * 100);
            if (pr !== lastPr) {
              lastPr = pr;
              fill.style.width = pr + '%';
              pct.textContent = pr + '%';
              var m = MSGS[0][1];
              for (var mi = 0; mi < MSGS.length; mi++) if (pr >= MSGS[mi][0]) m = MSGS[mi][1];
              if (m !== lastMsg) { lastMsg = m; msgEl.textContent = m; msgEl.classList.toggle('ok', pr >= 100); }
            }
          }

          // ACCESS GRANTED: keyboard flashes green, laptop shakes
          if (!isGranted && t >= T.granted) {
            isGranted = true;
            granted.classList.add('on');
            lap.classList.add('granted', 'shake');
            lapGlow.classList.add('g');
            sfx('granted');
          }

          // dive into the screen
          if (t >= T.dive) {
            if (!diving) { startDive(); sfx('dive', DIVE_MS / 1000 + 0.15); }
            var dk = clamp((t - T.dive) / DIVE_MS, 0, 1), de = Math.pow(dk, 2.1);
            lap.style.transform = 'translate(' + (dvx * de).toFixed(1) + 'px,' + (dvy * de).toFixed(1) + 'px) scale(' + (1 + (diveS - 1) * de).toFixed(3) + ')';
            white.style.opacity = (clamp((dk - 0.2) / 0.5, 0, 1) * 0.95).toFixed(3);
            lap.style.opacity = (1 - clamp((dk - 0.72) / 0.28, 0, 1)).toFixed(3);
            if (dk >= 1) { lapGone = true; lap.style.display = 'none'; }
          }
        }

        if (targetsReady) drawParticles(dts);

        if (!locked && t >= T.lock && targetsReady && !exiting) lock();

        // title decrypt + tagline
        if (locked && !exiting) {
          var lt = t - T.title;
          if (lt >= 0 && !titleDone) {
            scrambleTick += dt;
            if (scrambleTick > 45) { scrambleTick = 0; for (var i = 0; i < TITLE.length; i++) scrambleCache[i] = glyph(); }
            titleEl.innerHTML = titleHTML(lt);
            var rc = clamp(Math.floor((lt - 260) / 38) + 1, 0, TITLE.length);
            while (blipN < rc) { if (TITLE[blipN] !== ' ') sfx('blip', blipN); blipN++; } // a blip per letter
            if (lt > 260 + TITLE.length * 38) titleDone = true;
          }
          var tn = clamp(Math.floor((t - T.tag) / 28), 0, TAG_A.length + TAG_B.length);
          if (t >= T.tag && tn !== tagShown) { tagShown = tn; renderTag(tn); }
          // badge follows the mouse in 3D
          var tx = 0, ty = 0;
          if (mouseOn && !COARSE) { tx = (my - cy) / H * -18; ty = (mx - cx) / W * 24; }
          rx += (tx - rx) * Math.min(1, dts * 6); ry += (ty - ry) * Math.min(1, dts * 6);
          tilt.style.transform = 'perspective(800px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
        }

        // header clock
        var sec = Math.floor(Date.now() / 1000);
        if (sec !== lastSec) { lastSec = sec; clockEl.textContent = new Date().toTimeString().slice(0, 8); }

        // warp out once the page underneath has loaded
        if (!exiting && t >= T.exit && (loaded || t >= MAX_WAIT)) startExit();

        if (exiting) {
          var e = clamp((t - exitAt) / EXIT_MS, 0, 1);
          // the logo rushes at the screen and fades, then the screen opens from its centre
          var re = clamp((e - 0.26) / 0.74, 0, 1);
          var r = maxR * re * re;
          drawStars(dts);
          drawRing(r, re);
          setMask(r);
          stage.style.transform = 'scale(' + (1 + 6 * Math.pow(e, 1.6)).toFixed(3) + ')';
          stage.style.opacity = String(1 - clamp(e / 0.42, 0, 1));
          if (e >= 1) { finish(); return; }
        }
      } catch (err) {
        finish(); // never leave the site blocked
        return;
      }
      raf = requestAnimationFrame(frame);
    }

    /* ----- go ----- */
    layout();
    var img = new Image();
    img.onload = function () { buildFromLogo(img); };
    img.onerror = function () { buildFromText(); };
    img.src = LOGO_SRC;
    logo.src = LOGO_SRC;
    logo.onerror = function () { logo.style.display = 'none'; $('.scc-disc').style.display = 'none'; };
    var backLogo = $('.scc-back-logo');
    backLogo.onerror = function () { backLogo.style.display = 'none'; };
    backLogo.src = LOGO_SRC;
    raf = requestAnimationFrame(frame);
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
