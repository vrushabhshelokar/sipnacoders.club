/*!
 * Sipna Coders Club - opening animation
 * ------------------------------------------------------------------
 * Plain JavaScript, no libraries, no React. It draws a full-screen
 * intro on top of the site, then removes itself completely, so the
 * existing app is never touched.
 *
 * Sequence (about 5 seconds, click / tap / any key skips):
 *   1. Code rain + a boot terminal typing out with a progress bar
 *   2. "ACCESS GRANTED" glitch
 *   3. Thousands of particles spiral in and build the club logo
 *   4. Logo locks in: flash, shockwave, screen shake, HUD rings,
 *      "SIPNA CODERS CLUB" decrypts, tagline types out
 *   5. Warp jump: the screen opens from the logo into the website
 *
 * Loaded by ONE line in index.html, just above the main.jsx script:
 *   <script src="/intro/intro.js"></script>
 *
 * Replay any time by adding ?intro to the URL.
 */
(function () {
  'use strict';

  /* ---------------- settings ---------------- */
  var ONCE_PER_SESSION = false;           // false = play on every page load / refresh
  var LOGO_SRC = '/coders_club_logo.png'; // the logo in /public
  var MAX_WAIT = 7000;                    // ms - never hide the site longer than this

  /* ---------------- play once per session ---------------- */
  var forced = /[?&]intro(=|&|$)/.test(location.search);
  try {
    if (!forced && ONCE_PER_SESSION && sessionStorage.getItem('scc-intro-seen')) return;
    sessionStorage.setItem('scc-intro-seen', '1');
  } catch (e) { /* storage blocked: just play */ }

  function mq(q) { return !!(window.matchMedia && window.matchMedia(q).matches); }
  var REDUCED = mq('(prefers-reduced-motion: reduce)');
  var COARSE = mq('(pointer: coarse)');

  /* ---------------- timeline (ms) ---------------- */
  var T = {
    typed: 1050,    // terminal finished typing
    granted: 1150,  // ACCESS GRANTED
    assemble: 1450, // particles start spiralling in
    termOut: 1550,  // terminal dissolves
    lock: 2800,     // real logo locks in
    title: 2850,    // SIPNA CODERS CLUB decrypts
    tag: 3350,      // tagline types
    exit: 4050      // warp out (waits for the page to finish loading)
  };
  var EXIT_MS = 1000;
  var SKIP_AFTER = 600; // ignore accidental clicks in the first moment

  var TITLE = 'SIPNA CODERS CLUB';
  var TAG_A = '> Compile Your ';
  var TAG_B = 'Future_';
  var GLYPHS = '01<>/{}[]();=+*#$&%!?ABCDEFabcdef'.split('');

  var LINES = [
    [['$ ', 'p'], ['ssh root@sipnacoders.club', 'w']],
    [['> handshake ', 'd'], ['................. ', 'm'], ['[ OK ]', 'ok']],
    [['> modules ', 'd'], ['DSA·WEB·AI·CLOUD', 'c'], [' .. ', 'm'], ['[ OK ]', 'ok']],
    [['> mounting ', 'd'], ['/core/team', 'c'], [' ....... ', 'm'], ['[ OK ]', 'ok']],
    [['> compiling ', 'd'], ['future_', 'w'], [' ......... ', 'm'], ['[ OK ]', 'ok']]
  ];
  var TOTAL_CHARS = 0;
  for (var li = 0; li < LINES.length; li++)
    for (var si = 0; si < LINES[li].length; si++) TOTAL_CHARS += LINES[li][si][0].length;

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

    /* boot terminal */
    '#scc-intro .scc-term{position:absolute;left:50%;top:50%;width:min(560px,calc(100% - 32px));opacity:0;overflow:hidden;',
    'transform:translate(-50%,-50%) scale(.94);background:rgba(6,9,10,.84);border:1px solid rgba(16,185,129,.38);border-radius:12px;',
    'box-shadow:0 0 0 1px rgba(16,185,129,.08),0 0 70px rgba(16,185,129,.16),inset 0 0 30px rgba(16,185,129,.05);',
    '-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);animation:scc-term-in .45s cubic-bezier(.2,.9,.3,1) .08s forwards}',
    '#scc-intro .scc-term.out{animation:scc-term-out .38s ease-in forwards}',
    '#scc-intro .scc-bar{display:flex;align-items:center;gap:7px;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.03)}',
    '#scc-intro .scc-bar i{display:block;width:10px;height:10px;border-radius:50%}',
    '#scc-intro .scc-bar i:nth-child(1){background:rgba(239,68,68,.75)}',
    '#scc-intro .scc-bar i:nth-child(2){background:rgba(234,179,8,.75)}',
    '#scc-intro .scc-bar i:nth-child(3){background:rgba(34,197,94,.75)}',
    '#scc-intro .scc-bar span{margin-left:auto;font-size:11px;color:#71717a}',
    '#scc-intro .scc-body{padding:16px 18px 4px;font-size:13px;line-height:1.75;white-space:pre-wrap;word-break:break-word;min-height:calc(13px*1.75*5 + 20px)}',
    '#scc-intro .scc-body .p{color:#10b981}#scc-intro .scc-body .w{color:#f4f4f5}#scc-intro .scc-body .d{color:#a1a1aa}',
    '#scc-intro .scc-body .m{color:#52525b}#scc-intro .scc-body .c{color:#22d3ee}',
    '#scc-intro .scc-body .ok{color:#34d399;font-weight:700;text-shadow:0 0 8px rgba(52,211,153,.6)}',
    '#scc-intro .caret{display:inline-block;width:8px;height:1.05em;background:#34d399;vertical-align:-2px;margin-left:2px;animation:scc-blink .7s steps(1) infinite}',
    '#scc-intro .scc-prog{display:flex;align-items:center;gap:12px;padding:8px 18px 16px}',
    '#scc-intro .scc-track{flex:1;height:4px;border-radius:4px;background:rgba(255,255,255,.07);overflow:hidden}',
    '#scc-intro .scc-fill{height:100%;width:0;background:linear-gradient(90deg,#10b981,#22d3ee,#a855f7);box-shadow:0 0 12px #22d3ee}',
    '#scc-intro .scc-pct{min-width:44px;text-align:right;font-size:12px;color:#22d3ee}',
    '#scc-intro .scc-granted{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;',
    'background:rgba(5,6,6,.94);font-weight:800;letter-spacing:.22em;padding-left:.22em;',
    'color:#34d399;text-shadow:0 0 18px rgba(52,211,153,.75)}',
    '#scc-intro .scc-granted.on{opacity:1}',
    '#scc-intro .scc-granted span{display:inline-block}',
    '#scc-intro .scc-granted.on span{animation:scc-glitch .55s linear}',
    '#scc-intro.scc-xs .scc-body{font-size:11.5px;min-height:calc(11.5px*1.75*5 + 20px)}',

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
    '#scc-intro.scc-reduced .scc-term,#scc-intro.scc-reduced .scc-canvas,#scc-intro.scc-reduced .scc-shock,',
    '#scc-intro.scc-reduced .scc-flash,#scc-intro.scc-reduced .scc-scan,#scc-intro.scc-reduced .scc-sheen-box{display:none}',
    '#scc-intro.scc-reduced .scc-fx,#scc-intro.scc-reduced .scc-disc,#scc-intro.scc-reduced .r1,',
    '#scc-intro.scc-reduced .r2,#scc-intro.scc-reduced .r3{animation:none}',
    '#scc-intro.scc-reduced .scc-badge,#scc-intro.scc-reduced .scc-hud{transform:none;transition:opacity .4s ease}',
    '#scc-intro.scc-reduced{transition:opacity .45s ease}',

    /* keyframes */
    '@keyframes scc-in{to{opacity:1}}',
    '@keyframes scc-blink{50%{opacity:0}}',
    '@keyframes scc-scan{from{top:-160px}to{top:100%}}',
    '@keyframes scc-term-in{from{opacity:0;transform:translate(-50%,-50%) scale(.94);filter:blur(6px)}',
    'to{opacity:1;transform:translate(-50%,-50%) scale(1);filter:blur(0)}}',
    '@keyframes scc-term-out{from{opacity:1;transform:translate(-50%,-50%) scale(1);filter:blur(0)}',
    'to{opacity:0;transform:translate(-50%,-50%) scale(1.14);filter:blur(12px)}}',
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
    '<div class="scc-term">',
    '  <div class="scc-bar"><i></i><i></i><i></i><span>sipnacoders.club — bash</span></div>',
    '  <div class="scc-body"></div>',
    '  <div class="scc-prog"><div class="scc-track"><div class="scc-fill"></div></div><div class="scc-pct">0%</div></div>',
    '  <div class="scc-granted"><span>ACCESS GRANTED</span></div>',
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
    '<div class="scc-flash"></div>'
  ].join('');

  /* ---------------- helpers ---------------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function easeOutCubic(k) { return 1 - Math.pow(1 - k, 3); }
  function easeOutQuart(k) { return 1 - Math.pow(1 - k, 4); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function glyph() { return GLYPHS[(Math.random() * GLYPHS.length) | 0]; }

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
    var term = $('.scc-term'), body = $('.scc-body'), fill = $('.scc-fill'), pct = $('.scc-pct');
    var granted = $('.scc-granted'), stage = $('.scc-stage'), tilt = $('.scc-tilt');
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
      window.removeEventListener('wheel', onSkip);
      if (root.parentNode) root.parentNode.removeChild(root);
      if (style.parentNode) style.parentNode.removeChild(style);
      html.style.overflow = prevOverflow;
    }
    failsafe = setTimeout(finish, MAX_WAIT + 6000); // absolute safety net

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
      granted.style.fontSize = clamp(W * 0.05, 19, 40) + 'px';
      titleEl.style.top = titleTop + 'px';
      tagEl.style.top = (titleTop + titleFs * 1.75) + 'px';
      root.style.setProperty('--cx', cx + 'px');
      root.style.setProperty('--cy', cy + 'px');
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
    function renderTyping(n) {
      var out = [], left = n;
      for (var i = 0; i < LINES.length && left > 0; i++) {
        var s = '';
        for (var j = 0; j < LINES[i].length && left > 0; j++) {
          var txt = LINES[i][j][0], part = txt.slice(0, left);
          left -= part.length;
          s += '<span class="' + LINES[i][j][1] + '">' + part + '</span>';
        }
        out.push(s);
      }
      body.innerHTML = out.join('\n') + '<span class="caret"></span>';
    }

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
    var typed = -1, isGranted = false, termGone = false, locked = false, exiting = false, exitAt = 0;
    var titleDone = false, tagShown = -1, stars = [], lastSec = -1;

    function lock() {
      locked = true;
      root.classList.add('scc-locked');
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
      term.classList.add('out');
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
          t += dt;
        }
        var dts = dt / 1000;

        // motion trails: fade the previous frame (frame-rate independent)
        var fadeBase = exiting ? 0.22 : t < T.assemble ? 0.09 : t < T.lock ? 0.2 : 0.3;
        ctx.globalAlpha = 1 - Math.pow(1 - fadeBase, dt / 16.67);
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;

        var rainAlpha = t < T.assemble ? 1 : 1 - (t - T.assemble) / 600;
        drawRain(dts, t < T.assemble && !exiting, exiting ? 0 : rainAlpha);

        // terminal
        if (!exiting && t < T.termOut + 50) {
          var n = Math.floor(TOTAL_CHARS * clamp(t / T.typed, 0, 1));
          if (n !== typed) { typed = n; renderTyping(n); }
          var pr = Math.round(easeOutCubic(clamp(t / T.typed, 0, 1)) * 100);
          fill.style.width = pr + '%';
          pct.textContent = pr + '%';
        }
        if (!isGranted && t >= T.granted && !exiting) { isGranted = true; granted.classList.add('on'); }
        if (!termGone && t >= T.termOut) { termGone = true; term.classList.add('out'); }

        if (targetsReady) drawParticles(dts);

        if (!locked && t >= T.lock && targetsReady && !exiting) lock();

        // title decrypt + tagline
        if (locked && !exiting) {
          var lt = t - T.title;
          if (lt >= 0 && !titleDone) {
            scrambleTick += dt;
            if (scrambleTick > 45) { scrambleTick = 0; for (var i = 0; i < TITLE.length; i++) scrambleCache[i] = glyph(); }
            titleEl.innerHTML = titleHTML(lt);
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
    raf = requestAnimationFrame(frame);
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
