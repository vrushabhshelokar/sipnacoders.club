// The designs, in the order the events use them: [popup name, card look].
// The site picks the next one by itself for every new event (the first event uses the first line, the second event the
// second line ...). After the last line it starts again from the first one.
// Old and new designs are mixed on purpose, so two events in a row never look alike.
//
// Popups (the "Something big is coming" window):
//   radar terminal ticket launch neon glitch matrix confetti git arcade                (the first 10)
//   slot scratch chat comic news bsod clapper synth spy quest                          (the new 10)
// Card looks (the card on the Upcoming events page):
//   1 Signal   2 Terminal   3 Dossier   4 Blueprint   5 Vault                          (the first 5)
//   6 Jackpot  7 Scratch card  8 Chat  9 Comic page  10 Newsroom                       (new)
//   11 Crash   12 Cinema       13 Sunset  14 Countdown  15 Quest                       (new)
//
// You do not need to edit this file. To lock one design use FORCE_DESIGN in upcomingConfig.js (a line number from this list, 1 to 20).
// To look at one on your computer add ?design=7 to the address.
export const DESIGNS = [
  ['radar', 1],
  ['comic', 9],
  ['terminal', 2],
  ['slot', 6],
  ['ticket', 3],
  ['bsod', 11],
  ['neon', 5],
  ['chat', 8],
  ['launch', 4],
  ['clapper', 12],
  ['glitch', 1],
  ['scratch', 7],
  ['git', 4],
  ['synth', 13],
  ['confetti', 3],
  ['news', 10],
  ['matrix', 2],
  ['quest', 15],
  ['arcade', 5],
  ['spy', 14],
];

export const OLD_POPUPS = ['radar', 'terminal', 'glitch', 'launch', 'matrix', 'ticket', 'neon', 'arcade', 'git', 'confetti'];
export const NEW_POPUPS = ['slot', 'scratch', 'chat', 'comic', 'news', 'bsod', 'clapper', 'synth', 'spy', 'quest'];
export const POPUP_NAMES = [...OLD_POPUPS, ...NEW_POPUPS];
export const CARD_LOOKS = 15;
