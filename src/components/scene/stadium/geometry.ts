import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ARENA, archHeight } from "./config";

/**
 * Geometria da estrutura da arena, sem React: o site desenha estas malhas
 * (procedural) e o bake de luz (`scripts/bake-arena`) assa a luz delas. As duas
 * pontas precisam dos mesmos vértices, então tudo o que muda aqui pede um bake novo
 * (o teste de bake vencido compara o hash, ver docs/bake-luz.md §6b).
 */

/** As partes da estrutura, separadas por material e por uso (o pênalti só usa a norte). */
export const ARENA_PARTS = ["seatsSide", "seatEndNorth", "seatEndSouth", "solid", "arches"] as const;
export type ArenaPart = (typeof ARENA_PARTS)[number];

/** Albedo de cada parte no shader da arquibancada: base no tema escuro e no claro, e fileiras. */
export const PART_LOOK: Record<ArenaPart, { base: readonly [dark: number, light: number]; rows: number }> = {
  seatsSide: { base: [0.03, 0.12], rows: 1 },
  seatEndNorth: { base: [0.03, 0.12], rows: 1 },
  seatEndSouth: { base: [0.03, 0.12], rows: 1 },
  solid: { base: [0.02, 0.1], rows: 0 },
  arches: { base: [0.32, 0.45], rows: 0 }
};

/** Junta geometrias sem índice, só com posição (o shader da arquibancada não usa normal nem UV). */
export const merge = (geos: THREE.BufferGeometry[]) => {
  const flat = geos.map((g) => {
    const n = g.index ? g.toNonIndexed() : g;
    n.deleteAttribute("uv");
    n.deleteAttribute("normal");
    return n;
  });
  const merged = mergeGeometries(flat)!;
  geos.forEach((g) => g.dispose());
  flat.forEach((g) => g.dispose());
  return merged;
};

/** Prisma a partir de um perfil (distância do centro, altura), extrudado ao longo de 2 × half. */
function profile(points: [number, number][], half: number) {
  const shape = new THREE.Shape(points.map(([u, v]) => new THREE.Vector2(u, v)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: half * 2, bevelEnabled: false });
  g.translate(0, 0, -half);
  return g;
}

/** Arquibancada lateral (sign −1 oeste, +1 leste): perfil no plano XY, ao longo de z. */
function sideTier(sign: number, from: number, to: number, h: readonly [number, number], hanging: boolean) {
  const base = hanging ? h[0] - 2.2 : 0;
  const g = profile(
    [
      [from, h[0]],
      [to, h[1]],
      [to, base],
      [from, base]
    ],
    ARENA.side.halfLength
  );
  if (sign < 0) {
    g.scale(-1, 1, 1);
    // O espelho inverte o sentido dos triângulos; sem desfazer, a normal (que o bake
    // usa) apontaria para dentro do sólido e o lado oeste sairia apagado.
    flipWinding(g);
  }
  return g;
}

/** Inverte o sentido de cada triângulo (geometria sem índice), mantendo a forma. */
function flipWinding(g: THREE.BufferGeometry) {
  for (const name of Object.keys(g.attributes)) {
    const a = g.getAttribute(name);
    const n = a.itemSize;
    const arr = a.array as Float32Array;
    for (let t = 0; t < a.count; t += 3)
      for (let k = 0; k < n; k++) {
        const i1 = (t + 1) * n + k;
        const i2 = (t + 2) * n + k;
        const tmp = arr[i1];
        arr[i1] = arr[i2];
        arr[i2] = tmp;
      }
  }
}

/** Arquibancada do fundo (sign −1 norte, +1 sul): perfil girado para o eixo z. */
export function endTier(sign: number) {
  const { from, to, h, halfWidth } = ARENA.end;
  const g = profile(
    [
      [from, h[0]],
      [to, h[1]],
      [to, 0],
      [from, 0]
    ],
    halfWidth
  );
  g.rotateY(sign < 0 ? Math.PI / 2 : -Math.PI / 2);
  return g;
}

export function box(w: number, h: number, d: number, x: number, y: number, z: number, rotZ = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  if (rotZ) g.rotateZ(rotZ);
  g.translate(x, y, z);
  return g;
}

function seatsSide() {
  const { lower, upper } = ARENA.side;
  return merge([-1, 1].flatMap((s) => [sideTier(s, lower.from, lower.to, lower.h, false), sideTier(s, upper.from, upper.to, upper.h, true)]));
}

/** Prédios, coberturas, pilares dos arcos e a estrutura do telão. */
function solid() {
  const { building, roof } = ARENA.side;
  const run = roof.outer - roof.inner;
  const angle = Math.atan2(roof.h[1] - roof.h[0], run);
  const len = Math.hypot(run, roof.h[1] - roof.h[0]);
  const mid = (roof.inner + roof.outer) / 2;
  const midH = (roof.h[0] + roof.h[1]) / 2 + 0.6;
  const er = ARENA.end.roof;
  const { z, halfSpan, spring } = ARENA.arch;
  const sw = ARENA.screen;
  const parts: THREE.BufferGeometry[] = [];
  for (const s of [-1, 1]) {
    const bw = building.to - building.from;
    parts.push(box(bw, building.h, building.halfLength * 2, s * (building.from + bw / 2), building.h / 2, 0));
    parts.push(box(len, 1.2, roof.halfLength * 2, s * mid, midH, 0, s * angle));
    parts.push(box(er.halfWidth * 2, 0.8, er.to - er.from, 0, er.h, (s * (er.from + er.to)) / 2));
    // Pilares dos arcos, nos cantos abertos.
    parts.push(box(2.4, spring, 2.4, -halfSpan, spring / 2, s * z));
    parts.push(box(2.4, spring, 2.4, halfSpan, spring / 2, s * z));
  }
  // Estrutura do telão.
  parts.push(box(sw.width + 2, sw.h[1] - sw.h[0] + 2, 1.2, 0, (sw.h[0] + sw.h[1]) / 2, sw.z - 0.8));
  parts.push(box(1.2, sw.h[0], 1.2, -sw.width / 3, sw.h[0] / 2, sw.z - 0.8));
  parts.push(box(1.2, sw.h[0], 1.2, sw.width / 3, sw.h[0] / 2, sw.z - 0.8));
  return merge(parts);
}

function arches() {
  const { z, halfSpan } = ARENA.arch;
  return merge(
    [-1, 1].map((s) => {
      const pts = Array.from({ length: 25 }, (_, i) => {
        const x = -halfSpan + (i / 24) * halfSpan * 2;
        return new THREE.Vector3(x, archHeight(x), s * z);
      });
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.9, 8, false);
    })
  );
}

const BUILDERS: Record<ArenaPart, () => THREE.BufferGeometry> = {
  seatsSide,
  seatEndNorth: () => merge([endTier(-1)]),
  seatEndSouth: () => merge([endTier(1)]),
  solid,
  arches
};

/** Uma parte da estrutura: triângulos sem índice, só com posição. */
export function buildArenaPart(part: ArenaPart) {
  return BUILDERS[part]();
}

/** Tirantes dos arcos e, nos tiers médio e alto, a treliça da borda das coberturas laterais (linhas, fora do bake). */
export function buildArenaLines(truss: boolean) {
  const { roof } = ARENA.side;
  const v: number[] = [];
  const { z, hangerStep } = ARENA.arch;
  const er = ARENA.end.roof;
  for (const s of [-1, 1]) for (let x = -er.halfWidth; x <= er.halfWidth; x += hangerStep) v.push(x, archHeight(x), s * z, x, er.h, s * z);
  if (truss) {
    const top = roof.h[0];
    const bottom = top - roof.depth;
    for (const s of [-1, 1]) {
      const x = s * roof.inner;
      v.push(x, top, -roof.halfLength, x, top, roof.halfLength, x, bottom, -roof.halfLength, x, bottom, roof.halfLength);
      for (let zz = -roof.halfLength, k = 0; zz < roof.halfLength; zz += 6, k++) v.push(x, k % 2 ? top : bottom, zz, x, k % 2 ? bottom : top, zz + 6);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
  return g;
}
