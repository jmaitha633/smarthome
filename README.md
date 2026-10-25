# SmartNest — Firebase-ready Smart Home Website

This package updates the existing SmartNest dashboard to use Firebase Authentication and Firebase Realtime Database. It preserves the dashboard design and adds live reads/writes for light commands, security arm/disarm, door commands, and status fields.

## Important status

**This ZIP is prepared for your Firebase project, but it is not yet fully configured.** The Firebase web configuration values were not provided, so you must fill them in `firebase-config.js` before it can connect. The website also does not itself program the ESP32; hardware responds only after ESP32 firmware is configured to read these database paths.

## 1. Add your Firebase web configuration

1. Open https://console.firebase.google.com/ and choose `smart-home-security` (`smart-home-security-17f15`).
2. Open Project settings (gear) → Your apps → your web app → SDK setup and configuration → Config.
3. Open `firebase-config.js` and replace `PASTE_YOUR_API_KEY_HERE`, `PASTE_YOUR_REALTIME_DATABASE_URL_HERE`, and `PASTE_YOUR_APP_ID_HERE` with the exact values from Firebase. Confirm `authDomain` and `projectId` match your project/database.
4. Save the file. Do not paste service-account JSON, private keys, or passwords into this file.

## 2. Enable Firebase Authentication

In Firebase Console → Build → Authentication → Get started → Sign-in method, enable **Email/Password**. Then open Users and add a dedicated control user. Use that email/password in the website login panel. Do not use your Google account password.

## 3. Configure Realtime Database

Create Realtime Database if you have not already. In Realtime Database → Rules, review `DATABASE_RULES.json` and publish equivalent rules. These rules require a signed-in Firebase user. They allow authenticated clients to write `status`, so use them only while you understand that your ESP32 must authenticate securely too. For production, restrict writes by role/path and use separate rules or a trusted backend for device status.

Suggested initial structure:

```json
{
  "commands": {
    "L1": false,
    "L2": false,
    "L3": false,
    "securityArmed": false,
    "doorMotor": "STOP"
  },
  "status": {
    "motionDetected": false,
    "doorOpen": false,
    "securityLightOn": false,
    "alarmOn": false,
    "esp32Online": false
  }
}
```

The website can create command values when you use the controls, so you do not have to seed the data manually.

## 4. Test it locally / publish

Because this uses JavaScript modules and Firebase HTTPS imports, don't just double-click `index.html`. Use a local static web server, or publish all files in this folder to the root of your GitHub Pages `main` branch. The files that must be deployed together are:

- `index.html`
- `style.css`
- `script.js`
- `firebase-config.js`

For GitHub Pages, upload/replace these four files in `https://github.com/jmaitha633/smarthome`, commit to `main`, then wait for Pages to rebuild at https://jmaitha633.github.io/smarthome/ . **Do not publish until you have replaced the Firebase placeholders.**

## Database paths used by this website

- `/commands/L1`, `/commands/L2`, `/commands/L3`: booleans
- `/commands/securityArmed`: boolean
- `/commands/doorMotor`: `OPEN` or `STOP`
- `/commandsMeta/lastCommand`: audit metadata
- `/status/motionDetected`, `/status/doorOpen`, `/status/securityLightOn`, `/status/alarmOn`, `/status/esp32Online`: ESP32 status fields

## Safety notes

- A successful Firebase write means only that a cloud command was saved; it does not prove a light, siren or motor operated.
- Program local PIR-to-alarm behavior on the ESP32 so the alarm can still respond if Wi-Fi/cloud fails.
- Never drive motors, relays or sirens directly from ESP32 GPIO pins. Use suitable drivers, fuses and correctly rated supplies.
- Door movement must have physical limit switches, motor timeout, emergency stop/manual release and safe mechanical design. Never rely on a webpage as a safety interlock.
- Do not use a client-side PIN as real door security. This version removes the old hardcoded demo-code behavior and relies on Firebase sign-in for dashboard access.
- These database rules are a starting point, not a complete production security review. Keep Authentication enabled and avoid public read/write rules.
