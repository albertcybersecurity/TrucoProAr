const SoundFX = (() => {
  let enabled = true;
  let ctx = null;

  function ensure() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  function play(type = "click") {
    if (!enabled) return;
    try {
      ensure();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const map = { deal:360, card:430, win:760, lose:160, call:230, click:520 };
      osc.frequency.setValueAtTime(map[type] || 400, now);
      if (type === "win") osc.frequency.exponentialRampToValueAtTime(980, now + .12);
      if (type === "lose") osc.frequency.exponentialRampToValueAtTime(80, now + .22);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.16, now + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, now + (type === "lose" ? .28 : .16));
      osc.type = type === "call" ? "sawtooth" : "triangle";
      osc.start(now);
      osc.stop(now + (type === "lose" ? .3 : .18));
    } catch(e) {}
  }

  function toggle() {
    enabled = !enabled;
    if (enabled) play("click");
    return enabled;
  }

  return { play, toggle };
})();