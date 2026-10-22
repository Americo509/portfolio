"use client";

import * as React from "react";
import { cameraLive, keyCode, perfLive, perfStats, resetPerf, useCameraDebug } from "./debug";

/**
 * Painéis do ?debug (docs/plano-awwwards.md, revisão da etapa 1): o diretor de
 * câmera e o overlay de desempenho, que funciona no celular sem cabo.
 */
export function DebugPanels() {
  return (
    <>
      <PerfOverlay />
      <CameraDirector />
    </>
  );
}

const panel = "pointer-events-auto fixed z-[90] border border-white/15 bg-black/80 font-mono text-[11px] leading-snug text-white backdrop-blur";

/** Critério da etapa 1 no Android: mediana ≥ 55 fps e p95 ≤ 20 ms por 10 s, no hero, tier médio. */
const TARGET = { medianFps: 55, p95: 20, seconds: 10 };

function PerfOverlay() {
  const [, tick] = React.useReducer((n: number) => n + 1, 0);
  const [test, setTest] = React.useState<{ until: number; result?: ReturnType<typeof perfStats> } | null>(null);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      tick();
      setTest((t) => (t && !t.result && performance.now() >= t.until ? { ...t, result: perfStats(TARGET.seconds * 1000) } : t));
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  const now = perfStats(1000);
  const win = perfStats(TARGET.seconds * 1000);
  const r = test?.result;
  const pass = r ? r.medianFps >= TARGET.medianFps && r.p95 <= TARGET.p95 : null;

  return (
    <div className={`${panel} right-2 top-16 w-[220px] p-2`} role="status" aria-live="off">
      <div className="flex justify-between">
        <span>fps</span>
        <span>{now ? now.medianFps.toFixed(0) : "–"}</span>
      </div>
      <div className="flex justify-between">
        <span>mediana {TARGET.seconds}s</span>
        <span>{win ? `${win.medianFps.toFixed(0)} fps` : "–"}</span>
      </div>
      <div className="flex justify-between">
        <span>p95 {TARGET.seconds}s</span>
        <span>{win ? `${win.p95.toFixed(1)} ms` : "–"}</span>
      </div>
      <div className="flex justify-between text-white/60">
        <span>compilação paralela</span>
        <span>{perfLive.parallel === null ? "–" : perfLive.parallel ? "sim" : "não"}</span>
      </div>
      <div className="flex justify-between text-white/60">
        <span>cena pronta · maior trava</span>
        <span>
          {perfLive.readyMs === null ? "–" : `${(perfLive.readyMs / 1000).toFixed(1)} s`} · {perfLive.worstMountFrame.toFixed(0)} ms
        </span>
      </div>
      <div className="flex justify-between text-white/60">
        <span>tier · dpr · pós</span>
        <span>
          {perfLive.tier} · {perfLive.dpr} · {perfLive.post}
        </span>
      </div>
      <button
        type="button"
        className="mt-1.5 w-full border border-white/30 px-1 py-0.5 hover:bg-white/10"
        onClick={() => {
          resetPerf();
          setTest({ until: performance.now() + TARGET.seconds * 1000 });
        }}
      >
        {test && !r ? `medindo… ${Math.max(0, Math.ceil((test.until - performance.now()) / 1000))}s` : `testar ${TARGET.seconds} s`}
      </button>
      {r ? (
        <div className={pass ? "mt-1 text-[#7CFC9A]" : "mt-1 text-[#FF6B6B]"}>
          {pass ? "passou" : "não passou"}: {r.medianFps.toFixed(0)} fps / p95 {r.p95.toFixed(1)} ms ({r.frames} quadros)
        </div>
      ) : null}
    </div>
  );
}

function CameraDirector() {
  const { free, scrub, showPath, set } = useCameraDebug();
  const [open, setOpen] = React.useState(() => typeof window !== "undefined" && window.innerWidth >= 768);
  const [code, setCode] = React.useState("");
  const [, tick] = React.useReducer((n: number) => n + 1, 0);

  React.useEffect(() => {
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, []);

  // Na câmera livre, a camada da cena sobe por cima do conteúdo para receber o mouse.
  React.useEffect(() => {
    if (free) document.documentElement.dataset.cameraFree = "1";
    else delete document.documentElement.dataset.cameraFree;
    return () => {
      delete document.documentElement.dataset.cameraFree;
    };
  }, [free]);

  const capture = async () => {
    const line = keyCode();
    setCode((c) => (c ? `${c}\n${line}` : line));
    try {
      await navigator.clipboard.writeText(line);
    } catch {
      // Sem permissão de clipboard: o texto fica no campo para copiar à mão.
    }
  };

  const fmt = (v: number[]) => v.map((n) => n.toFixed(1)).join(", ");

  if (!open)
    return (
      <button type="button" className={`${panel} bottom-14 left-2 px-2 py-1`} onClick={() => setOpen(true)}>
        câmera ▸
      </button>
    );

  return (
    <div className={`${panel} bottom-14 left-2 w-[min(360px,calc(100vw-16px))] p-2`}>
      <div className="mb-1 flex items-center justify-between">
        <strong>Diretor de câmera</strong>
        <button type="button" onClick={() => setOpen(false)} aria-label="Fechar o diretor de câmera">
          ✕
        </button>
      </div>
      <div className="text-white/70">
        trilha {cameraLive.track} · g {cameraLive.g.toFixed(2)} · fov {cameraLive.fov.toFixed(0)}
        <br />
        pos [{fmt(cameraLive.pos)}]
        <br />
        alvo [{fmt(cameraLive.look)}]
      </div>
      <label className="mt-1.5 flex items-center gap-2">
        <input type="checkbox" checked={free} onChange={(e) => set({ free: e.target.checked })} />
        câmera livre (arraste para orbitar, roda para aproximar)
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={showPath} onChange={(e) => set({ showPath: e.target.checked })} />
        mostrar a trilha
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={scrub === null} onChange={(e) => set({ scrub: e.target.checked ? null : cameraLive.g })} />
        seguir o scroll
      </label>
      <input
        type="range"
        min={0}
        max={7}
        step={0.005}
        value={scrub ?? cameraLive.g}
        onChange={(e) => set({ scrub: Number(e.target.value) })}
        className="mt-1 w-full"
        aria-label="Percorrer a trilha"
      />
      <button type="button" className="mt-1 w-full border border-white/30 px-1 py-0.5 hover:bg-white/10" onClick={capture}>
        copiar quadro-chave
      </button>
      {code ? (
        <textarea
          readOnly
          value={code}
          rows={Math.min(6, code.split("\n").length + 1)}
          className="mt-1 w-full resize-y bg-black/60 p-1 text-[10px]"
          aria-label="Quadros-chave capturados"
        />
      ) : null}
    </div>
  );
}
