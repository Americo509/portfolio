"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ARENA, archHeight, endStandHeight } from "./config";
import {
  crowdFragment,
  crowdVertex,
  flagFragment,
  flagVertex,
  glowFragment,
  glowVertex,
  ledFragment,
  ledVertex,
  screenFragment,
  smokeFragment,
  smokeVertex,
  standFragment,
  worldVertex
} from "./shaders";
import type { Shared } from "./shared";

// Arena inspirada na de Itaquera (docs/estadio-arena.md §7): laterais iguais em
// dois anéis com o bloco do prédio atrás, fundos baixos com arco e tirantes,
// telão atrás do gol norte e a torcida com bandeiras e sinalizadores.

/** PRNG determinístico: a torcida e as bandeiras ficam iguais a cada carregamento. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const merge = (geos: THREE.BufferGeometry[]) => {
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
  if (sign < 0) g.scale(-1, 1, 1);
  return g;
}

/** Arquibancada do fundo (sign −1 norte, +1 sul): perfil girado para o eixo z. */
function endTier(sign: number) {
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

function box(w: number, h: number, d: number, x: number, y: number, z: number, rotZ = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  if (rotZ) g.rotateZ(rotZ);
  g.translate(x, y, z);
  return g;
}

function useStandMaterial(shared: Shared, base: number, rows: number) {
  return React.useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: worldVertex,
        fragmentShader: standFragment,
        uniforms: { ...shared, uBase: { value: base }, uRows: { value: rows } },
        side: THREE.DoubleSide
      }),
    [shared, base, rows]
  );
}

export function ArenaStructure({ shared, additive, truss }: { shared: Shared; additive: boolean; truss: boolean }) {
  const { roof } = ARENA.side;

  const seats = React.useMemo(() => {
    const { lower, upper } = ARENA.side;
    return merge([
      ...[-1, 1].flatMap((s) => [sideTier(s, lower.from, lower.to, lower.h, false), sideTier(s, upper.from, upper.to, upper.h, true)]),
      endTier(-1),
      endTier(1)
    ]);
  }, []);

  const solid = React.useMemo(() => {
    const { building } = ARENA.side;
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
      parts.push(box(er.halfWidth * 2, 0.8, er.to - er.from, 0, er.h, s * (er.from + er.to) / 2));
      // Pilares dos arcos, nos cantos abertos.
      parts.push(box(2.4, spring, 2.4, -halfSpan, spring / 2, s * z));
      parts.push(box(2.4, spring, 2.4, halfSpan, spring / 2, s * z));
    }
    // Estrutura do telão.
    parts.push(box(sw.width + 2, sw.h[1] - sw.h[0] + 2, 1.2, 0, (sw.h[0] + sw.h[1]) / 2, sw.z - 0.8));
    parts.push(box(1.2, sw.h[0], 1.2, -sw.width / 3, sw.h[0] / 2, sw.z - 0.8));
    parts.push(box(1.2, sw.h[0], 1.2, sw.width / 3, sw.h[0] / 2, sw.z - 0.8));
    return merge(parts);
  }, [roof]);

  const arches = React.useMemo(() => {
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
  }, []);

  // Tirantes dos arcos e, nos tiers médio e alto, a treliça da borda das coberturas laterais.
  const lines = React.useMemo(() => {
    const v: number[] = [];
    const { z, hangerStep } = ARENA.arch;
    const er = ARENA.end.roof;
    for (const s of [-1, 1])
      for (let x = -er.halfWidth; x <= er.halfWidth; x += hangerStep) v.push(x, archHeight(x), s * z, x, er.h, s * z);
    if (truss) {
      const top = roof.h[0];
      const bottom = top - roof.depth;
      for (const s of [-1, 1]) {
        const x = s * roof.inner;
        v.push(x, top, -roof.halfLength, x, top, roof.halfLength, x, bottom, -roof.halfLength, x, bottom, roof.halfLength);
        for (let zz = -roof.halfLength, k = 0; zz < roof.halfLength; zz += 6, k++)
          v.push(x, k % 2 ? top : bottom, zz, x, k % 2 ? bottom : top, zz + 6);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    return g;
  }, [truss, roof]);

  const seatMat = useStandMaterial(shared, additive ? 0.03 : 0.12, 1);
  const solidMat = useStandMaterial(shared, additive ? 0.02 : 0.1, 0);
  const archMat = useStandMaterial(shared, additive ? 0.32 : 0.45, 0);
  const lineMat = React.useMemo(() => new THREE.LineBasicMaterial({ transparent: true, opacity: additive ? 0.28 : 0.35 }), [additive]);
  useFrame(() => {
    lineMat.color.copy(shared.uFg.value);
  });

  React.useEffect(
    () => () => {
      [seats, solid, arches, lines].forEach((g) => g.dispose());
    },
    [seats, solid, arches, lines]
  );
  React.useEffect(() => () => [seatMat, solidMat, archMat, lineMat].forEach((m) => m.dispose()), [seatMat, solidMat, archMat, lineMat]);

  return (
    <group>
      <mesh geometry={seats} material={seatMat} renderOrder={1} />
      <mesh geometry={solid} material={solidMat} renderOrder={1} />
      <mesh geometry={arches} material={archMat} renderOrder={1} />
      <lineSegments geometry={lines} material={lineMat} renderOrder={1} />
      <LedStrips shared={shared} />
      <Screen shared={shared} />
    </group>
  );
}

/** Linha de LED contornando a borda interna das coberturas (setores: 0 sul, 1 leste, 2 oeste, 3 norte). */
function LedStrips({ shared }: { shared: Shared }) {
  const geo = React.useMemo(() => {
    const { roof } = ARENA.side;
    const er = ARENA.end.roof;
    const strips: [THREE.BufferGeometry, number][] = [
      [box(0.5, 0.35, roof.halfLength * 2, roof.inner + 0.2, roof.h[0] - 0.1, 0), 1],
      [box(0.5, 0.35, roof.halfLength * 2, -roof.inner - 0.2, roof.h[0] - 0.1, 0), 2],
      [box(er.halfWidth * 2, 0.35, 0.5, 0, er.h - 0.5, er.from), 0],
      [box(er.halfWidth * 2, 0.35, 0.5, 0, er.h - 0.5, -er.from), 3]
    ];
    const parts = strips.map(([g, sector]) => {
      const n = g.toNonIndexed();
      n.setAttribute("aSector", new THREE.Float32BufferAttribute(new Float32Array(n.attributes.position.count).fill(sector), 1));
      n.deleteAttribute("uv");
      n.deleteAttribute("normal");
      g.dispose();
      return n;
    });
    return mergeGeometries(parts)!;
  }, []);
  const mat = React.useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: ledVertex,
        fragmentShader: ledFragment,
        uniforms: { uFg: shared.uFg, uBg: shared.uBg, uLightOn: shared.uLightOn, uDim: shared.uDim }
      }),
    [shared]
  );
  React.useEffect(() => () => (geo.dispose(), mat.dispose()), [geo, mat]);
  return <mesh geometry={geo} material={mat} renderOrder={1} />;
}

function Screen({ shared }: { shared: Shared }) {
  const sw = ARENA.screen;
  const uniforms = React.useMemo(
    () => ({ uTime: shared.uTime, uFg: shared.uFg, uBg: shared.uBg, uSignal: shared.uSignal, uDim: shared.uDim }),
    [shared]
  );
  return (
    <mesh position={[0, (sw.h[0] + sw.h[1]) / 2, sw.z]} renderOrder={1}>
      <planeGeometry args={[sw.width, sw.h[1] - sw.h[0]]} />
      <shaderMaterial args={[{ vertexShader: worldVertex, fragmentShader: screenFragment, uniforms }]} />
    </mesh>
  );
}

/**
 * A torcida norte inteira: torcedores, bandeiras, fumaça e núcleos dos
 * sinalizadores. offsetZ desloca o bloco (o pênalti usa o gol dela em z = 0);
 * withStand desenha a arquibancada, que no estádio já vem na estrutura.
 */
export function NorthCrowd({
  shared,
  crowd,
  flags,
  smoke,
  additive,
  offsetZ = 0,
  withStand = false
}: {
  shared: Shared;
  crowd: number;
  flags: number;
  smoke: number;
  additive: boolean;
  offsetZ?: number;
  withStand?: boolean;
}) {
  const blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending;
  return (
    <>
      <group position={[0, 0, offsetZ]}>
        {withStand && <NorthStand shared={shared} additive={additive} />}
        <Crowd shared={shared} count={crowd} additive={additive} />
        <Flags shared={shared} count={flags} />
      </group>
      {/* Fumaça e núcleos já leem a posição dos sinalizadores (deslocada) nos uniforms. */}
      <FlareSmoke shared={shared} count={smoke} blending={blending} />
      <FlareCores shared={shared} blending={blending} />
    </>
  );
}

function NorthStand({ shared, additive }: { shared: Shared; additive: boolean }) {
  const geo = React.useMemo(() => merge([endTier(-1)]), []);
  const mat = useStandMaterial(shared, additive ? 0.03 : 0.12, 1);
  React.useEffect(() => () => (geo.dispose(), mat.dispose()), [geo, mat]);
  return <mesh geometry={geo} material={mat} renderOrder={1} />;
}

function FlareSmoke({ shared, count, blending }: { shared: Shared; count: number; blending: THREE.Blending }) {
  const geo = React.useMemo(() => {
    const g = new THREE.BufferGeometry();
    const seeds = new Float32Array(count).map(() => Math.random());
    // Cada partícula pertence a um sinalizador; o principal (0) solta um pouco mais de fumaça.
    const flare = new Float32Array(count).map((_, i) => (i % 8 < 3 ? 0 : (i % 8) - 2));
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    g.setAttribute("aFlare", new THREE.BufferAttribute(flare, 1));
    return g;
  }, [count]);
  React.useEffect(() => () => geo.dispose(), [geo]);
  return (
    <points geometry={geo} renderOrder={2} frustumCulled={false}>
      <shaderMaterial
        args={[{ vertexShader: smokeVertex, fragmentShader: smokeFragment, uniforms: shared, transparent: true, depthWrite: false, blending }]}
      />
    </points>
  );
}

/** O fogo na mão de cada torcedor. */
function FlareCores({ shared, blending }: { shared: Shared; blending: THREE.Blending }) {
  const geo = React.useMemo(() => {
    const flares = shared.uFlares.value;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(flares.flatMap((f) => [f.x, f.y, f.z]), 3));
    g.setAttribute("aSize", new THREE.Float32BufferAttribute(flares.map(() => 2.6), 1));
    g.setAttribute("aColor", new THREE.Float32BufferAttribute(flares.flatMap(() => [1.3, 0.35, 0.3]), 3));
    // aLight 4: sempre aceso, mesmo com os setores apagados.
    g.setAttribute("aLight", new THREE.Float32BufferAttribute(flares.map(() => 4), 1));
    return g;
  }, [shared]);
  const uniforms = React.useMemo(
    () => ({ uScale: shared.uScale, uTime: shared.uTime, uDim: shared.uDim, uLightOn: shared.uLightOn, uFlicker: { value: 1 } }),
    [shared]
  );
  React.useEffect(() => () => geo.dispose(), [geo]);
  return (
    <points geometry={geo} renderOrder={3} frustumCulled={false}>
      <shaderMaterial args={[{ vertexShader: glowVertex, fragmentShader: glowFragment, uniforms, transparent: true, depthWrite: false, blending }]} />
    </points>
  );
}

/** Torcida na arquibancada norte: um ponto por torcedor, em fileiras com leve desalinhamento. */
function Crowd({ shared, count, additive }: { shared: Shared; count: number; additive: boolean }) {
  const geo = React.useMemo(() => {
    const rand = rng(1910);
    const { from, to, halfWidth } = ARENA.end;
    const rows = 26;
    const perRow = Math.max(1, Math.round(count / rows));
    const pos: number[] = [];
    const seed: number[] = [];
    for (let r = 0; r < rows; r++) {
      const absZ = from + 0.9 + (r / (rows - 1)) * (to - from - 1.8);
      for (let i = 0; i < perRow; i++) {
        const x = -halfWidth + 1.5 + ((i + 0.5 + (rand() - 0.5) * 0.6) / perRow) * (halfWidth * 2 - 3);
        const z = absZ + (rand() - 0.5) * 0.3;
        pos.push(x, endStandHeight(z), -z);
        seed.push(rand());
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.Float32BufferAttribute(seed, 1));
    return g;
  }, [count]);
  // No tema escuro a torcida é silhueta quase preta; no claro, cinza-escuro para não sumir no fundo.
  const uniforms = React.useMemo(() => ({ ...shared, uTone: { value: additive ? 0.05 : 0.5 } }), [shared, additive]);
  React.useEffect(() => () => geo.dispose(), [geo]);
  return (
    <points geometry={geo} renderOrder={1} frustumCulled={false}>
      <shaderMaterial key={additive ? "dark" : "light"} args={[{ vertexShader: crowdVertex, fragmentShader: crowdFragment, uniforms }]} />
    </points>
  );
}

type FlagSpec = { x: number; z: number; pole: number; w: number; h: number; pattern: number; seed: number; swing: number; speed: number };

/**
 * Bandeirões e bandeiras de mastro balançando na torcida norte. O mastro gira
 * na base (o torcedor balança de um lado para o outro) e o pano ondula no shader.
 */
function Flags({ shared, count }: { shared: Shared; count: number }) {
  const specs = React.useMemo<FlagSpec[]>(() => {
    const rand = rng(1977);
    const big: FlagSpec[] = [
      { x: -19, z: 71, pole: 9, w: 11, h: 6.5, pattern: 0, seed: 0.3, swing: 0.55, speed: 1.1 },
      { x: 4, z: 75, pole: 10, w: 12, h: 7, pattern: 1, seed: 2.1, swing: 0.5, speed: 0.95 },
      { x: 23, z: 69, pole: 8.5, w: 10, h: 6, pattern: 2, seed: 4.4, swing: 0.6, speed: 1.2 }
    ];
    const small: FlagSpec[] = Array.from({ length: count }, () => ({
      x: -32 + rand() * 64,
      z: 62 + rand() * 20,
      pole: 3 + rand() * 1.2,
      w: 2.2 + rand() * 0.8,
      h: 1.4 + rand() * 0.4,
      pattern: Math.floor(rand() * 3),
      seed: rand() * 10,
      swing: 0.35 + rand() * 0.4,
      speed: 1.4 + rand() * 1.2
    }));
    return [...big.slice(0, count >= 8 ? 3 : 2), ...small];
  }, [count]);

  const refs = React.useRef<(THREE.Group | null)[]>([]);
  const poleMat = React.useMemo(() => new THREE.MeshBasicMaterial(), []);
  useFrame(() => {
    const t = shared.uTime.value;
    specs.forEach((f, i) => {
      const g = refs.current[i];
      if (g) g.rotation.z = Math.sin(t * f.speed + f.seed) * f.swing;
    });
    poleMat.color.copy(shared.uBg.value).lerp(shared.uFg.value, 0.25);
  });
  React.useEffect(() => () => poleMat.dispose(), [poleMat]);

  return (
    <group>
      {specs.map((f, i) => (
        <group
          key={i}
          position={[f.x, endStandHeight(f.z) + 1.6, -f.z]}
          ref={(g) => {
            refs.current[i] = g;
          }}
        >
          <mesh position={[0, f.pole / 2, 0]} material={poleMat} renderOrder={1}>
            <boxGeometry args={[0.12, f.pole, 0.12]} />
          </mesh>
          <Flag shared={shared} spec={f} />
        </group>
      ))}
    </group>
  );
}

function Flag({ shared, spec }: { shared: Shared; spec: FlagSpec }) {
  const geo = React.useMemo(() => {
    const g = new THREE.PlaneGeometry(spec.w, spec.h, 20, 8);
    // Pano preso ao mastro pela borda esquerda, no topo.
    g.translate(spec.w / 2, spec.pole - spec.h / 2, 0);
    return g;
  }, [spec]);
  const uniforms = React.useMemo(
    () => ({ ...shared, uSeed: { value: spec.seed }, uSize: { value: spec.w }, uPattern: { value: spec.pattern } }),
    [shared, spec]
  );
  React.useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} renderOrder={1}>
      <shaderMaterial args={[{ vertexShader: flagVertex, fragmentShader: flagFragment, uniforms, side: THREE.DoubleSide }]} />
    </mesh>
  );
}
