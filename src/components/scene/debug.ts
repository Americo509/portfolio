import { create } from "zustand";

/**
 * Ferramentas do ?debug: direção de câmera e desempenho (docs/plano-awwwards.md,
 * revisão da etapa 1). Sem three de propósito: os painéis do DOM importam este
 * módulo, e ele não pode puxar a cena para o pacote principal.
 */
export const isDebug = () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debug");

type CameraDebug = {
  /** Câmera livre (órbita com mouse/toque); a trilha para de mandar na câmera. */
  free: boolean;
  /** Progresso global forçado pelo slider; null segue o scroll. */
  scrub: number | null;
  /** Desenha a spline da trilha e os quadros-chave na cena. */
  showPath: boolean;
  /** Quadro fixo no lugar da trilha (posição, alvo e FOV); null segue a trilha. */
  shot: { pos: [number, number, number]; look: [number, number, number]; fov: number } | null;
  set: (patch: Partial<Omit<CameraDebug, "set">>) => void;
};

export const useCameraDebug = create<CameraDebug>((set) => ({
  free: false,
  scrub: null,
  showPath: true,
  shot: null,
  set: (patch) => set(patch)
}));

/** Leitura ao vivo da câmera, escrita pela cena a cada quadro. */
export const cameraLive = {
  g: 0,
  pos: [0, 0, 0] as [number, number, number],
  look: [0, 0, 0] as [number, number, number],
  fov: 42,
  track: "desktop" as "desktop" | "mobile"
};

/** Quadro-chave no formato de camera-track.ts, pronto para colar. */
export function keyCode() {
  const r = (v: number) => Math.round(v * 10) / 10;
  const { g, pos, look, fov } = cameraLive;
  return `{ at: ${Math.round(g * 100) / 100}, pos: [${pos.map(r).join(", ")}], look: [${look.map(r).join(", ")}], fov: ${Math.round(fov)} },`;
}

// ---------------------------------------------------------------------------
// Desempenho: tempos de quadro dos últimos ~20 s (anel), tier, DPR e pós ativos.

const SIZE = 1200;
export const perfLive = {
  times: new Float32Array(SIZE),
  stamps: new Float64Array(SIZE),
  index: 0,
  count: 0,
  tier: "-",
  dpr: 1,
  post: "-",
  /** O aparelho tem KHR_parallel_shader_compile (compila sem travar a página). */
  parallel: null as boolean | null,
  /** Do primeiro quadro da cena até ela ficar pronta (ms) e o maior quadro nesse intervalo. */
  readyMs: null as number | null,
  worstMountFrame: 0
};

export function pushFrame(ms: number) {
  const p = perfLive;
  p.times[p.index] = ms;
  p.stamps[p.index] = performance.now();
  p.index = (p.index + 1) % SIZE;
  p.count = Math.min(SIZE, p.count + 1);
}

/** Estatísticas da janela: mediana de fps e p95 do tempo de quadro (ms). */
export function perfStats(windowMs: number) {
  const p = perfLive;
  const now = performance.now();
  const sample: number[] = [];
  for (let i = 0; i < p.count; i++) {
    const j = (p.index - 1 - i + SIZE) % SIZE;
    if (now - p.stamps[j] > windowMs) break;
    sample.push(p.times[j]);
  }
  if (sample.length < 2) return null;
  sample.sort((a, b) => a - b);
  const median = sample[Math.floor(sample.length / 2)];
  const p95 = sample[Math.min(sample.length - 1, Math.floor(sample.length * 0.95))];
  return { frames: sample.length, medianFps: 1000 / median, p95 };
}

export function resetPerf() {
  perfLive.index = 0;
  perfLive.count = 0;
}

// ---------------------------------------------------------------------------
// Verificação do bake de luz (scripts/bake-arena/verify): sobrescritas do ?debug,
// controladas por window.__bake.

export const bakeDebug = {
  /** Intensidade de cada setor no lugar da do CameraRig (null segue a cena). */
  sectors: null as number[] | null,
  /** Força a mistura analítica/assada (0 ou 1); null segue o crossfade. */
  baked: null as number | null,
  /** Congela o relógio dos shaders (segundos): dois quadros comparáveis. */
  freeze: null as number | null,
  /** A luz assada já está na cena (o crossfade pode estar no meio). */
  loaded: false,
  /** Usa a referência float no lugar do KTX2, na mesma página (mesma fumaça, mesmo quadro). */
  useRef: false,
  /** Carrega a referência float (definida pela cena quando a luz assada chega). */
  loadRef: null as ((url: string) => Promise<void>) | null
};
