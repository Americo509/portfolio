/**
 * Jukebox procedural: um loop de samba-rock gerado com Web Audio (bumbo,
 * caixa, chimbal com swing, um baixo simples e chiado de vinil). Zero arquivos,
 * sem música de terceiros.
 */
export function createJukebox() {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let timer: number | null = null;
  let step = 0;
  let next = 0;
  const bpm = 102;
  const sixteenth = 60 / bpm / 4;
  // Padrões em 16 passos (1 compasso de 4/4).
  const kick = [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0];
  const snare = [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0];
  const hat = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  const bass = [43, 0, 0, 43, 0, 0, 46, 0, 48, 0, 0, 48, 0, 46, 0, 0];

  const noise = (c: AudioContext, seconds: number) => {
    const b = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  };

  function voice(c: AudioContext, t: number) {
    const out = master!;
    const i = step % 16;
    if (kick[i]) {
      const o = c.createOscillator();
      const g = c.createGain();
      o.frequency.setValueAtTime(120, t);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      g.gain.setValueAtTime(0.9, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + 0.3);
    }
    if (snare[i]) {
      const n = c.createBufferSource();
      n.buffer = noise(c, 0.2);
      const f = c.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = 1400;
      const g = c.createGain();
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      n.connect(f).connect(g).connect(out);
      n.start(t);
    }
    if (hat[i]) {
      const n = c.createBufferSource();
      n.buffer = noise(c, 0.05);
      const f = c.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = 7000;
      const g = c.createGain();
      g.gain.setValueAtTime(i % 2 ? 0.06 : 0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      n.connect(f).connect(g).connect(out);
      n.start(t);
    }
    if (bass[i]) {
      const o = c.createOscillator();
      o.type = "triangle";
      o.frequency.value = 440 * Math.pow(2, (bass[i] - 69) / 12);
      const g = c.createGain();
      g.gain.setValueAtTime(0.28, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + sixteenth * 2.5);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + sixteenth * 3);
    }
  }

  function schedule() {
    const c = ctx!;
    while (next < c.currentTime + 0.12) {
      // Swing: as notas fracas atrasam um pouco (a "levada").
      const swing = step % 2 ? sixteenth * 0.18 : 0;
      voice(c, next + swing);
      next += sixteenth;
      step++;
    }
  }

  return {
    get playing() {
      return timer !== null;
    },
    start() {
      if (timer !== null) return;
      ctx ??= new AudioContext();
      void ctx.resume();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
      // Chiado de vinil por baixo.
      const crackle = ctx.createBufferSource();
      crackle.buffer = noise(ctx, 2);
      crackle.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = "bandpass";
      lp.frequency.value = 3000;
      const cg = ctx.createGain();
      cg.gain.value = 0.015;
      crackle.connect(lp).connect(cg).connect(master);
      crackle.start();
      step = 0;
      next = ctx.currentTime + 0.05;
      timer = window.setInterval(schedule, 25);
    },
    stop() {
      if (timer !== null) window.clearInterval(timer);
      timer = null;
      master?.disconnect();
      master = null;
    }
  };
}
