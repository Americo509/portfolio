import { createHash } from "node:crypto";
import { ARENA, LIGHTS } from "../../src/components/scene/stadium/config";
import { ARENA_PARTS, buildArenaPart } from "../../src/components/scene/stadium/geometry";
import { ATLAS_PADDING, BAKE_VERSION, TIER_RES, sectorLights } from "./common";

/**
 * Hash do que o bake assou: posições de cada parte da estrutura (arredondadas em
 * 0,1 mm), ARENA, LIGHTS, as luzes do bake e a versão. Fica no arena-light.json; o
 * teste de bake vencido recalcula e compara (docs/bake-luz.md §6b).
 */
export function arenaHash() {
  const h = createHash("sha256");
  for (const part of ARENA_PARTS) {
    const g = buildArenaPart(part);
    const p = g.getAttribute("position").array as Float32Array;
    const q = new Int32Array(p.length);
    for (let i = 0; i < p.length; i++) q[i] = Math.round(p[i] * 1e4);
    h.update(part);
    h.update(new Uint8Array(q.buffer));
    g.dispose();
  }
  const round = (n: number) => Math.round(n * 1e4) / 1e4;
  h.update(JSON.stringify(ARENA));
  h.update(JSON.stringify(LIGHTS.map((l) => ({ s: l.sector, p: l.pos.toArray().map(round), d: l.dir.toArray().map(round) }))));
  h.update(JSON.stringify([0, 1, 2, 3].map(sectorLights)));
  h.update(JSON.stringify({ BAKE_VERSION, TIER_RES, ATLAS_PADDING }));
  return h.digest("hex");
}
