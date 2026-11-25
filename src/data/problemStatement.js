// Problem Statement section of the Vibe-A-Thon page (site/ProblemStatement.jsx).
// This is the only file you need to edit when the problem statements are ready.
//
// HOW TO PUBLISH:
//   1. The PDF is in the  public/  folder (public/ps-vibeathon-r1-xxxxxxxxxx.pdf). The long odd name is on purpose: the file is public once it is deployed,
//      so a name nobody can guess keeps it private until you switch the buttons on.
//   2. Do NOT write the path in this file: anything written here can be read by visitors inside the site code.
//      The server already knows that file: when you switch the buttons to Open and "PDF link" in the dashboard is empty, it hands out
//      that PDF. (Only to use another PDF: put its path in the dashboard, Events tab -> Problem statements -> "PDF link".)
//   3. When you are ready, switch "Problem statement buttons" to Open and press Save changes.
// The two buttons (View PS and Download) stay LOCKED until you switch them on in the dashboard
// (Events tab -> Vibe-A-Thon -> Problem statements -> Problem statement buttons -> Open). There is no schedule.
//
// To test the open buttons on your own computer, set  unlockNow: true  (and put it back to false before you push).
export const PS = {
  pdf: '',                                              // keep EMPTY: the link is set in the dashboard so it stays private until Open (for a test on your own computer, put the path here and put '' back before you push)
  fileName: 'VIBEATHON R1 PS.pdf',                         // the name the file gets when someone downloads it (Download button saves it straight away with this name; vercel.json gives the same name when the PDF is opened in a tab and saved from there)
  releaseAt: '',                                        // optional: a fixed time like '2026-11-27T20:00:00+05:30' (only the date words of the alert strip / Timeline row; it does NOT open the buttons). Empty = not decided yet
  releaseLabel: '',                                     // the same moment written for people, e.g. '27 Nov 2026, 8:00 PM IST'. Empty = the strip just says it is coming soon
  count: 10,                                            // how many problem statements are in the PDF
  alertText: 'Problem Statements Soon',  // words of the amber alert strip (dashboard: Events tab -> Date and time can change them without a deploy)
  unlockNow: false,                                     // false = locked (normal). true = open (testing only; the dashboard switch is the real control)
};
