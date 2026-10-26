/* Add these helpers near the top of script.js, after the lightStates declaration. */
function updateLocalClock() {
  const clock = document.querySelector("#local-clock");
  if (!clock) return;
  clock.textContent = new Intl.DateTimeFormat(undefined, {
    weekday: "short", day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  }).format(new Date());
}

/* Add these lines inside attachEvents(), after the existing light-button listeners. */
$("#all-lights-on")?.addEventListener("click", () => {
  Promise.all(Object.keys(lightStates).map(id => setLight(id, true)));
});
$("#all-lights-off")?.addEventListener("click", () => {
  Promise.all(Object.keys(lightStates).map(id => setLight(id, false)));
});

/* Add these lines near the bottom of script.js, after attachEvents(). */
updateLocalClock();
window.setInterval(updateLocalClock, 1000);
