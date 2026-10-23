"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { motionState, useApp } from "@/lib/store";
import type { GpuTier } from "@/lib/webgl";
import { ARENA, CONE_TAN, LIGHTS, TIER_SETTINGS } from "./config";
import { AMBIENT, AMBIENT_DIM_NO_BLUR, CHAPTER_ORDER, INTRO, TRACKS, sampleTrack, type Shot } from "./camera-track";
import { lens } from "./lens-state";
import { bakeDebug, cameraLive, useCameraDebug } from "../debug";
import { ArenaStructure, NorthCrowd } from "./Arena";
import { createShared, signalLight, type Shared } from "./shared";
import { sceneState } from "./scene-state";
import {
  beamFragment,
  beamVertex,
  fogFragment,
  glowFragment,
  glowVertex,
  pitchFragment,
  streakFragment,
  streakVertex,
  worldVertex
} from "./shaders";

export type StadiumPalette = {
  fg: THREE.Color;
  bg: THREE.Color;
  signal: THREE.Color;
  /** Luz dos refletores no ar (feixes e névoa). */
  beam: THREE.Color;
  additive: boolean;
};
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
          uBeam: shared.uBeam,
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

/** Riscos anamórficos nos 12 grupos de refletores (só nos temas noturnos, com blending aditivo). */
function Streaks({ shared }: { shared: Shared }) {
  const geo = React.useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(LIGHTS.flatMap((l) => [l.pos.x, l.pos.y - 0.4, l.pos.z]), 3));
    g.setAttribute("aSize", new THREE.Float32BufferAttribute(LIGHTS.map(() => 70), 1));
    g.setAttribute("aLight", new THREE.Float32BufferAttribute(LIGHTS.map((l) => l.sector), 1));
    return g;
  }, []);
  const uniforms = React.useMemo(
    () => ({ uScale: shared.uScale, uDim: shared.uDim, uLightOn: shared.uLightOn, uFg: shared.uFg }),
    [shared]
  );
  React.useEffect(() => () => geo.dispose(), [geo]);
  return (
    <points geometry={geo} renderOrder={3} frustumCulled={false}>
      <shaderMaterial
        args={[
          { vertexShader: streakVertex, fragmentShader: streakFragment, uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }
        ]}
      />
    </points>
  );
}

/**
 * Câmera: plano-sequência da home na linguagem de transmissão (camera-track.ts).
 * Abre com a saída do túnel (dolly zoom de cima da cobertura sul, com tremor de
 * câmera na mão e letterbox que se recolhe) e desce até o primeiro keyframe; depois
 * percorre a spline pelo scroll, com parallax do mouse e warp de FOV pela velocidade.
 * Também escreve o estado da lente (foco, letterbox e velocidade para o motion blur).
 */
function CameraRig({ shared, mode, blur }: { shared: Shared; mode: SceneMode; blur: boolean }) {
  // A saída do túnel é da home: quem chega direto numa página interna já começa no
  // quadro de fundo, sem o dolly zoom atrás do texto.
  const intro = React.useRef({ t: mode === "hero" ? 0 : 1, wait: 0.25 });
  const s = React.useRef({ x: 0, y: 0, lights: [1, 1, 1, 1], ready: false, frames: 0 });
  // A abertura só começa quando a cena está pronta e aparecendo; antes disso ela
  // ainda compila e faz o fade, e o dolly zoom passaria escondido.
  const sceneReady = useApp((st) => st.sceneStatus === "ready");
  const sample = React.useMemo(
    () => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), lens: { ...AMBIENT.desktop } as Omit<Shot, "pos" | "look"> }),
    []
  );
  const cur = React.useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), lens: { ...AMBIENT.desktop } }), []);
  const pos = React.useMemo(() => new THREE.Vector3(), []);
  const look = React.useMemo(() => new THREE.Vector3(), []);
  const prevForward = React.useMemo(() => new THREE.Vector3(0, 0, -1), []);
  const tmp = React.useMemo(() => ({ f: new THREE.Vector3(), r: new THREE.Vector3(), u: new THREE.Vector3() }), []);

  const camera = useThree((st) => st.camera);
  React.useEffect(() => {
    if (new URLSearchParams(window.location.search).has("debug")) Object.assign(window, { __camera: camera, __intro: intro.current });
  }, [camera]);


  useFrame((state, delta) => {
    const cam = state.camera as THREE.PerspectiveCamera;
    const st = s.current;
    const portrait = state.size.width / state.size.height < 0.8;

    // A abertura avança pelo tempo do quadro com teto de 1/30 s: depois de um
    // travamento (compilação de shader num aparelho médio) ela continua de onde
    // parou, em vez de pular para o fim.
    if (sceneReady && intro.current.t < 1) {
      const step = Math.min(delta, 1 / 30);
      if (intro.current.wait > 0) intro.current.wait -= step;
      else intro.current.t = Math.min(1, intro.current.t + step / (INTRO.dolly + INTRO.descent));
    }

    // Alvo da trilha: progresso global na home (ou o do slider do ?debug), quadro fixo
    // nas páginas internas.
    const dbg = useCameraDebug.getState();
    cameraLive.track = portrait ? "mobile" : "desktop";
    if (mode === "hero") {
      const g = dbg.scrub ?? CHAPTER_ORDER.indexOf(motionState.chapter) + motionState.chapterProgress;
      cameraLive.g = g;
      sampleTrack(portrait ? TRACKS.mobile : TRACKS.desktop, g, sample);
    } else {
      const a = portrait ? AMBIENT.mobile : AMBIENT.desktop;
      sample.pos.set(...a.pos);
      sample.look.set(...a.look);
      Object.assign(sample.lens, a);
      if (!blur) sample.lens.dim = AMBIENT_DIM_NO_BLUR;
    }
    // ?debug: quadro fixo (pré-visualização de quadro-chave, closes para conferência).
    if (dbg.shot) {
      sample.pos.set(...dbg.shot.pos);
      sample.look.set(...dbg.shot.look);
      sample.lens.fov = dbg.shot.fov;
    }

    // Amortecimento independente de framerate.
    const k = 1 - Math.exp(-delta * 2.6);
    if (!st.ready) {
      cur.pos.copy(sample.pos);
      cur.look.copy(sample.look);
      Object.assign(cur.lens, sample.lens);
      st.ready = true;
    }
    cur.pos.lerp(sample.pos, k);
    cur.look.lerp(sample.look, k);
    const L = cur.lens;
    for (const key of ["fov", "dim", "fog", "focus", "range", "bokeh", "letterbox"] as const) L[key] += (sample.lens[key] - L[key]) * k;
    st.x += (motionState.pointer.x - st.x) * 0.04;
    st.y += (motionState.pointer.y - st.y) * 0.04;

    // Apito final: os setores da cobertura apagam um a um conforme o capítulo avança (o
    // norte por último). Nas páginas internas, refletores a meia-luz.
    const final = mode === "hero" && motionState.chapter === "final";
    for (let i = 0; i < 4; i++) {
      const on = final ? 1 - THREE.MathUtils.smoothstep(motionState.chapterProgress, 0.12 + i * 0.14, 0.24 + i * 0.14) : mode === "hero" ? 1 : 0.4;
      st.lights[i] += (on - st.lights[i]) * k * 2;
      // ?debug (verificação do bake): setores forçados por window.__bake.
      shared.uLightOn.value[i] = bakeDebug.sectors ? bakeDebug.sectors[i] : st.lights[i];
    }

    // Saída do túnel: dolly zoom (a torcida norte fica do mesmo tamanho enquanto a câmera
    // avança e a lente abre) e depois a descida até o enquadramento da trilha.
    const T = intro.current.t * (INTRO.dolly + INTRO.descent);
    const from = portrait ? INTRO.fromMobile : INTRO.from;
    const mid = portrait ? INTRO.midMobile : INTRO.mid;
    const halfSize = from.pos.distanceTo(INTRO.subject) * Math.tan(THREE.MathUtils.degToRad(from.fov / 2));
    const vertigo = (p: THREE.Vector3) => THREE.MathUtils.radToDeg(2 * Math.atan(halfSize / p.distanceTo(INTRO.subject)));
    let fov: number;
    if (T < INTRO.dolly) {
      const u = THREE.MathUtils.smootherstep(T / INTRO.dolly, 0, 1);
      pos.lerpVectors(from.pos, mid.pos, u);
      look.copy(INTRO.subject);
      fov = vertigo(pos);
    } else {
      const u = THREE.MathUtils.smootherstep((T - INTRO.dolly) / INTRO.descent, 0, 1);
      pos.lerpVectors(mid.pos, cur.pos, u);
      look.lerpVectors(INTRO.subject, cur.look, u);
      fov = THREE.MathUtils.lerp(vertigo(mid.pos), L.fov, u);
    }
    const settled = intro.current.t;
    sceneState.intro = settled;
    pos.x += st.x * 2.4 * settled;
    pos.y += st.y * 1.0 * settled;

    // Câmera na mão no começo da saída do túnel: micro-tremor que se acalma.
    const shake = Math.max(0, 1 - T / 1.2);
    if (shake > 0) {
      const tt = state.clock.elapsedTime;
      pos.x += (Math.sin(tt * 13.1) * 0.6 + Math.sin(tt * 7.3) * 0.4) * 0.35 * shake;
      pos.y += (Math.sin(tt * 11.7) * 0.5 + Math.sin(tt * 5.9) * 0.5) * 0.3 * shake;
      look.x += Math.sin(tt * 9.4) * 0.5 * shake;
    }

    // Nas tomadas quase a pino (spidercam), o "para cima" padrão fica quase paralelo ao
    // olhar e o quadro gira; ali o norte vira o topo da tela.
    if (dbg.free) {
      // Câmera livre do ?debug: a órbita manda; aqui só se lê a posição para o diretor.
      pos.copy(cam.position);
    } else {
      const steep = THREE.MathUtils.smoothstep(-tmp.f.subVectors(look, pos).normalize().y, 0.75, 0.95);
      cam.up.set(0, 1 - steep, -steep).normalize();
      cam.position.copy(pos);
      cam.lookAt(look);
      fov += Math.abs(motionState.velocityNorm) * 12;
      if (Math.abs(cam.fov - fov) > 0.01) {
        cam.fov = fov;
        cam.updateProjectionMatrix();
      }
      cameraLive.look = look.toArray() as [number, number, number];
    }
    cameraLive.pos = cam.position.toArray() as [number, number, number];
    cameraLive.fov = cam.fov;

    // Lente: foco, letterbox (no túnel e no apito final) e a velocidade angular da
    // câmera projetada na tela, que vira o motion blur só nos movimentos rápidos.
    lens.focus = THREE.MathUtils.lerp(pos.distanceTo(INTRO.subject), L.focus, settled);
    lens.range = THREE.MathUtils.lerp(120, L.range, settled);
    lens.bokeh = L.bokeh * settled;
    lens.letterbox = Math.max(L.letterbox, 1 - THREE.MathUtils.smoothstep(intro.current.t, 0.3, 0.8));
    cam.getWorldDirection(tmp.f);
    tmp.r.crossVectors(tmp.f, cam.up).normalize();
    tmp.u.crossVectors(tmp.r, tmp.f).normalize();
    const d = tmp.f.clone().sub(prevForward);
    prevForward.copy(tmp.f);
    const tanV = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const vx = d.dot(tmp.r) / (2 * tanV * cam.aspect);
    const vy = d.dot(tmp.u) / (2 * tanV);
    const speed = Math.hypot(vx, vy);
    // Abaixo do limiar, nada de blur: só os movimentos rápidos borram. Os primeiros
    // quadros não contam (a câmera "pula" para a posição inicial) e o rastro tem teto.
    const gate = ++st.frames < 4 ? 0 : THREE.MathUtils.smoothstep(speed, 0.002, 0.01);
    const cap = Math.min(1, 0.012 / Math.max(1e-6, speed * 1.5));
    lens.blur.x = -vx * gate * 1.5 * cap;
    lens.blur.y = -vy * gate * 1.5 * cap;

    shared.uDim.value = L.dim;
    shared.uFogMul.value = L.fog;
    shared.uCamPos.value.copy(pos);
    shared.uScale.value = (state.size.height * state.gl.getPixelRatio()) / (2 * Math.tan((cam.fov * Math.PI) / 360));
  });

  return null;
}

// Diretor de câmera e coleta de desempenho: só carregam no ?debug.
const DebugScene = React.lazy(() => import("./DebugScene").then((m) => ({ default: m.DebugScene })));

/**
 * Etapas de montagem (o Scene avança uma por tarefa, ver StageRunner): 0 gramado,
 * estrutura e câmera; 1 neblina e feixes; 2 torcida; 3 lâmpadas e flares; 4 (no
 * Scene) o pós-processamento.
 */
export function Stadium({
  tier,
  palette,
  mode,
  stage,
  blur
}: {
  tier: GpuTier;
  palette: StadiumPalette;
  mode: SceneMode;
  stage: number;
  /** O pós tem profundidade de campo (tier alto, tema escuro). */
  blur: boolean;
}) {
  const [debug] = React.useState(() => new URLSearchParams(window.location.search).has("debug"));
  const shared = React.useMemo(createShared, []);
  const settings = TIER_SETTINGS[tier];
  const { scene, gl } = useThree();
  React.useEffect(() => {
    if (new URLSearchParams(window.location.search).has("debug")) Object.assign(window, { __scene: scene, __gl: gl, __bake: bakeDebug, __cameraDebug: useCameraDebug });
  }, [scene, gl]);
  const blending = palette.additive ? THREE.AdditiveBlending : THREE.NormalBlending;

  React.useEffect(() => {
    shared.uFg.value.copy(palette.fg);
    shared.uBg.value.copy(palette.bg);
    shared.uSignal.value.copy(signalLight(palette.signal));
    shared.uBeam.value.copy(palette.beam);
    scene.background = palette.bg.clone();
  }, [palette, shared, scene]);

  // Fora da home a cena fica de fundo: os sinalizadores apagam (nada de brilho
  // vermelho atrás do texto) e a torcida pula e balança menos. Transição suave ao
  // trocar de página.
  const hype = React.useRef(mode === "hero" ? 1 : 0);
  useFrame((_, delta) => {
    shared.uTime.value = bakeDebug.freeze ?? shared.uTime.value + delta;
    const t = shared.uTime.value;
    hype.current += ((mode === "hero" ? 1 : 0) - hype.current) * (1 - Math.exp(-delta * 1.5));
    shared.uFlare.value = (0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 3.7)) * hype.current;
    shared.uEnergy.value = 0.25 + 0.75 * hype.current;
  });

  return (
    <>
      <CameraRig shared={shared} mode={mode} blur={blur} />
      <Pitch shared={shared} />
      <ArenaStructure shared={shared} additive={palette.additive} truss={settings.truss} tier={tier} />
      {stage >= 1 ? (
        <>
          <Fog shared={shared} layers={settings.fogLayers} blending={blending} />
          <Beams shared={shared} blending={blending} strength={palette.additive ? 0.24 : 0.11} />
        </>
      ) : null}
      {stage >= 2 ? (
        <NorthCrowd
          shared={shared}
          crowd={settings.crowd}
          flags={settings.flags}
          smoke={settings.smoke}
          additive={palette.additive}
          signal={palette.signal}
        />
      ) : null}
      {stage >= 3 ? (
        <>
          <Glows shared={shared} palette={palette} />
          {palette.additive && <Streaks shared={shared} />}
        </>
      ) : null}
      {debug ? (
        <React.Suspense fallback={null}>
          <DebugScene />
        </React.Suspense>
      ) : null}
    </>
  );
}
