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
import { perfLive } from "./debug";

/** Quantas etapas a cena monta antes de ficar pronta (ver STAGES em Stadium.tsx). */
const LAST_STAGE = 4;

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Monta a cena em etapas (docs/plano-awwwards.md, revisão da etapa 1): gramado e
 * estrutura; neblina e feixes; torcida; lâmpadas; pós-processamento. Só roda com
 * KHR_parallel_shader_compile.
 *
 * No Chrome os shaders compilam no processo da GPU; a página só trava quando
 * pergunta se terminou, o que o three faz no primeiro desenho de cada programa. Com
 * a extensão, compileAsync consulta sem bloquear, então cada etapa é compilada antes
 * de ser desenhada, com o desenho parado. Só no fim a cena avisa que está pronta: o
 * fade e a abertura começam com tudo compilado.
 */
function StageRunner({
  stage,
  onStage,
  onCompiling,
  onReady
}: {
  stage: number;
  onStage: (s: number) => void;
  onCompiling: (v: boolean) => void;
  onReady: () => void;
}) {
  const { gl, scene, camera } = useThree();
  const started = React.useRef(0);
  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (stage === 0) started.current = performance.now();
      onCompiling(true);
      await gl.compileAsync(scene, camera).catch(() => undefined);
      if (!alive) return;
      onCompiling(false);
      // Um quadro para a etapa ser desenhada antes de montar a próxima; o tempo dele
      // (onde mora o travamento, se a compilação ainda não terminou) vai para o ?debug.
      const t = performance.now();
      await nextFrame();
      await wait(0);
      perfLive.worstMountFrame = Math.max(perfLive.worstMountFrame, performance.now() - t);
      if (!alive) return;
      if (stage < LAST_STAGE) onStage(stage + 1);
      else {
        perfLive.readyMs = performance.now() - started.current;
        onReady();
      }
    })();
    return () => {
      alive = false;
    };
    // Roda uma vez por etapa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);
  return null;
}

/**
 * Sem compilação paralela (ex.: SwiftShader, aparelhos antigos), esperar não esconde
 * nada: a cena monta inteira e desenha direto, e avisa que está pronta no segundo
 * quadro. Medido na revisão do commit 87ac1ef: a montagem em etapas sem a extensão
 * piorava o TBT em ~190 ms.
 */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = React.useRef(0);
  const started = React.useRef(0);
  const done = React.useRef(false);
  useFrame(() => {
    if (done.current) return;
    if (frames.current === 0) started.current = performance.now();
    if (++frames.current >= 2) {
      done.current = true;
      perfLive.readyMs = performance.now() - started.current;
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
    // Só com o scroll em movimento: parada, a franja de cor viraria contorno vermelho na LUT.
    lens.aberration = level === "full" ? Math.abs(motionState.velocityNorm) * 0.006 : 0;
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
  // null até o renderer existir: aí se sabe se o aparelho compila shaders em paralelo.
  const [parallel, setParallel] = React.useState<boolean | null>(null);
  const [stage, setStage] = React.useState(0);
  // Começa parado: nada é desenhado (e compilado às cegas) antes de escolher o caminho.
  const [compiling, setCompiling] = React.useState(true);
  const shown = parallel ? stage : LAST_STAGE;
  // Para o overlay de desempenho do ?debug.
  React.useEffect(() => {
    perfLive.tier = tier;
    perfLive.dpr = dpr;
    perfLive.post = theme === "light" ? "none" : post;
  }, [tier, dpr, post, theme]);
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
      frameloop={hidden || gameActive || compiling ? "never" : "always"}
      camera={{ position: [52, 74, 130], fov: 28, near: 0.5, far: 600 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
      onCreated={({ gl }) => {
        const p = gl.extensions.has("KHR_parallel_shader_compile");
        perfLive.parallel = p;
        setParallel(p);
        if (!p) setCompiling(false);
      }}
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
      {parallel === null ? null : (
        <>
          <Stadium tier={tier} palette={palette} mode={mode} stage={shown} />
          {shown >= LAST_STAGE && post !== "none" && theme !== "light" ? <Effects level={post} resenha={theme === "resenha"} /> : null}
          {parallel ? (
            <StageRunner stage={stage} onStage={setStage} onCompiling={setCompiling} onReady={onReady} />
          ) : (
            <ReadySignal onReady={onReady} />
          )}
        </>
      )}
    </Canvas>
  );
}
