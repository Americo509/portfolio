"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ARENA, ARENA_MODEL, endStandHeight } from "./config";
import { ARENA_PARTS, PART_LOOK, box, buildArenaLines, buildArenaPart, type ArenaPart } from "./geometry";
import { loadBakedArena, loadReference, type BakedArena } from "./baked";
import { sceneState } from "./scene-state";
import { bakeDebug } from "../debug";
import { useApp } from "@/lib/store";
import type { GpuTier } from "@/lib/webgl";
import {
  crowdFragment,
  crowdVertex,
  flagFragment,
  flagVertex,
  flareCoreFragment,
  flareCoreVertex,
  ledFragment,
  ledVertex,
  screenFragment,
  smokeFragment,
  smokeVertex,
  standFragment,
  worldVertex
} from "./shaders";
import { signalLight, type Shared } from "./shared";

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

function useStandMaterial(shared: Shared, base: number, rows: number, baked = false) {
  const mat = React.useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: worldVertex,
        fragmentShader: standFragment,
        uniforms: { ...shared, uBase: { value: base }, uRows: { value: rows } },
        defines: bakedDefines(baked),
        side: THREE.DoubleSide
      }),
    [shared, base, rows, baked]
  );
  React.useEffect(() => () => mat.dispose(), [mat]);
  return mat;
}

/** USE_BAKED liga a luz assada no shader da arquibancada; ?debug&bakeCheck pinta as faces fora do atlas. */
function bakedDefines(baked: boolean): Record<string, string> {
  if (!baked) return {};
  const check = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("bakeCheck");
  return check ? { USE_BAKED: "", BAKE_CHECK: "" } : { USE_BAKED: "" };
}

/** Um material por parte da estrutura, com o albedo de PART_LOOK. */
function useStandMaterials(shared: Shared, additive: boolean, baked: boolean) {
  const mats = React.useMemo(
    () =>
      Object.fromEntries(
        ARENA_PARTS.map((part) => {
          const look = PART_LOOK[part];
          return [
            part,
            new THREE.ShaderMaterial({
              vertexShader: worldVertex,
              fragmentShader: standFragment,
              uniforms: { ...shared, uBase: { value: look.base[additive ? 0 : 1] }, uRows: { value: look.rows } },
              defines: bakedDefines(baked),
              side: THREE.DoubleSide
            })
          ];
        })
      ) as Record<ArenaPart, THREE.ShaderMaterial>,
    [shared, additive, baked]
  );
  React.useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);
  return mats;
}

export function ArenaStructure({ shared, additive, truss, tier }: { shared: Shared; additive: boolean; truss: boolean; tier: GpuTier }) {
  const materials = useStandMaterials(shared, additive, false);
  const bakedMaterials = useStandMaterials(shared, additive, true);
  const baked = useBakedArena(shared, tier, bakedMaterials);
  return (
    <group>
      <ProceduralStructure shared={shared} additive={additive} truss={truss} baked={baked} materials={baked ? bakedMaterials : materials} />
      <LedStrips shared={shared} />
      <Screen shared={shared} />
    </group>
  );
}

/**
 * Luz assada (docs/bake-luz.md): carrega depois que a cena fica pronta (fora do
 * TBT), compila o shader novo e troca a geometria com uBaked em 0, o que deixa a troca
 * invisível (a malha é a mesma e a luz ainda é a analítica). Depois, o crossfade: se
 * chegou durante a abertura, 0,5 s, dentro dela; se depois, 2 s.
 */
function useBakedArena(shared: Shared, tier: GpuTier, materials: Record<ArenaPart, THREE.ShaderMaterial>) {
  const ready = useApp((s) => s.sceneStatus === "ready");
  const { gl, camera, scene } = useThree();
  const [baked, setBaked] = React.useState<BakedArena | null>(null);
  const refTexture = React.useRef<(() => THREE.Texture | null) | null>(null);
  React.useEffect(() => {
    // Uma vez só: trocar de tema recria os materiais, mas a luz assada já está na cena.
    if (!ready || !ARENA_MODEL || baked) return;
    let alive = true;
    const start = async () => {
      try {
        const b = await loadBakedArena(gl, tier);
        applyBaked(shared, b);
        shared.uBaked.value = 0;
        if (gl.extensions.has("KHR_parallel_shader_compile")) {
          const group = new THREE.Group();
          for (const part of ARENA_PARTS) if (b.meshes[part]) group.add(new THREE.Mesh(b.meshes[part]!.geometry, materials[part]));
          await gl.compileAsync(group, camera, scene).catch(() => undefined);
        }
        if (alive) {
          setBaked(b);
          bakeDebug.loaded = true;
          if (new URLSearchParams(window.location.search).has("debug")) {
            let ref: THREE.Texture | null = null;
            bakeDebug.loadRef = async (url) => {
              ref = await loadReference(url);
            };
            refTexture.current = () => ref;
          }
        }
      } catch {
        // Sem a luz assada, fica a analítica.
      }
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const id = w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 2000 }) : window.setTimeout(start, 300);
    return () => {
      alive = false;
      if (w.cancelIdleCallback) w.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, [ready, gl, camera, scene, tier, shared, materials, baked]);

  const fade = React.useRef(0);
  useFrame((_, delta) => {
    if (!baked) return;
    // ?debug: a referência float da verificação no lugar do KTX2.
    const ref = bakeDebug.useRef ? refTexture.current?.() : null;
    shared.uLightmap.value = ref ?? baked.lightmap;
    if (!fade.current) fade.current = sceneState.intro < 0.87 ? 0.5 : 2;
    shared.uBaked.value = bakeDebug.baked ?? Math.min(1, shared.uBaked.value + delta / fade.current);
  });
  return baked;
}

function applyBaked(shared: Shared, b: BakedArena) {
  shared.uLightmap.value = b.lightmap;
  shared.uLightScale.value.set(...b.meta.scale);
  shared.uReserveUv.value.set(...b.meta.reserveUv);
}

function ProceduralStructure({
  shared,
  additive,
  truss,
  baked,
  materials
}: {
  shared: Shared;
  additive: boolean;
  truss: boolean;
  /** Com a luz assada, as malhas vêm do glTF (os mesmos vértices, mais a UV do lightmap). */
  baked: BakedArena | null;
  materials: Record<ArenaPart, THREE.ShaderMaterial>;
}) {
  const parts = React.useMemo(() => ARENA_PARTS.map((part) => ({ part, geo: buildArenaPart(part) })), []);
  const lines = React.useMemo(() => buildArenaLines(truss), [truss]);

  const lineMat = React.useMemo(() => new THREE.LineBasicMaterial({ transparent: true, opacity: additive ? 0.28 : 0.35 }), [additive]);
  useFrame(() => {
    lineMat.color.copy(shared.uFg.value);
  });

  React.useEffect(() => () => parts.forEach(({ geo }) => geo.dispose()), [parts]);
  React.useEffect(() => () => lines.dispose(), [lines]);
  React.useEffect(() => () => lineMat.dispose(), [lineMat]);

  return (
    <group>
      {parts.map(({ part, geo }) => {
        const m = baked?.meshes[part];
        return m ? (
          <mesh key={part} geometry={m.geometry} material={materials[part]} matrixAutoUpdate={false} matrix={m.matrixWorld} renderOrder={1} />
        ) : (
          <mesh key={part} geometry={geo} material={materials[part]} renderOrder={1} />
        );
      })}
      <lineSegments geometry={lines} material={lineMat} renderOrder={1} />
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
  signal,
  offsetZ = 0,
  withStand = false
}: {
  shared: Shared;
  crowd: number;
  flags: number;
  smoke: number;
  additive: boolean;
  /** Cor do acento do modo (vermelho no Expediente, âmbar na Resenha). */
  signal: THREE.Color;
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
      <FlareCores shared={shared} blending={blending} signal={signal} />
    </>
  );
}

/**
 * A arquibancada norte no pênalti: a mesma parte da arena, com a mesma luz assada
 * quando ela existe (a câmera do pênalti entrou na amostragem do atlas).
 */
function NorthStand({ shared, additive }: { shared: Shared; additive: boolean }) {
  const geo = React.useMemo(() => buildArenaPart("seatEndNorth"), []);
  const look = PART_LOOK.seatEndNorth;
  const mat = useStandMaterial(shared, look.base[additive ? 0 : 1], look.rows);
  const bakedMat = useStandMaterial(shared, look.base[additive ? 0 : 1], look.rows, true);
  const gl = useThree((s) => s.gl);
  const [mesh, setMesh] = React.useState<THREE.Mesh | null>(null);
  React.useEffect(() => {
    if (!ARENA_MODEL) return;
    let alive = true;
    loadBakedArena(gl, "mid")
      .then((b) => {
        if (!alive || !b.meshes.seatEndNorth) return;
        applyBaked(shared, b);
        shared.uBaked.value = 0;
        setMesh(b.meshes.seatEndNorth);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [gl, shared]);
  useFrame((_, delta) => {
    if (mesh) shared.uBaked.value = bakeDebug.baked ?? Math.min(1, shared.uBaked.value + delta);
  });
  React.useEffect(() => () => geo.dispose(), [geo]);
  return mesh ? (
    <mesh geometry={mesh.geometry} material={bakedMat} matrixAutoUpdate={false} matrix={mesh.matrixWorld} renderOrder={1} />
  ) : (
    <mesh geometry={geo} material={mat} renderOrder={1} />
  );
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
function FlareCores({ shared, blending, signal }: { shared: Shared; blending: THREE.Blending; signal: THREE.Color }) {
  const geo = React.useMemo(() => {
    const flares = shared.uFlares.value;
    const c = signalLight(signal).multiplyScalar(1.2);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(flares.flatMap((f) => [f.x, f.y, f.z]), 3));
    g.setAttribute("aSize", new THREE.Float32BufferAttribute(flares.map(() => 3.4), 1));
    g.setAttribute("aColor", new THREE.Float32BufferAttribute(flares.flatMap(() => [c.r, c.g, c.b]), 3));
    // aLight 4: sempre aceso, mesmo com os setores apagados (o ?debug acha os núcleos por ele).
    g.setAttribute("aLight", new THREE.Float32BufferAttribute(flares.map(() => 4), 1));
    g.setAttribute("aIndex", new THREE.Float32BufferAttribute(flares.map((_, i) => i), 1));
    return g;
  }, [shared, signal]);
  const uniforms = React.useMemo(
    () => ({
      uScale: shared.uScale,
      uTime: shared.uTime,
      uDim: shared.uDim,
      uFlare: shared.uFlare,
      uHot: { value: blending === THREE.AdditiveBlending ? 1 : 0 }
    }),
    [shared, blending]
  );
  React.useEffect(() => () => geo.dispose(), [geo]);
  return (
    <points geometry={geo} renderOrder={3} frustumCulled={false}>
      <shaderMaterial
        args={[{ vertexShader: flareCoreVertex, fragmentShader: flareCoreFragment, uniforms, transparent: true, depthWrite: false, blending }]}
      />
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
      if (g) g.rotation.z = Math.sin(t * f.speed + f.seed) * f.swing * shared.uEnergy.value;
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
