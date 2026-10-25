JKSMARTNEST + JK ENGINEERING SOLUTIONS — WEBSITE PACKAGE

WHAT IS INCLUDED
- index.html: JKSmartNest dashboard for lighting, security and model-door controls. The bottom now has only a short “For more information” call-to-action and a button linking to the separate contact page.
- contact.html: a separate JK ENGINEERING SOLUTIONS information and contact page with company overview, service descriptions, green-energy design, solar section, enquiry form, email and WhatsApp contact.
- contact-page.css: responsive forest-green, clean-white and solar-gold styling for the contact page.
- app-additions.css: dashboard add-ons and compact bottom contact call-to-action.
- contact-form.js: prepares a prefilled email or WhatsApp message using the selected service, enquiry type and message. The website does not store enquiries.
- script.js, style.css, firebase-config.js: dashboard scripts, styling and Firebase configuration preserved from the package.
- manifest.webmanifest, icon.svg, icon-192.png, icon-512.png, pwa.js, sw.js: installable PWA support.
- DATABASE_RULES.json, README.md, .nojekyll: supporting files.

CONTACT PAGE OVERVIEW
JK ENGINEERING SOLUTIONS — “Powering Innovation. Delivering Reliable Energy.”
The page describes:
1. Solar energy solutions: enquiries about solar power, lighting, backup-power planning, installation support and maintenance.
2. Smart home automation: connected lighting, remote controls and website-to-device control.
3. Lighting and motor control: lighting controls, small motor/door mechanisms, setup and maintenance.
4. Security systems: alarms, motion detection, security lighting and sensors.
5. A simple enquiry process and selectable email/WhatsApp form.

CONTACT DETAILS
Email: jmaitha633@gmail.com
WhatsApp: 0743 410 685 — https://wa.me/254743410685

PUBLISH TO GITHUB PAGES
1. Download and extract the ZIP.
2. Back up your current repository before replacing files.
3. Upload all files from inside the extracted folder to the ROOT of https://github.com/jmaitha633/smarthome (not the enclosing folder).
4. Replace matching files, and add contact.html and contact-page.css.
5. Commit to the main branch and wait for GitHub Pages to publish.
6. Visit https://jmaitha633.github.io/smarthome/ and click the bottom “Explore services & contact” button.
7. If old files appear, use Ctrl+F5. The service worker cache has been versioned to help refresh the app shell.

IMPORTANT TECHNICAL NOTES
- The package does not automatically publish to GitHub Pages.
- The contact form opens the user's email app or WhatsApp with a prepared message; it does not send or store messages automatically.
- The dashboard still needs correctly configured Firebase access and ESP32 firmware for real hardware operation.
- The site is a Progressive Web App, not a native APK/EXE.
- Do not make Firebase database writes public just to simplify setup.
- Use suitable electrical protection, driver circuits and safe low-voltage testing. Solar installations should be designed and installed to suit the actual loads and local safety requirements.
