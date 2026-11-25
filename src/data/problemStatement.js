// Problem Statement section of the Vibe-A-Thon page (site/ProblemStatement.jsx).
// This is the only file you need to edit when the problem statements are ready.
//
// HOW TO PUBLISH:
//   1. The PDF is in the  public/  folder (public/ps-vibeathon-r1-xxxxxxxxxx.pdf). The long odd name is on purpose: the file is public once it is deployed,
//      so a name nobody can guess keeps it private until you switch the buttons on.
//   2. In the dashboard (Events tab -> Problem statements) write its path in "PDF link":   /ps-vibeathon-r1-xxxxxxxxxx.pdf
//      Do NOT write the path in this file: anything written here can be read by visitors inside the site code.
//      The site only gives the link out after you switch the buttons to Open.
//   3. When you are ready, switch "Problem statement buttons" to Open and press Save changes.
// The two buttons (View PS and Download) stay LOCKED until you switch them on in the dashboard
// (Events tab -> Vibe-A-Thon -> Problem statements -> Problem statement buttons -> Open). There is no schedule.
//
// To test the open buttons on your own computer, set  unlockNow: true  (and put it back to false before you push).
export const PS = {
  pdf: '',                                              // keep EMPTY: the link is set in the dashboard so it stays private until Open (for a test on your own computer, put the path here and put '' back before you push)
  fileName: 'PS-Vibethon.pdf',                          // the name the file gets when someone downloads it (Download button saves it straight away with this name; vercel.json gives the same name when the PDF is opened in a tab and saved from there)
  releaseAt: '2026-11-21T20:00:00+05:30',               // only the date shown in the Timeline row. It does NOT open the buttons any more
  releaseLabel: ' ? Nov 2026,  IST',            // the same moment, written for people
  count: 10,                                            // how many problem statements are in the PDF
  alertText: 'Problem Statemenl Soon',   // words of the amber alert strip (dashboard: Events tab -> Date and time can change them without a deploy)
  unlockNow: false,                                     // false = locked (normal). true = open (testing only; the dashboard switch is the real control)
};
