"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { gsap } from "@/lib/gsap";
import { motionState } from "@/lib/store";
import type { GpuTier } from "@/lib/webgl";
import { CAMERA, CHAPTER_PRESETS, CONE_TAN, FLARE, FLOODLIGHTS, TIER_SETTINGS } from "./config";
import {
  beamFragment,
  beamVertex,
  fogFragment,
  glowFragment,
  glowVertex,
  pitchFragment,
  smokeFragment,
  smokeVertex,
  worldVertex
} from "./shaders";

// Os materiais recebem os uniforms pelo construtor (args): assim o three guarda a
// MESMA referência e o useFrame consegue animá-los. Como prop (uniforms={...}),
// os wrappers são copiados e valores primitivos (uTime, uScale) congelam.

export type StadiumPalette = { fg: THREE.Color; bg: THREE.Color; signal: THREE.Color; additive: boolean };
export type SceneMode = "hero" | "ambient";

type Shared = ReturnType<typeof createShared>;

function createShared() {
  return {
    uTime: { value: 0 },
    uLightPos: { value: FLOODLIGHTS.map((l) => l.pos.clone()) },
    uLightDir: { value: FLOODLIGHTS.map((l) => l.dir.clone()) },
    uConeTan: { value: CONE_TAN },
    uFg: { value: new THREE.Color() },
    uBg: { value: new THREE.Color() },
    uSignal: { value: new THREE.Color() },
    uFlarePos: { value: FLARE.clone() },
    uFlare: { value: 1 },
    uDim: { value: 0 },
    uFogMul: { value: 1 },
    uLightOn: { value: [1, 1, 1, 1] },
    uScale: { value: 1 },
    uCamPos: { value: new THREE.Vector3() }
  };
}

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

/** Feixes dos refletores como cones geométricos (a neblina em camadas sozinha vira "fatias"). */
function Beams({ shared, blending, strength }: { shared: Shared; blending: THREE.Blending; strength: number }) {
  const beams = React.useMemo(
    () =>
      FLOODLIGHTS.map((l) => {
        // Comprimento até o chão ao longo da direção do refletor.
        const length = l.pos.y / Math.max(0.2, -l.dir.y);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), l.dir.clone().negate());
        const position = l.pos.clone().addScaledVector(l.dir, length / 2);
        const uniforms = {
          uIndex: { value: FLOODLIGHTS.indexOf(l) },
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

/** Arquibancadas em silhueta: só existem para recortar a neblina iluminada atrás delas. */
function Stands({ color }: { color: THREE.Color }) {
  const stands: { pos: [number, number, number]; size: [number, number, number]; rot?: [number, number, number] }[] = [
    { pos: [0, 3.5, -63], size: [150, 7, 6], rot: [0.5, 0, 0] },
    { pos: [0, 9, -70], size: [170, 8, 6], rot: [0.5, 0, 0] },
    { pos: [-48, 3.5, -30], size: [6, 7, 70], rot: [0, 0, -0.5] },
    { pos: [48, 3.5, -30], size: [6, 7, 70], rot: [0, 0, 0.5] }
  ];
  return (
    <group>
      {stands.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={s.rot ?? [0, 0, 0]} renderOrder={1}>
          <boxGeometry args={s.size} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

function Towers({ color }: { color: THREE.Color }) {
  return (
    <group>
      {FLOODLIGHTS.map((l, i) => (
        <group key={i}>
          <mesh position={[l.pos.x, l.pos.y / 2, l.pos.z]}>
            <cylinderGeometry args={[0.35, 0.6, l.pos.y, 6]} />
            <meshBasicMaterial color={color} />
          </mesh>
          <mesh
            position={l.pos}
            onUpdate={(m) => m.lookAt(l.pos.clone().add(l.dir))}
          >
            <planeGeometry args={[9, 4.5]} />
            <meshBasicMaterial color={color} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Cabeças dos refletores (6 lâmpadas cada) + núcleo do sinalizador. */
function Glows({ shared, palette }: { shared: Shared; palette: StadiumPalette }) {
  const geo = React.useMemo(() => {
    const pos: number[] = [];
    const size: number[] = [];
    const color: number[] = [];
    const light: number[] = [];
    FLOODLIGHTS.forEach((l, li) => {
      const side = new THREE.Vector3().crossVectors(l.dir, new THREE.Vector3(0, 1, 0)).normalize();
      const up = new THREE.Vector3().crossVectors(side, l.dir).normalize();
      for (let c = -1; c <= 1; c++)
        for (let r = 0; r < 2; r++) {
          const p = l.pos.clone().addScaledVector(side, c * 2.6).addScaledVector(up, (r - 0.5) * 1.8).addScaledVector(l.dir, 0.5);
          pos.push(p.x, p.y, p.z);
          size.push(4.5);
          color.push(1, 1, 1);
          light.push(li);
        }
      // Clarão (glare) de cada refletor.
      const glare = l.pos.clone().addScaledVector(l.dir, 1.2);
      pos.push(glare.x, glare.y, glare.z);
      size.push(26);
      color.push(0.55, 0.55, 0.55);
      light.push(li);
    });
    pos.push(FLARE.x, FLARE.y, FLARE.z);
    size.push(9);
    light.push(4);
    color.push(palette.signal.r * 1.4, palette.signal.g * 1.4 + 0.15, palette.signal.b * 1.4 + 0.1);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.Float32BufferAttribute(size, 1));
    g.setAttribute("aColor", new THREE.Float32BufferAttribute(color, 3));
    g.setAttribute("aLight", new THREE.Float32BufferAttribute(light, 1));
    return g;
  }, [palette]);
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

function Smoke({ shared, count, blending }: { shared: Shared; count: number; blending: THREE.Blending }) {
  const geo = React.useMemo(() => {
    const g = new THREE.BufferGeometry();
    const seeds = new Float32Array(count).map(() => Math.random());
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
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

/**
 * Câmera: descida do alto do refletor até o enquadramento do capítulo atual
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

    // Apito final: os refletores apagam um a um conforme o capítulo avança.
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

  const structure = React.useMemo(
    () => palette.bg.clone().lerp(palette.fg, palette.additive ? 0.018 : 0.1),
    [palette]
  );

  return (
    <>
      <CameraRig shared={shared} mode={mode} />
      <Pitch shared={shared} />
      <Stands color={structure} />
      <Towers color={structure} />
      <Fog shared={shared} layers={settings.fogLayers} blending={blending} />
      <Beams shared={shared} blending={blending} strength={palette.additive ? 0.3 : 0.12} />
      <Smoke shared={shared} count={settings.smoke} blending={blending} />
      <Glows shared={shared} palette={palette} />
    </>
  );
}
