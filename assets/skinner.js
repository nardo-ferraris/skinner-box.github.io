(() => {
  const btn = document.getElementById("fixedBtn");
  if (!btn) return;

  const msg = document.getElementById("fixedMessage");
  const clicksOut = document.getElementById("fixedClicks");
  const pointsOut = document.getElementById("fixedPoints");
  const nextOut = document.getElementById("fixedNext");

  const REWARD_INTERVAL_MS = 2000; // sempre uguale: prevedibile
  let clicks = 0;
  let points = 0;
  let nextRewardAt = Date.now();

  function updateCountdown() {
    const ms = Math.max(0, nextRewardAt - Date.now());
    nextOut.textContent = (ms / 1000).toFixed(1) + "s";
  }

  btn.addEventListener("click", () => {
    clicks++;
    clicksOut.textContent = String(clicks);

    if (Date.now() >= nextRewardAt) {
      points++;
      pointsOut.textContent = String(points);
      nextRewardAt = Date.now() + REWARD_INTERVAL_MS;
      msg.textContent = "Premio erogato: +1. Sistema fisso, niente sorprese.";
    } else {
      msg.textContent = "Troppo presto: nessun premio.";
    }
  });

  setInterval(updateCountdown, 100);
  updateCountdown();
})();
