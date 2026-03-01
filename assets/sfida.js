(() => {
  const board = document.getElementById("challengeBoard");
  if (!board) return;

  const startBtn = document.getElementById("startBtn");
  const btnA = document.getElementById("btnA");
  const btnB = document.getElementById("btnB");

  const timeOut = document.getElementById("timeOut");
  const pointsOut = document.getElementById("pointsOut");
  const clicksOut = document.getElementById("clicksOut");
  const ratioOutLive = document.getElementById("ratioOutLive");
  const goalFill = document.getElementById("goalFill");
  const goalLabel = document.getElementById("goalLabel");
  const aInfo = document.getElementById("aInfo");
  const liveMessage = document.getElementById("liveMessage");

  const finalBox = document.getElementById("finalBox");
  const debriefMain = document.getElementById("debriefMain");
  const ratioOut = document.getElementById("ratioOut");
  const barA = document.getElementById("barA");
  const barB = document.getElementById("barB");
  const clickAOut = document.getElementById("clickAOut");
  const clickBOut = document.getElementById("clickBOut");
  const schemaText = document.getElementById("schemaText");

  const GOAL = 60;
  const DURATION = 60;

  let running = false;
  let remaining = DURATION;
  let timer = null;
  let startAt = 0;

  let totalPoints = 0;
  let pointsA = 0;
  let pointsB = 0;
  let clicksA = 0;
  let clicksB = 0;

  // A: +10 ogni finestra da 10s (se clicchi nel momento giusto)
  let lastAWindowClaimed = 0;

  function updateGoal() {
    const p = Math.min(100, Math.round((totalPoints / GOAL) * 100));
    goalFill.style.width = p + "%";
    goalLabel.textContent = totalPoints + " / " + GOAL + " punti";
  }

  function ratioText(a, b) {
    if (a === 0 && b > 0) return "∞";
    if (a === 0 && b === 0) return "1.00";
    return (b / a).toFixed(2);
  }

  function updateDashboard() {
    timeOut.textContent = remaining + "s";
    pointsOut.textContent = totalPoints + " (A:" + pointsA + " / B:" + pointsB + ")";
    clicksOut.textContent = clicksA + " / " + clicksB;
    ratioOutLive.textContent = ratioText(clicksA, clicksB);

    if (remaining <= 10) timeOut.classList.add("pulse");
    else timeOut.classList.remove("pulse");

    updateGoal();
    updateAStatus();
  }

  function updateAStatus() {
    if (!running) {
      aInfo.textContent = "A pronto ogni 10 secondi: +10 punti garantiti.";
      return;
    }

    const elapsedSec = Math.floor((Date.now() - startAt) / 1000);
    const windowIndex = Math.floor(elapsedSec / 10);

    if (windowIndex > lastAWindowClaimed) {
      aInfo.textContent = "Pulsante A pronto: un click ora vale +10.";
    } else {
      const secToNext = 10 - (elapsedSec % 10);
      aInfo.textContent = "Prossimo +10 di A tra " + secToNext + "s.";
    }
  }

  function floatReward(text, btn, type) {
    const boardRect = board.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const el = document.createElement("span");

    el.className = "float-reward " + type;
    el.textContent = text;
    el.style.left = btnRect.left - boardRect.left + btnRect.width / 2 + "px";
    el.style.top = btnRect.top - boardRect.top + 8 + "px";
    board.appendChild(el);

    setTimeout(() => el.remove(), 900);
  }

  function shake(btn, jackpot) {
    btn.classList.remove("shake", "shake-jackpot");
    void btn.offsetWidth;
    btn.classList.add(jackpot ? "shake-jackpot" : "shake");
  }

  function jackpotBurst(btn) {
    const icons = ["⭐", "✨", "🎉"];
    const boardRect = board.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const x = btnRect.left - boardRect.left + btnRect.width / 2;
    const y = btnRect.top - boardRect.top + btnRect.height / 2;

    for (let i = 0; i < 12; i++) {
      const p = document.createElement("span");
      p.className = "particle";
      p.textContent = icons[Math.floor(Math.random() * icons.length)];
      p.style.left = x + "px";
      p.style.top = y + "px";
      p.style.setProperty("--dx", (Math.random() * 180 - 90) + "px");
      p.style.setProperty("--dy", (-40 - Math.random() * 140) + "px");
      board.appendChild(p);
      setTimeout(() => p.remove(), 700);
    }
  }

  function finish(reason) {
    if (!running) return;
    running = false;
    clearInterval(timer);

    btnA.disabled = true;
    btnB.disabled = true;
    startBtn.disabled = false;

    const r = ratioText(clicksA, clicksB);
    ratioOut.textContent = "Rapporto click B/A: " + r;

    const maxClicks = Math.max(clicksA, clicksB, 1);
    barA.style.width = Math.round((clicksA / maxClicks) * 100) + "%";
    barB.style.width = Math.round((clicksB / maxClicks) * 100) + "%";
    clickAOut.textContent = String(clicksA);
    clickBOut.textContent = String(clicksB);

    if (clicksB > clicksA * 1.5) {
      debriefMain.textContent =
        "Il tuo cervello è stato catturato dal Jackpot. Hai ignorato la certezza del Pulsante A per inseguire la scarica di dopamina di B.";
    } else {
      debriefMain.textContent =
        "Hai mantenuto un comportamento più bilanciato. La ricompensa variabile resta comunque molto attraente.";
    }

    if (reason === "goal") {
      liveMessage.textContent = "Obiettivo centrato: 60 punti raggiunti prima del tempo.";
    } else {
      liveMessage.textContent = "Tempo scaduto: osserva come hai distribuito i click.";
    }

    schemaText.innerHTML =
      "<strong>Schema del gioco</strong><br>" +
      "1) Pulsante A (fisso): +10 punti solo ogni 10 secondi.<br>" +
      "2) Pulsante B (variabile): 70% = 0, 25% = 1-3, 5% = +20 jackpot.<br>" +
      "3) Il jackpot usa feedback più forte (shake + testo fluttuante + particelle).<br>" +
      "4) Debrief finale: confronto click su B vs A per misurare l'attrazione all'incertezza.";

    finalBox.classList.remove("hidden");
    updateDashboard();
  }

  function startGame() {
    clearInterval(timer);
    running = true;
    remaining = DURATION;
    startAt = Date.now();

    totalPoints = 0;
    pointsA = 0;
    pointsB = 0;
    clicksA = 0;
    clicksB = 0;
    lastAWindowClaimed = 0;

    startBtn.disabled = true;
    btnA.disabled = false;
    btnB.disabled = false;
    finalBox.classList.add("hidden");
    liveMessage.textContent = "Partita avviata: raggiungi 60 punti in 60 secondi.";
    updateDashboard();

    timer = setInterval(() => {
      remaining--;
      updateDashboard();

      if (totalPoints >= GOAL) {
        finish("goal");
        return;
      }

      if (remaining <= 0) {
        finish("timeout");
      }
    }, 1000);
  }

  startBtn.addEventListener("click", startGame);

  btnA.addEventListener("click", () => {
    if (!running) return;

    clicksA++;
    const elapsedSec = Math.floor((Date.now() - startAt) / 1000);
    const windowIndex = Math.floor(elapsedSec / 10);

    if (windowIndex > lastAWindowClaimed) {
      pointsA += 10;
      totalPoints += 10;
      lastAWindowClaimed = windowIndex;
      floatReward("+10", btnA, "mono");
      liveMessage.textContent = "A: premio fisso ottenuto.";
    } else {
      floatReward("0", btnA, "mono");
      liveMessage.textContent = "A: troppo presto, nessun punto.";
    }

    updateDashboard();
    if (totalPoints >= GOAL) finish("goal");
  });

  btnB.addEventListener("click", () => {
    if (!running) return;

    clicksB++;

    const roll = Math.random();
    let reward = 0;
    let jackpot = false;

    if (roll < 0.7) {
      reward = 0;
    } else if (roll < 0.95) {
      reward = 1 + Math.floor(Math.random() * 3);
    } else {
      reward = 20;
      jackpot = true;
    }

    if (reward > 0) {
      pointsB += reward;
      totalPoints += reward;
      shake(btnB, jackpot);
      floatReward("+" + reward + "⭐", btnB, jackpot ? "jackpot" : "var");

      if (jackpot) {
        jackpotBurst(btnB);
        liveMessage.textContent = "JACKPOT +20! Colpo dopaminergico pieno.";
      } else {
        liveMessage.textContent = "B: premio casuale +" + reward + ".";
      }
    } else {
      floatReward("0", btnB, "var");
      liveMessage.textContent = "B: niente premio. Ritenti?";
    }

    updateDashboard();
    if (totalPoints >= GOAL) finish("goal");
  });

  updateDashboard();
})();
