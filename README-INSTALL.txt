JKSMARTNEST COMPLETE WEBSITE + INSTALLABLE APP PACKAGE

WHAT IS INCLUDED
- index.html: updated existing dashboard branded JKSmartNest, install button, contact section
- script.js: original Firebase/dashboard controls preserved
- style.css: original dashboard styling preserved
- firebase-config.js: existing Firebase web configuration preserved
- manifest.webmanifest, icon.svg, icon-192.png, icon-512.png, pwa.js, sw.js: installable Progressive Web App support
- app-additions.css: styling for install button and contact section
- README.md, DATABASE_RULES.json, .nojekyll: existing supporting files (where present)

IMPORTANT
This package includes your existing dashboard structure and JavaScript, and adds PWA support. It does not convert the website into a native APK/EXE. It makes the website installable through supported browsers. Firebase controls still need internet and Firebase Authentication/database permissions. Offline caching does not make live Firebase controls work offline.

HOW TO PUBLISH TO YOUR EXISTING GITHUB PAGES WEBSITE
1. Download this ZIP and choose Extract All on Windows.
2. Open https://github.com/jmaitha633/smarthome
3. Make a backup of your current repository files before replacing anything.
4. Upload the files from the extracted folder to the repository root (not the enclosing folder). Replace the matching existing files with the package versions, especially index.html. Add the new files app-additions.css, manifest.webmanifest, icon.svg, icon-192.png, icon-512.png, pwa.js and sw.js.
5. Keep all files in the same root folder as index.html. Do not rename script.js or firebase-config.js.
6. Commit changes to the main branch.
7. Wait for GitHub Pages to finish deploying, then open https://jmaitha633.github.io/smarthome/ and refresh.
8. On Android Chrome: use the browser menu and select Install app if shown; otherwise Add to Home screen.
9. On Windows Edge: menu (...) > Apps > Install this site as an app. Chrome may offer an install icon/menu option when the site is installable.
10. You can also use the Install app button on the website when your browser offers the installation prompt.

CONTACT DETAILS ADDED TO THE WEBSITE
Email: jmaitha633@gmail.com
WhatsApp: 0743 410 685 (opens https://wa.me/254743410685)

SAFETY / FUNCTION NOTES
- Installing the web app does not program the ESP32 or connect hardware by itself.
- Do not drive a motor, siren, relay load, or mains appliance directly from ESP32 GPIO pins.
- Use suitable drivers, power supplies, protection, and door limit switches. Keep PIR alarm triggering local on the ESP32 so it can still work if internet fails.
- Keep Firebase security rules and authentication properly configured; do not make the database publicly writable for convenience.
