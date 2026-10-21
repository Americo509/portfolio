/**
 * Som procedural (Web Audio API, zero arquivos): chute, rede, apito, trave e
 * torcida. Só toca depois de um gesto do usuário e se o som estiver ligado.
 */
export function createPenaltyAudio() {
  let ctx: AudioContext | null = null;
  let enabled = false;

  const ac = () => {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  };

  const noise = (c: AudioContext, seconds: number) => {
    const buffer = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buffer;
    return src;
  };

  const env = (c: AudioContext, gain: number, attack: number, release: number) => {
    const g = c.createGain();
    const t = c.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + release);
    g.connect(c.destination);
    return g;
  };

  return {
    setEnabled(v: boolean) {
      enabled = v;
      if (v) ac();
    },
    get enabled() {
      return enabled;
    },
    kick() {
      if (!enabled) return;
      const c = ac();
      const o = c.createOscillator();
      o.frequency.setValueAtTime(140, c.currentTime);
      o.frequency.exponentialRampToValueAtTime(45, c.currentTime + 0.12);
      o.connect(env(c, 0.9, 0.004, 0.18));
      o.start();
      o.stop(c.currentTime + 0.25);
    },
    net() {
      if (!enabled) return;
      const c = ac();
      const n = noise(c, 0.5);
      const f = c.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = 2400;
      n.connect(f).connect(env(c, 0.35, 0.01, 0.4));
      n.start();
    },
    post() {
      if (!enabled) return;
      const c = ac();
      [880, 1320, 2093].forEach((freq, i) => {
        const o = c.createOscillator();
        o.type = "triangle";
        o.frequency.value = freq;
        o.connect(env(c, 0.25 / (i + 1), 0.002, 0.9));
        o.start();
        o.stop(c.currentTime + 1);
      });
    },
    whistle() {
      if (!enabled) return;
      const c = ac();
      const o = c.createOscillator();
      const lfo = c.createOscillator();
      const depth = c.createGain();
      o.frequency.value = 2800;
      lfo.frequency.value = 28;
      depth.gain.value = 140;
      lfo.connect(depth).connect(o.frequency);
      o.connect(env(c, 0.18, 0.02, 0.45));
      o.start();
      lfo.start();
      o.stop(c.currentTime + 0.5);
      lfo.stop(c.currentTime + 0.5);
    },
    crowd(intensity = 1) {
      if (!enabled) return;
      const c = ac();
      const n = noise(c, 2.4);
      const f = c.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 900;
      const g = c.createGain();
      const t = c.currentTime;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.5 * intensity, t + 0.25);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.3);
      n.connect(f).connect(g).connect(c.destination);
      n.start();
    }
  };
}

export type PenaltyAudio = ReturnType<typeof createPenaltyAudio>;
