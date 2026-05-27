let engine = new TrucoEngine({ to: 15 });
let timerId = null;
let seconds = 29;

const $ = (id) => document.getElementById(id);

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(id).classList.add("active");
  document.querySelectorAll(".nav button").forEach(b => b.classList.toggle("active", b.dataset.screen === id));
  window.scrollTo({ top:0, behavior:"smooth" });
}

document.querySelectorAll("[data-screen]").forEach(btn => btn.addEventListener("click", () => showScreen(btn.dataset.screen)));
$("quickPlayBtn").onclick = () => { showScreen("game"); newMatch(); };
$("heroPlayBtn").onclick = () => { showScreen("game"); newMatch(); };
$("newHandBtn").onclick = () => startHand();
$("resetBtn").onclick = () => newMatch();
$("envidoBtn").onclick = () => callEnvido("envido");
$("realEnvidoBtn").onclick = () => callEnvido("real");
$("faltaEnvidoBtn").onclick = () => callEnvido("falta");
$("trucoBtn").onclick = () => callTruco();
$("mazoBtn").onclick = () => goMazo();
$("soundBtn").onclick = () => {
  const enabled = SoundFX.toggle();
  $("soundBtn").textContent = enabled ? "🔊 Sonido" : "🔇 Silencio";
};
$("modalClose").onclick = () => $("modal").classList.remove("active");
$("modalPlayAgain").onclick = () => { $("modal").classList.remove("active"); newMatch(); };

function init() {
  $("previewCard1").innerHTML = CardRenderer.render({num:1, suit:"espada", name:"Ancho de Espadas"});
  $("previewCard2").innerHTML = CardRenderer.render({num:7, suit:"oro", name:"Siete de Oros"});
  $("previewCard3").innerHTML = CardRenderer.render({num:1, suit:"basto", name:"Ancho de Bastos"});
  renderLobby();
  renderRanking();
  renderGame();
}

function renderLobby() {
  const tables = [
    ["Mesa Palermo", "1v1 contra CPU", "Gratis"],
    ["Copa Federal", "2v2 online-ready", "Próximamente"],
    ["Mesa VIP Obelisco", "1v1 VIP", "Demo"],
    ["Torneo Relámpago", "Bracket", "Próximamente"]
  ];
  $("lobbyGrid").innerHTML = tables.map(t => `
    <div class="lobby-card">
      <h3>${t[0]}</h3>
      <p>${t[1]} · ${t[2]}</p>
      <button class="primary-btn" onclick="showScreen('game'); newMatch();">Entrar</button>
    </div>`).join("");
}

function renderRanking() {
  const rows = [
    [1, "ReyEspada", 8840, "78%"],
    [2, "Mati7Oros", 8120, "74%"],
    [3, "DanielPro", 7905, "72%"],
    [4, "SofiAR", 7340, "69%"]
  ];
  $("rankingList").innerHTML = rows.map(r => `<div class="rank-row"><div class="rank-pos">#${r[0]}</div><div>${r[1]}</div><div>${r[2]}</div><div>${r[3]}</div></div>`).join("");
}

function newMatch() {
  engine = new TrucoEngine({ to: 15 });
  log("Nueva partida iniciada.");
  SoundFX.play("deal");
  renderGame();
  afterTurnRender();
}

function startHand() {
  engine.startHand();
  log("Nueva mano repartida.");
  SoundFX.play("deal");
  renderGame();
  afterTurnRender();
}

function renderGame() {
  const s = engine.snapshot();
  $("scorePlayer").textContent = s.playerScore;
  $("scoreCPU").textContent = s.cpuScore;
  $("handOwner").textContent = s.mano === "player" ? "Vos" : "CPU";
  $("stateText").textContent = s.handOver ? "Mano terminada" : (s.turn === "player" ? "Tu turno" : "Turno CPU");
  $("envidoText").textContent = s.playerEnvido;
  $("turnBadge").textContent = s.turn === "player" ? `TU JUGADA · ${seconds}s` : "JUEGA RIVAL";
  $("cpuCards").innerHTML = Array.from({length:s.cpuHandCount}).map(()=>`<div class="card-back"></div>`).join("");
  $("playerCards").innerHTML = s.playerHand.map((card, i) => `<button class="card-button" ${s.turn !== "player" || s.handOver ? "disabled" : ""} onclick="playPlayer(${i})">${CardRenderer.render(card)}</button>`).join("");
  for (let i=0;i<3;i++) {
    const slot = $(`slot${i}`);
    const entry = s.table[i];
    slot.className = "play-slot";
    slot.innerHTML = "";
    if (!entry) continue;
    if (entry.winner === "player") slot.classList.add("win-player");
    if (entry.winner === "cpu") slot.classList.add("win-cpu");
    if (entry.cpu) slot.innerHTML += `<div class="mini-card cpu">${CardRenderer.render(entry.cpu)}</div>`;
    if (entry.player) slot.innerHTML += `<div class="mini-card player">${CardRenderer.render(entry.player)}</div>`;
  }
  $("envidoBtn").disabled = s.envidoUsed || s.currentIndex > 0 || s.turn !== "player" || s.handOver;
  $("realEnvidoBtn").disabled = $("envidoBtn").disabled;
  $("faltaEnvidoBtn").disabled = $("envidoBtn").disabled;
  $("trucoBtn").disabled = s.trucoLevel > 1 || s.turn !== "player" || s.handOver;
  $("mazoBtn").disabled = s.handOver;
}

function afterTurnRender() {
  clearTimer();
  const s = engine.snapshot();
  if (engine.isFinished()) return endGame();
  if (s.handOver) {
    setTimeout(() => startHand(), 1600);
    return;
  }
  if (s.turn === "cpu") {
    setTimeout(cpuPlay, 850);
  } else {
    startTimer();
  }
}

function playPlayer(index) {
  const r = engine.playPlayer(index);
  if (!r.ok) return toast(r.error);
  log(`Jugaste <b>${r.card.name}</b>.`);
  SoundFX.play("card");
  renderGame();
  if (engine.canResolve()) {
    setTimeout(resolveTrick, 450);
  } else {
    afterTurnRender();
  }
}

function cpuPlay() {
  const r = engine.playCPU();
  if (!r.ok) return;
  log(`CPU jugó <b>${r.card.name}</b>.`);
  SoundFX.play("card");
  renderGame();
  if (engine.canResolve()) {
    setTimeout(resolveTrick, 450);
  } else {
    afterTurnRender();
  }
}

function resolveTrick() {
  const r = engine.resolveTrick();
  if (!r.ok) return;
  if (r.trickWinner === "player") log("Ganaste la mano.");
  else if (r.trickWinner === "cpu") log("El rival ganó la mano.");
  else log("Mano parda.");
  SoundFX.play(r.trickWinner === "player" ? "win" : r.trickWinner === "cpu" ? "lose" : "click");
  renderGame();
  afterTurnRender();
}

function callEnvido(type) {
  const r = engine.callEnvido(type);
  if (!r.ok) return;
  log(`Cantaste <b>${r.label}</b>.`);
  if (r.accepted) log(`CPU quiso. Tu envido: ${r.playerEnvido}. CPU: ${r.cpuEnvido}. Ganó ${r.winner === "player" ? "vos" : "CPU"} +${r.points}.`);
  else log(`CPU no quiso. Sumaste ${r.points}.`);
  SoundFX.play(r.winner === "player" ? "win" : "lose");
  renderGame();
  if (engine.isFinished()) endGame();
}

function callTruco() {
  const r = engine.callTruco();
  if (!r.ok) return;
  log("Cantaste <b>TRUCO</b>.");
  if (r.accepted) log("CPU quiso. La mano vale 2.");
  else log("CPU no quiso. Sumaste 1.");
  SoundFX.play(r.accepted ? "call" : "win");
  renderGame();
  afterTurnRender();
}

function goMazo() {
  const r = engine.goMazo();
  log(`Te fuiste al mazo. CPU suma ${r.points}.`);
  SoundFX.play("lose");
  renderGame();
  afterTurnRender();
}

function startTimer() {
  seconds = 29;
  $("turnBadge").textContent = `TU JUGADA · ${seconds}s`;
  timerId = setInterval(() => {
    seconds--;
    $("turnBadge").textContent = `TU JUGADA · ${seconds}s`;
    if (seconds <= 0) {
      clearTimer();
      const s = engine.snapshot();
      if (s.playerHand.length) playPlayer(0);
    }
  }, 1000);
}

function clearTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
}

function endGame() {
  const s = engine.snapshot();
  $("modalTitle").textContent = s.playerScore >= s.to ? "¡Ganaste la partida!" : "Ganó la CPU";
  $("modalText").textContent = `Resultado final: Vos ${s.playerScore} - CPU ${s.cpuScore}`;
  $("modal").classList.add("active");
}

function log(message) {
  $("log").innerHTML = `<div>${message}</div>` + $("log").innerHTML;
}

function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 2200);
}

init();