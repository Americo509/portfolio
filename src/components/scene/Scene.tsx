"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from "@react-three/postprocessing";
import type { ChromaticAberrationEffect } from "postprocessing";
import { motionState, useApp } from "@/lib/store";
import type { GpuTier } from "@/lib/webgl";
import { TIER_SETTINGS } from "./stadium/config";
import { Stadium, type SceneMode, type StadiumPalette } from "./stadium/Stadium";

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

/** Pós-processamento: bloom nos refletores e aberração cromática proporcional à velocidade do scroll. */
function Effects({ level }: { level: "bloom" | "full" }) {
  const ca = React.useRef<ChromaticAberrationEffect>(null);
  const offset = React.useMemo(() => new THREE.Vector2(0.0004, 0.0004), []);

  useFrame(() => {
    if (!ca.current) return;
    const v = Math.abs(motionState.velocityNorm);
    const amount = 0.0004 + v * 0.006;
    ca.current.offset.set(amount, amount * 0.6);
  });

  if (level === "bloom") {
    return (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.55} luminanceSmoothing={0.2} />
        <Vignette offset={0.25} darkness={0.75} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.5} luminanceSmoothing={0.2} />
      <ChromaticAberration ref={ca} offset={offset} radialModulation modulationOffset={0.25} />
      <Vignette offset={0.25} darkness={0.75} />
    </EffectComposer>
  );
}

export default function Scene({
  tier,
  theme,
  mode,
  onReady
}: {
  tier: GpuTier;
  theme: "dark" | "light";
  mode: SceneMode;
  onReady: () => void;
}) {
  const settings = TIER_SETTINGS[tier];
  const [dpr, setDpr] = React.useState(() => Math.min(settings.dpr, window.devicePixelRatio || 1));
  const [post, setPost] = React.useState(settings.post);
  const [hidden, setHidden] = React.useState(false);
  const gameActive = useApp((s) => s.gameActive);

  React.useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const palette = React.useMemo<StadiumPalette>(
    () =>
      theme === "dark"
        ? { fg: new THREE.Color("#F5F5F0"), bg: new THREE.Color("#080808"), signal: new THREE.Color("#E61919"), additive: true }
        : { fg: new THREE.Color("#080808"), bg: new THREE.Color("#F5F5F0"), signal: new THREE.Color("#C21414"), additive: false },
    [theme]
  );

  return (
    <Canvas
      dpr={dpr}
      frameloop={hidden || gameActive ? "never" : "always"}
      camera={{ position: [40, 46, 66], fov: 58, near: 0.5, far: 600 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => {
          setDpr((d) => Math.max(1, d - 0.25));
          setPost((p) => (p === "full" ? "bloom" : p));
        }}
        onFallback={() => {
          setDpr(1);
          setPost("none");
        }}
      />
      <Stadium tier={tier} palette={palette} mode={mode} />
      {post !== "none" && theme === "dark" ? <Effects level={post} /> : null}
      <ReadySignal onReady={onReady} />
    </Canvas>
  );
}
