class TrucoEngine {
  constructor({ to = 15 } = {}) {
    this.to = to;
    this.reset();
  }

  reset() {
    this.playerScore = 0;
    this.cpuScore = 0;
    this.handNumber = 0;
    this.startHand();
  }

  startHand() {
    const deck = this.shuffle(this.buildDeck());
    this.playerHand = deck.slice(0, 3);
    this.cpuHand = deck.slice(3, 6);
    this.table = [null, null, null];
    this.currentIndex = 0;
    this.handNumber++;
    this.mano = this.handNumber % 2 ? "player" : "cpu";
    this.turn = this.mano;
    this.trucoLevel = 1;
    this.envidoUsed = false;
    this.waiting = false;
    this.handOver = false;
    return this.snapshot();
  }

  buildDeck() {
    const nums = [1,2,3,4,5,6,7,10,11,12];
    const suits = ["espada", "basto", "oro", "copa"];
    const deck = [];
    for (const suit of suits) {
      for (const num of nums) {
        const card = { num, suit, id: `${num}-${suit}` };
        card.rank = this.rank(card);
        card.name = CardRenderer.cardName(card);
        deck.push(card);
      }
    }
    return deck;
  }

  rank(card) {
    const key = `${card.num}-${card.suit}`;
    const special = {
      "1-espada": 14, "1-basto": 13, "7-espada": 12, "7-oro": 11,
      "1-oro": 8, "1-copa": 8, "7-basto": 4, "7-copa": 4
    };
    if (special[key]) return special[key];
    if (card.num === 3) return 10;
    if (card.num === 2) return 9;
    if (card.num === 12) return 7;
    if (card.num === 11) return 6;
    if (card.num === 10) return 5;
    if (card.num === 6) return 3;
    if (card.num === 5) return 2;
    if (card.num === 4) return 1;
    return 0;
  }

  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  playPlayer(index) {
    if (this.turn !== "player" || this.waiting || this.handOver) return { ok:false, error:"No es tu turno" };
    const card = this.playerHand.splice(index, 1)[0];
    if (!this.table[this.currentIndex]) this.table[this.currentIndex] = {};
    this.table[this.currentIndex].player = card;
    this.turn = "cpu";
    return { ok:true, card, snapshot:this.snapshot() };
  }

  playCPU() {
    if (this.turn !== "cpu" || this.handOver) return { ok:false };
    const idx = this.chooseCPUCard();
    const card = this.cpuHand.splice(idx, 1)[0];
    if (!this.table[this.currentIndex]) this.table[this.currentIndex] = {};
    this.table[this.currentIndex].cpu = card;
    this.turn = "player";
    return { ok:true, card, snapshot:this.snapshot() };
  }

  chooseCPUCard() {
    const entry = this.table[this.currentIndex];
    const hand = this.cpuHand.map((card, i) => ({ card, i }));
    if (entry && entry.player) {
      const winning = hand.filter(x => x.card.rank > entry.player.rank).sort((a,b)=>a.card.rank-b.card.rank);
      if (winning.length) return winning[0].i;
      return hand.sort((a,b)=>a.card.rank-b.card.rank)[0].i;
    }
    return hand.sort((a,b)=>a.card.rank-b.card.rank)[0].i;
  }

  canResolve() {
    const t = this.table[this.currentIndex];
    return t && t.player && t.cpu;
  }

  resolveTrick() {
    const t = this.table[this.currentIndex];
    if (!t || !t.player || !t.cpu) return { ok:false };
    let winner = "parda";
    if (t.player.rank > t.cpu.rank) winner = "player";
    if (t.cpu.rank > t.player.rank) winner = "cpu";
    t.winner = winner;
    const handWinner = this.getHandWinner();
    if (handWinner) {
      this.awardHand(handWinner);
      return { ok:true, trickWinner:winner, handWinner, snapshot:this.snapshot() };
    }
    this.currentIndex++;
    this.turn = winner === "parda" ? this.mano : winner;
    return { ok:true, trickWinner:winner, snapshot:this.snapshot() };
  }

  getHandWinner() {
    const results = this.table.filter(Boolean).map(t => t.winner);
    const p = results.filter(x => x === "player").length;
    const c = results.filter(x => x === "cpu").length;
    if (p >= 2) return "player";
    if (c >= 2) return "cpu";
    if (results.length === 2) {
      if (results[0] === "parda" && results[1] === "player") return "player";
      if (results[0] === "parda" && results[1] === "cpu") return "cpu";
      if (results[0] === "player" && results[1] === "parda") return "player";
      if (results[0] === "cpu" && results[1] === "parda") return "cpu";
    }
    if (results.length === 3) {
      if (p > c) return "player";
      if (c > p) return "cpu";
      return this.mano;
    }
    return null;
  }

  awardHand(winner) {
    const points = this.trucoLevel;
    if (winner === "player") this.playerScore += points;
    else this.cpuScore += points;
    this.handOver = true;
  }

  calcEnvido(hand) {
    const bySuit = {};
    hand.forEach(card => {
      const val = card.num >= 10 ? 0 : card.num;
      bySuit[card.suit] = bySuit[card.suit] || [];
      bySuit[card.suit].push(val);
    });
    let best = 0;
    Object.values(bySuit).forEach(vals => {
      vals.sort((a,b)=>b-a);
      if (vals.length >= 2) best = Math.max(best, 20 + vals[0] + vals[1]);
      else best = Math.max(best, vals[0]);
    });
    return best;
  }

  callEnvido(type = "envido") {
    if (this.envidoUsed || this.currentIndex > 0 || this.turn !== "player") return { ok:false };
    this.envidoUsed = true;
    const p = this.calcEnvido(this.playerHand);
    const c = this.calcEnvido(this.cpuHand);
    const config = {
      envido: { points:2, threshold:23, label:"ENVIDO" },
      real: { points:3, threshold:26, label:"REAL ENVIDO" },
      falta: { points: Math.max(1, this.to - Math.max(this.playerScore, this.cpuScore)), threshold:28, label:"FALTA ENVIDO" }
    }[type];
    const accepts = c >= config.threshold || Math.random() > 0.45;
    if (!accepts) {
      this.playerScore += 1;
      return { ok:true, accepted:false, winner:"player", points:1, playerEnvido:p, cpuEnvido:c, label:config.label };
    }
    const winner = p >= c ? "player" : "cpu";
    if (winner === "player") this.playerScore += config.points;
    else this.cpuScore += config.points;
    return { ok:true, accepted:true, winner, points:config.points, playerEnvido:p, cpuEnvido:c, label:config.label };
  }

  callTruco() {
    if (this.trucoLevel > 1 || this.turn !== "player") return { ok:false };
    const power = this.cpuHand.reduce((s,c)=>s+c.rank,0);
    const accepts = power > 16 || Math.random() > 0.42;
    if (accepts) {
      this.trucoLevel = 2;
      return { ok:true, accepted:true, level:this.trucoLevel };
    }
    this.playerScore += 1;
    this.handOver = true;
    return { ok:true, accepted:false, points:1 };
  }

  goMazo() {
    this.cpuScore += this.trucoLevel;
    this.handOver = true;
    return { ok:true, points:this.trucoLevel };
  }

  isFinished() {
    return this.playerScore >= this.to || this.cpuScore >= this.to;
  }

  snapshot() {
    return {
      to:this.to,
      playerScore:this.playerScore,
      cpuScore:this.cpuScore,
      handNumber:this.handNumber,
      mano:this.mano,
      turn:this.turn,
      playerHand:this.playerHand,
      cpuHandCount:this.cpuHand.length,
      table:this.table,
      currentIndex:this.currentIndex,
      trucoLevel:this.trucoLevel,
      envidoUsed:this.envidoUsed,
      handOver:this.handOver,
      playerEnvido:this.calcEnvido(this.playerHand)
    };
  }
}