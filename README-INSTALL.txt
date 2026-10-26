JKSmartNest dashboard update pack
=================================

This is an incremental update pack for:
https://github.com/jmaitha633/smarthome
Live page:
https://jmaitha633.github.io/smarthome/index.html

IMPORTANT
---------
This ZIP contains update files/snippets, not a complete replacement of your current
website. Keep your existing index.html, style.css, script.js, and firebase-config.js.
Do not replace firebase-config.js with a blank file.

WHAT'S INCLUDED
---------------
1. app-additions.css
   Replacement for the existing app-additions.css. Includes existing sensor/energy
   panel styling plus responsive quick lighting controls, local clock styling,
   keyboard focus visibility, and reduced-motion support.

2. index-snippet.html
   Add the local clock and quick-light action bar to index.html in the locations
   described by the comments.

3. script-snippet.js
   Add the local clock helper and event listeners to script.js as described in the
   comments. Existing Firebase authentication, database paths and device logic remain
   unchanged.

INSTALLATION
------------
1. Download and extract this ZIP.
2. On GitHub, open jmaitha633/smarthome.
3. Replace app-additions.css with the included app-additions.css.
4. Edit index.html and add the two snippets from index-snippet.html in the indicated
   places. Do not replace the entire HTML page with the snippet file.
5. Edit script.js and add the snippets from script-snippet.js in the indicated places.
6. Commit the changes to the main branch.
7. Wait for GitHub Pages to rebuild, then refresh the live website with Ctrl+F5.

SAFETY / FUNCTIONAL NOTES
-------------------------
- The quick lighting buttons require a signed-in Firebase user and suitable Realtime
  Database rules. They write the same controls/light1, light2 and light3 paths as the
  existing controls.
- Physical lights only respond when the ESP32 firmware is connected and implements
  those database paths.
- Browser clock is display-only and does not imply the ESP32 is online.
- Security decisions and siren operation should remain local on the ESP32; do not rely
  on the browser or internet connection for emergency response.
