import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getDatabase, ref, set, onValue, push, serverTimestamp, query, limitToLast } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const lightPaths = { L1:"light1", L2:"light2", L3:"light3" };
let auth, db, currentUser = null, armed = false;
const lightStates = { L1:false, L2:false, L3:false };
let latestStatus = {};
let toastTimer;

function toast(message) {
  const el = $("#toast"); if (!el) return;
  el.textContent = message; el.classList.add("show"); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3500);
}
function connection(title, detail, online=false) {
  $("#connection-title").textContent = title;
  $("#connection-detail").textContent = detail;
  $("#connection-pill").innerHTML = `<span></span> ${online ? "CONNECTED" : "NOT CONNECTED"}`;
}
function renderLights() {
  let count=0;
  Object.entries(lightStates).forEach(([id,on])=>{
    const card=document.querySelector(`[data-light="${id}"]`), btn=document.querySelector(`[data-toggle-light="${id}"]`);
    if(!card||!btn)return;
    card.classList.toggle("is-on",on); btn.setAttribute("aria-pressed",String(on));
    card.querySelector(".toggle-label").textContent=on?"Turn off":"Turn on";
    $(`#${id}-state`).textContent=on?"ON":"OFF"; if(on)count++;
  });
  $("#lights-on-count").textContent=count; $("#lights-on-count-small").textContent=count;
}
async function writeControl(key,value) {
  if(!currentUser){toast("Please sign in first."); showLogin(); return false;}
  try {
    await set(ref(db,`controls/${key}`),value);
    await set(ref(db,"controlsMeta/lastCommand"),{key,value,by:currentUser.uid,at:serverTimestamp()});
    toast(`Command sent: ${key}`); return true;
  } catch(e) { console.error(e); toast(`Firebase command failed: ${e.code||e.message}`); return false; }
}
async function setLight(id,value) {
  if(await writeControl(lightPaths[id],value)){lightStates[id]=value;renderLights();}
}
function renderSecurity() {
  $("#security-stat").textContent=typeof latestStatus.online==="boolean"&&!latestStatus.online?"Offline":(armed?"Armed":"Disarmed");
  $("#security-stat-note").textContent=armed?"Monitoring enabled":"Monitoring paused";
  $("#security-status-title").textContent=latestStatus.alarm?"ALARM ACTIVE":(armed?"System armed":"System disarmed");
  $("#security-status-text").textContent=latestStatus.alarmReason|| (latestStatus.alarm?"Check the property and follow your safety plan.":(armed?"Sensors are monitored by the local controller.":"Security is disarmed."));
  $("#security-status-box").classList.toggle("armed",armed||!!latestStatus.alarm);
  $("#security-status-icon").textContent=latestStatus.alarm?"!":(armed?"!":"✓");
  $("#arm-button").disabled=armed; $("#disarm-button").disabled=!armed;
}
function valText(v,yes="Detected",no="Clear") { return typeof v==="boolean"?(v?yes:no):"Unknown"; }
function setState(id,text,alert=false) {
  const el=$(id); if(!el)return; el.textContent=text; el.classList.toggle("alerting",alert);
}
function renderStatus(s={}) {
  latestStatus=s;
  setState("#sensor-pir",valText(s.motion,"Motion","No motion"),!!s.motion);
  setState("#sensor-door",valText(s.doorOpen,"Open","Closed"),!!s.doorOpen);
  setState("#door-stat",typeof s.doorOpen==="boolean"?(s.doorOpen?"Open":"Closed"):"Unknown",!!s.doorOpen);
  $("#door-stat-note").textContent=typeof s.doorOpen==="boolean"?"Contact sensor reporting":"Waiting for contact sensor";
  setState("#sensor-distance",Number.isFinite(Number(s.distanceCm))?`${Number(s.distanceCm).toFixed(0)} cm`:"— cm");
  setState("#sensor-tamper",valText(s.tamper,"Tampered","Secure"),!!s.tamper);
  setState("#alarm-state",s.alarm?"ACTIVE":"Silent",!!s.alarm);
  setState("#device-online",s.online===true?"Online":s.online===false?"Offline":"Unknown",s.online===false);
  setState("#sensor-gas",s.gasAlarm===true?"HAZARD":(Number.isFinite(Number(s.gasRaw))?`Raw ${s.gasRaw}`:"Unknown"),!!s.gasAlarm);
  setState("#sensor-flame",valText(s.flame,"Detected","Clear"),!!s.flame);
  setState("#sensor-temp",Number.isFinite(Number(s.temperatureC))?`${Number(s.temperatureC).toFixed(1)} °C`:"— °C");
  setState("#sensor-health",s.sensorFault?"FAULT":(s.sensorHealth||"Unknown"),!!s.sensorFault);
  const hazard=!!(s.gasAlarm||s.flame||s.sensorFault);
  $("#safety-banner").classList.toggle("hazard-active",hazard);
  $("#safety-title").textContent=hazard?"HAZARD / SENSOR FAULT REPORTED":"No confirmed hazard reported";
  $("#safety-copy").textContent=s.safetyMessage||(hazard?"Follow the site's emergency procedure. Local safety firmware must operate independently.":"Waiting for gas, smoke and flame telemetry.");
  $("#solar-watts").textContent=Number.isFinite(Number(s.solarWatts))?`${Number(s.solarWatts).toFixed(1)} W`:"— W";
  $("#solar-volts").textContent=`Voltage: ${Number.isFinite(Number(s.solarVolts))?Number(s.solarVolts).toFixed(2):"—"} V`;
  $("#load-watts").textContent=Number.isFinite(Number(s.loadWatts))?`${Number(s.loadWatts).toFixed(1)} W`:"— W";
  $("#load-amps").textContent=`Current: ${Number.isFinite(Number(s.loadAmps))?Number(s.loadAmps).toFixed(2):"—"} A`;
  $("#battery-volts").textContent=Number.isFinite(Number(s.batteryVolts))?`${Number(s.batteryVolts).toFixed(2)} V`:"— V";
  $("#battery-current").textContent=`Current: ${Number.isFinite(Number(s.batteryAmps))?Number(s.batteryAmps).toFixed(2):"—"} A`;
  const soc=Number(s.batterySoc);
  $("#battery-stat").textContent=Number.isFinite(soc)?`${Math.max(0,Math.min(100,soc)).toFixed(0)}%`:"—%";
  $("#battery-soc").textContent=Number.isFinite(soc)?`${Math.max(0,Math.min(100,soc)).toFixed(0)}%`:"—%";
  $("#battery-note").textContent=Number.isFinite(soc)?(soc<30?"Low reserve": "Battery telemetry received"):"No battery telemetry";
  $("#load-shed-state").textContent=`Load shedding: ${typeof s.loadShed==="boolean"?(s.loadShed?"active":"inactive"):"unknown"}`;
  $("#battery-meter-label").textContent=Number.isFinite(soc)?(soc<30?"Low reserve — conserve energy":"Reserve level reported"):"Waiting for telemetry";
  $("#battery-meter-fill").style.width=Number.isFinite(soc)?`${Math.max(0,Math.min(100,soc))}%`:"0%";
  $("#battery-meter-fill").classList.toggle("low",Number.isFinite(soc)&&soc<30);
  $("#last-updated").textContent=s.lastSeen?`Last device update: ${new Date(s.lastSeen).toLocaleString()}`:"Waiting for device telemetry";
  renderSecurity();
}
function showLogin() {
  if($("#firebase-login-panel"))return;
  const panel=document.createElement("section"); panel.id="firebase-login-panel"; panel.className="panel login-panel";
  panel.innerHTML=`<div class="panel-heading"><div><p class="eyebrow">SECURE CONNECTION</p><h2>Sign in to control JKSmartNest</h2></div></div><p class="panel-description">Use an account created in Firebase Authentication. Do not share your password.</p><form id="firebase-login-form"><label for="firebase-email">Email</label><input id="firebase-email" type="email" required autocomplete="username" placeholder="Email address"><label for="firebase-password">Password</label><input id="firebase-password" type="password" required autocomplete="current-password" placeholder="Password"><button class="primary-button" type="submit">Sign in</button><p id="firebase-login-message" aria-live="polite"></p></form>`;
  $(".main-content").insertBefore(panel,$(".main-content").firstChild);
  $("#firebase-login-form").addEventListener("submit",async e=>{
    e.preventDefault();const msg=$("#firebase-login-message");
    try{await signInWithEmailAndPassword(auth,$("#firebase-email").value.trim(),$("#firebase-password").value);msg.textContent="Signed in successfully.";}
    catch(err){msg.textContent=`Sign-in failed: ${err.code||err.message}`;}
  });
}
function normalizeCommand(raw) {
  return raw.toLowerCase().replace(/[.,!?]/g,"").replace(/\s+/g," ").trim();
}
async function runCommand(raw) {
  const c=normalizeCommand(raw);
  const lightMatch=c.match(/\b(?:light\s*)?(l[123])\s+(on|off)\b/);
  if(lightMatch) return setLight(lightMatch[1].toUpperCase(),lightMatch[2]==="on");
  const on=/\b(all lights on|turn on all lights|lights on|light up the room|turn on the lights)\b/.test(c);
  const off=/\b(all lights off|turn off all lights|lights off|turn off the lights)\b/.test(c);
  if(on||off){await Promise.all(Object.keys(lightStates).map(id=>setLight(id,on)));return;}
  if(/\b(secure the perimeter|arm system|arm security|activate security)\b/.test(c)){
    if(await writeControl("armed",true)){armed=true;renderSecurity();} return;
  }
  if(/\b(disarm|disarm security|disable security)\b/.test(c)){
    if(!currentUser){showLogin();toast("Sign in required.");return;}
    if(!window.confirm("Confirm disarming the security system?"))return;
    if(await writeControl("armed",false)){armed=false;renderSecurity();} return;
  }
  toast("Command not recognized. Try 'secure the perimeter', 'lights off', or 'L1 on'.");
}
function attachEvents() {
  $$("[data-toggle-light]").forEach(b=>b.addEventListener("click",()=>setLight(b.dataset.toggleLight,!lightStates[b.dataset.toggleLight])));
  $("#command-form").addEventListener("submit",e=>{e.preventDefault();const input=$("#command-input");runCommand(input.value);input.value="";});
  $("#voice-button").addEventListener("click",()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){$("#voice-status").textContent="Browser speech recognition unavailable; type a command instead.";return;}
    const rec=new SR();rec.lang="en-US";rec.interimResults=false;rec.maxAlternatives=1;
    $("#voice-status").textContent="Listening…";$("#voice-button").disabled=true;
    rec.onresult=e=>{const spoken=e.results[0][0].transcript;$("#voice-status").textContent=`Heard: “${spoken}”`;runCommand(spoken);};
    rec.onerror=()=>$("#voice-status").textContent="Voice recognition failed. Type the command instead.";
    rec.onend=()=>$("#voice-button").disabled=false;
    try{rec.start();}catch{$("#voice-button").disabled=false;}
  });
  $("#arm-button").addEventListener("click",async()=>{if(await writeControl("armed",true)){armed=true;renderSecurity();}});
  $("#disarm-button").addEventListener("click",async()=>{if(!window.confirm("Confirm disarming the security system?"))return;if(await writeControl("armed",false)){armed=false;renderSecurity();}});
  $("#test-alert-button").addEventListener("click",async()=>{
    if(!currentUser){showLogin();toast("Sign in to log a test event.");return;}
    try{await push(ref(db,"dashboardTestEvents"),{type:"dashboard_test",message:"Dashboard test event only; no physical alarm was triggered.",by:currentUser.uid,at:serverTimestamp()});toast("Dashboard test event logged.");}
    catch(e){toast(`Could not log event: ${e.code||e.message}`);}
  });
  $("#refresh-events").addEventListener("click",()=>loadAccessEvents());
}
function loadAccessEvents() {
  if(!db||!currentUser)return;
  onValue(query(ref(db,"accessEvents"),limitToLast(12)),snap=>{
    const body=$("#access-events");body.replaceChildren();const items=[];
    snap.forEach(child=>items.push({id:child.key,...child.val()}));
    items.reverse();
    if(!items.length){body.innerHTML='<tr><td colspan="4">No access events received yet.</td></tr>';return;}
    for(const ev of items){
      const tr=document.createElement("tr");
      const time=ev.timestamp?new Date(typeof ev.timestamp==="number"?ev.timestamp:Date.parse(ev.timestamp)).toLocaleString():"Time unavailable";
      [time,ev.identity||ev.method||"Unknown method",ev.event||ev.type||"Access event",ev.result||"Unspecified"].forEach(v=>{const td=document.createElement("td");td.textContent=String(v);tr.appendChild(td);});
      body.appendChild(tr);
    }
    $("#events-note").textContent=`Showing ${items.length} recent event(s).`;
  },err=>{console.error(err);$("#events-note").textContent="Access history unavailable; check Firebase rules.";});
}
function listenFirebase() {
  onValue(ref(db,"controls"),snap=>{
    const c=snap.val()||{};
    Object.entries(lightPaths).forEach(([id,key])=>{if(typeof c[key]==="boolean")lightStates[id]=c[key];});
    if(typeof c.armed==="boolean")armed=c.armed;
    renderLights();renderSecurity();
  },e=>toast(`Controls read failed: ${e.code||e.message}`));
  onValue(ref(db,"status"),snap=>renderStatus(snap.val()||{}),e=>toast(`Status read failed: ${e.code||e.message}`));
  loadAccessEvents();
}
attachEvents();renderLights();renderSecurity();renderStatus({});
try {
  const app=initializeApp(firebaseConfig);auth=getAuth(app);db=getDatabase(app);
  onAuthStateChanged(auth,user=>{
    currentUser=user;
    if(user){connection("Signed in","Firebase authenticated",true);$("#firebase-login-panel")?.remove();listenFirebase();}
    else{connection("Sign-in required","Please sign in",false);showLogin();}
  });
} catch(e){console.error(e);connection("Config error","Check firebase-config.js",false);toast("Firebase initialization failed. Check firebase-config.js.");}
