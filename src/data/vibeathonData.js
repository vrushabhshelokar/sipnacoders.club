/* =====================================================================
   VIBE-A-THON CENTRALIZED DATA CONFIGURATION
   ---------------------------------------------------------------------
   Single source of truth for all sections of the Vibe-A-Thon experience.
   Edit content, dates, rulebook, perks, and milestones directly here.
   ===================================================================== */

export const WHY_PARTICIPATE = [
  {
  num: '01',
  tag: 'HACKERRANK_PERKS',
  title: 'Exclusive Rewards & Opportunities',
  desc: 'Win a HackerRank Infinity Plan, mock interview credits, and official goodies. Get access to 1,500+ AI tools and earn an official HackerRank Participation Certificate.',
  icon: 'Trophy',
  accent: '#3ddc84',
},
  {
    num: '02',
    tag: 'RECOGNITION',
    title: 'Recognition & Rewards',
    desc: 'Compete for the ₹40,000+ prize pool, official winner accolades, merit certificates, and network with leading developer communities.',
    icon: 'Trophy',
    accent: '#7cf2d4',
  },
  {
    num: '03',
    tag: 'PRODUCTION',
    title: 'Build Real Projects',
    desc: 'Move beyond theoretical learning and sandbox tutorials. Engineer and ship functional, production-ready software under real-world constraints.',
    icon: 'Terminal',
    accent: '#7cf2d4',
  },
  {
    num: '04',
    tag: 'AI_WORKFLOWS',
    title: 'AI-Powered Development',
    desc: 'Master the next generation of software engineering. Experience modern AI-assisted, prompt-driven and vibe-coding tools to accelerate output 10x.',
    icon: 'Sparkles',
    accent: '#ff5468',
  },
  {
    num: '05',
    tag: 'SQUAD_ARENA',
    title: 'Compete & Collaborate',
    desc: 'Assemble your team of 1 to 4 coders. Brainstorm architectures, solve real development bottlenecks, and compete against the best student builders.',
    icon: 'Users',
    accent: '#4c8dff',
  },
  {
    num: '06',
    tag: 'PORTFOLIO_PROOF',
    title: 'Portfolio Enhancement',
    desc: 'Produce verified, live open-source projects with comprehensive README documentation that can be highlighted on your resume and in interviews.',
    icon: 'Globe',
    accent: '#fbbc05',
  },
  
];

export const EVENT_JOURNEY = [
  {
    stage: '01',
    label: 'Stage 01',
    title: 'Registration',
    tag: 'INITIALIZE',
    accent: '#7cf2d4',
    icon: 'ClipboardList',
    summary: 'Assemble your squad, lock in your team roster, and register for the qualifier.',
    points: [
      'Register your team (1 to 4 members)',
      'Submit participant information & profiles',
      'Complete registration requirements',
    ],
  },
  {
    stage: '02',
    label: 'Stage 02',
    title: 'Online Qualifier',
    tag: 'ROUND 1',
    accent: '#4c8dff',
    icon: 'Terminal',
    summary: 'Remote sprint: pick a problem statement, vibe-code your module, and ship live.',
    points: [
      'Work on the released problem statements',
      'Build using AI-assisted vibe coding workflows',
      'Deploy your live prototype on Vercel with GitHub log',
    ],
  },
  {
    stage: '03',
    label: 'Stage 03',
    title: 'Top 75 Selection',
    tag: 'EVALUATION',
    accent: '#fbbc05',
    icon: 'Check',
    summary: 'Submissions are vetted by the technical jury to select the finalists.',
    points: [
      'Projects undergo thorough technical jury review',
      'The Top 75 qualifying teams are selected',
      'Finalists receive detailed briefing for the offline finale',
    ],
  },
  {
    stage: '04',
    label: 'Stage 04',
    title: '18-Hour Offline Finale',
    tag: 'ARENA SPRINT',
    accent: '#ff5468',
    icon: 'Zap',
    summary: 'The ultimate 18-hour continuous build and pitch marathon at Sipna COET.',
    points: [
      'Qualified teams report on campus at Sipna COET',
      'Build, iterate, and connect full stack modules',
      'Pass desk checks and pitch live on stage to win',
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
      'Team size: 1 to 4 members per team.',
      'Every team must designate a Team Leader responsible for all official communications.',
      'Cross-college teams are permitted.',
      'All members must be enrolled students at an accredited institution at the time of registration.',
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
      'Round 1 submission requires a live Vercel deployment URL and a public GitHub repository.',
      'Top 75 qualifying teams will enter in next round.',
      'Qualifying Teams for Round 2 must pay the remaining Round 2 registration fee to confirm their participation. Refer to the Fees section for details.',
      'Round 2 (Offline Finale): Top 75 teams report to Sipna COET, Amravati.',
      'Round 2 is a continuous Live 18-hour build marathon - teams expand their Round 1 module into a full system.',
    ],
  },
  {
  id: '03',
  tag: 'REG_PROTOCOLS',
  title: 'Registration & Fees',
  icon: 'ClipboardList',
  intro: 'Registration details and payment requirements.',
  points: [
    'Registration Fee: ₹200 per team.',
    'Round 1 registration is covered by the initial fee.',
    'Teams qualifying for Round 2 must pay an additional ₹500.',
    'Round 2 fee includes food and accommodation for the full 18-hour event.',
    'Round 2 payment instructions will be shared with qualified teams.',
    'Registration Deadline: 12 December 2026.',
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
    'Round 1 submissons start soon',
  ],
},
  {
  id: '05',
  tag: 'EVAL_MATRIX',
  title: 'Judging & Prizes',
  icon: 'Trophy',
  intro: 'Compete for the ₹40,000+ prize pool.',
  points: [
    'Projects will be evaluated on Innovation, Technical Implementation, Functionality, User Experience, and Final Presentation.',
    'Judging decisions by the organizing team are final.',
    'Winner, Runner-Up, and Second Runner-Up receive cash prizes, trophies and Official hackerRank Goodies',
    'All participants receive a Certificate of Participation.',
    'Round 2 finalists receive a Certificate of Achievement.',
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
    amount: '+₹500',
    unit: 'additional / team',
    payable: 'Payable only by teams qualifying for Round 2',
    inclusions: [
      'Food provided during the 18-hour event',
      'Accommodation / stay for the entire 18-hour event',
    ],
  },
  totalSummary: 'Total potential cost: ₹700 per qualifying team (₹200 paid initially + ₹500 paid only after qualifying for Round 2). Non-qualifying teams pay only ₹200.',
};

export const PARTICIPANT_TIERS = [
  {
    tier: '01',
    category: 'Winners & Runners-Up',
    scope: '1st, 2nd & 3rd Place',
    tag: 'PODIUM TEAMS',
    accent: '#7cf2d4',
    accentRgb: '124, 242, 212',
    icon: 'Trophy',
    certBadge: 'CASH + GOODIES',
    certType: 'Physical Trophy & Cash',
    rewards: [
      'Respective cash prizes from ₹40,000+ pool (₹25k / ₹10k / ₹5k)',
      'Official HackerRank rewards & exclusive goodies',
      'Mock interview credits & HackerRank Infinity Plan benefits',
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
      'Access to 1,500+ AI developer tools',
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
      'Access to 1,500+ AI developer tools',
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
    time: '11 Am',
    date: '16 Nov 2026',
    desc: 'Official registration form goes live. Teams can register and submit all required participant details.',
    accent: '#7cf2d4',
    accentRgb: '124, 242, 212',
    icon: 'ClipboardList',
  },
  {
    id: '02',
    phase: 'PRE-EVENT',
    milestone: 'Registration Closes',
    time: '12 Am',
    date: '12 Dec 2026',
    desc: 'Last day to submit team registrations. No entries will be accepted after the deadline.',
    accent: '#7cf2d4',
    accentRgb: '124, 242, 212',
    icon: 'Clock',
  },
  {
    id: '03',
    phase: 'ROUND 1',
    milestone: 'Problem Statements Released',
    time: '12 Am',
    date: '22 Nov 2026',
    desc: '10 problem statements are published. Teams choose one and begin building their Round 1 module.',
    accent: '#4c8dff',
    accentRgb: '76, 141, 255',
    icon: 'Terminal',
  },
  {
    id: '04',
    phase: 'ROUND 1',
    milestone: 'Round 1 Submission Deadline',
    time: '12 Am',
    date: '12 Dec 2026',
    desc: 'Submit your GitHub repo URL and live Vercel deployment link. No late submissions accepted.',
    accent: '#4c8dff',
    accentRgb: '76, 141, 255',
    icon: 'Send',
  },
  {
    id: '05',
    phase: 'SELECTION',
    milestone: 'Top 75 Results Announced',
    time: '12 Am',
    date: '17 -18 Dec 2026',
    desc: 'Shortlisted teams notified via email and announced on official Sipna Coders Club channels.',
    accent: '#fbbc05',
    accentRgb: '251, 188, 5',
    icon: 'Check',
  },
  {
    id: '06',
    phase: 'FINALE',
    milestone: 'Offline Finale — Day Begins',
    time: '9 Am',
    date: '26 Dec',
    desc: 'Top 75 teams report to Sipna COET, Amravati. 18-hour clock starts. Build, iterate, survive.',
    accent: '#ff5468',
    accentRgb: '255, 84, 104',
    icon: 'Zap',
  },
  {
    id: '07',
    phase: 'FINALE',
    milestone: 'Final Presentations & Results',
    time: '10 Am',
    date: '27 Dec 2026',
    desc: 'Shortlisted teams present their projects live on stage. Winners announced. Prizes distributed.',
    accent: '#ff5468',
    accentRgb: '255, 84, 104',
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
