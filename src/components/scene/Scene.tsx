"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { motionState } from "@/lib/store";
import type { GpuTier } from "@/lib/webgl";
import { buildNetwork } from "./network-layout";

type Palette = { fg: THREE.Color; signal: THREE.Color; additive: boolean };

const PACKETS: Record<GpuTier, number> = { low: 120, mid: 260, high: 520 };
const BASE_DPR: Record<GpuTier, number> = { low: 1, mid: 1.5, high: 1.75 };

const nodeVertex = /* glsl */ `
  attribute float aSize;
  attribute float aHub;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vHub;
  varying float vDepth;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float pulse = 1.0 + aHub * 0.25 * sin(uTime * 2.0 + position.x);
    gl_PointSize = aSize * pulse * uPixelRatio * (90.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vHub = aHub;
    vDepth = smoothstep(26.0, 6.0, -mv.z);
  }
`;

const nodeFragment = /* glsl */ `
  uniform vec3 uFg;
  uniform vec3 uSignal;
  varying float vHub;
  varying float vDepth;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    // Núcleo nítido + halo curto (nada de "bolhas").
    float core = smoothstep(0.16, 0.08, d);
    float halo = pow(1.0 - smoothstep(0.0, 0.5, d), 5.0) * 0.6;
    vec3 color = mix(uFg, uSignal, vHub);
    float alpha = (core + halo) * mix(0.3, 1.0, vDepth);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

// "Eventos" percorrendo as conexões: a posição é interpolada no vertex shader.
const packetVertex = /* glsl */ `
  attribute vec3 aStart;
  attribute vec3 aEnd;
  attribute float aOffset;
  attribute float aSpeed;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uVelocity;
  varying float vFade;
  void main() {
    float t = fract(aOffset + uTime * aSpeed * (1.0 + abs(uVelocity) * 3.0));
    vec3 p = mix(aStart, aEnd, t);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (1.0 + 1.5 * sin(t * 3.14159)) * uPixelRatio * (36.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vFade = sin(t * 3.14159);
  }
`;

const packetFragment = /* glsl */ `
  uniform vec3 uSignal;
  varying float vFade;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.1, d) * vFade * 0.9;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uSignal, a);
  }
`;

function Network({ tier, palette }: { tier: GpuTier; palette: Palette }) {
  const group = React.useRef<THREE.Group>(null);
  const { nodes, edges } = React.useMemo(() => buildNetwork(), []);
  const blending = palette.additive ? THREE.AdditiveBlending : THREE.NormalBlending;

  const nodeGeo = React.useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(nodes.flatMap((n) => [n.x, n.y, n.z]), 3));
    g.setAttribute("aSize", new THREE.Float32BufferAttribute(nodes.map((n, i) => (i === 0 ? 3.2 : n.hub ? 1.6 : n.r)), 1));
    g.setAttribute("aHub", new THREE.Float32BufferAttribute(nodes.map((n, i) => (i === 0 || n.hub ? 1 : 0)), 1));
    return g;
  }, [nodes]);

  const edgeGeo = React.useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        edges.flatMap(([a, b]) => [nodes[a].x, nodes[a].y, nodes[a].z, nodes[b].x, nodes[b].y, nodes[b].z]),
        3
      )
    );
    return g;
  }, [nodes, edges]);

  const packetGeo = React.useMemo(() => {
    const count = PACKETS[tier];
    const start = new Float32Array(count * 3);
    const end = new Float32Array(count * 3);
    const offset = new Float32Array(count);
    const speed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const [a, b] = edges[i % edges.length];
      const [from, to] = i % 2 ? [nodes[a], nodes[b]] : [nodes[b], nodes[a]];
      start.set([from.x, from.y, from.z], i * 3);
      end.set([to.x, to.y, to.z], i * 3);
      offset[i] = Math.random();
      speed[i] = 0.08 + Math.random() * 0.22;
    }
    const g = new THREE.BufferGeometry();
    // "position" é obrigatório para o three calcular o draw range; o shader usa aStart/aEnd.
    g.setAttribute("position", new THREE.BufferAttribute(start.slice(), 3));
    g.setAttribute("aStart", new THREE.BufferAttribute(start, 3));
    g.setAttribute("aEnd", new THREE.BufferAttribute(end, 3));
    g.setAttribute("aOffset", new THREE.BufferAttribute(offset, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    return g;
  }, [tier, nodes, edges]);

  const uniforms = React.useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uVelocity: { value: 0 },
      uFg: { value: new THREE.Color() },
      uSignal: { value: new THREE.Color() }
    }),
    []
  );

  // Uniforms estáveis (o programa do shader guarda a referência); só os valores mudam com o tema.
  React.useEffect(() => {
    uniforms.uFg.value.copy(palette.fg);
    uniforms.uSignal.value.copy(palette.signal);
  }, [palette, uniforms]);

  React.useEffect(() => () => [nodeGeo, edgeGeo, packetGeo].forEach((g) => g.dispose()), [nodeGeo, edgeGeo, packetGeo]);

  useFrame((state, delta) => {
    uniforms.uTime.value += delta;
    uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    uniforms.uVelocity.value = motionState.velocityNorm;

    const g = group.current;
    if (!g) return;
    const { x, y } = motionState.pointer;
    g.rotation.y += delta * 0.035;
    g.rotation.x += (y * 0.12 - g.rotation.x) * 0.04;
    g.position.x += (2.4 + x * 0.35 - g.position.x) * 0.04;
    // Scroll rápido "estica" a câmera (warp leve; a versão dramática vem na Fase 2).
    const cam = state.camera as THREE.PerspectiveCamera;
    const fov = 40 + Math.abs(motionState.velocityNorm) * 8;
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov += (fov - cam.fov) * 0.1;
      cam.updateProjectionMatrix();
    }
  });

  return (
    <group ref={group} position={[2.4, 0, 0]}>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color={palette.fg} transparent opacity={palette.additive ? 0.1 : 0.16} depthWrite={false} />
      </lineSegments>
      <points geometry={nodeGeo}>
        <shaderMaterial
          vertexShader={nodeVertex}
          fragmentShader={nodeFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={blending}
        />
      </points>
      <points geometry={packetGeo} frustumCulled={false}>
        <shaderMaterial
          vertexShader={packetVertex}
          fragmentShader={packetFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={blending}
        />
      </points>
    </group>
  );
}

function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = React.useRef(0);
  const done = React.useRef(false);
  useFrame(() => {
    if (done.current) return;
    if (++frames.current >= 2) {
      done.current = true;
      onReady();
    }
  });
  return null;
}

export default function Scene({
  tier,
  theme,
  onReady
}: {
  tier: GpuTier;
  theme: "dark" | "light";
  onReady: () => void;
}) {
  const [dpr, setDpr] = React.useState(() => Math.min(BASE_DPR[tier], window.devicePixelRatio || 1));
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const palette = React.useMemo<Palette>(
    () =>
      theme === "dark"
        ? { fg: new THREE.Color("#F5F5F0"), signal: new THREE.Color("#E61919"), additive: true }
        : { fg: new THREE.Color("#080808"), signal: new THREE.Color("#C21414"), additive: false },
    [theme]
  );

  return (
    <Canvas
      dpr={dpr}
      frameloop={hidden ? "never" : "always"}
      camera={{ position: [0, 0, 14], fov: 40, near: 0.1, far: 100 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
        onFallback={() => setDpr(1)}
      />
      <Network tier={tier} palette={palette} />
      <ReadySignal onReady={onReady} />
    </Canvas>
  );
}
