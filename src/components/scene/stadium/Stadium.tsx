"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { gsap } from "@/lib/gsap";
import { motionState } from "@/lib/store";
import type { GpuTier } from "@/lib/webgl";
import { ARENA, CAMERA, CHAPTER_PRESETS, CONE_TAN, LIGHTS, TIER_SETTINGS } from "./config";
import { ArenaStructure, NorthCrowd } from "./Arena";
import { createShared, type Shared } from "./shared";
import {
  beamFragment,
  beamVertex,
  fogFragment,
  glowFragment,
  glowVertex,
  pitchFragment,
  worldVertex
} from "./shaders";

export type StadiumPalette = { fg: THREE.Color; bg: THREE.Color; signal: THREE.Color; additive: boolean };
export type SceneMode = "hero" | "ambient";

function Fog({ shared, layers, blending }: { shared: Shared; layers: number; blending: THREE.Blending }) {
  const materials = React.useMemo(
    () =>
      Array.from({ length: layers }, (_, i) => ({
        ...shared,
        // Com menos camadas (tier baixo), cada uma pesa mais para o volume total ficar parecido.
        uOpacity: { value: (0.75 + (i % 3) * 0.15) * Math.min(2.2, 7 / layers) },
        uSeed: { value: i * 7.31 }
      })),
    [shared, layers]
  );
  return (
    <group>
      {materials.map((uniforms, i) => {
        const z = -88 + (i * 118) / Math.max(1, layers - 1);
        return (
          <mesh key={i} position={[0, 38, z]} renderOrder={2}>
            <planeGeometry args={[280, 115]} />
            <shaderMaterial
              args={[{ vertexShader: worldVertex, fragmentShader: fogFragment, uniforms, transparent: true, depthWrite: false, blending }]}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/** Feixes dos grupos de refletores como cones geométricos (a neblina em camadas sozinha vira "fatias"). */
function Beams({ shared, blending, strength }: { shared: Shared; blending: THREE.Blending; strength: number }) {
  const beams = React.useMemo(
    () =>
      LIGHTS.map((l) => {
        // Comprimento até o chão ao longo da direção do refletor.
        const length = l.pos.y / Math.max(0.2, -l.dir.y);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), l.dir.clone().negate());
        const position = l.pos.clone().addScaledVector(l.dir, length / 2);
        const uniforms = {
          uSector: { value: l.sector },
          uLightOn: shared.uLightOn,
          uTime: shared.uTime,
          uFg: shared.uFg,
          uCamPos: shared.uCamPos,
          uDim: shared.uDim,
          uOrigin: { value: l.pos.clone() },
          uDir: { value: l.dir.clone() },
          uLength: { value: length },
          uStrength: { value: strength }
        };
        return { length, quaternion, position, uniforms, radius: length * CONE_TAN };
      }),
    [shared, strength]
  );
  return (
    <group>
      {beams.map((b, i) => (
        <mesh key={i} position={b.position} quaternion={b.quaternion} renderOrder={2}>
          <coneGeometry args={[b.radius, b.length, 48, 1, true]} />
          <shaderMaterial
            args={[
              {
                vertexShader: beamVertex,
                fragmentShader: beamFragment,
                uniforms: b.uniforms,
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide,
                blending
              }
            ]}
          />
        </mesh>
      ))}
    </group>
  );
}

function Pitch({ shared }: { shared: Shared }) {
  return (
    <mesh rotation-x={-Math.PI / 2} renderOrder={0}>
      <planeGeometry args={[420, 420]} />
      <shaderMaterial args={[{ vertexShader: worldVertex, fragmentShader: pitchFragment, uniforms: shared }]} />
    </mesh>
  );
}

/** Lâmpadas da borda da cobertura: os grupos grandes e as pequenas ao longo da borda. */
function Glows({ shared, palette }: { shared: Shared; palette: StadiumPalette }) {
  const geo = React.useMemo(() => {
    const pos: number[] = [];
    const size: number[] = [];
    const color: number[] = [];
    const light: number[] = [];
    const lamp = (p: THREE.Vector3, s: number, c: number, sector: number) => {
      pos.push(p.x, p.y, p.z);
      size.push(s);
      color.push(c, c, c);
      light.push(sector);
    };
    LIGHTS.forEach((l) => {
      // Laterais: a fileira de lâmpadas corre ao longo de z; fundos, ao longo de x.
      const along = Math.abs(l.pos.x) > 30 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
      for (let c = -2; c <= 2; c++) lamp(l.pos.clone().addScaledVector(along, c * 2.2).addScaledVector(l.dir, 0.4), 3.6, 1, l.sector);
      lamp(l.pos.clone().addScaledVector(l.dir, 1.2), 24, 0.5, l.sector);
    });
    // Lâmpadas menores espalhadas pela borda, entre os grupos.
    const { roof } = ARENA.side;
    const er = ARENA.end.roof;
    for (let z = -roof.halfLength + 3; z < roof.halfLength; z += 6) {
      lamp(new THREE.Vector3(roof.inner, roof.h[0] - 0.6, z), 2, 0.8, 1);
      lamp(new THREE.Vector3(-roof.inner, roof.h[0] - 0.6, z), 2, 0.8, 2);
    }
    for (let x = -er.halfWidth + 4; x < er.halfWidth; x += 6) {
      lamp(new THREE.Vector3(x, er.h - 0.9, er.from), 2, 0.8, 0);
      lamp(new THREE.Vector3(x, er.h - 0.9, -er.from), 2, 0.8, 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.Float32BufferAttribute(size, 1));
    g.setAttribute("aColor", new THREE.Float32BufferAttribute(color, 3));
    g.setAttribute("aLight", new THREE.Float32BufferAttribute(light, 1));
    return g;
  }, []);
  const uniforms = React.useMemo(
    () => ({ uScale: shared.uScale, uTime: shared.uTime, uDim: shared.uDim, uLightOn: shared.uLightOn, uFlicker: { value: 1 } }),
    [shared]
  );
  React.useEffect(() => () => geo.dispose(), [geo]);
  return (
    <points geometry={geo} renderOrder={3} frustumCulled={false}>
      <shaderMaterial
        args={[
          {
            vertexShader: glowVertex,
            fragmentShader: glowFragment,
            uniforms,
            transparent: true,
            depthWrite: false,
            blending: palette.additive ? THREE.AdditiveBlending : THREE.NormalBlending
          }
        ]}
      />
    </points>
  );
}

/**
 * Câmera: descida de cima da cobertura sul até o enquadramento do capítulo atual
 * (uma vez); depois desliza entre os presets de cada capítulo da home, com
 * parallax do mouse e "warp" de FOV pela velocidade do scroll.
 */
function CameraRig({ shared, mode }: { shared: Shared; mode: SceneMode }) {
  const intro = React.useRef({ t: 0 });
  const s = React.useRef({ x: 0, y: 0, dim: 0, fog: 1, fov: CAMERA.end.fov, lights: [1, 1, 1, 1] });
  const target = React.useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3() }), []);
  const cur = React.useMemo(
    () => ({ pos: CAMERA.end.pos.clone(), look: CAMERA.end.look.clone() }),
    []
  );
  const pos = React.useMemo(() => new THREE.Vector3(), []);
  const look = React.useMemo(() => new THREE.Vector3(), []);

  React.useEffect(() => {
    const tween = gsap.to(intro.current, { t: 1, duration: 3.2, ease: "power3.inOut", delay: 0.15 });
    return () => {
      tween.kill();
    };
  }, []);

  useFrame((state, delta) => {
    const cam = state.camera as THREE.PerspectiveCamera;
    const t = intro.current.t;
    const st = s.current;
    const chapter = mode === "hero" ? motionState.chapter : "ambient";
    const cp = motionState.chapterProgress;
    const preset = CHAPTER_PRESETS[chapter];

    target.pos.set(...preset.pos);
    target.look.set(...preset.look);
    if (chapter === "hero") target.pos.z -= cp * 14;
    if (chapter === "matches") target.pos.x += cp * 46;
    if (chapter === "final") target.pos.z -= cp * 6;

    // Amortecimento independente de framerate.
    const k = 1 - Math.exp(-delta * 2.2);
    cur.pos.lerp(target.pos, k);
    cur.look.lerp(target.look, k);
    st.x += (motionState.pointer.x - st.x) * 0.04;
    st.y += (motionState.pointer.y - st.y) * 0.04;
    st.fov += (preset.fov - st.fov) * k;
    st.dim += (preset.dim - st.dim) * k;
    st.fog += (preset.fog - st.fog) * k;

    // Apito final: os setores da cobertura apagam um a um conforme o capítulo avança (o norte por último).
    for (let i = 0; i < 4; i++) {
      const on = chapter === "final" ? 1 - THREE.MathUtils.smoothstep(cp, 0.12 + i * 0.14, 0.24 + i * 0.14) : 1;
      st.lights[i] += (on - st.lights[i]) * k * 2;
      shared.uLightOn.value[i] = st.lights[i];
    }

    pos.lerpVectors(CAMERA.start.pos, cur.pos, t);
    look.lerpVectors(CAMERA.start.look, cur.look, t);
    pos.x += st.x * 2.4 * t;
    pos.y += st.y * 1.0 * t;

    cam.position.copy(pos);
    cam.lookAt(look);
    const fov = THREE.MathUtils.lerp(CAMERA.start.fov, st.fov, t) + Math.abs(motionState.velocityNorm) * 12;
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }

    shared.uDim.value = st.dim;
    shared.uFogMul.value = st.fog;
    shared.uCamPos.value.copy(pos);
    shared.uScale.value = (state.size.height * state.gl.getPixelRatio()) / (2 * Math.tan((cam.fov * Math.PI) / 360));
  });

  return null;
}

export function Stadium({ tier, palette, mode }: { tier: GpuTier; palette: StadiumPalette; mode: SceneMode }) {
  const shared = React.useMemo(createShared, []);
  const settings = TIER_SETTINGS[tier];
  const { scene, gl } = useThree();
  React.useEffect(() => {
    if (new URLSearchParams(window.location.search).has("debug")) Object.assign(window, { __scene: scene, __gl: gl });
  }, [scene, gl]);
  const blending = palette.additive ? THREE.AdditiveBlending : THREE.NormalBlending;

  React.useEffect(() => {
    shared.uFg.value.copy(palette.fg);
    shared.uBg.value.copy(palette.bg);
    shared.uSignal.value.copy(palette.signal);
    scene.background = palette.bg.clone();
  }, [palette, shared, scene]);

  useFrame((_, delta) => {
    shared.uTime.value += delta;
    const t = shared.uTime.value;
    shared.uFlare.value = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 3.7);
  });

  return (
    <>
      <CameraRig shared={shared} mode={mode} />
      <Pitch shared={shared} />
      <ArenaStructure shared={shared} additive={palette.additive} truss={settings.truss} />
      <NorthCrowd shared={shared} crowd={settings.crowd} flags={settings.flags} smoke={settings.smoke} additive={palette.additive} />
      <Fog shared={shared} layers={settings.fogLayers} blending={blending} />
      <Beams shared={shared} blending={blending} strength={palette.additive ? 0.3 : 0.11} />
      <Glows shared={shared} palette={palette} />
    </>
  );
}
