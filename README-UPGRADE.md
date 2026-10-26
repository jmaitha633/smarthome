# JKSmartNest Upgrade Pack

## Included
- `index.html`: upgraded dashboard UI for multi-sensor security, environmental safety, solar analytics and access history.
- `script.js`: Firebase Realtime Database listeners and authenticated controls.
- `app-additions.css`: responsive styling for new panels.
- `FIREBASE_SCHEMA.md`: expected database structure and setup checklist.

## Install on GitHub Pages
1. Download and unzip this pack.
2. Back up your current repository files.
3. Replace `index.html` and `script.js` with the files here.
4. Add `app-additions.css` to the same repository root.
5. Keep your existing `style.css`, `firebase-config.js`, and any other files the site uses.
6. Commit the changes to the `main` branch. GitHub Pages should redeploy automatically.

## Important
This pack updates the web app only. It does NOT update your physical ESP32 firmware, wire sensors, configure Firebase rules, or prove a physical alarm works. Sensor and energy fields remain "Unknown" until your ESP32 publishes matching values. Do not use the dashboard as a certified fire/security system.

Never publish service-account private keys or other server secrets in frontend files. Firebase web config is not a private key, but database access must be protected by Authentication and restrictive Realtime Database Rules.
