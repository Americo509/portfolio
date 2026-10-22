"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import { gsap } from "@/lib/gsap";
import { GOAL, zoneCenter, type Outcome } from "@/lib/penalty/engine";
import { NorthCrowd } from "@/components/scene/stadium/Arena";
import { PITCH, endStandHeight } from "@/components/scene/stadium/config";
import { createShared } from "@/components/scene/stadium/shared";
import { NORTH_OFFSET, PENALTY_CAMERA, penaltyFov } from "./camera";

export type KickPlan = {
  target: { x: number; y: number };
  outcome: Outcome;
  keeperZone: number;
  power: number;
  curve: number;
};

export type PenaltySceneHandle = {
  kick: (plan: KickPlan) => Promise<void>;
  reset: () => void;
};

type Props = {
  /** Controle imperativo (via prop, porque next/dynamic não repassa ref). */
  control: React.MutableRefObject<PenaltySceneHandle | null>;
  aim: React.MutableRefObject<{ x: number; y: number; visible: boolean }>;
  onAim: (x: number, y: number) => void;
  muralha: boolean;
  reduce: boolean;
  dark: boolean;
};

const SPOT = new THREE.Vector3(0, 0.11, 11);
const FG = "#F5F5F0";
const SIGNAL = "#E61919";

// ---------- Rede: linhas com deformação no ponto de impacto ----------
const netVertex = /* glsl */ `
  uniform vec2 uImpact;
  uniform float uBulge;
  void main() {
    vec3 p = position;
    float d = distance(p.xy, uImpact);
    p.z -= exp(-d * d * 1.6) * uBulge * smoothstep(-2.2, -0.2, p.z);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const netFragment = /* glsl */ `
  uniform vec3 uColor;
  void main() { gl_FragColor = vec4(uColor, 0.32); }
`;

function buildNet() {
  const pts: number[] = [];
  const w = GOAL.halfWidth;
  const h = GOAL.height;
  const depth = -2;
  const step = 0.24;
  // Fundo (z = depth) e teto, com linhas horizontais e verticais.
  for (let x = -w; x <= w + 0.001; x += step) pts.push(x, 0, depth, x, h, depth, x, h, depth, x, h, 0);
  for (let y = 0; y <= h + 0.001; y += step) pts.push(-w, y, depth, w, y, depth);
  for (let z = depth; z <= 0.001; z += step) pts.push(-w, h, z, w, h, z);
  // Laterais.
  for (const sx of [-w, w]) {
    for (let z = depth; z <= 0.001; z += step) pts.push(sx, 0, z, sx, h, z);
    for (let y = 0; y <= h + 0.001; y += step) pts.push(sx, y, depth, sx, y, 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

function Net({ uniforms }: { uniforms: { uImpact: { value: THREE.Vector2 }; uBulge: { value: number }; uColor: { value: THREE.Color } } }) {
  const geo = React.useMemo(buildNet, []);
  React.useEffect(() => () => geo.dispose(), [geo]);
  return (
    <lineSegments geometry={geo}>
      <shaderMaterial args={[{ vertexShader: netVertex, fragmentShader: netFragment, uniforms, transparent: true, depthWrite: false }]} />
    </lineSegments>
  );
}

function Goal() {
  const mat = <meshStandardMaterial color={FG} emissive={FG} emissiveIntensity={0.35} roughness={0.4} />;
  return (
    <group>
      {[-GOAL.halfWidth, GOAL.halfWidth].map((x) => (
        <mesh key={x} position={[x, GOAL.height / 2, 0]}>
          <cylinderGeometry args={[0.06, 0.06, GOAL.height, 12]} />
          {mat}
        </mesh>
      ))}
      <mesh position={[0, GOAL.height, 0]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.06, 0.06, GOAL.halfWidth * 2 + 0.12, 12]} />
        {mat}
      </mesh>
    </group>
  );
}

/** Gramado com as linhas a giz da grande área. */
function Pitch({ dark }: { dark: boolean }) {
  const lines = React.useMemo(() => {
    const p: number[] = [];
    const seg = (x1: number, z1: number, x2: number, z2: number) => p.push(x1, 0.005, z1, x2, 0.005, z2);
    seg(-30, 0, 30, 0);
    seg(-9.16, 0, -9.16, 5.5);
    seg(9.16, 0, 9.16, 5.5);
    seg(-9.16, 5.5, 9.16, 5.5);
    seg(-20.16, 0, -20.16, 16.5);
    seg(20.16, 0, 20.16, 16.5);
    seg(-20.16, 16.5, 20.16, 16.5);
    // Meia-lua.
    const r = 9.15;
    let prev: [number, number] | null = null;
    for (let a = -0.93; a <= 0.93 + 0.001; a += 0.06) {
      const x = Math.sin(a) * r;
      const z = 11 + Math.cos(a) * r;
      if (prev) seg(prev[0], prev[1], x, z);
      prev = [x, z];
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    return g;
  }, []);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color={dark ? "#1a1a1a" : "#d9d9d2"} roughness={1} />
      </mesh>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color={dark ? FG : "#080808"} transparent opacity={0.5} />
      </lineSegments>
      <mesh position={[SPOT.x, 0.006, SPOT.z]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.13, 24]} />
        <meshBasicMaterial color={dark ? FG : "#080808"} />
      </mesh>
    </group>
  );
}

/** Número da camisa desenhado num canvas (sem fonte externa). */
function useNumberTexture(text: string) {
  return React.useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = FG;
    ctx.font = "bold 84px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 64, 70);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text]);
}

type Rig = { x: number; y: number; rot: number; reachL: number; reachR: number; spread: number; scale: number };

/**
 * Goleiro estilizado: alto e longilíneo, camisa 12 preta, luvas grandes e
 * arquinho no cabelo. Sem rosto, sem uniforme de clube, sem marca.
 */
function Keeper({ rig, muralha }: { rig: React.MutableRefObject<Rig>; muralha: boolean }) {
  const root = React.useRef<THREE.Group>(null);
  const armL = React.useRef<THREE.Group>(null);
  const armR = React.useRef<THREE.Group>(null);
  const number = useNumberTexture("12");
  const body = <meshStandardMaterial color="#141414" roughness={0.8} />;
  const glove = <meshStandardMaterial color={FG} roughness={0.6} />;
  const outline = <Outlines thickness={0.035} color={SIGNAL} visible={muralha} />;

  useFrame(({ clock }) => {
    const r = rig.current;
    const g = root.current;
    if (!g) return;
    const idle = Math.sin(clock.elapsedTime * 1.7) * 0.12 * (1 - Math.min(1, Math.abs(r.rot) * 2));
    g.position.set(r.x + idle, r.y, 0.4);
    g.rotation.z = r.rot;
    g.scale.setScalar(r.scale);
    // Braços: caídos para fora em repouso; abertos na horizontal no Modo Muralha; esticados no mergulho.
    if (armL.current) armL.current.rotation.z = -0.35 - r.spread * 1.2 - r.reachL * 2.6;
    if (armR.current) armR.current.rotation.z = 0.35 + r.spread * 1.2 + r.reachR * 2.6;
  });

  return (
    <group ref={root}>
      {/* Pernas */}
      {[-0.14, 0.14].map((x) => (
        <mesh key={x} position={[x, 0.48, 0]}>
          <capsuleGeometry args={[0.09, 0.78, 4, 8]} />
          {body}
          {outline}
        </mesh>
      ))}
      {/* Tronco com a camisa 12 */}
      <mesh position={[0, 1.28, 0]}>
        <capsuleGeometry args={[0.22, 0.5, 4, 12]} />
        {body}
        {outline}
      </mesh>
      <mesh position={[0, 1.34, 0.225]}>
        <planeGeometry args={[0.26, 0.26]} />
        <meshBasicMaterial map={number} transparent />
      </mesh>
      {/* Cabeça + arquinho */}
      <mesh position={[0, 1.82, 0]}>
        <sphereGeometry args={[0.13, 16, 12]} />
        {body}
        {outline}
      </mesh>
      <mesh position={[0, 1.83, 0.015]} rotation-x={-0.25}>
        <torusGeometry args={[0.136, 0.014, 6, 24, Math.PI]} />
        <meshStandardMaterial color={FG} emissive={FG} emissiveIntensity={0.4} />
      </mesh>
      {/* Braços (pivô no ombro) com luvas grandes */}
      {[
        { ref: armL, x: -0.3 },
        { ref: armR, x: 0.3 }
      ].map(({ ref, x }) => (
        <group key={x} ref={ref} position={[x, 1.55, 0]}>
          <mesh position={[0, -0.36, 0]}>
            <capsuleGeometry args={[0.065, 0.62, 4, 8]} />
            {body}
            {outline}
          </mesh>
          <mesh position={[0, -0.76, 0]}>
            <boxGeometry args={[0.2, 0.24, 0.1]} />
            {glove}
          </mesh>
        </group>
      ))}
    </group>
  );
}

function bezier(out: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, t: number) {
  const it = 1 - t;
  out.set(0, 0, 0)
    .addScaledVector(a, it * it * it)
    .addScaledVector(b, 3 * it * it * t)
    .addScaledVector(c, 3 * it * t * t)
    .addScaledVector(d, t * t * t);
  return out;
}

/** Fundo: neblina iluminada atrás do gol e o clarão de dois refletores no alto. */
function Backdrop({ dark }: { dark: boolean }) {
  // Clarão do refletor: textura radial gerada em canvas.
  const glare = React.useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.12, "rgba(255,255,255,0.9)");
    g.addColorStop(0.35, "rgba(255,255,255,0.18)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  const uniforms = React.useMemo(
    () => ({ uFg: { value: new THREE.Color(dark ? FG : "#080808") }, uOpacity: { value: dark ? 0.22 : 0.08 } }),
    [dark]
  );
  return (
    <group>
      <mesh position={[0, 6, -30]}>
        <planeGeometry args={[110, 40]} />
        <shaderMaterial
          args={[
            {
              uniforms,
              transparent: true,
              depthWrite: false,
              fog: false,
              vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
              fragmentShader:
                "uniform vec3 uFg; uniform float uOpacity; varying vec2 vUv; void main(){ vec2 c = vUv - vec2(0.5, 0.38); float g = exp(-dot(c*vec2(1.0,2.2), c*vec2(1.0,2.2)) * 9.0); gl_FragColor = vec4(uFg, g * uOpacity); }"
            }
          ]}
        />
      </mesh>
      {[-1, 1].map((sx) => (
        <sprite key={sx} position={[sx * 16, 9.5, -28]} scale={[7, 7, 1]}>
          <spriteMaterial map={glare} color={dark ? "#ffffff" : "#080808"} transparent opacity={dark ? 0.9 : 0.25} depthWrite={false} fog={false} />
        </sprite>
      ))}
    </group>
  );
}

/**
 * A torcida norte da arena atrás do gol, com bandeirões e sinalizadores. O gol
 * do pênalti fica em z = 0, que é a linha de fundo norte da arena deslocada.
 */

function NorthEnd({ dark, reduce }: { dark: boolean; reduce: boolean }) {
  const shared = React.useMemo(() => createShared(NORTH_OFFSET), []);
  const signal = React.useMemo(() => new THREE.Color(SIGNAL), []);
  React.useEffect(() => {
    shared.uFg.value.set(dark ? FG : "#080808");
    shared.uBg.value.set(dark ? "#080808" : "#F5F5F0");
    shared.uSignal.value.set(SIGNAL);
  }, [dark, shared]);
  useFrame((state, delta) => {
    // Com movimento reduzido, a torcida fica parada (sem pulo, bandeira nem fumaça andando).
    if (!reduce) shared.uTime.value += delta;
    const t = shared.uTime.value;
    shared.uFlare.value = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 3.7);
    const cam = state.camera as THREE.PerspectiveCamera;
    shared.uScale.value = (state.size.height * state.gl.getPixelRatio()) / (2 * Math.tan((cam.fov * Math.PI) / 360));
    shared.uCamPos.value.copy(cam.position);
  });
  return <NorthCrowd shared={shared} crowd={1500} flags={10} smoke={260} additive={dark} signal={signal} offsetZ={NORTH_OFFSET} withStand />;
}

/** Flashes de fotógrafos na torcida atrás do gol (só no gol). */
function Flashes({ burst }: { burst: React.MutableRefObject<number> }) {
  const geo = React.useMemo(() => {
    const p: number[] = [];
    for (let i = 0; i < 40; i++) {
      const z = -10 - Math.random() * 12;
      p.push((Math.random() - 0.5) * 60, endStandHeight(NORTH_OFFSET - z) + 1 + Math.random() * 1.5, z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    return g;
  }, []);
  const mat = React.useRef<THREE.PointsMaterial>(null);
  useFrame(() => {
    if (!mat.current) return;
    mat.current.opacity = burst.current > 0 ? (Math.random() > 0.5 ? burst.current : 0) : 0;
  });
  return (
    <points geometry={geo}>
      <pointsMaterial ref={mat} size={0.35} color="#ffffff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function SceneContent({ control, aim, onAim, muralha, reduce, dark }: Props) {
  const { camera, scene } = useThree();
  const ball = React.useRef<THREE.Mesh>(null);
  const reticle = React.useRef<THREE.Mesh>(null);
  const rig = React.useRef<Rig>({ x: 0, y: 0, rot: 0, reachL: 0, reachR: 0, spread: 0, scale: 1.08 });
  const flight = React.useRef({ t: 0, active: false, phase: 0, after: 0 });
  const path = React.useMemo(
    () => ({ a: SPOT.clone(), b: new THREE.Vector3(), c: new THREE.Vector3(), d: new THREE.Vector3(), e: new THREE.Vector3() }),
    []
  );
  const shake = React.useRef(0);
  const burst = React.useRef(0);
  const netUniforms = React.useMemo(
    () => ({ uImpact: { value: new THREE.Vector2(0, 1) }, uBulge: { value: 0 }, uColor: { value: new THREE.Color(FG) } }),
    []
  );

  React.useEffect(() => {
    scene.background = new THREE.Color(dark ? "#080808" : "#F5F5F0");
    scene.fog = new THREE.Fog(dark ? "#080808" : "#F5F5F0", 22, 60);
    netUniforms.uColor.value.set(dark ? FG : "#080808");
  }, [dark, scene, netUniforms]);

  const { size } = useThree();
  React.useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...PENALTY_CAMERA.pos);
    cam.lookAt(...PENALTY_CAMERA.look);
    // Campo de visão vertical mínimo para caber o gol (± 4,4 m) na largura em qualquer proporção.
    cam.fov = penaltyFov(size.width / size.height);
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  // Muralha: pose de braços abertos, um pouco maior.
  React.useEffect(() => {
    gsap.to(rig.current, { spread: muralha ? 1 : 0, scale: muralha ? 1.18 : 1.08, duration: reduce ? 0 : 0.6, ease: "back.out(2)" });
  }, [muralha, reduce]);

  React.useImperativeHandle(control, () => ({
    reset() {
      flight.current = { t: 0, active: false, phase: 0, after: 0 };
      ball.current?.position.copy(SPOT);
      gsap.to(rig.current, { x: 0, y: 0, rot: 0, reachL: 0, reachR: 0, duration: reduce ? 0 : 0.5, ease: "power2.out" });
      netUniforms.uBulge.value = 0;
    },
    kick(plan) {
      return new Promise<void>((resolve) => {
        const { target, outcome, keeperZone, power, curve } = plan;
        const T = new THREE.Vector3(target.x, target.y, 0);
        path.a.copy(SPOT);
        path.b.set(SPOT.x + curve * 0.4, SPOT.y + 0.3 + target.y * 0.35, 7.2);
        path.c.set(T.x - curve * 2.2, T.y + 0.25, 3.0);
        path.d.copy(T);
        const side = Math.sign(target.x || 1);
        // Depois do plano do gol: rede, rebote na luva, trave ou para fora.
        if (outcome === "goal") path.e.set(T.x * 0.92, Math.max(0.2, T.y * 0.85), -1.7);
        else if (outcome === "save") path.e.set(T.x + side * 3.2, T.y + 1.3, 4.5);
        else if (outcome === "post") path.e.set(T.x - side * 1.4, Math.max(0.3, T.y * 0.5), 4);
        else path.e.set(T.x * 1.35, T.y + 1.2, -12);

        const duration = reduce ? 0.35 : 0.95 - power * 0.4;
        const f = flight.current;
        f.t = 0;
        f.after = 0;
        f.phase = 0;
        f.active = true;

        // Goleiro: decidiu antes; pula no reflexo. Na defesa, as luvas encontram a bola.
        const dive = outcome === "save" ? { x: T.x, y: T.y } : zoneCenter(keeperZone);
        const right = dive.x > 0.2;
        const left = dive.x < -0.2;
        const tl = gsap.timeline({
          onComplete: () => {
            f.active = false;
            resolve();
          }
        });
        tl.to(f, { t: 1, duration, ease: "none" }, 0)
          .to(
            rig.current,
            {
              x: dive.x * 0.82,
              y: Math.max(0, dive.y - 1.55) * 0.9,
              rot: left ? 0.9 + dive.y * 0.15 : right ? -(0.9 + dive.y * 0.15) : 0,
              reachL: left || (!right && dive.y > 1.4) ? 1 : 0.2,
              reachR: right || (!left && dive.y > 1.4) ? 1 : 0.2,
              duration: reduce ? 0.2 : 0.45,
              ease: "power3.out"
            },
            duration * 0.32
          )
          .add(() => {
            f.phase = 1;
            if (outcome === "goal") {
              netUniforms.uImpact.value.set(T.x, T.y);
              gsap.fromTo(netUniforms.uBulge, { value: 0 }, { value: 0.9, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" });
              if (!reduce) {
                shake.current = 0.25;
                burst.current = 1;
                gsap.to(burst, { current: 0, duration: 1.4, ease: "power2.in" });
                // Câmera lenta no gol.
                gsap.fromTo(tl, { timeScale: 0.25 }, { timeScale: 1, duration: 0.9, ease: "power2.in" });
              }
            }
          }, duration)
          .to(f, { after: 1, duration: reduce ? 0.2 : 0.55, ease: "power2.out" }, duration)
          .to({}, { duration: reduce ? 0.1 : 0.5 });
      });
    }
  }));

  useFrame((state, delta) => {
    const b = ball.current;
    const f = flight.current;
    if (b) {
      if (f.active) {
        if (f.phase === 0) bezier(b.position, path.a, path.b, path.c, path.d, f.t);
        else b.position.lerpVectors(path.d, path.e, f.after);
        b.rotation.x -= delta * 18;
        b.rotation.y += delta * 6;
      }
    }
    // Retícula de mira no plano do gol.
    const r = reticle.current;
    if (r) {
      r.visible = aim.current.visible && !f.active;
      r.position.set(aim.current.x, aim.current.y, 0.02);
    }
    // Tremor de câmera no gol.
    if (shake.current > 0) {
      shake.current = Math.max(0, shake.current - delta);
      const s = shake.current * 0.25;
      const [px, py, pz] = PENALTY_CAMERA.pos;
      state.camera.position.set(px + (Math.random() - 0.5) * s, py + (Math.random() - 0.5) * s, pz);
      state.camera.lookAt(...PENALTY_CAMERA.look);
    }
  });

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const x = THREE.MathUtils.clamp(e.point.x, -GOAL.halfWidth - 1.2, GOAL.halfWidth + 1.2);
    const y = THREE.MathUtils.clamp(e.point.y, 0.05, GOAL.height + 0.9);
    onAim(x, y);
  };

  return (
    <>
      <hemisphereLight args={["#ffffff", "#000000", 0.7]} />
      <spotLight position={[0, 16, 12]} angle={0.55} penumbra={0.7} intensity={dark ? 520 : 160} color="#ffffff" />
      <Backdrop dark={dark} />
      <Pitch dark={dark} />
      <Goal />
      <Net uniforms={netUniforms} />
      <Keeper rig={rig} muralha={muralha} />
      <mesh ref={ball} position={SPOT}>
        <icosahedronGeometry args={[0.11, 1]} />
        <meshStandardMaterial color={FG} flatShading roughness={0.5} />
      </mesh>
      <mesh ref={reticle} visible={false}>
        <ringGeometry args={[0.16, 0.2, 32]} />
        <meshBasicMaterial color={SIGNAL} transparent opacity={0.9} depthTest={false} />
      </mesh>
      <NorthEnd dark={dark} reduce={reduce} />
      <Flashes burst={burst} />
      {/* Plano invisível para mirar com o ponteiro */}
      <mesh position={[0, 1.5, 0]} onPointerMove={onMove} onPointerDown={onMove} visible={false}>
        <planeGeometry args={[30, 12]} />
        <meshBasicMaterial />
      </mesh>
    </>
  );
}

export default function PenaltyScene(props: Props) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [...PENALTY_CAMERA.pos], fov: PENALTY_CAMERA.minFov, near: 0.1, far: 120 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0, touchAction: "none" }}
      aria-hidden="true"
    >
      <SceneContent {...props} />
    </Canvas>
  );
}
