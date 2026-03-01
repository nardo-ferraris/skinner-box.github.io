(() => {
  const pullArea = document.getElementById("pullArea");
  if (!pullArea) return;

  const pullLabel = document.getElementById("pullLabel");
  const spinner = document.getElementById("spinner");
  const factBox = document.getElementById("factBox");
  const bonusOut = document.getElementById("bonusCount");
  const bonusToast = document.getElementById("bonusToast");

  const facts = [
    "Fatto: la ricompensa incerta mantiene l'attenzione più della ricompensa fissa.",
    "Fatto: il delay nel refresh aumenta l'aspettativa di una novità importante.",
    "Fatto: le notifiche rosse combinano urgenza visiva e rinforzo intermittente.",
    "Fatto: non cerchi solo contenuti, cerchi la prossima sorpresa."
  ];

  let startY = null;
  let pullDistance = 0;
  let loading = false;
  let bonusCount = 0;

  function getY(e) {
    return e.touches ? e.touches[0].clientY : e.clientY;
  }

  function showToast(text) {
    bonusToast.textContent = text;
    bonusToast.classList.add("show");
    setTimeout(() => bonusToast.classList.remove("show"), 1300);
  }

  function doRefresh() {
    loading = true;
    pullLabel.textContent = "Caricamento...";
    spinner.style.display = "block";

    const delay = 1000 + Math.floor(Math.random() * 1000);
    setTimeout(() => {
      spinner.style.display = "none";
      factBox.textContent = facts[Math.floor(Math.random() * facts.length)];
      pullLabel.textContent = "Nuovo contenuto trovato";

      // Ricompensa casuale ogni tanto
      if (Math.random() < 0.25) {
        bonusCount++;
        bonusOut.textContent = String(bonusCount);
        showToast("🎁 Bonus casuale! Ecco il 'colpo di fortuna' del feed.");
      }

      loading = false;
      setTimeout(() => {
        pullLabel.textContent = "Trascina in basso ↓";
      }, 1000);
    }, delay);
  }

  function onStart(e) {
    if (loading) return;
    startY = getY(e);
    pullDistance = 0;
  }

  function onMove(e) {
    if (startY === null || loading) return;
    pullDistance = Math.max(0, getY(e) - startY);

    if (pullDistance > 75) {
      pullLabel.textContent = "Rilascia per refresh 🎰";
    } else if (pullDistance > 10) {
      pullLabel.textContent = "Continua a trascinare...";
    }
  }

  function onEnd() {
    if (startY === null || loading) return;
    if (pullDistance > 75) doRefresh();
    else pullLabel.textContent = "Trascina in basso ↓";

    startY = null;
    pullDistance = 0;
  }

  ["mousedown", "touchstart"].forEach((evt) =>
    pullArea.addEventListener(evt, onStart, { passive: true })
  );
  ["mousemove", "touchmove"].forEach((evt) =>
    pullArea.addEventListener(evt, onMove, { passive: true })
  );
  ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach((evt) =>
    pullArea.addEventListener(evt, onEnd, { passive: true })
  );
})();
