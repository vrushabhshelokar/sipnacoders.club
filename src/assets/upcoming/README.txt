UPCOMING EVENT POSTERS
======================
Put the poster of the next event in THIS folder and name the file after the event type
(the same EVENT_TYPE you write in src/site/upcomingConfig.js):

    hackathon.jpg          <- the first poster of a hackathon
    hackathon1.jpg         <- the second poster
    hackathon2.jpg         <- the third poster ... there is no limit (hackathon20.jpg works too)

    workshop.jpg, workshop1.jpg, workshop2.jpg ...
    online.jpg, online1.jpg, online2.jpg ...

* Only the files that match your EVENT_TYPE are shown. The other types just wait here.
* Windows tip: switch on View > Show > File name extensions in File Explorer, so renaming does not give hackathon.jpg.jpg
  (hackathon.jpg.jpg and "hackathon (2).jpg" are understood anyway).
* jpg, jpeg, png, webp and avif all work (capital letters like .JPG are fine too). Tip: keep each file under about 500 KB (webp / jpg) so the page stays fast.
* One poster = it shows by itself. Several posters = a slideshow (with arrows, dots and swipe).
* No poster in this folder = the mystery picture ("?", radar, ...) stays like before.

HOW IT LOOKS ON THE SITE
After the poster is added, the mystery picture of the popup and of the Upcoming card stays for 2 seconds.
Then a crazy reveal plays (about 1.5 seconds) and the poster appears in its place and stays.
It does not need "Try to decrypt".
There are 10 reveals: slam, curtain, flip, iris, assemble, spotlight, scroll, zap, burst and warp.
Every design has its own one and the site picks it by itself (the list is in src/site/designs.js, the 3rd word of every line).
To try one on your computer add  ?fx=warp  to the address (for example localhost:5173/?popup=quest&fx=warp).

The poster has the same look as the membership poster on the home page: round corners, a soft glow and a small tilt.
After the reveal it gives a small shake every 3 seconds, and when the mouse is on it
the poster comes straight. (People who switched off animations on their phone / computer see it still, only tilted.)
To change this look, open src/site/PosterStage.css and find ".ps { --ps-tilt: ... }":
    --ps-tilt: -2deg    <- 0deg = straight poster   --ps-radius: 12px = corner roundness
To stop the 3-second shake, delete the line "animation: ps-shake 3s ease-in-out infinite;" in the same file.

THE EVENT NAME
When you write EVENT_NAME in src/site/upcomingConfig.js, the name appears letter by letter with a sparkle on every letter,
and then the whole word shines now and then. Every design has its own effect and the Upcoming card uses the effect of its popup. Nothing to set up.

After adding or removing a poster: git add src/assets/upcoming, commit and push (the site rebuilds by itself).
When the event is over, delete the poster files (or leave them: they only show while SHOW_UPCOMING is true).
