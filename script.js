/* SmartNest prototype UI.
   All controls in this file are simulated locally. Connect an authenticated API
   and ESP32 firmware before using this interface with real devices. */
const lightStates = { L1: false, L2: false, L3: false };
let armed = false;
let doorUnlocked = false;
let toastTimer;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function updateLights() {
  let count = 0;
  Object.entries(lightStates).forEach(([id, isOn]) => {
    const card = document.querySelector(`[data-light="${id}"]`);
    const button = document.querySelector(`[data-toggle-light="${id}"]`);
    card.classList.toggle("is-on", isOn);
    button.setAttribute("aria-pressed", String(isOn));
    card.querySelector(".toggle-label").textContent = isOn ? "Turn off" : "Turn on";
    $(`#${id}-state`).textContent = isOn ? "ON" : "OFF";
    if (isOn) count++;
  });
  $("#lights-on-count").textContent = count;
  $("#lights-on-count-small").textContent = count;
}
function setLight(id, value) {
  if (!(id in lightStates)) return;
  lightStates[id] = value;
  updateLights();
  showToast(`${id} turned ${value ? "ON" : "OFF"} (demo)`);
}
$$("[data-toggle-light]").forEach(button => {
  button.addEventListener("click", () => {
    const id = button.dataset.toggleLight;
    setLight(id, !lightStates[id]);
  });
});
function runCommand(raw, announce = true) {
  const command = raw.trim().toUpperCase().replace(/[.,!?]/g, "").replace(/\s+/g, " ");
  const match = command.match(/\b(L[123])\s+(ON|OFF)\b/);
  if (match) {
    setLight(match[1], match[2] === "ON");
    $("#voice-status").textContent = `Command completed: ${match[1]} ${match[2]} (demo).`;
    return true;
  }
  if (/\b(ALL LIGHTS|EVERY LIGHT|LIGHTS)\s+ON\b/.test(command)) {
    Object.keys(lightStates).forEach(id => lightStates[id] = true);
    updateLights(); if (announce) showToast("All lights turned ON (demo)");
    $("#voice-status").textContent = "All lights are ON (demo)."; return true;
  }
  if (/\b(ALL LIGHTS|EVERY LIGHT|LIGHTS)\s+OFF\b/.test(command)) {
    Object.keys(lightStates).forEach(id => lightStates[id] = false);
    updateLights(); if (announce) showToast("All lights turned OFF (demo)");
    $("#voice-status").textContent = "All lights are OFF (demo)."; return true;
  }
  if (announce) showToast("Command not recognized. Try “L1 ON” or “all lights off”.");
  $("#voice-status").textContent = "Command not recognized. Try “L1 on”, “L2 off” or “all lights off”.";
  return false;
}
$("#command-form").addEventListener("submit", event => {
  event.preventDefault();
  const input = $("#command-input");
  if (input.value.trim()) runCommand(input.value);
  input.value = "";
});

$("#voice-button").addEventListener("click", () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    $("#voice-status").textContent = "Speech recognition is not supported in this browser. Type a command below instead.";
    showToast("Voice recognition unavailable in this browser.");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  $("#voice-status").textContent = "Listening… say a light command.";
  $("#voice-button").disabled = true;
  recognition.onresult = event => {
    const spoken = event.results[0][0].transcript;
    $("#voice-status").textContent = `Heard: “${spoken}”`;
    runCommand(spoken);
  };
  recognition.onerror = () => {
    $("#voice-status").textContent = "Could not hear that command. Check microphone permission or type it instead.";
  };
  recognition.onend = () => { $("#voice-button").disabled = false; };
  try { recognition.start(); } catch (_) {
    $("#voice-button").disabled = false;
    $("#voice-status").textContent = "Voice recognition could not start. Please type a command.";
  }
});

function updateSecurity() {
  $("#security-stat").textContent = armed ? "Armed" : "Disarmed";
  $("#security-stat-note").textContent = armed ? "Motion monitoring enabled (demo)" : "Monitoring is paused";
  $("#security-status-title").textContent = armed ? "System armed" : "System disarmed";
  $("#security-status-text").textContent = armed ? "Motion monitoring is enabled in this demo." : "Your demo alarm is not monitoring.";
  $("#security-status-box").classList.toggle("armed", armed);
  $("#security-status-icon").textContent = armed ? "!" : "✓";
  $("#arm-button").disabled = armed;
  $("#disarm-button").disabled = !armed;
  if (!armed) {
    $("#security-light-state").textContent = "Standby";
    $("#bell-state").textContent = "Silent";
    $("#bell-state").classList.remove("alerting");
  }
}
$("#arm-button").addEventListener("click", () => { armed = true; updateSecurity(); showToast("Security system armed (demo)."); });
$("#disarm-button").addEventListener("click", () => { armed = false; updateSecurity(); showToast("Security system disarmed (demo)."); });
$("#test-alert-button").addEventListener("click", () => {
  if (!armed) {
    showToast("Arm the demo system first to test a motion alert.");
    return;
  }
  $("#security-light-state").textContent = "ON · demo";
  $("#bell-state").textContent = "Alert · demo";
  $("#bell-state").classList.add("alerting");
  showToast("Demo motion detected: security light and bell status activated.");
  $("#security-status-text").textContent = "Demo motion detected. Security light and bell status are active.";
});

function updateDoor() {
  $("#door-stat").textContent = doorUnlocked ? "Unlocked" : "Locked";
  $("#door-status-title").textContent = doorUnlocked ? "Door unlocked (demo)" : "Door locked";
  $("#door-status-copy").textContent = doorUnlocked ? "Demo access granted. Lock again when finished." : "Access is secured.";
  $("#lock-door-button").disabled = !doorUnlocked;
}
$("#door-form").addEventListener("submit", event => {
  event.preventDefault();
  const code = $("#door-code").value;
  // Prototype only: this client-side check is not secure enough for a real lock.
  if (code === "8668") {
    doorUnlocked = true;
    updateDoor();
    $("#door-message").textContent = "Demo code accepted. Door status changed to unlocked on this page only.";
    showToast("Access code accepted (demo only).");
  } else {
    $("#door-message").textContent = "Incorrect code. Try again.";
    showToast("Code not accepted.");
  }
  $("#door-code").value = "";
});
$("#lock-door-button").addEventListener("click", () => {
  doorUnlocked = false;
  updateDoor();
  $("#door-message").textContent = "Door marked locked in the local demo.";
  showToast("Door locked (demo).");
});

updateLights();
updateSecurity();
updateDoor();
