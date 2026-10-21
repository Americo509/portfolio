"use client";

import * as React from "react";
import { gsap } from "@/lib/gsap";
import { useApp } from "@/lib/store";
import { hasWebGL } from "@/lib/webgl";
import { loadScene } from "@/components/scene/load";

const SESSION_KEY = "gd:booted";
const MIN_MS = 1300;
const MAX_MS = 2600;

/**
 * Script inline do <head>: decide antes do primeiro paint se o preloader
 * aparece (primeira visita da sessão, sem reduced motion). Sem JS, não aparece.
 */
export const bootScript = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!sessionStorage.getItem('${SESSION_KEY}')){document.documentElement.dataset.boot='1'}}catch(e){}`;

const pad = (n: number) => String(Math.round(n)).padStart(3, "0");

export function Preloader({ handle, services }: { handle: string; services: string[] }) {
  const root = React.useRef<HTMLDivElement>(null);
  const counter = React.useRef<HTMLSpanElement>(null);
  const setBooted = useApp((s) => s.setBooted);
  const [visibleLines, setVisibleLines] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const finishRef = React.useRef<(fast?: boolean) => void>(undefined);

  const lines = React.useMemo(
    () => [
      `> boot ${handle} --env=production`,
      `> mounting services: ${services.map((s) => s.toLowerCase()).join(" · ")}`,
      "> connecting event bus .............. ok",
      "> warming caches .................... ok",
      `> ${services.length}/${services.length} services healthy`
    ],
    [handle, services]
  );

  React.useEffect(() => {
    const html = document.documentElement;
    if (html.dataset.boot !== "1") {
      setBooted(true);
      setDone(true);
      return;
    }

    const el = root.current!;
    const q = gsap.utils.selector(el);
    const state = { value: 0 };
    const start = performance.now();
    let finished = false;
    let cancelled = false;
    let target = 0;

    const render = () => {
      if (counter.current) counter.current.textContent = pad(state.value);
      setVisibleLines(Math.min(lines.length, Math.floor((state.value / 100) * lines.length) + 1));
    };

    const advance = (weight: number) => {
      if (finished || cancelled) return;
      target = Math.min(96, target + weight);
      gsap.to(state, { value: target, duration: 0.5, ease: "power2.out", onUpdate: render });
    };

    const finish = (fast = false) => {
      if (finished || cancelled) return;
      finished = true;
      window.removeEventListener("keydown", onKey);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}

      gsap.killTweensOf(state);
      const tl = gsap.timeline({
        defaults: { ease: "cine" },
        onComplete: () => {
          delete html.dataset.boot;
          setDone(true);
        }
      });
      tl.to(state, { value: 100, duration: fast ? 0.15 : 0.35, ease: "power2.out", onUpdate: render })
        .to(q("[data-content]"), { autoAlpha: 0, duration: 0.3 }, fast ? 0 : "+=0.15")
        .to(q("[data-slit]"), { scaleX: 1, duration: 0.45 }, "<")
        .add(() => setBooted(true))
        .to(q("[data-half='top']"), { yPercent: -100, duration: fast ? 0.7 : 1.05 })
        .to(q("[data-half='bottom']"), { yPercent: 100, duration: fast ? 0.7 : 1.05 }, "<")
        .to(q("[data-slit]"), { autoAlpha: 0, duration: 0.4 }, "<0.2");
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish(true);
    };
    window.addEventListener("keydown", onKey);
    finishRef.current = finish;

    // Tarefas reais: fontes, load da página e o chunk da cena 3D (quando houver WebGL).
    const tasks: [Promise<unknown>, number][] = [
      [document.fonts?.ready ?? Promise.resolve(), 35],
      [
        document.readyState === "complete"
          ? Promise.resolve()
          : new Promise((r) => window.addEventListener("load", r, { once: true })),
        35
      ],
      [hasWebGL() ? loadScene().catch(() => undefined) : Promise.resolve(), 26]
    ];
    tasks.forEach(([p, w]) => p.then(() => advance(w)));

    const settle = () => {
      const wait = Math.max(0, MIN_MS - (performance.now() - start));
      window.setTimeout(() => finish(), wait);
    };
    Promise.all(tasks.map(([p]) => p)).then(settle);
    const failsafe = window.setTimeout(() => finish(), MAX_MS);
    render();

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      window.removeEventListener("keydown", onKey);
    };
  }, [lines, setBooted]);

  if (done) return null;

  return (
    <div ref={root} className="boot-screen fixed inset-0 z-[80]" role="status" aria-label="Carregando o site">
      <div data-half="top" className="absolute inset-x-0 top-0 h-1/2 bg-bg" />
      <div data-half="bottom" className="absolute inset-x-0 bottom-0 h-1/2 bg-bg" />
      <div data-slit className="absolute inset-x-0 top-1/2 h-px origin-center scale-x-0 bg-signal" />

      <div data-content className="absolute inset-0 flex flex-col justify-between p-[var(--margin)] text-fg">
        <div className="label flex items-center justify-between text-muted">
          <span>{handle}</span>
          <span className="hidden sm:inline">boot sequence</span>
          <button type="button" onClick={() => finishRef.current?.(true)} className="label text-fg underline underline-offset-4">
            Pular [esc]
          </button>
        </div>

        <ul className="font-mono text-[12px] leading-relaxed sm:text-[13px]">
          {lines.map((line, i) => (
            <li key={line} className={i < visibleLines ? "opacity-100" : "opacity-0"}>
              {line}
              {i === visibleLines - 1 ? <span className="ml-1 inline-block h-[1em] w-[0.55em] translate-y-[2px] animate-pulse bg-signal" /> : null}
            </li>
          ))}
        </ul>

        <div className="flex items-end justify-between">
          <span ref={counter} className="font-display text-chapter tabular-nums">
            000
          </span>
          <span className="label pb-[0.6em] text-muted">loading %</span>
        </div>
      </div>
    </div>
  );
}
