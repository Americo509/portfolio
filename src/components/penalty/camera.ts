import { PITCH } from "@/components/scene/stadium/config";

/**
 * Câmera do pênalti, também usada pelo bake de luz para saber o que ela enxerga da
 * arquibancada norte (docs/bake-luz.md §3).
 */
export const PENALTY_CAMERA = {
  pos: [0, 1.35, 14.4] as const,
  look: [0, 1.05, 0] as const,
  /** Campo de visão vertical mínimo; no retrato ele abre para caber o gol (± GOAL_HALF_VIEW). */
  minFov: 27,
  goalHalfView: 4.6,
  /** Tremor máximo no gol (metros, ponta a ponta). */
  shake: 0.0625
};

/** O gol do pênalti fica em z = 0, que é a linha de fundo norte da arena deslocada. */
export const NORTH_OFFSET = PITCH.length / 2;

/** FOV vertical do pênalti para uma proporção de tela. */
export function penaltyFov(aspect: number) {
  const { pos, look, goalHalfView, minFov } = PENALTY_CAMERA;
  const dist = Math.hypot(pos[0] - look[0], pos[1] - look[1], pos[2] - look[2]);
  const hHalf = Math.atan(goalHalfView / dist);
  return Math.max(minFov, (2 * Math.atan(Math.tan(hHalf) / aspect) * 180) / Math.PI);
}
