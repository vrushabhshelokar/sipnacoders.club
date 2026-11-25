// The 5 Vibe-A-Thon domains (shown under the Problem Statement Release card, site/PsDomains.jsx).
//
// PRIVATE UNTIL RELEASE: this file is not part of the normal page download. The browser fetches it only after the problem
// statement section has unlocked (release time reached AND the PDF added). Before that nobody sees these words on the page.
//
// To change a domain, edit its name / count / focus below. count = how many problem statements it holds (the total
// should match PS.count in data/problemStatement.js). The problem statement TITLES are not listed here on purpose:
// they stay inside the PDF.
export const PS_DOMAINS = [
  {
    name: 'Digital Trust, Safety & Privacy',
    count: 3,
    focus: 'Detecting deception, identifying digital threats and protecting sensitive information.',
  },
  {
    name: 'Sustainability & Social Impact',
    count: 1,
    focus: 'Reducing food waste and improving resource redistribution.',
  },
  {
    name: 'Business, Retail & Agricultural Intelligence',
    count: 2,
    focus: 'Forecasting, market intelligence, inventory optimization and data-driven decisions.',
  },
  {
    name: 'Smart Cities & Citizen Services',
    count: 3,
    focus: 'Improving civic infrastructure, public grievance handling and access to government information.',
  },
  {
    name: 'Healthcare & Personal Wellbeing',
    count: 1,
    focus: 'Medication adherence, health record management and understandable medical information.',
  },
];
