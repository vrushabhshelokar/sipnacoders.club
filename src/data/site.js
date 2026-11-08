/* =====================================================================
   SIPNA CODERS CLUB - SITE CONTENT
   ---------------------------------------------------------------------
   Everything the website shows lives in this one file.

   ✏️  UPCOMING EVENTS  -> edit `upcomingEvents` below.
       - date: 'YYYY-MM-DDTHH:MM' in Indian time, e.g. '2026-12-12T10:00'
               leave '' if the date is not fixed yet (shows "Date TBA")
       - registerLink: paste the Google Form link ('' shows "Registration opens soon")
       - An event disappears from "Upcoming" by itself once it is over.

   ✏️  When an event is over, add it to `pastEvents` with its photos.
   ===================================================================== */

import logo from '../assets/coders_club_logo.webp';
import groupPhoto from '../assets/group1.webp';
import membershipPoster from '../assets/posters/membership.webp';

import Flutter_Flow from '../assets/events/flutter_flow.webp';
import Devthone from '../assets/events/devthone.webp';
import Tech_Treck from '../assets/events/tech_treck.webp';
import Treasure_X from '../assets/events/treasure_x.webp';
import TechTrek26_1 from '../assets/events/tech_trek_2026_1.webp';
import TechTrek26_2 from '../assets/events/tech_trek_2026_2.webp';
import TechTrek26_3 from '../assets/events/tech_trek_2026_3.webp';
import GitGithub_1 from '../assets/events/git_github_1.webp';
import GitGithub_2 from '../assets/events/git_github_2.webp';
import GitGithub_3 from '../assets/events/git_github_3.webp';
import BuildNight_1 from '../assets/events/gemini_buildnight_1.webp';
import BuildNight_2 from '../assets/events/gemini_buildnight_2.webp';
import BuildNight_3 from '../assets/events/gemini_buildnight_3.webp';
import FunNight_1 from '../assets/events/gemini_funnight_1.webp';
import FunNight_2 from '../assets/events/gemini_funnight_2.webp';
import FunNight_3 from '../assets/events/gemini_funnight_3.webp';
import FunNight_4 from '../assets/events/gemini_funnight_4.webp';

import ashay from '../assets/people/ashay.webp';
import vrushabh from '../assets/people/vrush.webp';
import shreya from '../assets/people/shreya.webp';
import srushti from '../assets/people/srushti.webp';
import atharva from '../assets/people/atharva.webp';
import ritesh from '../assets/people/ritesh.webp';
import sakshi from '../assets/people/sakshi.webp';
import harshdeep from '../assets/people/harshdeep.webp';
import uday from '../assets/people/uday.webp';
import chitra from '../assets/people/chitra.webp';
import mahi from '../assets/people/mahi.webp';
import pranav from '../assets/people/pranav.webp';

export { logo, groupPhoto, membershipPoster };

/* ---------------- links ---------------- */
export const LINKS = {
  joinForm: 'https://forms.gle/5a85cYhy9zy8Jw5s9',       // "Join Coders Community" button
  membershipForm: 'https://forms.gle/JJd8cno31C1ExZMh8', // "Become a member" button
  instagram: 'https://www.instagram.com/sipnacoders.club/',
  linkedin: 'https://www.linkedin.com/company/sipna-coders-club/posts/',
  email: 'team@sipnacoders.club',
  registerForm: 'https://tally.so/embed/J9OJGY?alignLeft=1&hideTitle=0&transparentBackground=1&dynamicHeight=1',
};

/* ---------------- numbers on the home page ---------------- */
export const STATS = [
  { value: 600, suffix: '+', label: 'participants' },
  { value: 9, suffix: '+', label: 'events conducted' },
  { value: 4, suffix: '', label: 'workshops' },
  { value: 12, suffix: '', label: 'core members' },
];

/* =====================================================================
   UPCOMING EVENTS
   Empty list = the site shows a "Coming soon" card with a Get notified button.
   To announce an event, copy the example below inside the [ ] and fill it in:

  {
    id: 'web-dev-bootcamp',               // any short unique name
    title: 'Web Dev Bootcamp',
    category: 'Workshop',                 // Workshop, Hackathon, Seminar, Contest...
    date: '2026-12-12T14:00',             // 'YYYY-MM-DDTHH:MM' Indian time, or '' if not fixed
    durationMins: 180,
    venue: 'CSE Seminar Hall, Block B',
    description: 'One or two lines about the event.',
    registerLink: 'https://forms.gle/...',  // '' shows "Registration opens soon"
    poster: null,                         // or an imported poster image
  },
   ===================================================================== */
export const upcomingEvents = [];

/* =====================================================================
   PAST EVENTS  (newest first is automatic - sorted by sortDate)
   To add photos: import them at the top, then list them in `images`.
   ===================================================================== */
export const pastEvents = [
  {
    id: 'next-event',
    title: '',       
    category: '',    
    date: '',         
    description: '',
    images: [],       
  },
  {
    id: 'gemini-build-night',
    title: 'Fund My Crazy – Build Night with Gemini',
    category: 'Online Build Night',
    date: '30 AUG 2026',
    sortDate: '2026-08-30',
    description: 'An online build night with Google Gemini where 32 students picked one of five elements, reimagined it, turned the idea into a visual using AI, and pitched it.',
    images: [BuildNight_1, BuildNight_2, BuildNight_3],
  },
  {
    id: 'gemini-fun-night',
    title: 'Gemini Campus Fun Night & AI Art Challenge',
    category: 'Online Workshop',
    date: '26 JUL 2026',
    sortDate: '2026-07-26',
    description: 'A hands-on online session on creating AI art with Google Gemini, where 26 students designed a Freshers Party Night poster and pitched their creative ideas.',
    images: [FunNight_1, FunNight_2, FunNight_3, FunNight_4],
  },
  {
    id: 'tech-trek-2026',
    title: 'Tech Trek 2026',
    category: 'Seminar',
    date: '25 OCT 2026',
    sortDate: '2026-10-25',
    description: 'The latest edition of our Tech Trek series, giving students insights into modern technologies and practical guidance for building a career in tech.',
    images: [TechTrek26_1, TechTrek26_2, TechTrek26_3],
  },
  {
    id: 'git-github-workshop',
    title: 'Git & GitHub Workshop',
    category: 'Workshop',
    date: '9 SEP 2026',
    sortDate: '2026-09-09',
    description: 'A hands-on workshop on Git and GitHub, where students learned version control, branching and collaborating on code with their teams.',
    images: [GitGithub_1, GitGithub_2, GitGithub_3],
  },
  {
    id: 'devthon',
    title: 'Devthon',
    category: 'Hackathon',
    date: '20 MAR 2025',
    sortDate: '2025-03-20',
    description: 'A large-scale national-level hackathon that received 300+ entries with 200+ active participants, providing a competitive platform for innovation, problem-solving, and real-world project development.',
    images: [Devthone],
  },
  {
    id: 'treasurex',
    title: 'TreasureX',
    category: 'Treasure Hunt',
    date: '28 AUG 2025',
    sortDate: '2025-08-28',
    description: 'A fun and engaging event combining coding challenges with problem-solving activities, where 30+ students participated, making learning interactive and enjoyable.',
    images: [Treasure_X],
  },
  {
    id: 'tech-trek-2025',
    title: 'Tech Trek',
    category: 'Seminar',
    date: '8 NOV 2025',
    sortDate: '2025-11-08',
    description: 'An advanced continuation of the Tech Trek series, attended by 50 students, focusing on deeper insights into modern technologies and practical development guidance.',
    images: [Tech_Treck],
  },
  {
    id: 'prompt-engineering',
    title: 'Prompt Engineering',
    category: 'Workshop',
    date: '27 SEP 2025',
    sortDate: '2025-09-27',
    description: 'A focused session on AI and prompt engineering techniques, where 40+ students participated and learned how to effectively interact with modern AI tools.',
    images: ['https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1920&auto=format&fit=crop'],
  },
  {
    id: 'flutter-flow',
    title: 'Flutter Flow',
    category: 'Workshop',
    date: '25 OCT 2024',
    sortDate: '2024-10-25',
    description: 'A practical workshop on no-code/low-code app development using Flutter Flow, attended by 100+ students, enabling them to build basic mobile applications efficiently.',
    images: [Flutter_Flow],
  },
];

/* ---------------- core team (shown in this order) ---------------- */
export const TEAM = [
  { name: 'Vrushabh Shelokar', role: 'President', img: vrushabh, status: '3rd CSE',
    socials: { linkedin: 'https://www.linkedin.com/in/vrushabh-shelokar', instagram: 'https://www.instagram.com/vrush_1337/' } },
  { name: 'Ritesh Pawar', role: 'Vice President', img: ritesh, status: '3rd IT',
    socials: { linkedin: 'https://www.linkedin.com/in/ritesh-pawar-694730353' } },
  { name: 'Sakshi Bawankar', role: 'Secretary', img: sakshi, status: '3rd CSE', socials: {} },
  { name: 'Uday Shivarkar', role: 'Treasurer', img: uday, status: '3rd CSE', socials: {} },
  { name: 'Ashay Deshpande', role: 'UI/UX Designer', img: ashay, status: '2nd IT',
    socials: {
      linkedin: 'https://www.linkedin.com/in/ashay-deshpande-554683387?utm_source=share_via&utm_content=profile&utm_medium=member_android',
      instagram: 'https://www.instagram.com/nextup_ashay?mdxt=ZDF0OXFnZW5tNW9m',
    } },
  { name: 'Harshdip Patil', role: 'Technical Head', img: harshdeep, status: '3rd CSE', socials: {} },
  { name: 'Shreya Gulhane', role: 'Public Relation Officer', img: shreya, status: '3rd CSE', socials: {} },
  { name: 'Shrushti Deshbhratar', role: 'Executive Member', img: srushti, status: '3rd IT', socials: {} },
  { name: 'Mahi Sahu', role: 'Executive Member', img: mahi, status: '3rd CSE', socials: {} },
  { name: 'Chitra Bankar', role: 'Student Advisor', img: chitra, status: '3rd CSE', socials: {} },
  { name: 'Atharva Khule', role: 'Executive Member', img: atharva, status: '2nd CSE', socials: {} },
  { name: 'Pranav Raut', role: 'Advisor', img: pranav, status: '4th CSE',
    socials: { linkedin: 'https://www.linkedin.com/in/rautpranav13?utm_source=share_via&utm_content=profile&utm_medium=member_android' } },
];

/* ---------------- campus ambassadors (team page) ----------------
   PROGRAMS: the ambassador programs and what an ambassador does in each.
   ✏️ logo: to show a program's official badge, put the image in src/assets/programs/,
      import it at the top of this file (e.g. import gsaLogo from '../assets/programs/gsa.png';)
      and set  logo: gsaLogo.  Leave null to show the coloured name badge instead.
   ✏️ link: official program page ('' for none). */
export const PROGRAMS = {
  gsa: {
    name: 'Google Student Ambassador', org: 'Google', color: '#4285f4', logo: null, link: '',
    duties: ['Represents Google Gemini on campus', 'Runs hands-on AI sessions for students', 'Builds a student community around Google AI'],
  },
  hrcc: {
    name: 'HackerRank Campus Crew', org: 'HackerRank', color: '#2ec866', logo: null, link: '',
    duties: ['Represents HackerRank on campus', 'Organises workshops, hackathons and tech sessions', 'Helps students practise coding and prepare for technical interviews'],
  },
  msa: {
    name: 'Microsoft Student Ambassador', org: 'Microsoft', color: '#00a4ef', logo: null,
    link: 'https://learn.microsoft.com/training/student-hub/become-a-student-ambassador',
    duties: ['Hosts learning sessions on Microsoft technology', 'Shares Microsoft Learn resources and learning paths', 'Builds a community of learners on campus'],
  },
  unstop: {
    name: 'Unstop Campus Champion', org: 'Unstop', color: '#7c6cff', logo: null, link: '',
    duties: ['The face and voice of Unstop on campus', 'Conducts competitions, hackathons and events', 'Connects college clubs with Unstop opportunities'],
  },
  gfg: {
    name: 'GeeksforGeeks Campus Mantri', org: 'GeeksforGeeks', color: '#2f8d46', logo: null,
    link: 'https://www.geeksforgeeks.org/campus-ambassador-know-more/',
    duties: ['Represents GeeksforGeeks on campus', 'Organises coding events and sessions', 'Brings GfG learning resources to students'],
  },
};

/* the members, and which programs they are part of (keys from PROGRAMS above) */
export const AMBASSADORS = [
  { name: 'Vrushabh Shelokar', role: 'President · 3rd CSE', img: vrushabh, programs: ['gsa', 'hrcc'], status: 'present' },
  { name: 'Atharva Khule', role: 'Executive Member · 2nd CSE', img: atharva, programs: ['msa'], status: 'present' },
  { name: 'Ashay Deshpande', role: 'Executive Member · 2nd IT', img: ashay, programs: ['unstop'], status: 'present' },
  { name: 'Chitra Bankar', role: 'Student Advisor · 3rd CSE', img: chitra, programs: ['gfg'], status: 'present' },
];

/* ---------------- what we do (home page cards) ---------------- */
export const TRACKS = [
  { id: 'web', icon: 'Globe', color: '#4c8dff', title: 'Web Development', desc: 'From your first HTML page to full-stack React apps, deployed live.' },
  { id: 'dsa', icon: 'Code', color: '#c084fc', title: 'DSA & Coding', desc: 'Weekly problem solving that gets you ready for interviews and contests.' },
  { id: 'ai', icon: 'Sparkles', color: '#3ddc84', title: 'AI & Prompting', desc: 'Build real things with modern AI tools like Google Gemini.' },
  { id: 'cloud', icon: 'Cloud', color: '#22d3ee', title: 'Cloud & DevOps', desc: 'Linux, Git, Docker and deploying projects to the cloud.' },
  { id: 'app', icon: 'Smartphone', color: '#fbbc05', title: 'App Development', desc: 'Flutter and low-code tools to put your app on a phone.' },
];

/* ---------------- tools & platforms strip (home page, under the numbers) ----------------
   ✏️ Only list names your sessions really used, or that really worked with the club. */
export const TOOLS = [
  'Google Gemini', 'GitHub', 'FlutterFlow', 'HackerRank Campus Crew',
  'Microsoft Learn', 'GeeksforGeeks', 'Google Student Ambassadors',
];

/* ---------------- FAQ (home page) ----------------
   ✏️ Check the answers. Add more by copying a line, e.g. { q: 'Is membership free?', a: '...' }
   link (optional): { label: 'Button text', href: 'https://...' } or { label: '...', to: '/connect' } */
export const FAQ = [
  { q: 'Who can join Sipna Coders Club?',
    a: 'Students of Sipna College of Engineering & Technology who want to learn, build and grow with other coders. Seats are limited, so fill the membership form early.',
    link: { label: 'Become a member', href: LINKS.membershipForm } },
  { q: 'Do I need to know coding already?',
    a: 'No. Our sessions start from the basics, like your very first web page, and go all the way to full projects, hackathons and contests. Beginners are welcome.' },
  { q: 'What do members get?',
    a: 'Access to Google Student Ambassador, Microsoft Learn and GeeksforGeeks resources, coding contests and challenges, resume and LinkedIn guidance, a members-only community, and hands-on workshops and sessions.' },
  { q: 'How do I join?',
    a: 'Fill the membership form, follow us on Instagram and LinkedIn, and come to our next event. That is it.',
    link: { label: 'Open the membership form', href: LINKS.membershipForm } },
  { q: 'How will I hear about upcoming events?',
    a: 'Every event is announced on our Instagram and LinkedIn first. Join the community to get the news before anyone else.',
    link: { label: 'Join Coders Community', href: LINKS.joinForm } },
  { q: 'How can I contact the club?',
    a: 'Email team@sipnacoders.club, or message us on Instagram or LinkedIn. All our links are on the Connect page.',
    link: { label: 'Go to Connect', to: '/connect' } },
];

/* ---------------- member voices (home page) ----------------
   Empty = the section stays hidden. ✏️ Add REAL quotes only, with the person's permission:
  {
    quote: 'One or two lines in their own words.',
    name: 'Full Name',
    role: '2nd year IT · Member',      // or 'Devthon participant', etc.
    img: null,                          // or an imported photo (import it at the top of this file)
  },
*/
export const VOICES = [];

/* ---------------- wins & projects (home page) ----------------
   Empty = the section stays hidden. ✏️ Add real achievements and member projects:
  {
    kind: 'Award',                      // 'Award' or 'Project'
    title: 'Winners – Some Hackathon 2026',
    who: 'Team name or member names',
    year: '2026',
    desc: 'One or two lines about it.',
    link: 'https://github.com/...',     // optional: project, certificate or post link ('' for none)
  },
*/
export const WINS = [];

/* ---------------- how to join ---------------- */
export const JOIN_STEPS = [
  { title: 'Fill the membership form', desc: 'Takes two minutes. Tell us who you are and what you want to build.' },
  { title: 'Follow us', desc: 'Event announcements and photos land on Instagram and LinkedIn first.' },
  { title: 'Show up and build', desc: 'Come to a workshop, hackathon or seminar and start shipping with us.' },
];
