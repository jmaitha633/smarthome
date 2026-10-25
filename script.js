import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getDatabase, ref, set, onValue, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const lightPaths = { L1: "light1", L2: "light2", L3: "light3" };
let auth, db, currentUser = null, armed = false, doorOpen = false;
const lightStates = { L1: false, L2: false, L3: false };
let toastTimer;
function toast(message) {
  const el = $("#toast"); if (!el) return;
  el.textContent = message; el.classList.add("show"); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3000);
}
function connection(label, online) {
  const strong = $(".sidebar-bottom strong"), small = $(".sidebar-bottom small"), pill = $(".demo-pill");
  if (strong) strong.textContent = label;
  if (small) small.textContent = online ? "Firebase connected" : "Sign in to connect";
  if (pill) { pill.innerHTML = `<span></span> ${online ? "FIREBASE CONNECTED" : "SIGN IN REQUIRED"}`; }
}
function renderLights() {
  let count = 0;
  Object.entries(lightStates).forEach(([id, value]) => {
    const card = document.querySelector(`[data-light="${id}"]`), button = document.querySelector(`[data-toggle-light="${id}"]`);
    if (!card || !button) return;
    card.classList.toggle("is-on", value); button.setAttribute("aria-pressed", String(value));
    const label = card.querySelector(".toggle-label"); if (label) label.textContent = value ? "Turn off" : "Turn on";
    const state = $(`#${id}-state`); if (state) state.textContent = value ? "ON" : "OFF";
    if (value) count++;
  });
  if ($("#lights-on-count")) $("#lights-on-count").textContent = count;
  if ($("#lights-on-count-small")) $("#lights-on-count-small").textContent = count;
}
async function writeControl(key, value) {
  if (!currentUser) { toast("Please sign in first."); showLogin(); return false; }
  try {
    await set(ref(db, `controls/${key}`), value);
    await set(ref(db, "controlsMeta/lastCommand"), { key, value, by: currentUser.uid, at: serverTimestamp() });
    toast(`${key} updated in Firebase.`); return true;
  } catch (e) { console.error(e); toast(`Firebase write failed: ${e.code || e.message}`); return false; }
}
async function setLight(id, value) {
  const key = lightPaths[id]; if (!key) return;
  if (await writeControl(key, value)) { lightStates[id] = value; renderLights(); }
}
function renderSecurity() {
  if ($("#security-stat")) $("#security-stat").textContent = armed ? "Armed" : "Disarmed";
  if ($("#security-stat-note")) $("#security-stat-note").textContent = armed ? "Motion monitoring enabled" : "Monitoring is paused";
  if ($("#security-status-title")) $("#security-status-title").textContent = armed ? "System armed" : "System disarmed";
  if ($("#security-status-text")) $("#security-status-text").textContent = armed ? "Security is armed in Firebase." : "Security system is disarmed.";
  if ($("#security-status-box")) $("#security-status-box").classList.toggle("armed", armed);
  if ($("#security-status-icon")) $("#security-status-icon").textContent = armed ? "!" : "✓";
  if ($("#arm-button")) $("#arm-button").disabled = armed;
  if ($("#disarm-button")) $("#disarm-button").disabled = !armed;
}
function renderDoor() {
  const label = doorOpen ? "Open" : "Closed / unknown";
  if ($("#door-stat")) $("#door-stat").textContent = label;
  if ($("#door-status-title")) $("#door-status-title").textContent = doorOpen ? "Door reported open" : "Door closed / status unknown";
  if ($("#door-status-copy")) $("#door-status-copy").textContent = "Door sensor status is reported by the ESP32 when firmware is connected.";
}
function showLogin() {
  if ($("#firebase-login-panel")) return;
  const panel = document.createElement("section"); panel.id = "firebase-login-panel"; panel.className = "panel";
  panel.style.cssText = "position:relative;max-width:560px;margin:0 auto 22px;border:2px solid #4c6fff";
  panel.innerHTML = `<div class="panel-heading"><div><p class="eyebrow">SECURE CONNECTION</p><h2>Sign in to control your home</h2></div></div><p class="panel-description">Use the email and password of a user created in Firebase Authentication.</p><form id="firebase-login-form"><label for="firebase-email">Firebase user email</label><input id="firebase-email" type="email" required autocomplete="username" placeholder="Email address" style="width:100%;padding:11px;border:1px solid #e3e8f0;border-radius:9px;margin-bottom:12px"><label for="firebase-password">Password</label><input id="firebase-password" type="password" required autocomplete="current-password" placeholder="Firebase user password" style="width:100%;padding:11px;border:1px solid #e3e8f0;border-radius:9px;margin-bottom:12px"><button class="primary-button" type="submit">Sign in</button><p id="firebase-login-message" aria-live="polite">Sign in to enable Firebase controls.</p></form>`;
  const main = $(".main-content"); main.insertBefore(panel, main.firstChild);
  $("#firebase-login-form").addEventListener("submit", async e => {
    e.preventDefault(); const message = $("#firebase-login-message");
    try { await signInWithEmailAndPassword(auth, $("#firebase-email").value.trim(), $("#firebase-password").value); message.textContent = "Signed in successfully."; }
    catch (err) { message.textContent = `Sign-in failed: ${err.code || err.message}. Check Authentication and the user password.`; }
  });
}
function attachEvents() {
  $$('[data-toggle-light]').forEach(button => button.addEventListener("click", () => {
    const id = button.dataset.toggleLight; setLight(id, !lightStates[id]);
  }));
  $("#command-form")?.addEventListener("submit", e => {
    e.preventDefault(); const input = $("#command-input");
    const command = input.value.trim().toUpperCase().replace(/[.,!?]/g, "").replace(/\s+/g, " ");
    const match = command.match(/\b(L[123])\s+(ON|OFF)\b/);
    if (match) setLight(match[1], match[2] === "ON");
    else if (/\b(ALL LIGHTS|EVERY LIGHT|LIGHTS)\s+ON\b/.test(command)) Promise.all(Object.keys(lightStates).map(id => setLight(id, true)));
    else if (/\b(ALL LIGHTS|EVERY LIGHT|LIGHTS)\s+OFF\b/.test(command)) Promise.all(Object.keys(lightStates).map(id => setLight(id, false)));
    else toast("Try L1 ON, L2 OFF, or ALL LIGHTS ON.");
    input.value = "";
  });
  $("#voice-button")?.addEventListener("click", () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { $("#voice-status").textContent = "Speech recognition unavailable; type a command instead."; return; }
    const recognition = new SR(); recognition.lang = "en-US"; recognition.interimResults = false;
    $("#voice-status").textContent = "Listening… say a light command."; $("#voice-button").disabled = true;
    recognition.onresult = e => { const spoken = e.results[0][0].transcript; $("#voice-status").textContent = `Heard: “${spoken}”`; $("#command-input").value = spoken; $("#command-form").requestSubmit(); };
    recognition.onerror = () => { $("#voice-status").textContent = "Voice recognition failed. Type the command instead."; };
    recognition.onend = () => { $("#voice-button").disabled = false; }; try { recognition.start(); } catch { $("#voice-button").disabled = false; }
  });
  $("#arm-button")?.addEventListener("click", async () => { if (await writeControl("armed", true)) { armed = true; renderSecurity(); } });
  $("#disarm-button")?.addEventListener("click", async () => { if (await writeControl("armed", false)) { armed = false; renderSecurity(); } });
  $("#test-alert-button")?.addEventListener("click", () => toast("Test the PIR sensor locally on the ESP32; this button does not simulate a real sensor."));
  const form = $("#door-form");
  if (form) {
    form.innerHTML = `<p class="form-hint">Model door commands are only requests. Test with a safe low-voltage setup, physical limit switches and a motor timeout.</p><div class="command-row"><button class="primary-button" id="unlock-door-command" type="button">Unlock model door</button><button class="secondary-button" id="lock-door-command" type="button">Lock model door</button></div>`;
    $("#unlock-door-command").addEventListener("click", () => writeControl("door", "unlocked"));
    $("#lock-door-command").addEventListener("click", () => writeControl("door", "locked"));
  }
  $("#lock-door-button")?.addEventListener("click", () => writeControl("door", "locked"));
}
function listenFirebase() {
  onValue(ref(db, "controls"), snap => {
    const c = snap.val() || {};
    Object.entries(lightPaths).forEach(([id, key]) => { if (typeof c[key] === "boolean") lightStates[id] = c[key]; });
    if (typeof c.armed === "boolean") armed = c.armed;
    renderLights(); renderSecurity();
  }, err => { console.error(err); toast(`Cannot read controls: ${err.code || err.message}`); });
  onValue(ref(db, "status"), snap => {
    const s = snap.val() || {};
    if (typeof s.doorOpen === "boolean") doorOpen = s.doorOpen;
    if (typeof s.online === "boolean") connection(s.online ? "ESP32 online" : "Firebase connected", true);
    if (typeof s.motion === "boolean" && s.motion && armed) {
      if ($("#security-light-state")) $("#security-light-state").textContent = "Motion detected";
      if ($("#bell-state")) { $("#bell-state").textContent = s.alarm ? "Alarm active" : "Motion detected"; $("#bell-state").classList.toggle("alerting", !!s.alarm); }
      if ($("#security-status-text")) $("#security-status-text").textContent = s.alarm ? "Motion detected — alarm status active." : "Motion detected while armed.";
    } else {
      if ($("#security-light-state")) $("#security-light-state").textContent = "Standby";
      if ($("#bell-state")) { $("#bell-state").textContent = s.alarm ? "Alarm active" : "Silent"; $("#bell-state").classList.toggle("alerting", !!s.alarm); }
    }
    renderDoor();
  }, err => { console.error("Status listener:", err); toast(`Cannot read status: ${err.code || err.message}`); });
}
attachEvents(); renderLights(); renderSecurity(); renderDoor();
try {
  const app = initializeApp(firebaseConfig); auth = getAuth(app); db = getDatabase(app);
  onAuthStateChanged(auth, user => {
    currentUser = user;
    if (user) { connection("Signed in", true); $("#firebase-login-panel")?.remove(); listenFirebase(); }
    else { connection("Sign in required", false); showLogin(); }
  });
} catch (err) { console.error(err); connection("Config error", false); toast("Firebase initialization failed. Check firebase-config.js."); }
