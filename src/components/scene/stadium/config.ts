import * as THREE from "three";
import type { GpuTier } from "@/lib/webgl";

/**
 * Geometria da arena (unidades ≈ metros), inspirada na arena de Itaquera
 * (docs/estadio-arena.md §7). Campo de 68 × 105 centrado na origem, sobre o
 * plano XZ. Norte = −z (o fundo que a câmera do hero vê), oeste = −x.
 */
export const PITCH = { width: 68, length: 105 };

export const ARENA = {
  /** Laterais (leste e oeste iguais): dois anéis, cobertura e o bloco do prédio atrás. */
  side: {
    halfLength: 56,
    lower: { from: 40, to: 62, h: [0.8, 12] as const },
    upper: { from: 64, to: 84, h: [16, 38] as const },
    building: { from: 84, to: 96, h: 48, halfLength: 90 },
    roof: { inner: 44, outer: 96, h: [40, 50] as const, halfLength: 60, depth: 4 }
  },
  /** Fundos (norte e sul): anel único e baixo, cobertura fina pendurada no arco. */
  end: {
    from: 60.5,
    to: 84.5,
    halfWidth: 36,
    h: [0.8, 14] as const,
    roof: { from: 60, to: 88, h: 24, halfWidth: 40 }
  },
  /** Arcos sobre os fundos, apoiados em pilares nos cantos abertos. */
  arch: { z: 72, halfSpan: 60, spring: 30, apex: 46, hangerStep: 8 },
  /** Telão atrás da arquibancada norte. */
  screen: { z: -86.5, width: 24, h: [14, 22] as const }
};

/**
 * Modelo da arena feito no Blender, com a luz assada (docs/arena-blender.md). Com
 * null, a estrutura continua procedural. Ao subir public/models/arena.glb, troque
 * por "/models/arena.glb".
 */
export const ARENA_MODEL: string | null = null;

/** Altura da arquibancada do fundo numa distância |z| do meio-campo. */
export const endStandHeight = (absZ: number) => {
  const { from, to, h } = ARENA.end;
  return h[0] + ((absZ - from) / (to - from)) * (h[1] - h[0]);
};

/** Altura do arco num x (parábola entre os pilares). */
export const archHeight = (x: number) => {
  const { halfSpan, spring, apex } = ARENA.arch;
  return spring + (apex - spring) * (1 - (x / halfSpan) ** 2);
};

/**
 * Setores da cobertura. A ordem é a do apagar no apito final (o norte, atrás
 * do sinalizador, apaga por último) e a das linhas do preloader.
 */
export const SECTORS = ["south", "east", "west", "north"] as const;
export const LIGHTS_PER_SECTOR = 3;

const roofLight = (sector: number, pos: [number, number, number], target: [number, number, number]) => {
  const p = new THREE.Vector3(...pos);
  return { sector, pos: p, dir: new THREE.Vector3(...target).sub(p).normalize() };
};

/**
 * Grupos de refletores na borda interna da cobertura (3 por setor), mirando o
 * gramado. Sem torres: a luz desce da cobertura em cortina.
 */
export const LIGHTS = [
  // sul (borda da cobertura do fundo)
  roofLight(0, [-24, 24, 60], [-14, 0, 26]),
  roofLight(0, [0, 24, 60], [0, 0, 22]),
  roofLight(0, [24, 24, 60], [14, 0, 26]),
  // leste
  roofLight(1, [44, 40, -36], [8, 0, -30]),
  roofLight(1, [44, 40, 0], [6, 0, 0]),
  roofLight(1, [44, 40, 36], [8, 0, 30]),
  // oeste
  roofLight(2, [-44, 40, -36], [-8, 0, -30]),
  roofLight(2, [-44, 40, 0], [-6, 0, 0]),
  roofLight(2, [-44, 40, 36], [-8, 0, 30]),
  // norte
  roofLight(3, [-24, 24, -60], [-14, 0, -26]),
  roofLight(3, [0, 24, -60], [0, 0, -22]),
  roofLight(3, [24, 24, -60], [14, 0, -26])
];

/** Meia-abertura do cone de luz (tan do ângulo). */
export const CONE_TAN = 0.16;

/** Sinalizadores na mão da torcida, na arquibancada norte. O primeiro solta mais fumaça. */
const flareAt = (x: number, absZ: number) => new THREE.Vector3(x, endStandHeight(absZ) + 2.1, -absZ);
export const FLARES = [flareAt(-14, 68), flareAt(9, 72), flareAt(-27, 66), flareAt(24, 70), flareAt(-3, 78), flareAt(29, 77)];

// A câmera (keyframes por capítulo, trilha mobile e saída do túnel) fica em camera-track.ts.

export const TIER_SETTINGS: Record<
  GpuTier,
  { fogLayers: number; smoke: number; dpr: number; post: "none" | "bloom" | "full"; crowd: number; flags: number; truss: boolean }
> = {
  low: { fogLayers: 3, smoke: 120, dpr: 1, post: "none", crowd: 900, flags: 4, truss: false },
  mid: { fogLayers: 5, smoke: 300, dpr: 1.5, post: "bloom", crowd: 1800, flags: 10, truss: true },
  high: { fogLayers: 8, smoke: 600, dpr: 1.75, post: "full", crowd: 2600, flags: 16, truss: true }
};
