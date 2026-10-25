# SmartNest — Firebase website files

These files are configured for Firebase project `smart-home-security-17f15` and the Realtime Database structure currently used in your project.

## Files to upload to GitHub
Upload all five files together to the root of `https://github.com/jmaitha633/smarthome` on the `main` branch: `index.html`, `style.css`, `script.js`, `firebase-config.js`, and `.nojekyll`. `DATABASE_RULES.json` is a reference file; do not upload it as website code.

## Database paths used
- `/controls/light1`, `/controls/light2`, `/controls/light3` — boolean values
- `/controls/armed` — boolean
- `/controls/door` — `locked` or `unlocked` string for the model-door request
- `/status/motion`, `/status/doorOpen`, `/status/alarm`, `/status/battery`, `/status/online`, `/status/lastSeen` — status values reported by device firmware

## Authentication
The website uses Firebase Email/Password Authentication. Sign in with a user created in Firebase Console → Authentication. Do not put your password into the source files.

## Database rules
The `DATABASE_RULES.json` file is a starter example matching these paths. Publish rules only after reviewing them. For a quick browser test, authenticated users can read/write the paths; this is not a final production security policy. Before real deployment, restrict who can control devices and who can write status. The ESP32 should use its own secure authentication approach. Never use public read/write rules.

## Test
1. Upload the website files to GitHub and wait for GitHub Pages to deploy.
2. Open `https://jmaitha633.github.io/smarthome/`.
3. Sign in using a Firebase Authentication email/password user.
4. Click a light toggle and check Realtime Database → Data → `controls` to see if `light1`, `light2`, or `light3` changes.
5. A successful database write confirms only the cloud command was saved; physical devices will not operate until the ESP32 firmware and hardware are configured.

## Safety
Use only low-voltage test lamps for early tests. Do not connect mains voltage to the ESP32 or breadboard. Do not drive a motor, relay coil or siren directly from a GPIO. Use suitable drivers, fuses, limit switches, motor timeout and an emergency/manual stop. Keep local PIR-to-alarm logic working if internet access fails.


JK Engineering Solutions contact section includes enquiries for clean solar energy systems and solar installation/maintenance, alongside smart home, lighting, motor and security services.
