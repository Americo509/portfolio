"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { fxRegistry, type FxItem } from "@/lib/fx";
import { motionState } from "@/lib/store";

const vertex = /* glsl */ `
  uniform float uVel;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    // O meio do plano "fica para trás" com a velocidade do scroll (resistência do ar).
    p.y += sin(uv.x * 3.14159) * uVel * 0.06;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2 uRes;
  uniform vec2 uImg;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uVel;
  uniform float uTime;
  uniform float uReveal;
  varying vec2 vUv;

  vec2 cover(vec2 uv) {
    float rs = uRes.x / uRes.y;
    float ri = uImg.x / uImg.y;
    vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
    return (uv - 0.5) * s + 0.5;
  }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  void main() {
    vec2 uv = (vUv - 0.5) * (1.0 - 0.05 * uHover) + 0.5;
    vec2 d = uv - uMouse;
    float dist = length(d * vec2(uRes.x / uRes.y, 1.0));
    float ripple = sin(dist * 38.0 - uTime * 5.0) * 0.006 * uHover * (1.0 - smoothstep(0.0, 0.45, dist));
    uv += normalize(d + 1e-4) * ripple;

    float shift = 0.0022 * uHover + abs(uVel) * 0.014;
    vec3 col = vec3(
      texture2D(uTex, cover(uv + vec2(shift, 0.0))).r,
      texture2D(uTex, cover(uv)).g,
      texture2D(uTex, cover(uv - vec2(shift, 0.0))).b
    );
    float gray = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(gray) * 1.04, col, uHover);

    // Reveal de baixo para cima com borda serrilhada (ruído por coluna).
    float n = hash(vec2(floor(vUv.x * 48.0), 7.0));
    float edge = uReveal * 1.15 - 0.08 + n * 0.06 * (1.0 - uReveal);
    float a = step(vUv.y, edge);
    if (a < 0.5) discard;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const loader = new THREE.TextureLoader();
const cache = new Map<string, Promise<THREE.Texture>>();
function loadTexture(src: string) {
  let p = cache.get(src);
  if (!p) {
    p = loader.loadAsync(src).then((t) => {
      // Sem conversão de espaço de cor: o shader devolve o valor sRGB como veio.
      t.colorSpace = THREE.NoColorSpace;
      t.minFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
      return t;
    });
    cache.set(src, p);
  }
  return p;
}

function FxPlane({ item }: { item: FxItem }) {
  const mesh = React.useRef<THREE.Mesh>(null);
  const { size } = useThree();
  const uniforms = React.useMemo(
    () => ({
      uTex: { value: null as THREE.Texture | null },
      uRes: { value: new THREE.Vector2(1, 1) },
      uImg: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uVel: { value: 0 },
      uTime: { value: 0 },
      uReveal: { value: 0 }
    }),
    []
  );
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    loadTexture(item.src)
      .then((t) => {
        if (!alive) return;
        uniforms.uTex.value = t;
        const img = t.image as { width: number; height: number };
        uniforms.uImg.value.set(img.width, img.height);
        item.el.dataset.fx = "on";
        setReady(true);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
      delete item.el.dataset.fx;
    };
  }, [item, uniforms]);

  useFrame((_, delta) => {
    const m = mesh.current;
    if (!m) return;
    const r = item.el.getBoundingClientRect();
    const visible = ready && r.bottom > 0 && r.top < size.height && r.width > 0;
    m.visible = visible;
    if (!visible) return;
    m.position.set(r.left + r.width / 2 - size.width / 2, size.height / 2 - (r.top + r.height / 2), 0);
    m.scale.set(r.width, r.height, 1);
    item.hover += (item.hoverTarget - item.hover) * Math.min(1, delta * 6);
    uniforms.uRes.value.set(r.width, r.height);
    const k = Math.min(1, delta * 8);
    uniforms.uMouse.value.x += (item.mouse.x - uniforms.uMouse.value.x) * k;
    uniforms.uMouse.value.y += (item.mouse.y - uniforms.uMouse.value.y) * k;
    uniforms.uHover.value = item.hover;
    uniforms.uVel.value = motionState.velocityNorm;
    uniforms.uTime.value += delta;
    uniforms.uReveal.value = item.reveal;
  });

  return (
    <mesh ref={mesh} visible={false}>
      <planeGeometry args={[1, 1, 24, 8]} />
      <shaderMaterial args={[{ vertexShader: vertex, fragmentShader: fragment, uniforms, transparent: true }]} />
    </mesh>
  );
}

function Planes() {
  const items = React.useSyncExternalStore(fxRegistry.subscribe, fxRegistry.getSnapshot, fxRegistry.getSnapshot);
  return (
    <>
      {items.map((item) => (
        <FxPlane key={item.id} item={item} />
      ))}
    </>
  );
}

/** Canvas transparente sobreposto ao conteúdo que redesenha as FxImage com shader. */
export default function ImageFxCanvas() {
  const [hidden, setHidden] = React.useState(false);
  React.useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 10], zoom: 1, near: 0.1, far: 100 }}
      dpr={[1, 1.5]}
      frameloop={hidden ? "never" : "always"}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 20 }}
      aria-hidden="true"
    >
      <Planes />
    </Canvas>
  );
}
