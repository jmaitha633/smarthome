import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getDatabase, ref, get, set, onValue, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
let toastTimer;
let auth, db, currentUser = null;
const lightStates = { L1: false, L2: false, L3: false };
let armed = false;
let doorOpen = false;
let connected = false;

function showToast(message) {
  const toast = $("#toast"); if (!toast) return;
  toast.textContent = message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}
function setConnection(label, isOnline) {
  const side = document.querySelector(".sidebar-bottom strong");
  const sideSmall = document.querySelector(".sidebar-bottom small");
  const pill = document.querySelector(".demo-pill");
  if (side) side.textContent = label;
  if (sideSmall) sideSmall.textContent = isOnline ? "Firebase connected" : "Sign in to connect";
  if (pill) { pill.innerHTML = `<span></span> ${isOnline ? "FIREBASE CONNECTED" : "OFFLINE"}`; pill.style.color = isOnline ? "#16865f" : "#a56b05"; }
  connected = isOnline;
}
function updateLights() {
  let count = 0;
  Object.entries(lightStates).forEach(([id, isOn]) => {
    const card = document.querySelector(`[data-light="${id}"]`);
    const button = document.querySelector(`[data-toggle-light="${id}"]`);
    if (!card || !button) return;
    card.classList.toggle("is-on", isOn); button.setAttribute("aria-pressed", String(isOn));
    const label = card.querySelector(".toggle-label"); if (label) label.textContent = isOn ? "Turn off" : "Turn on";
    const state = $(`#${id}-state`); if (state) state.textContent = isOn ? "ON" : "OFF";
    if (isOn) count++;
  });
  if ($("#lights-on-count")) $("#lights-on-count").textContent = count;
  if ($("#lights-on-count-small")) $("#lights-on-count-small").textContent = count;
}
async function writeCommand(path, value) {
  if (!currentUser) { showToast("Sign in before sending commands."); openLogin(); return false; }
  try {
    await set(ref(db, `commands/${path}`), value);
    await set(ref(db, "commandsMeta/lastCommand"), { path, value, by: currentUser.uid, at: serverTimestamp() });
    showToast(`${path}: ${String(value)} sent to Firebase.`);
    return true;
  } catch (err) {
    console.error(err); showToast(`Firebase write failed: ${err.code || err.message}`); return false;
  }
}
async function setLight(id, value) {
  if (!(id in lightStates)) return;
  if (await writeCommand(id, value)) { lightStates[id] = value; updateLights(); }
}
function updateSecurity() {
  $("#security-stat").textContent = armed ? "Armed" : "Disarmed";
  $("#security-stat-note").textContent = armed ? "Motion monitoring enabled" : "Monitoring is paused";
  $("#security-status-title").textContent = armed ? "System armed" : "System disarmed";
  $("#security-status-text").textContent = armed ? "Security arming command is active in Firebase." : "Security system is disarmed.";
  $("#security-status-box").classList.toggle("armed", armed);
  $("#security-status-icon").textContent = armed ? "!" : "✓";
  $("#arm-button").disabled = armed; $("#disarm-button").disabled = !armed;
}
function updateDoor() {
  $("#door-stat").textContent = doorOpen ? "Open" : "Closed / unknown";
  $("#door-status-title").textContent = doorOpen ? "Door reported open" : "Door closed / status unknown";
  $("#door-status-copy").textContent = "Door status comes from the ESP32 reed sensor when firmware is connected.";
  const btn = $("#lock-door-button"); if (btn) btn.disabled = !currentUser;
}
function showLogin() {
  if ($("#firebase-login-panel")) return;
  const panel = document.createElement("section"); panel.id = "firebase-login-panel"; panel.className = "panel";
  panel.style.cssText = "position:relative;max-width:520px;margin:0 auto 22px;border:2px solid #4c6fff";
  panel.innerHTML = `<div class="panel-heading"><div><p class="eyebrow">SECURE CONNECTION</p><h2>Sign in to control your home</h2></div></div><p class="panel-description">Use the email and password of a user created in Firebase Authentication. Do not enter your Google account password.</p><form id="firebase-login-form"><label for="firebase-email">Firebase user email</label><input id="firebase-email" type="email" required autocomplete="username" placeholder="you@example.com" style="width:100%;padding:11px;border:1px solid #e3e8f0;border-radius:9px;margin-bottom:12px"><label for="firebase-password">Password</label><input id="firebase-password" type="password" required autocomplete="current-password" placeholder="Firebase user password" style="width:100%;padding:11px;border:1px solid #e3e8f0;border-radius:9px;margin-bottom:12px"><button class="primary-button" type="submit">Sign in</button><p id="firebase-login-message" class="door-message" aria-live="polite">Firebase controls are locked until you sign in.</p></form>`;
  const main = document.querySelector(".main-content"); main.insertBefore(panel, main.firstChild);
  $("#firebase-login-form").addEventListener("submit", async e => {
    e.preventDefault(); const message = $("#firebase-login-message");
    try { await signInWithEmailAndPassword(auth, $("#firebase-email").value.trim(), $("#firebase-password").value); message.textContent = "Signed in."; }
    catch (err) { message.textContent = `Sign-in failed: ${err.code || err.message}. Check Firebase Authentication and user account.`; }
  });
}
function openLogin() { const p = $("#firebase-login-panel"); if (p) p.scrollIntoView({ behavior: "smooth", block: "center" }); else showLogin(); }
function attachEvents() {
  $$('[data-toggle-light]').forEach(button => button.addEventListener("click", () => {
    const id = button.dataset.toggleLight; setLight(id, !lightStates[id]);
  }));
  $("#command-form").addEventListener("submit", e => {
    e.preventDefault(); const input = $("#command-input"); const command = input.value.trim().toUpperCase().replace(/[.,!?]/g, "").replace(/\s+/g, " ");
    const match = command.match(/\b(L[123])\s+(ON|OFF)\b/);
    if (match) setLight(match[1], match[2] === "ON");
    else if (/\b(ALL LIGHTS|EVERY LIGHT|LIGHTS)\s+ON\b/.test(command)) Promise.all(Object.keys(lightStates).map(id => setLight(id, true)));
    else if (/\b(ALL LIGHTS|EVERY LIGHT|LIGHTS)\s+OFF\b/.test(command)) Promise.all(Object.keys(lightStates).map(id => setLight(id, false)));
    else { showToast("Try L1 ON, L2 OFF, or ALL LIGHTS ON."); $("#voice-status").textContent = "Try L1 ON, L2 OFF or ALL LIGHTS ON/OFF."; }
    input.value = "";
  });
  $("#voice-button").addEventListener("click", () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { $("#voice-status").textContent = "Speech recognition is unavailable. Type a command instead."; return; }
    const recognition = new SR(); recognition.lang = "en-US"; recognition.interimResults = false;
    $("#voice-status").textContent = "Listening… say a light command."; $("#voice-button").disabled = true;
    recognition.onresult = e => { const spoken = e.results[0][0].transcript; $("#voice-status").textContent = `Heard: “${spoken}”`; $("#command-input").value = spoken; $("#command-form").requestSubmit(); };
    recognition.onerror = () => { $("#voice-status").textContent = "Voice recognition failed. Type the command instead."; };
    recognition.onend = () => { $("#voice-button").disabled = false; }; try { recognition.start(); } catch { $("#voice-button").disabled = false; }
  });
  $("#arm-button").addEventListener("click", async () => { if (await writeCommand("securityArmed", true)) { armed = true; updateSecurity(); } });
  $("#disarm-button").addEventListener("click", async () => { if (await writeCommand("securityArmed", false)) { armed = false; updateSecurity(); } });
  $("#test-alert-button").addEventListener("click", async () => { showToast("For a real alarm test, use the PIR sensor and ESP32 firmware. This button sends no fake sensor event."); });
  // Door movement is a momentary command; firmware must enforce limit switches and motor timeout.
  const doorForm = $("#door-form");
  if (doorForm) {
    doorForm.innerHTML = `<p class="form-hint">Door movement is disabled until your ESP32 firmware and physical limit switches are installed and tested. Do not use this website as a safety interlock.</p><button class="primary-button full-button" id="open-door-command" type="button">Send OPEN command</button>`;
    $("#open-door-command").addEventListener("click", () => writeCommand("doorMotor", "OPEN"));
  }
  $("#lock-door-button").textContent = "Send STOP command";
  $("#lock-door-button").addEventListener("click", () => writeCommand("doorMotor", "STOP"));
}
function listenToFirebase() {
  onValue(ref(db, "commands"), snap => {
    const data = snap.val() || {};
    ["L1", "L2", "L3"].forEach(id => { if (typeof data[id] === "boolean") lightStates[id] = data[id]; });
    if (typeof data.securityArmed === "boolean") armed = data.securityArmed;
    updateLights(); updateSecurity();
  }, err => { console.error(err); showToast("Cannot read Firebase commands. Check database rules."); });
  onValue(ref(db, "status"), snap => {
    const s = snap.val() || {};
    if (typeof s.doorOpen === "boolean") doorOpen = s.doorOpen;
    if (typeof s.esp32Online === "boolean") setConnection(s.esp32Online ? "Connected" : "Firebase ready", s.esp32Online);
    if (typeof s.motionDetected === "boolean" && s.motionDetected && armed) {
      $("#security-light-state").textContent = s.securityLightOn ? "ON" : "Check status";
      $("#bell-state").textContent = s.alarmOn ? "Alert" : "Motion detected";
      $("#bell-state").classList.toggle("alerting", !!s.alarmOn);
    } else if (!s.motionDetected) {
      $("#security-light-state").textContent = "Standby"; $("#bell-state").textContent = "Silent"; $("#bell-state").classList.remove("alerting");
    }
    updateDoor();
  }, err => console.error("Status listener:", err));
}

attachEvents(); updateLights(); updateSecurity(); updateDoor();
const missing = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes("PASTE_") || !firebaseConfig.appId || firebaseConfig.appId.includes("PASTE_") || !firebaseConfig.databaseURL || firebaseConfig.databaseURL.includes("PASTE_");
if (missing) {
  setConnection("Setup required", false);
  showLogin();
  $("#firebase-login-message").textContent = "First edit firebase-config.js and paste your Firebase web app values, then reload this page.";
} else {
  try {
    const app = initializeApp(firebaseConfig); auth = getAuth(app); db = getDatabase(app);
    onAuthStateChanged(auth, user => {
      currentUser = user;
      if (user) {
        setConnection("Signed in", true);
        const panel = $("#firebase-login-panel"); if (panel) panel.remove();
        listenToFirebase();
      } else {
        setConnection("Sign in required", false); showLogin();
      }
    });
  } catch (err) { console.error(err); setConnection("Config error", false); showToast("Firebase setup error. Check firebase-config.js."); }
}
