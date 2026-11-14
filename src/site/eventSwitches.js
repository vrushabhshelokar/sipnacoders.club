// =====================================================================================
//  EVENT SWITCHES  -  turn the Code Clash section and the two popups on or off.
//  This is the only file you edit for them. true = ON, false = OFF.
//
//  NOW (Code Clash is running):      CODE_CLASH_POPUP = true    VIBEATHON_POPUP = false
//  WHEN CODE CLASH ENDS:             CODE_CLASH_POPUP = false   VIBEATHON_POPUP = true
//                                    CODE_CLASH_SECTION = false (hides the Code Clash block on the Home page)
//
//  Only ONE popup shows per visit. If both popups are ON, the Code Clash popup wins.
//  The Vibe-A-Thon popup also needs SHOW_UPCOMING and SHOW_POPUP in upcomingConfig.js to be true (they already are).
//  The Code Clash popup scrolls to the Code Clash block, so it also needs CODE_CLASH_SECTION = true.
// =====================================================================================

export const CODE_CLASH_POPUP = true;      // popup that takes people to the Code Clash block on the Home page
export const VIBEATHON_POPUP = false;      // popup that takes people to the Upcoming events page (Vibe-A-Thon)
export const CODE_CLASH_SECTION = true;    // the Code Clash block on the Home page (above Membership)


/* -------------------------------------------------------------------------------------
   Code Clash details. Change a word here and the block and the popup both change.
   ------------------------------------------------------------------------------------- */
export const CODE_CLASH_FORM = 'https://forms.gle/b1sEdP7bd2VGTysDA';   // where "Register now" in the block goes

export const CODE_CLASH_POPUP_TEXT = {
  flag: 'Registrations open',
  title: 'Think fast. Code smart.',
  desc: 'HackerRank coding competition for all engineering students. Online, 2 rounds, solo entry.',
  button: 'Register now',     // takes people to the Code Clash block (the form opens from the block)
  later: 'Maybe later',
  facts: [
    { k: 'Date', v: '21 Nov 2026' },
    { k: 'Time', v: '2 to 4 PM' },
    { k: 'Fee', v: '₹49 solo' },
  ],
};


/* -------------------------------------------------------------------------------------
   ADVANCED - you do not need to touch anything below
   ------------------------------------------------------------------------------------- */
export const CODE_CLASH_ID = 'code-clash';                              // the block's id: sipnacoders.club/#code-clash
export const CODE_CLASH_SEEN_KEY = 'scc-clash-popup-1';                 // change the number (…-2) to show the popup again to people who closed it
export const CODE_CLASH_SKIP_ON = ['/register', '/upcoming'];           // pages where the Code Clash popup never appears
// Preview the Code Clash popup any time (ignores "already seen" and the switches): add ?popup=clash to the address.
