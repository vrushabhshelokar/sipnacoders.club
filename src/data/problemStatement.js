// Problem Statement section of the Vibe-A-Thon page (site/ProblemStatement.jsx).
// This is the only file you need to edit when the problem statements are ready.
//
// HOW TO PUBLISH:
//   1. Put the PDF in the  public/  folder, for example  public/Vibe-A-Thon-Problem-Statements.pdf
//      (no spaces in the file name)
//   2. Write its path below:   pdf: '/Vibe-A-Thon-Problem-Statements.pdf'
//   3. git add -A, commit, push.
// The two buttons (View PS and Download) switch on by themselves at releaseAt. Until then they are locked and show a countdown.
//
// To test the open buttons on your own computer before the release time, set  unlockNow: true  (and put it back to false before you push).
export const PS = {
  pdf: '',                                              // '' = not added yet (buttons stay locked). Example: '/Vibe-A-Thon-Problem-Statements.pdf'
  fileName: 'Vibe-A-Thon-Problem-Statements.pdf',       // the name the file gets when someone downloads it
  releaseAt: '2026-11-21T20:00:00+05:30',               // when the buttons switch on (21 Nov 2026, 8:00 PM IST, same as the Timeline)
  releaseLabel: '21 Nov 2026,  IST',            // the same moment, written for people
  count: 10,                                            // how many problem statements are in the PDF
  alertText: 'Problem Statement tentative publish on 21 Nov, IST',   // words of the amber alert strip (dashboard: Events tab -> Date and time can change them without a deploy)
  unlockNow: false,                                     // true = buttons open right now (testing only)
};
