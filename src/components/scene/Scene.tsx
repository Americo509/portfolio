"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Bloom, DepthOfField, EffectComposer, LUT, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode, type DepthOfFieldEffect } from "postprocessing";
import { motionState, useApp } from "@/lib/store";
import type { GpuTier } from "@/lib/webgl";
import { TIER_SETTINGS } from "./stadium/config";
import { Stadium, type SceneMode, type StadiumPalette } from "./stadium/Stadium";
import { LensEffect, getLut } from "./stadium/lens";
import { lens } from "./stadium/lens-state";

/**
 * Compila os shaders da cena em paralelo (KHR_parallel_shader_compile, via
 * compileAsync) antes do primeiro quadro: sem isso, a primeira renderização compila
 * tudo de uma vez e trava a página por quase um segundo no celular. Enquanto
 * compila, o canvas não desenha (o fallback estático continua na tela). Sem a
 * extensão (ex.: SwiftShader), não há ganho em esperar: desenha direto.
 */
function Precompile({ onDone }: { onDone: () => void }) {
  const { gl, scene, camera } = useThree();
  React.useEffect(() => {
    let alive = true;
    if (!gl.extensions.has("KHR_parallel_shader_compile")) {
      onDone();
      return;
    }
    gl.compileAsync(scene, camera)
      .catch(() => undefined)
      .then(() => {
        if (alive) onDone();
      });
    return () => {
      alive = false;
    };
    // Uma vez só, com a cena já montada (este componente é o último da árvore).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
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

/**
 * Pós-processamento, na ordem de uma câmera de cinema (docs/plano-awwwards.md, "Cor" e
 * "Lente"): profundidade de campo (rack focus), bloom, lente (motion blur nos
 * movimentos rápidos + aberração pela velocidade do scroll), tone mapping AgX, LUT
 * do modo (Expediente ou Resenha), grão e vinheta. O tier médio fica com bloom, AgX,
 * LUT, grão e vinheta, que o compositor junta numa passada só.
 */
function Effects({ level, resenha }: { level: "bloom" | "full"; resenha: boolean }) {
  const dof = React.useRef<DepthOfFieldEffect>(null);
  const lensEffect = React.useMemo(() => new LensEffect(), []);

  React.useEffect(() => {
    // O grão passa a vir do pós-processamento; o CSS fica só para quem não tem cena.
    document.documentElement.dataset.postGrain = "1";
    return () => {
      delete document.documentElement.dataset.postGrain;
      lensEffect.dispose();
    };
  }, [lensEffect]);

  useFrame(() => {
    lens.aberration = level === "full" ? 0.0006 + Math.abs(motionState.velocityNorm) * 0.006 : 0;
    const d = dof.current;
    if (!d) return;
    d.cocMaterial.focusDistance = lens.focus;
    d.cocMaterial.focusRange = lens.range;
    d.bokehScale = lens.bokeh;
  });

  const lut = React.useMemo(() => getLut(resenha ? "resenha" : "night"), [resenha]);

  if (level === "bloom") {
    return (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.55} luminanceSmoothing={0.2} />
        <ToneMapping mode={ToneMappingMode.AGX} />
        <LUT lut={lut} />
        <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.2} />
        <Vignette offset={0.25} darkness={0.75} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={0}>
      <DepthOfField ref={dof} focusDistance={lens.focus} focusRange={lens.range} bokehScale={0} resolutionScale={0.5} />
      <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.5} luminanceSmoothing={0.2} />
      <primitive object={lensEffect} dispose={null} />
      <ToneMapping mode={ToneMappingMode.AGX} />
      <LUT lut={lut} tetrahedralInterpolation />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.2} />
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
  theme: "dark" | "light" | "resenha";
  mode: SceneMode;
  onReady: () => void;
}) {
  const settings = TIER_SETTINGS[tier];
  const [dpr, setDpr] = React.useState(() => Math.min(settings.dpr, window.devicePixelRatio || 1));
  const [post, setPost] = React.useState(settings.post);
  const [hidden, setHidden] = React.useState(false);
  const [compiled, setCompiled] = React.useState(false);
  const gameActive = useApp((s) => s.gameActive);

  React.useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const palette = React.useMemo<StadiumPalette>(() => {
    if (theme === "resenha")
      // Pós-jogo: refletores esquentam (âmbar de balcão de bar) e a neblina fica dourada.
      return { fg: new THREE.Color("#F7D9A8"), bg: new THREE.Color("#0A0806"), signal: new THREE.Color("#F59E0B"), additive: true };
    return theme === "dark"
      ? { fg: new THREE.Color("#F5F5F0"), bg: new THREE.Color("#080808"), signal: new THREE.Color("#E61919"), additive: true }
      : { fg: new THREE.Color("#080808"), bg: new THREE.Color("#F5F5F0"), signal: new THREE.Color("#C21414"), additive: false };
  }, [theme]);

  return (
    <Canvas
      dpr={dpr}
      frameloop={hidden || gameActive || !compiled ? "never" : "always"}
      camera={{ position: [52, 74, 130], fov: 28, near: 0.5, far: 600 }}
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
      {post !== "none" && theme !== "light" ? <Effects level={post} resenha={theme === "resenha"} /> : null}
      <ReadySignal onReady={onReady} />
      <Precompile onDone={() => setCompiled(true)} />
    </Canvas>
  );
}
