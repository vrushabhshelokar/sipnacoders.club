// =====================================================================================
//  UPCOMING EVENT CONTROL PANEL  -  the only file you edit for the popup and the Upcoming events card.
//
//  EVERY DAY YOU ONLY NEED THESE THREE LINES:
//    1) SHOW_UPCOMING   true  = popup + Upcoming card are ON        false = both are OFF (no event right now)
//    2) EVENT_TYPE      'hackathon'  or  'workshop'  or  'online'
//    3) SHOW_POPUP      true  = the popup shows                     false = no popup (the Upcoming events button,
//                                                                          "1 upcoming event found" and the card all stay)
//
//  The popup design and the matching card design pick themselves. Every new event gets the NEXT design
//  (1, 2, 3 ... 10, then it starts again from 1), so two events in a row never look the same.
//  The club decides it by counting your finished events: when you add a finished event (with photos) to
//  data/site.js -> pastEvents, the next event automatically moves to the next design.
// =====================================================================================

export const SHOW_UPCOMING = true;
export const EVENT_TYPE = 'hackathon';   // 'hackathon' | 'workshop' | 'online'
export const SHOW_POPUP = false;          // true = show the popup   false = no popup (everything else stays)


/* -------------------------------------------------------------------------------------
   OPTIONAL - fill these in only when the leader tells you. Leave '' while it is a secret.
   When a new event starts, clear them again.
   Dates are Indian time, written 'YYYY-MM-DDTHH:MM'  (example: '2026-12-26T10:00')
   ------------------------------------------------------------------------------------- */
export const EVENT_NAME = '';       // the name. The card title and the popup both show it ("Vibe A Thon is coming")
export const EVENT_START = '';      // first day of the event. The timer starts counting down to it
export const HIDE_AFTER = '';       // optional: the card + popup disappear after this moment.
                                    //   Empty = they hide 2 days after EVENT_START (or stay until you set SHOW_UPCOMING = false)
// A box left '' stays "Will be revealed soon". Type a detail and "Try to decrypt" types it out in its box.
// Only the block of your EVENT_TYPE is used. Examples: Format '18 hours', Team size '4 members', Venue 'Seminar Hall'.
export const DETAILS = {
  hackathon: { Format: '', Rounds: '', 'Team size': '', Theme: '', Prizes: '', Registration: '' },
  workshop: { Topic: '', Speaker: '', Duration: '', Venue: '', Seats: '', Registration: '' },
  online: { Platform: '', Host: '', Duration: '', 'Join link': '', Certificate: '', Registration: '' },
};


/* -------------------------------------------------------------------------------------
   ADVANCED - you do not need to touch anything below
   ------------------------------------------------------------------------------------- */

// The 10 designs, in the order the events use them: [popup name, card look].
// Card looks: 1 Signal (radar + ?), 2 Terminal, 3 Dossier, 4 Blueprint, 5 Vault.
export const DESIGNS = [
  ['radar', 1],      //  1  event 1
  ['terminal', 2],   //  2  event 2
  ['ticket', 3],     //  3  event 3
  ['launch', 4],     //  4  event 4
  ['neon', 5],       //  5  event 5
  ['glitch', 1],     //  6  event 6  (after 5 events the card looks come round again, with new popups)
  ['matrix', 2],     //  7
  ['confetti', 3],   //  8
  ['git', 4],        //  9
  ['arcade', 5],     // 10  then it starts again from 1
];
// Only finished events dated on or after this day move the designs on (so old events never shift it).
export const ROTATION_FROM = '2026-11-08';
// Lock one design instead of the automatic order: 0 = automatic, or a number from 1 to 10 (see the list above).
export const FORCE_DESIGN = 0;
// Preview any design on your computer: add ?design=4 to the address (example: localhost:5173/?design=4).
// Only the popup: ?popup=glitch   Names: radar terminal glitch launch matrix ticket neon arcade git confetti

export const COMPILING = 35;        // the "compiling" bar percentage while no date is announced
export const TEASER_FROM = '';      // optional: with EVENT_START set, the bar fills from this moment up to EVENT_START
export const POPUP_TEXT = {
  title: 'Something big is coming',
  desc: "Tap below to see what's next at Sipna Coders Club.",
  button: "See what's coming",
  later: 'Maybe later',
};
// true = once EVENT_NAME is filled the popup says "<name> is coming"; false = it stays mysterious
export const POPUP_SHOW_NAME = true;
export const POPUP_DELAY = 600;           // milliseconds to wait after the opening animation
export const POPUP_SEEN_KEY = 'scc-hack-popup-1';   // change the number (…-2) to show the popup again to people who already closed it
export const POPUP_SKIP_ON = ['/register', '/upcoming'];   // pages where the popup never appears
export const TYPE_MS = 45;                // "Try to decrypt" typing speed (milliseconds per letter)
