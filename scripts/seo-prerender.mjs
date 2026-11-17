/* =====================================================================================
   scripts/seo-prerender.mjs
   -------------------------------------------------------------------------------------
   WHAT IT DOES
   The website is a JavaScript app, so a crawler or an AI assistant that does not run JavaScript only sees an empty
   page. After every `npm run build` this script (it runs by itself as the "postbuild" step) writes the real TEXT of
   every page into the built HTML files:

     dist/index.html            Home          (also used by Vercel for any unknown address)
     dist/upcoming/index.html   Upcoming events (all Vibe-A-Thon details)
     dist/events/index.html     Events
     dist/team/index.html       Team
     dist/connect/index.html    Connect
     dist/register/index.html   Register
     dist/llms-full.txt         the whole site as one plain-text file

   The text comes from the same data files the website uses (src/data/site.js, src/data/vibeathonData.js,
   src/site/upcomingConfig.js, src/site/eventSwitches.js), so when you edit those files the text follows by itself.
   Events that are over (by the build date) move from "Upcoming" to "Past" on the next build.

   WHAT VISITORS SEE: nothing new. The text sits inside <div id="root"> (visually hidden), and React replaces it the
   moment the site starts. With JavaScript switched off, the text is shown as a plain readable page.

   SAFE BY DESIGN: if anything goes wrong, the script prints a warning and leaves the normal build untouched.

   COMMANDS
     node scripts/seo-prerender.mjs --install     adds  "postbuild": "node scripts/seo-prerender.mjs"  to package.json (once)
     npm run build                                runs vite build, then this script
   ===================================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const SITE = 'https://sipnacoders.club';
const MARK_START = '<!--seo-static:start-->';
const MARK_END = '<!--seo-static:end-->';

const log = (...a) => console.log('[seo-prerender]', ...a);
const warn = (...a) => console.warn('[seo-prerender]', ...a);

/* ------------------------------------------------------------------ install (package.json) */
function install() {
  const p = path.join(ROOT, 'package.json');
  const raw = fs.readFileSync(p, 'utf8');
  if (/"postbuild"\s*:/.test(raw)) { log('package.json already has "postbuild". Nothing to do.'); return; }
  const re = /("build"\s*:\s*"vite build",)(\r?\n)([ \t]*)/;
  if (!re.test(raw)) {
    warn('Could not find the "build": "vite build" line in package.json. Nothing was changed.');
    process.exitCode = 1;
    return;
  }
  const next = raw.replace(re, (_, a, nl, ind) => `${a}${nl}${ind}"postbuild": "node scripts/seo-prerender.mjs",${nl}${ind}`);
  JSON.parse(next); // must still be valid JSON
  fs.writeFileSync(p, next);
  log('Added "postbuild" to package.json.');
}

/* ------------------------------------------------------------------ small helpers */
const arr = (x) => (Array.isArray(x) ? x : []);
const str = (x) => String(x ?? '').replace(/\s+/g, ' ').trim();
const A = (label, url) => `[${label}](${url})`;
const safe = (name, fn) => {
  try { return fn() || []; } catch (e) { warn(`section "${name}" skipped:`, e.message); return []; }
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inline = (s) => esc(s).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, l, u) => `<a href="${u}">${l}</a>`);

const nice = (d) => str(d).replace(/\b([A-Z])([A-Z]{2})\b/g, (_, a, b) => a + b.toLowerCase()); // 21 NOV 2026 -> 21 Nov 2026
const longDate = (iso) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

function todayIST() {
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ read the site's data files */
async function loadData() {
  const esbuild = await import('esbuild'); // comes with Vite
  const abs = (p) => JSON.stringify(path.join(ROOT, p).replace(/\\/g, '/'));
  const stubAssets = {
    name: 'stub-assets',
    setup(b) {
      b.onResolve({ filter: /\.(webp|png|jpe?g|gif|svg|avif|ico|lottie|mp4|webm|woff2?)$/i }, (a) => ({ path: a.path, namespace: 'stub' }));
      b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export default "";', loader: 'js' }));
    },
  };
  const entry = [
    `export * as site from ${abs('src/data/site.js')};`,
    `export * as vibe from ${abs('src/data/vibeathonData.js')};`,
    `export * as up from ${abs('src/site/upcomingConfig.js')};`,
    `export * as sw from ${abs('src/site/eventSwitches.js')};`,
  ].join('\n');
  const out = await esbuild.build({
    stdin: { contents: entry, resolveDir: ROOT, loader: 'js' },
    bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent', plugins: [stubAssets],
  });
  const code = out.outputFiles[0].text;
  const tmp = path.join(os.tmpdir(), `seo-data-${process.pid}-${Date.now()}.mjs`);
  fs.writeFileSync(tmp, code);
  try {
    return await import(pathToFileURL(tmp).href);
  } finally {
    try { fs.unlinkSync(tmp); } catch { /* ignore */ }
  }
}

/* ------------------------------------------------------------------ the text of every page */
function buildPages(d, today) {
  const site = d.site || {};
  const vibe = d.vibe || {};
  const up = d.up || {};
  const sw = d.sw || {};
  const LINKS = site.LINKS || {};
  const email = LINKS.email || 'team@sipnacoders.club';
  const membership = LINKS.membershipForm || '';
  const clashForm = sw.CODE_CLASH_FORM || '';

  /* which events are still ahead (by the build date) */
  const END = { 'vibe-a-thon': '2026-12-27' }; // Vibe-A-Thon runs two days; the data file only holds its first day
  const all = arr(site.pastEvents).map((e) => ({ ...e, date: nice(e.date), end: END[e.id] || e.sortDate || '' }));
  const ahead = all.filter((e) => e.end && e.end >= today).sort((a, b) => String(a.sortDate).localeCompare(String(b.sortDate)));
  const done = all.filter((e) => !(e.end && e.end >= today)).sort((a, b) => String(b.sortDate).localeCompare(String(a.sortDate)));
  const manual = arr(site.upcomingEvents).map((e) => ({
    id: e.id, title: e.title, category: e.category, date: str(e.date).replace('T', ' ') + (e.date ? ' IST' : 'Date to be announced'),
    description: e.description, venue: e.venue, registerLink: e.registerLink, sortDate: str(e.date).slice(0, 10), manual: true,
  }));
  const upcoming = [...ahead, ...manual];

  /* ---- facts per event ---- */
  const factsFor = (ev) => {
    if (ev.id === 'code-clash') {
      return [
        'What: online coding competition on HackerRank',
        'When: 21 November 2026, 2 PM to 4 PM IST',
        'Format: two rounds, solo entry. Use any language HackerRank supports (Java, C++, Python and more)',
        'Who can join: all engineering students',
        'Registration fee: ₹49',
        'Rewards: HackerRank Infinity Plan, mock interview credits and 1,500+ AI tools. Every participant gets a certificate',
        'Organised under HackerRank Campus Crew, in association with Sipna Coders Club',
        clashForm ? `Register: ${A('Code Clash registration form', clashForm)}` : '',
      ].filter(Boolean);
    }
    if (ev.id === 'vibe-a-thon') {
      const det = (up.DETAILS && up.DETAILS.hackathon) || {};
      const fin = vibe.FINALE_EVENT_INFO || {};
      const prize = vibe.PRIZE_DATA || {};
      const dist = arr(prize.distribution).map((p) => `${p.title} ${p.amount}`).join(', ');
      const fee = vibe.FEE_DATA || {};
      const deadline = arr(vibe.EVENT_SCHEDULE).find((s) => /deadline/i.test(s.milestone || ''));
      return [
        `What: ${str(ev.description)}`,
        fin.dates ? `Final round: ${fin.dates} at ${fin.venue || 'Sipna COET, Amravati'}` : '',
        det.Format ? `Format: ${det.Format}` : '',
        det.Rounds ? `Rounds: ${det.Rounds}` : '',
        det['Team size'] ? `Team size: ${det['Team size']}` : '',
        det.Theme ? `Theme: ${det.Theme}` : '',
        prize.totalPool ? `Prize pool: ${prize.totalPool}${dist ? ` (${dist})` : ''}` : '',
        fee.round1 ? `Fees: ${fee.round1.amount} ${fee.round1.unit} for Round 1; ${fee.round2 ? `${String(fee.round2.amount).replace(/^\+/, '')} more only for the top 75 teams that reach Round 2` : ''}` : '',
        deadline ? `Round 1 registration and submission deadline: ${deadline.date}, ${deadline.time}` : '',
        `Register: ${A('Vibe-A-Thon registration page', SITE + '/register')}`,
        `All details: ${A('Upcoming events page', SITE + '/upcoming')}`,
      ].filter(Boolean);
    }
    return [
      ev.category ? `Type: ${ev.category}` : '',
      ev.date ? `When: ${ev.date}` : '',
      ev.venue ? `Where: ${ev.venue}` : '',
      ev.description ? `What: ${str(ev.description)}` : '',
      ev.registerLink ? `Register: ${A('Registration form', ev.registerLink)}` : '',
    ].filter(Boolean);
  };

  const upcomingBlocks = (level) => {
    const h = level === 2 ? 'h2' : 'h3';
    const sub = level === 2 ? 'h3' : 'h4';
    const b = [];
    if (!upcoming.length) {
      b.push([h, 'Upcoming events']);
      b.push(['p', `No event is announced right now (checked on ${longDate(today)}). New events are announced first on Instagram and LinkedIn.`]);
      return b;
    }
    b.push([h, `Upcoming events (${upcoming.length})`]);
    b.push(['p', `As of ${longDate(today)}, Sipna Coders Club has ${upcoming.length} upcoming event${upcoming.length > 1 ? 's' : ''}: ${upcoming.map((e) => `${e.title} (${e.date})`).join(' and ')}.`]);
    for (const ev of upcoming) {
      b.push([sub === 'h4' ? 'h3' : sub, `${ev.title}: ${ev.date}`]);
      b.push(['ul', factsFor(ev)]);
    }
    return b;
  };

  const pastBlocks = (title) => {
    if (!done.length) return [];
    return [
      ['h2', title],
      ['ul', done.map((e) => `${e.title} (${str(e.category)}, ${e.date}): ${str(e.description)}`)],
    ];
  };

  const contactBlocks = () => [
    ['h2', 'Contact'],
    ['ul', [
      `Email: ${A(email, 'mailto:' + email)}`,
      LINKS.instagram ? `Instagram: ${A('@sipnacoders.club', LINKS.instagram)}` : '',
      LINKS.linkedin ? `LinkedIn: ${A('Sipna Coders Club', LINKS.linkedin)}` : '',
      'Location: Sipna College of Engineering & Technology (Sipna COET), Amravati, Maharashtra, India',
    ].filter(Boolean)],
  ];

  const pagesList = () => [
    ['h2', 'Pages on this website'],
    ['ul', [
      `${A('Home', SITE + '/')}: what the club does, upcoming events, membership, past events, FAQ`,
      `${A('Events', SITE + '/events')}: every workshop, hackathon, seminar and build night so far`,
      `${A('Upcoming events', SITE + '/upcoming')}: everything about the next hackathon (Vibe-A-Thon)`,
      `${A('Team', SITE + '/team')}: the core team and the founding crew`,
      `${A('Connect', SITE + '/connect')}: email, Instagram, LinkedIn`,
      `${A('Register', SITE + '/register')}: Vibe-A-Thon registration`,
      `${A('Whole website as plain text', SITE + '/llms-full.txt')}`,
    ]],
    ['p', `This text was generated on ${longDate(today)}, when the website was last deployed. The live pages always have the newest details.`],
  ];

  const teamBlocks = () => safe('team', () => {
    const b = [['h2', 'Core team']];
    b.push(['ul', arr(site.TEAM).map((m) => `${m.name}: ${m.role}${m.status && m.status !== '—' ? ` (${m.status})` : ''}`)]);
    return b;
  });

  const programBlocks = () => safe('ambassadors', () => {
    const progs = site.PROGRAMS || {};
    const amb = arr(site.AMBASSADORS);
    if (!amb.length) return [];
    return [
      ['h2', 'Campus ambassadors in the club'],
      ['p', 'Club members who represent these programs on campus: ' + Object.values(progs).map((p) => p.name).join(', ') + '.'],
      ['ul', amb.map((m) => `${m.name} (${m.role}): ${arr(m.programs).map((k) => (progs[k] || {}).name).filter(Boolean).join(', ')}`)],
    ];
  });

  /* ---------------------------------------------------------------- HOME */
  const home = () => {
    const stats = arr(site.STATS).map((s) => `${s.value}${s.suffix || ''} ${s.label}`).join(', ');
    const b = [
      ['h1', 'Sipna Coders Club'],
      ['p', 'Sipna Coders Club is the coding community of Sipna College of Engineering & Technology (Sipna COET), Amravati, Maharashtra, India. Compile your future: not just a club, a runtime environment for the next generation of software engineers. Build, break, and ship code that matters.'],
      ['p', `We run workshops, hackathons, seminars and build nights in web development, DSA, AI, cloud and app development.${stats ? ` By the numbers: ${stats}.` : ''}`],
    ];
    b.push(...safe('upcoming', () => upcomingBlocks(2)));
    b.push(...safe('membership', () => [
      ['h2', 'Join Coders Community (membership)'],
      ['p', 'Registrations are open. Three simple steps and you are in.'],
      ['ul', arr(site.JOIN_STEPS).map((s, i) => `Step ${i + 1}, ${s.title}: ${s.desc}`)],
      membership ? ['p', `Membership form: ${A('Become a member', membership)}`] : null,
    ].filter(Boolean)));
    b.push(...safe('past', () => pastBlocks('Past events')));
    b.push(...safe('tracks', () => [
      ['h2', 'What we do'],
      ['ul', arr(site.TRACKS).map((t) => `${t.title}: ${t.desc}`)],
    ]));
    b.push(...safe('tools', () => (arr(site.TOOLS).length ? [['h2', 'Tools and platforms in our sessions'], ['p', arr(site.TOOLS).join(', ') + '.']] : [])));
    b.push(...programBlocks());
    b.push(...safe('faq', () => (arr(site.FAQ).length ? [['h2', 'Frequently asked questions'], ['ul', arr(site.FAQ).map((f) => `${f.q} ${str(f.a)}`)]] : [])));
    b.push(['h2', 'The founding crew'], ['p', `The members who started Sipna Coders Club and built the community we have today. Meet the current team on the ${A('Team page', SITE + '/team')}.`]);
    return b;
  };

  /* ---------------------------------------------------------------- UPCOMING (all Vibe-A-Thon details) */
  const upcomingPage = () => {
    const b = [
      ['h1', 'Upcoming events'],
      ['p', "Workshops, hackathons and contests. Here's what Sipna Coders Club is planning next."],
    ];
    b.push(...safe('upcoming', () => upcomingBlocks(2)));

    const vib = ahead.find((e) => e.id === 'vibe-a-thon') || all.find((e) => e.id === 'vibe-a-thon');
    if (!vib && !arr(vibe.EVENT_SCHEDULE).length) return b;

    b.push(['h2', 'Vibe-A-Thon: full details']);
    b.push(['p', 'Vibe-A-Thon is the 18-hour AI build-a-thon by Sipna Coders Club, with an online qualifier and an on-campus finale at Sipna COET, Amravati. Stop making pitch decks. Start deploying.']);

    b.push(...safe('journey', () => [
      ['h3', 'The journey in four stages'],
      ['ul', arr(vibe.EVENT_JOURNEY).map((s) => `${s.label}, ${s.title} (${s.tag}): ${s.summary} ${arr(s.points).join('; ')}.`)],
    ]));

    b.push(...safe('flow', () => {
      const F = up.FLOW;
      if (!F) return [];
      const r1 = F.r1 || {}; const r2 = F.r2 || {}; const link = F.link || {};
      const out = [['h3', F.title || 'The Two-Round Event Flow']];
      out.push(['p', `${r1.tag || 'Round 1'} (${r1.where || 'Online'}), ${r1.name || ''}: ${r1.intro || ''}`]);
      out.push(['ul', arr(r1.steps).map((s) => {
        const tools = arr(s.tools).length ? ` Tools: ${s.tools.join(', ')}.` : '';
        const lv = arr(s.levels).map((l) => ` ${l.tag} (${l.note}): ${l.desc}`).join('');
        return `${s.title}: ${s.desc}${tools}${lv}`;
      })]);
      if (link.big) out.push(['p', `${link.top || 'Top'} ${link.big} ${link.label || 'teams qualify'} for Round 2.`]);
      out.push(['p', `${r2.tag || 'Round 2'} (${r2.where || 'Offline'}), ${r2.name || ''}. Venue: ${r2.venue || ''}. ${r2.intro || ''}`]);
      out.push(['ul', arr(r2.phases).map((p) => `Hour ${p.from} to ${p.to}: ${p.title}${p.check ? ` (${p.check})` : ''}`)]);
      return out;
    }));

    b.push(...safe('schedule', () => [
      ['h3', 'Important dates'],
      ['ul', arr(vibe.EVENT_SCHEDULE).map((s) => `${s.date}, ${s.time}: ${s.milestone}. ${s.desc}`)],
    ]));

    b.push(...safe('finale', () => {
      const fin = vibe.FINALE_EVENT_INFO || {};
      const out = [['h3', 'Finale day schedule (18-hour offline finale)']];
      out.push(['p', `Dates: ${fin.dates || ''}. Duration: ${fin.duration || ''}. Build window: ${fin.buildWindow || ''}. Venue: ${fin.venue || ''}.`]);
      for (const day of arr(vibe.FINALE_SCHEDULE)) {
        out.push(['p', `${day.dayNumber}, ${day.dateLabel}: ${day.summary}`]);
        out.push(['ul', arr(day.events).map((e) => `${e.time}: ${e.title}. ${e.desc}`)]);
      }
      return out;
    }));

    b.push(...safe('why', () => [
      ['h3', 'Why participate'],
      ['ul', arr(vibe.WHY_PARTICIPATE).map((w) => `${w.title}: ${w.desc}`)],
    ]));

    b.push(...safe('prizes', () => {
      const p = vibe.PRIZE_DATA || {}; const f = vibe.FEE_DATA || {};
      const out = [['h3', 'Prizes, fees and certificates']];
      out.push(['p', `Total prize pool: ${p.totalPool || ''}.`]);
      out.push(['ul', arr(p.distribution).map((x) => `${x.title}: ${x.amount} (${x.tag})`)]);
      out.push(['ul', [
        f.round1 ? `${f.round1.title} (${f.round1.subtitle}): ${f.round1.amount} ${f.round1.unit}. ${f.round1.details || ''}` : '',
        f.round2 ? `${f.round2.title} (${f.round2.subtitle}): ${String(f.round2.amount).replace(/^\+/, '')} ${f.round2.unit}. Includes: ${arr(f.round2.inclusions).join('; ')}.` : '',
        f.totalSummary || '',
      ].filter(Boolean)]);
      out.push(['ul', arr(vibe.PARTICIPANT_TIERS).map((t) => `${t.category} (${t.scope}), ${t.certType}: ${arr(t.rewards).join('; ')}.`)]);
      return out;
    }));

    b.push(...safe('rules', () => {
      const out = [['h3', 'Rulebook']];
      for (const c of arr(vibe.RULEBOOK_CATEGORIES)) {
        out.push(['p', `${c.title}: ${c.intro}`]);
        out.push(['ul', arr(c.points)]);
      }
      return out;
    }));

    b.push(['p', `Register for Vibe-A-Thon on the ${A('Register page', SITE + '/register')}. This website is the only official registration portal.`]);
    return b;
  };

  /* ---------------------------------------------------------------- EVENTS */
  const eventsPage = () => {
    const b = [
      ['h1', 'Events'],
      ['p', "Workshops, hackathons, seminars and build nights. Everything Sipna Coders Club has done so far, event by event."],
    ];
    if (upcoming.length) {
      b.push(['h2', 'Coming up']);
      b.push(['ul', upcoming.map((e) => `${e.title} (${str(e.category)}, ${e.date}): ${str(e.description)}`)]);
    }
    b.push(...safe('past', () => pastBlocks('Past events: what we have done')));
    return b;
  };

  /* ---------------------------------------------------------------- TEAM */
  const teamPage = () => {
    const b = [
      ['h1', 'Meet the team'],
      ['p', 'The current core team of Sipna Coders Club: the people who plan the events, run the workshops and keep the club shipping.'],
    ];
    b.push(...teamBlocks());
    b.push(['h2', 'The founding crew'], ['p', 'The members who started Sipna Coders Club and built the community we have today.']);
    b.push(...programBlocks());
    b.push(['h2', 'Want to be part of the team?'], ['p', `Join the community, come to events and grow with us.${membership ? ` ${A('Become a member', membership)}` : ''}`]);
    return b;
  };

  /* ---------------------------------------------------------------- CONNECT */
  const connectPage = () => [
    ['h1', 'Get in touch'],
    ['p', 'Facing an issue or looking to collaborate? Sipna Coders Club usually replies within 24 hours.'],
    ...contactBlocks(),
    ['p', `You can also write a message on the ${A('Connect page', SITE + '/connect')}; it opens your email app with the message ready to send.`],
  ];

  /* ---------------------------------------------------------------- REGISTER */
  const registerPage = () => {
    const sched = arr(vibe.EVENT_SCHEDULE);
    const open = sched.find((s) => /registration opens/i.test(s.milestone || ''));
    const deadline = sched.find((s) => /deadline/i.test(s.milestone || ''));
    const fee = vibe.FEE_DATA || {};
    return [
      ['h1', 'Register for Vibe-A-Thon'],
      ['p', 'Vibe-A-Thon is the 18-hour AI build-a-thon by Sipna Coders Club. Fill the registration form on this page to participate. Limited seats available. The form is embedded on this page: https://sipnacoders.club/register . This website is the only official registration portal.'],
      ['ul', [
        'Team size: 1 to 4 members (solo is allowed)',
        open ? `Registration opens: ${open.date}, ${open.time}` : '',
        deadline ? `Round 1 registration and submission deadline: ${deadline.date}, ${deadline.time}` : '',
        fee.round1 ? `Round 1 fee: ${fee.round1.amount} ${fee.round1.unit}` : '',
        fee.round2 ? `Round 2 fee: ${fee.round2.amount} ${fee.round2.unit}, only for the top 75 teams` : '',
      ].filter(Boolean)],
      ['p', `Full rules, dates and prizes: ${A('Upcoming events page', SITE + '/upcoming')}.`],
    ];
  };

  const footer = [...contactBlocks(), ...pagesList()];
  return [
    { route: '/', title: 'Sipna Coders Club | Coding club of Sipna COET, Amravati', description: null, blocks: home(), footer },
    { route: '/upcoming', title: 'Upcoming events | Sipna Coders Club', description: upcoming.length ? `Upcoming events of Sipna Coders Club, Amravati: ${upcoming.map((e) => `${e.title} (${e.date})`).join(' and ')}. Dates, rules, prizes and registration.` : 'Upcoming events of Sipna Coders Club, Amravati. New events are announced first on Instagram and LinkedIn.', blocks: upcomingPage(), footer },
    { route: '/events', title: 'Events | Sipna Coders Club', description: 'Workshops, hackathons, seminars and build nights by Sipna Coders Club, Amravati. Every event so far, with dates and what happened.', blocks: eventsPage(), footer },
    { route: '/team', title: 'Team | Sipna Coders Club', description: 'Meet the core team of Sipna Coders Club, the coding community of Sipna College of Engineering & Technology, Amravati.', blocks: teamPage(), footer },
    { route: '/connect', title: 'Connect | Sipna Coders Club', description: 'Contact Sipna Coders Club: email, Instagram and LinkedIn. We usually reply within 24 hours.', blocks: connectPage(), footer: pagesList() },
    { route: '/register', title: 'Register | Sipna Coders Club', description: 'Register for Vibe-A-Thon, the 18-hour AI build-a-thon by Sipna Coders Club. Team size 1 to 4, Round 1 is online.', blocks: registerPage(), footer },
  ];
}

/* ------------------------------------------------------------------ renderers */
function renderHtml(blocks) {
  return blocks.map(([t, v]) => {
    if (t === 'ul') return `<ul>${arr(v).filter(Boolean).map((x) => `<li>${inline(x)}</li>`).join('')}</ul>`;
    if (t === 'p') return `<p>${inline(v)}</p>`;
    return `<${t}>${inline(v)}</${t}>`;
  }).join('\n');
}

function renderMd(blocks, shift) {
  return blocks.map(([t, v]) => {
    if (t === 'ul') return arr(v).filter(Boolean).map((x) => `- ${x}`).join('\n');
    if (t === 'p') return String(v);
    const n = Number(t.slice(1)) + shift;
    return `${'#'.repeat(Math.min(n, 6))} ${v}`;
  }).join('\n\n');
}

/* ------------------------------------------------------------------ put it into the built HTML */
const HIDE_CSS = '.seo-static{position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip:rect(0,0,0,0);clip-path:inset(50%)}';
const SHOW_CSS = 'body{background:#06070a}.seo-static{position:static;width:auto;height:auto;max-width:760px;margin:0 auto;padding:40px 20px;overflow:visible;clip:auto;clip-path:none;font:16px/1.6 system-ui,sans-serif;color:#e8eaf0;text-align:left}.seo-static a{color:#7cf2d4}.seo-static h1,.seo-static h2,.seo-static h3{line-height:1.25}';

function setMeta(html, attr, name, content) {
  const re = new RegExp(`(<meta\\s+${attr}="${name}"\\s+content=")[^"]*(")`);
  return re.test(html) ? html.replace(re, (_, a, b) => `${a}${esc(content)}${b}`) : html;
}

function makeHtml(base, page) {
  let html = base;
  const url = SITE + (page.route === '/' ? '/' : page.route);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, (_, a, b) => `${a}${url}${b}`);
  if (page.route !== '/') {
    html = setMeta(html, 'name', 'description', page.description);
    html = setMeta(html, 'property', 'og:title', page.title);
    html = setMeta(html, 'property', 'og:description', page.description);
    html = setMeta(html, 'property', 'og:url', url);
    html = setMeta(html, 'name', 'twitter:title', page.title);
    html = setMeta(html, 'name', 'twitter:description', page.description);
  }
  // the old short <noscript> summary is replaced by the full text below
  html = html.replace(/<noscript>\s*<main[\s\S]*?<\/main>\s*<\/noscript>\s*/, '');
  const head = `<style id="seo-static-css">${HIDE_CSS}</style>\n    <noscript><style>${SHOW_CSS}</style></noscript>\n    <link rel="alternate" type="text/plain" href="/llms-full.txt" title="The whole website as plain text" />\n  `;
  html = html.replace('</head>', head + '</head>');
  const block = `${MARK_START}<div class="seo-static">\n${renderHtml([...page.blocks, ...arr(page.footer)])}\n</div>${MARK_END}`;
  html = html.replace(/<div id="root"\s*>\s*<\/div>/, `<div id="root">${block}</div>`);
  return html;
}

function check(html, label) {
  if (!html.includes('<div id="root">' + MARK_START)) throw new Error(`${label}: root block missing`);
  if (!/<script[^>]+type="module"/.test(html)) throw new Error(`${label}: app script missing`);
  if (!html.includes('</html>')) throw new Error(`${label}: broken HTML`);
  if (html.length > 400000) throw new Error(`${label}: too large`);
}

async function main() {
  const indexPath = path.join(DIST, 'index.html');
  if (!fs.existsSync(indexPath)) { warn('dist/index.html not found. Run "npm run build" first. Skipping.'); return; }
  const base = fs.readFileSync(indexPath, 'utf8');
  if (base.includes(MARK_START)) { log('already done for this build. Nothing to do.'); return; }
  if (!/<div id="root"\s*>\s*<\/div>/.test(base)) { warn('could not find <div id="root"></div> in dist/index.html. Skipping.'); return; }

  const data = await loadData();
  const today = todayIST();
  const pages = buildPages(data, today);

  // 1) build everything in memory and check it
  const outputs = pages.map((p) => {
    const html = makeHtml(base, p);
    check(html, p.route);
    return { page: p, html };
  });
  const full = [
    '# Sipna Coders Club: the whole website as plain text',
    `Generated on ${longDate(today)} from ${SITE}. Each section below is one page of the website.`,
    ...pages.map((p) => `<!-- ${SITE}${p.route === '/' ? '/' : p.route} -->\n${renderMd(p.blocks, 1)}`),
    renderMd(pages[0].footer, 1),
  ].join('\n\n') + '\n';

  // 2) write (inner pages first, home last)
  for (const { page, html } of outputs) {
    if (page.route === '/') continue;
    const dir = path.join(DIST, page.route.slice(1));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
  }
  fs.writeFileSync(path.join(DIST, 'llms-full.txt'), full);
  const llms = path.join(DIST, 'llms.txt');
  if (fs.existsSync(llms)) {
    const t = fs.readFileSync(llms, 'utf8');
    if (!t.includes('llms-full.txt')) fs.writeFileSync(llms, t.replace(/\s*$/, '\n') + `\n## Full text\n\n- [The whole website as plain text](${SITE}/llms-full.txt): every page in one file\n`);
  }
  fs.writeFileSync(indexPath, outputs.find((o) => o.page.route === '/').html);

  log(`done. Text written into ${outputs.length} pages + llms-full.txt (${(full.length / 1024).toFixed(1)} KB). Build date ${today}.`);
}

/* ------------------------------------------------------------------ start (kept at the end on purpose) */
if (process.argv.includes('--install')) {
  install();
  process.exit(process.exitCode ?? 0);
}

try {
  await main();
} catch (e) {
  warn('skipped. The site is built exactly as before. Reason:', e && e.message ? e.message : e);
}
process.exit(0);
