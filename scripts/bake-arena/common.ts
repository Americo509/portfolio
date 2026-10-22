import * as THREE from "three";
import { ARENA, LIGHTS, LIGHTS_PER_SECTOR, SECTORS } from "../../src/components/scene/stadium/config";

/**
 * Parâmetros do bake de luz da arena (docs/bake-luz.md). Tudo o que muda o resultado
 * está aqui ou em geometry.ts/config.ts, e entra no hash do bake vencido.
 */

/** Sobe quando o desenho das luzes ou a codificação mudam sem mexer na geometria. */
export const BAKE_VERSION = 1;

/** Resolução do bake e dos tiers (o bake roda uma vez no maior; os outros saem por redução). */
export const TIER_RES = { low: 512, mid: 1024, high: 2048 } as const;
export type BakeTier = keyof typeof TIER_RES;

/** Margem do xatlas em texels no maior tamanho (vira 2 no tier de 512). */
export const ATLAS_PADDING = 8;

/** Canais da textura, na ordem de SECTORS e de uLightOn: R sul, G leste, B oeste, A norte. */
export const CHANNELS = SECTORS;

/** Para fora do campo, na direção de cada setor (a arquibancada daquele setor fica para lá). */
const OUTWARD = [new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, -1)];

export type BakeLight = {
  kind: "flood" | "stand" | "bounce";
  pos: [number, number, number];
  target: [number, number, number];
  /** Meio ângulo do cone, em radianos. */
  angle: number;
  penumbra: number;
  /** Intensidade relativa dentro do setor (cada setor é calibrado à parte). */
  intensity: number;
  /** Retângulo de jitter (metros) ao longo de `along` e na vertical: dá a penumbra das sombras. */
  jitter: [along: number, up: number];
  along: [number, number, number];
};

const v3 = (v: THREE.Vector3) => [v.x, v.y, v.z] as [number, number, number];

/**
 * As luzes de um setor:
 * - os 3 grupos de refletores (LIGHTS), com cone mais aberto que o facho visível;
 * - a luz da arquibancada: spots sob a borda da cobertura, apontando para os degraus
 *   do próprio setor (o equivalente físico do sectorSpill);
 * - o rebote do gramado: da mancha que o setor faz no campo, para cima.
 */
export function sectorLights(sector: number): BakeLight[] {
  const own = LIGHTS.filter((l) => l.sector === sector);
  const out = OUTWARD[sector];
  const side = sector === 1 || sector === 2;
  const along = side ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
  const lights: BakeLight[] = [];

  for (const l of own) {
    lights.push({
      kind: "flood",
      pos: v3(l.pos),
      target: v3(l.pos.clone().addScaledVector(l.dir, 40)),
      angle: 0.55,
      penumbra: 0.7,
      intensity: 1,
      jitter: [6, 1],
      along: v3(along)
    });
  }

  // Arquibancada do setor: altura média dos degraus e distância até o meio deles.
  const a = own[0].pos;
  const b = own[LIGHTS_PER_SECTOR - 1].pos;
  const standMid = side
    ? { reach: (ARENA.side.lower.from + ARENA.side.upper.to) / 2 - ARENA.side.roof.inner, h: (ARENA.side.lower.h[0] + ARENA.side.upper.h[1]) / 2 }
    : { reach: (ARENA.end.from + ARENA.end.to) / 2 - ARENA.end.roof.from, h: (ARENA.end.h[0] + ARENA.end.h[1]) / 2 };
  const count = 5;
  const span = side ? ARENA.side.halfLength * 1.6 : ARENA.end.halfWidth * 1.6;
  for (let i = 0; i < count; i++) {
    const u = (i + 0.5) / count - 0.5;
    const base = a.clone().lerp(b, 0.5).addScaledVector(along, u * span);
    const pos = base.clone().addScaledVector(out, 1.5).add(new THREE.Vector3(0, -1.5, 0));
    const target = base.clone().addScaledVector(out, standMid.reach).setY(standMid.h);
    lights.push({ kind: "stand", pos: v3(pos), target: v3(target), angle: 1.0, penumbra: 1, intensity: 0.35, jitter: [span / count, 1], along: v3(along) });
  }

  // Rebote: do centro da mancha dos refletores do setor no gramado, para cima.
  const pool = new THREE.Vector3();
  own.forEach((l) => pool.add(l.pos.clone().addScaledVector(l.dir, -l.pos.y / l.dir.y)));
  pool.divideScalar(own.length).setY(0.3);
  lights.push({ kind: "bounce", pos: v3(pool), target: v3(pool.clone().setY(30)), angle: 1.45, penumbra: 1, intensity: 0.12, jitter: [16, 0], along: v3(along) });
  return lights;
}

/** A luz analítica de hoje (sectorSpill em shaders.ts), por setor, para calibrar o bake. */
export function analyticSpill(p: THREE.Vector3, sector: number) {
  const a = LIGHTS[sector * LIGHTS_PER_SECTOR].pos;
  const b = LIGHTS[sector * LIGHTS_PER_SECTOR + LIGHTS_PER_SECTOR - 1].pos;
  const ab = b.clone().sub(a);
  const t = THREE.MathUtils.clamp(p.clone().sub(a).dot(ab) / ab.dot(ab), 0, 1);
  return Math.exp(-p.distanceTo(a.clone().addScaledVector(ab, t)) * 0.05) * 2.2;
}
