/* =====================================================================
   VIBE-A-THON CENTRALIZED DATA CONFIGURATION
   ---------------------------------------------------------------------
   Single source of truth for all sections of the Vibe-A-Thon experience.
   Edit content, dates, rulebook, perks, and milestones directly here.
   ===================================================================== */

export const WHY_PARTICIPATE = [
  {
    num: '01',
    tag: 'INDUSTRY_CRED',
    title: 'Official Certification & Honors',
    desc: 'Earn verified HackerRank campus crew credentials for your participation, compete for podium honors, and unlock access to 1,500+ AI developer tools.',
    icon: 'Trophy',
    accent: '#3ddc84',
  },
  {
    num: '02',
    tag: 'PRODUCTION',
    title: 'Build & Deploy Real Software',
    desc: 'Move beyond theoretical learning and sandbox tutorials. Engineer, test, and ship functional, production-ready software deployed live on Vercel.',
    icon: 'Terminal',
    accent: '#4c8dff',
  },
  {
    num: '03',
    tag: 'OFFLINE_ARENA',
    title: '18-Hour Build Marathon',
    desc: 'Experience the electric atmosphere of a continuous overnight offline build sprint at Sipna COET. Push your stamina, solve bugs, and pitch live.',
    icon: 'Zap',
    accent: '#ff5468',
  },
  {
    num: '04',
    tag: 'SQUAD_SYNAPSE',
    title: 'Teamwork & Solo Flexibility',
    desc: 'Form a squad of 1 to 4 coders or test your skills solo. Collaborate across disciplines, overcome blockers, and build alongside top student creators.',
    icon: 'Users',
    accent: '#fbbc05',
  },
  {
    num: '05',
    tag: 'PORTFOLIO_PROOF',
    title: 'Resume Proof-of-Work',
    desc: 'Produce a verified open-source repository with documentation and a README Vibe Log that demonstrates hands-on engineering to recruiters.',
    icon: 'Globe',
    accent: '#7cf2d4',
  },
  {
    num: '06',
    tag: 'AI_WORKFLOWS',
    title: 'AI-Powered Vibe Coding',
    desc: 'Master next-generation development. Leverage modern AI-assisted engineering tools and prompt-driven workflows to accelerate build velocity 10x.',
    icon: 'Sparkles',
    accent: '#7cf2d4',
  },
  
];

export const EVENT_JOURNEY = [
  {
  stage: '01',
  label: 'Stage 01',
  title: 'Team Registration',
  tag: 'INITIALIZE',
  accent: '#7cf2d4',
  icon: 'ClipboardList',
  summary: 'Create your team, add your members, and register for Round 1.',
  points: [
    'Team size: 1 to 4 members (solo participation is allowed)',
    'Choose a team leader and enter all team members’ details',
    'Pay the Round 1 registration fee of ₹200 per team',
  ],
},
  {
  stage: '02',
  label: 'Stage 02',
  title: 'Online Qualifier',
  tag: 'ROUND 1',
  accent: '#4c8dff',
  icon: 'Terminal',
  summary: 'Choose a problem statement, build your project using AI tools, and deploy it online.',
  points: [
    'Choose 1 problem statement from the 10 available options',
    'Build your frontend using AI-assisted coding tools',
    'Deploy your project on Vercel',
    'Submit your Vercel link, public GitHub repository, and README Vibe Log',
  ],
},
  {
  stage: '03',
  label: 'Stage 03',
  title: 'Top 75 Selection',
  tag: 'EVALUATION',
  accent: '#fbbc05',
  icon: 'Check',
  summary: 'The technical jury reviews all submissions and selects the top 75 teams.',
  points: [
    'The jury checks your project, live demo, and GitHub code',
    'Top 75 teams announced: 17–18 Dec 2026',
    // 'Selected teams must pay the ₹500 Round 2 fee between 17–22 Dec 2026 (food and stay included)',
  ],
},
  {
  stage: '04',
  label: 'Stage 04',
  title: '18-Hour Offline Finale',
  tag: 'ARENA SPRINT',
  accent: '#ff5468',
  icon: 'Zap',
  summary: 'Build and present your final project in an 18-hour offline hackathon at Sipna COET.',
  points: [
    'Selected teams check in at Sipna COET on 26 Dec, 10 AM',
    'The 18-hour hackathon starts at 2:00 PM',
    'Live project presentations on 27 Dec, 10 AM',
    'Prize distribution of ₹40,000+ on 27 Dec, 2 PM',
  ],
},
];

/* =====================================================================
   SECTION 4 — RULEBOOK CATEGORIES
   6 consolidated categories. Update TBD placeholders when confirmed.
   ===================================================================== */
export const RULEBOOK_CATEGORIES = [
  {
    id: '01',
    tag: 'TEAM_PROTOCOLS',
    title: 'Team & Eligibility',
    icon: 'Users',
    intro: 'Form your squad. Know the rules before you register.',
    points: [
      'Team size: 1 to 4 members per team (including the Team Leader). Solo participation is fully permitted.',
      'Every team must designate a Team Leader responsible for all official communications.',
      'Cross-college teams are permitted.',
      'All members must be currently enrolled students at an accredited institution at the time of registration.',
      'Duplicate registrations or misrepresentation of team details results in immediate disqualification.',
    ],
  },
  {
    id: '02',
    tag: 'FORMAT_TIMELINE',
    title: 'Event Format & Timeline',
    icon: 'GitBranch',
    intro: 'Two rounds. One chance. Know the full format end to end.',
    points: [
      'Round 1 (Online Qualifier): Build and deploy one problem statement module using AI-assisted tools.',
      'Round 1 submission requires a live Vercel deployment URL and a public GitHub repository with a README Vibe Log.',
      'Round 1 registration & submission deadline: 12 December 2026.',
      'Top 75 qualifying teams announcement: 17–18 December 2026.',
      //'Round 2 payment window: 17 December – 22 December 2026 (only for Top 75 qualifiers).',
      'Round 2 (Offline Finale): 26–27 December 2026 at Sipna COET, Amravati — a continuous 18-hour build marathon.',
    ],
  },
  {
    id: '03',
    tag: 'REG_PROTOCOLS',
    title: 'Registration & Fees',
    icon: 'ClipboardList',
    intro: 'Registration details and two-phase fee structure.',
    points: [
      'Round 1 Registration Fee: ₹200 per team (payable during initial registration, deadline: 12 December 2026).',
      // 'Teams qualifying for the Top 75 must pay an additional ₹500 during the payment window (17–22 December 2026).',
      'Food and campus accommodation for the entire 18-hour event.',
      // 'Total potential fee for a qualifying team is ₹700 across both phases (non-qualifying teams pay only ₹200).',
      'Round 2 payment instructions will be shared directly with qualified teams.',
      'All official registrations and payments must be processed solely through sipnacoders.club.',
    ],
  },
  {
  id: '04',
  tag: 'PROJECT_SPECS',
  title: 'Project & Submission',
  icon: 'Terminal',
  intro: 'Project requirements and submission guidelines.',
  points: [
    'Choose exactly one of the 10 Round 1 problem statements.',
    'AI-assisted development tools are permitted.',
    'Include at least one functional AI feature.',
    'Deploy your project on Vercel.',
    'Submit a public GitHub repository with a Vibe Log in README.md.',
    'Round 1 submissions close on 12 December 2026 at 11:59 PM.',
  ],
},
  {
    id: '05',
    tag: 'EVAL_MATRIX',
    title: 'Judging & Rewards',
    icon: 'Trophy',
    intro: 'Compete for ₹40,000+ in cash prizes and exclusive HackerRank winner perks.',
    points: [
      'Projects are evaluated on Innovation, Technical Architecture, Execution, AI Implementation, and Live Demo.',
      'Judging panel decisions are definitive and binding.',
      'Winners (1st, 2nd, 3rd) receive cash prizes (₹25,000 / ₹10,000 / ₹5,000) and exclusive HackerRank rewards: HackerRank Infinity Subscription, Mock Interview Credits, Access to 1,500+ AI Tools, and Official HackerRank Goodies.',
      'Other Round 2 finalists receive an official physical HackerRank campus crew Certificate of Participation.',
      'All Round 1 participants receive an official HackerRank campus crew e-Certificate of Participation.',
    ],
  },
  {
  id: '06',
  tag: 'SUPPORT_NODE',
  title: 'Organizers & Support',
  icon: 'Globe',
  intro: 'Officially organized by Sipna Coders Club.',
  points: [
    'Organizer: Sipna Coders Club, Sipna College of Engineering & Technology, Amravati.',
    'Official Support: team@sipnacoders.club',
    'Official Instagram: @sipnacoders.club',
    'This website (sipnacoders.club) is the ONLY official registration portal for Vibe-A-Thon.',
    'Do not register, submit details, or make payments through any other website or unofficial links.',
  ],
},
];


/* =====================================================================
   SECTION 5 — PRIZE POOL, REGISTRATION FEES & WHAT'S INCLUDED
   ===================================================================== */
export const PRIZE_DATA = {
  totalPool: '₹40,000+',
  eventHighlight: '18-Hour Offline Finale',
  distribution: [
    {
      rank: '01',
      title: '1st Prize',
      amount: '₹25,000+',
      accent: '#7cf2d4',
      accentRgb: '124, 242, 212',
      featured: true,
      tag: 'CHAMPION',
      icon: 'Trophy',
    },
    {
      rank: '02',
      title: '2nd Prize',
      amount: '₹10,000+',
      accent: '#fbbc05',
      accentRgb: '251, 188, 5',
      featured: false,
      tag: 'RUNNER-UP',
      icon: 'Zap',
    },
    {
      rank: '03',
      title: '3rd Prize',
      amount: '₹5,000+',
      accent: '#ff5468',
      accentRgb: '255, 84, 104',
      featured: false,
      tag: '2ND RUNNER-UP',
      icon: 'Sparkles',
    },
  ],
};

export const FEE_DATA = {
  round1: {
    title: 'Round 1',
    subtitle: 'Initial Registration',
    amount: '₹200',
    unit: 'per team',
    payable: 'Paid upon initial registration',
    details: 'Covers Round 1 registration for all team members (1–4 members).',
  },
  round2: {
    title: 'Round 2',
    subtitle: 'Top 75 Qualifiers Only',
    amount: '-',
    unit: 'additional / team',
    payable: 'Payable only by teams qualifying for Round 2',
    inclusions: [
      'Food provided during the 18-hour event',
      'Accommodation / stay for the entire 18-hour event',
    ],
    // Registration Matrix, Round 2 box: the dates under the Publishing soon strip
    schedule: [
      { label: 'Round 2 Payment Window', value: '17–22 Dec 2026' },
    ],
  },
};

// "Publishing soon": while this is not empty, every Round 2 block of the page (Registration Matrix box, Milestone Schedule row, Event Flow card) shows ONLY this text.
// When Round 2 is ready, set it to '' (two quotes, nothing between) and the full Round 2 content is back everywhere.
export const ROUND2_SOON = 'Publishing soon';

export const PARTICIPANT_TIERS = [
  {
    tier: '01',
    category: 'Winners & Runners-Up',
    scope: '1st, 2nd & 3rd Place',
    tag: 'PODIUM TEAMS',
    accent: '#7cf2d4',
    accentRgb: '124, 242, 212',
    icon: 'Trophy',
    certBadge: 'CASH + PERKS',
    certType: 'Physical Trophy & Cash',
    rewards: [
      'Cash prizes from ₹40,000+ pool (₹25,000 1st / ₹10,000 2nd / ₹5,000 3rd)',
      'HackerRank Infinity Subscription',
      'Mock Interview Credits',
      'Official HackerRank Goodies & Access to 1,500+ AI Tools',
    ],
  },
  {
    tier: '02',
    category: 'Other Round 2 Participants',
    scope: 'Top 75 Non-Podium Finalists',
    tag: 'OFFLINE FINALE',
    accent: '#4c8dff',
    accentRgb: '76, 141, 255',
    icon: 'Files',
    certBadge: 'PHYSICAL CERTIFICATE',
    certType: 'Printed Hardcopy',
    rewards: [
      'Official physical HackerRank campus crew Certificate of Participation',
      'Food & 18-hour accommodation provided on campus',
    ],
  },
  {
    tier: '03',
    category: 'Round 1 Participants',
    scope: 'All Registered Qualifier Teams',
    tag: 'ALL PARTICIPANTS',
    accent: '#94a3b8',
    accentRgb: '148, 163, 184',
    icon: 'Code',
    certBadge: 'DIGITAL E-CERTIFICATE',
    certType: 'Verified e-Certificate',
    rewards: [
      'Official HackerRank campus crew e-Certificate of Participation',
      'Qualifier problem statement review & jury evaluation',
    ],
  },
];

export const CERTIFICATE_SUMMARY = [
  {
    category: '1st, 2nd & 3rd Place',
    scope: 'Podium Winners',
    recognition: 'Cash prizes + HackerRank rewards',
    format: 'Cash + Goodies + Accolades',
    badge: 'WINNERS',
    accent: '#7cf2d4',
  },
  {
    category: 'Other Round 2 Participants',
    scope: 'Offline Finalists',
    recognition: 'Official physical HackerRank campus crew Certificate',
    format: 'Physical Certificate',
    badge: 'PHYSICAL',
    accent: '#4c8dff',
  },
  {
    category: 'Round 1 Participants',
    scope: 'All Qualifier Teams',
    recognition: 'HackerRank campus crew e-Certificate',
    format: 'Digital e-Certificate',
    badge: 'E-CERTIFICATE',
    accent: '#94a3b8',
  },
];


/* =====================================================================
   SECTION 6 — EVENT SCHEDULE & TIMELINE
   All dates/times are TBD. Update when confirmed.
   ===================================================================== */
export const EVENT_SCHEDULE = [
  {
    id: '01',
    phase: 'PRE-EVENT',
    milestone: 'Registration Opens',
    time: '11:00 AM',
    date: '16 Nov 2026',
    desc: 'Official registration form goes live. Teams (1–4 members) can register and submit participant details.',
    accent: '#7cf2d4',
    accentRgb: '124, 242, 212',
    icon: 'ClipboardList',
  },
  {
    id: '02',
    phase: 'ROUND 1',
    milestone: 'Problem Statements Released',
    time: '-',
    date: ' Nov 2026',
    desc: '10 problem statements are published. Teams choose one and begin building their Round 1 module.',
    accent: '#4c8dff',
    accentRgb: '76, 141, 255',
    icon: 'Terminal',
  },
  {
    id: '03',
    phase: 'ROUND 1',
    milestone: 'Round 1 Registration & Submission Deadline',
    time: '11:59 PM',
    date: '12 Dec 2026',
    desc: 'Final deadline for Round 1 registration (₹200/team) and submission of GitHub repo & live Vercel URL.',
    accent: '#ff5468',
    accentRgb: '255, 84, 104',
    icon: 'Send',
  },
  {
    id: '04',
    phase: 'SELECTION',
    milestone: 'Top 75 Finalists Announced',
    time: 'Official Channels',
    date: '17–18 Dec 2026',
    desc: 'Shortlisted teams notified via email and announced on official Sipna Coders Club channels.',
    accent: '#fbbc05',
    accentRgb: '251, 188, 5',
    icon: 'Check',
  },
  {
    id: '05',
    phase: 'ROUND 2',
    milestone: 'Round 2 Payment Window',
    time: 'Finalist Portal',
    date: '17–22 Dec 2026',
    desc: 'Details will be share soon',
    // desc: 'Top 75 qualifying teams pay the ₹500 Round 2 fee (covering food and stay for the 18-hour event).',
    accent: '#7cf2d4',
    accentRgb: '124, 242, 212',
    icon: 'CreditCard',
  },
  {
    id: '06',
    phase: 'FINALE',
    milestone: '18-Hour Offline Finale Begins',
    time: '10:00 AM Check-in',
    date: '26 Dec 2026',
    desc: 'Top 75 teams report to Sipna COET. Build commences officially at 2:00 PM for continuous 18 hours.',
    accent: '#ff5468',
    accentRgb: '255, 84, 104',
    icon: 'Zap',
  },
  {
    id: '07',
    phase: 'FINALE',
    milestone: 'Final Demos & Closing Ceremony',
    time: '10:00 AM & 2:00 PM',
    date: '27 Dec 2026',
    desc: 'Stage presentations from 10:00 AM – 12:00 PM, followed by the Winner Announcement & Closing Ceremony from 2:00 PM onwards.',
    accent: '#7cf2d4',
    accentRgb: '124, 242, 212',
    icon: 'Trophy',
  },
];


/* =====================================================================
   SECTION 8 — VIBE-A-THON 18-HOUR FINALE DAY SCHEDULE
   Complete chronological schedule for 26–27 December 2026 at Sipna COET.
   ===================================================================== */
export const FINALE_EVENT_INFO = {
  dates: '26–27 December 2026',
  duration: '18 Hours',
  buildWindow: '26 Dec, 2:00 PM – 27 Dec, 8:00 AM',
  buildStart: '26 December 2026, 2:00 PM',
  buildEnd: '27 December 2026, 8:00 AM',
  venue: 'Sipna College of Engineering & Technology, Amravati',
};

export const FINALE_SCHEDULE = [
  {
    dayId: 'day-01',
    dayNumber: 'DAY 01',
    dateLabel: '26 DECEMBER 2026',
    summary: 'Check-in, inauguration & the official 18-hour build launch.',
    events: [
      {
        id: '01',
        title: 'Registration & Check-in',
        time: '10:00 AM – 11:00 AM',
        desc: 'Attendance, participant verification and ID card collection.',
        venue: 'VENUE: TO BE ANNOUNCED',
        type: 'standard',
        icon: 'ClipboardList',
      },
      {
        id: '02',
        title: 'Instructions & Inauguration',
        time: '11:00 AM – 12:00 PM',
        desc: 'Event instructions, guidelines and official inauguration.',
        venue: 'VENUE: TO BE ANNOUNCED',
        type: 'standard',
        icon: 'Files',
      },
      {
        id: '03',
        title: 'Lunch Break',
        time: '12:00 PM – 2:00 PM',
        desc: 'Lunch for participants.',
        venue: 'VENUE: TO BE ANNOUNCED',
        type: 'break',
        icon: 'Clock',
      },
      {
        id: '04',
        title: 'THE BUILD BEGINS — 18-HOUR TIMER',
        time: '2:00 PM onwards',
        desc: 'Official commencement of the 18-hour development challenge.',
        venue: 'VENUE: TO BE ANNOUNCED',
        type: 'primary-build',
        highlightTag: '18-HOUR TIMER ACTIVATED',
        icon: 'Zap',
      },
      {
        id: '05',
        title: 'First Evaluation',
        time: '5:00 PM – 7:00 PM',
        desc: 'First round of project evaluation.',
        venue: 'VENUE: TO BE ANNOUNCED',
        type: 'eval',
        icon: 'Search',
      },
      {
        id: '06',
        title: 'Fun Activity',
        time: '7:00 PM – 7:30 PM',
        desc: 'Interactive fun activity for participants.',
        venue: 'VENUE: TO BE ANNOUNCED',
        type: 'fun',
        icon: 'Sparkles',
      },
      {
        id: '07',
        title: 'Dinner Break',
        time: '8:00 PM – 9:00 PM',
        desc: 'Dinner for participants.',
        venue: 'VENUE: TO BE ANNOUNCED',
        type: 'break',
        icon: 'Clock',
      },
      {
        id: '08',
        title: 'Second Evaluation',
        time: '10:00 PM – 11:00 PM',
        desc: 'Second round of project evaluation.',
        venue: 'VENUE: TO BE ANNOUNCED',
        type: 'eval',
        icon: 'Search',
      },
    ],
  },
  {
    dayId: 'day-02',
    dayNumber: 'DAY 02',
    dateLabel: '27 DECEMBER 2026',
    summary: 'Code freeze, final project demos & closing ceremony.',
    events: [
      {
        id: '09',
        title: 'Code Freeze',
        time: '8:00 AM – 9:00 AM',
        desc: 'Final code submission and development freeze.',
        venue: 'VENUE: TO BE ANNOUNCED',
        type: 'milestone',
        highlightTag: 'SUBMISSION DEADLINE',
        icon: 'Terminal',
      },
      {
        id: '10',
        title: 'Breakfast Break',
        time: '9:10 AM – 10:00 AM',
        desc: 'Breakfast for participants.',
        venue: 'VENUE: TO BE ANNOUNCED',
        type: 'break',
        icon: 'Clock',
      },
      {
        id: '11',
        title: 'Final Demo & Project Presentation',
        time: '10:00 AM – 12:00 PM',
        desc: 'Final project demonstrations, presentations and evaluation.',
        venue: 'VENUE: TO BE ANNOUNCED',
        type: 'milestone',
        highlightTag: 'STAGE PRESENTATIONS',
        icon: 'Play',
      },
      {
        id: '12',
        title: 'Winner Announcement & Closing Ceremony',
        time: '2:00 PM onwards',
        desc: 'Winner announcement, prize distribution and official closing ceremony.',
        venue: 'VENUE: TO BE ANNOUNCED',
        type: 'ceremony',
        highlightTag: 'AWARDS CEREMONY',
        icon: 'Trophy',
      },
    ],
  },
];
