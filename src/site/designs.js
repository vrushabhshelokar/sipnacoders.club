// The designs, in the order the events use them: [popup name, card look, poster reveal].
// The site picks the next one by itself for every new event (the first event uses the first line, the second event the
// second line ...). After the last line it starts again from the first one.
// Old and new designs are mixed on purpose, so two events in a row never look alike.
//
// Poster reveal (the 3rd word of every line): what happens when the poster you uploaded replaces the "?" picture, 2 seconds after it appears.
//   slam curtain flip iris assemble spotlight scroll zap burst warp      (each one is used by two designs)
// To try one on your computer: add ?fx=warp to the address (any name from the list).
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
  ['radar', 1, 'iris'],
  ['comic', 9, 'slam'],
  ['terminal', 2, 'assemble'],
  ['slot', 6, 'burst'],
  ['ticket', 3, 'scroll'],
  ['bsod', 11, 'zap'],
  ['neon', 5, 'spotlight'],
  ['chat', 8, 'flip'],
  ['launch', 4, 'warp'],
  ['clapper', 12, 'curtain'],
  ['glitch', 1, 'zap'],
  ['scratch', 7, 'iris'],
  ['git', 4, 'assemble'],
  ['synth', 13, 'warp'],
  ['confetti', 3, 'burst'],
  ['news', 10, 'slam'],
  ['matrix', 2, 'flip'],
  ['quest', 15, 'scroll'],
  ['arcade', 5, 'curtain'],
  ['spy', 14, 'spotlight'],
];

export const POSTER_EFFECTS = ['slam', 'curtain', 'flip', 'iris', 'assemble', 'spotlight', 'scroll', 'zap', 'burst', 'warp'];
export const OLD_POPUPS = ['radar', 'terminal', 'glitch', 'launch', 'matrix', 'ticket', 'neon', 'arcade', 'git', 'confetti'];
export const NEW_POPUPS = ['slot', 'scratch', 'chat', 'comic', 'news', 'bsod', 'clapper', 'synth', 'spy', 'quest'];
export const POPUP_NAMES = [...OLD_POPUPS, ...NEW_POPUPS];
export const CARD_LOOKS = 15;
