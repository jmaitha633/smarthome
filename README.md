# SmartNest — Smart Home Security & Automation Website

A responsive front-end prototype for a microcontroller-based smart home project.

## Features
- Independent L1, L2 and L3 lighting controls
- Typed commands: `L1 ON`, `L2 OFF`, `L3 ON`, `ALL LIGHTS ON`, `ALL LIGHTS OFF`
- Browser speech recognition where supported
- Demo security arm/disarm controls
- Simulated motion-alert status for the security light and bell
- Demo door-access code form and lock status
- Responsive desktop and mobile layout

## Run it
1. Extract the ZIP file.
2. Open `index.html` in a modern browser.
3. For microphone voice recognition, use a browser that supports the Web Speech API; microphone permissions and secure-context requirements may apply.
4. All status changes are local demonstrations only.

## Important before connecting hardware
This site is **not connected to an ESP32**. It does not switch real lights, activate a physical bell, monitor a sensor, operate a CCTV camera, or unlock a door.

To connect hardware, add an authenticated backend/API or a securely configured MQTT/WebSocket service and ESP32 firmware. Do not expose the ESP32 directly to the public internet. Use HTTPS, authentication, access controls and rate limits. A four-digit code checked in front-end JavaScript is visible to anyone who can inspect the website, so it must never be used as real door security. Verify door access securely on the controller/backend and use a safer authentication design.

## Files
- `index.html` — dashboard structure
- `style.css` — responsive styling
- `script.js` — local demo interactions
