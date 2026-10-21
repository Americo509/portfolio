import * as THREE from "three";
import type { GpuTier } from "@/lib/webgl";

/**
 * Geometria do estádio (unidades ≈ metros). Campo de 68 × 105 centrado na
 * origem, sobre o plano XZ; a câmera fica atrás de um dos gols olhando o campo.
 */
export const PITCH = { width: 68, length: 105 };

const tower = (x: number, z: number, tx: number, tz: number) => {
  const pos = new THREE.Vector3(x, 38, z);
  const dir = new THREE.Vector3(tx, 0, tz).sub(pos).normalize();
  return { pos, dir };
};

/** 4 refletores nos cantos, mirando o miolo do campo. */
export const FLOODLIGHTS = [
  tower(-46, -64, 22, 6),
  tower(46, -64, -18, 10),
  tower(-46, 64, -6, -30),
  tower(46, 64, 14, -34)
];

/** Meia-abertura do cone de luz (tan do ângulo). */
export const CONE_TAN = 0.14;

/** O sinalizador: na arquibancada do fundo, um pouco à esquerda. */
export const FLARE = new THREE.Vector3(-20, 12.5, -61);

/** Câmera: começa no alto do refletor e desce até o nível do campo. */
export const CAMERA = {
  start: { pos: new THREE.Vector3(40, 46, 66), look: new THREE.Vector3(0, 0, -6), fov: 58 },
  end: { pos: new THREE.Vector3(-10, 3.4, 56), look: new THREE.Vector3(18, 8, -30), fov: 42 }
};

export const TIER_SETTINGS: Record<GpuTier, { fogLayers: number; smoke: number; dpr: number; post: "none" | "bloom" | "full" }> = {
  low: { fogLayers: 3, smoke: 90, dpr: 1, post: "none" },
  mid: { fogLayers: 5, smoke: 220, dpr: 1.5, post: "bloom" },
  high: { fogLayers: 8, smoke: 480, dpr: 1.75, post: "full" }
};
