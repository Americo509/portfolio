"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { motionState, useApp } from "@/lib/store";

type HudCopy = {
  build: string;
  node: string;
  port: string;
  live: string;
  firstHalf: string;
  halfTime: string;
  secondHalf: string;
  addedTime: string;
};

/** O scroll da página vira o relógio da partida: 0' → 90' + acréscimos. */
export function matchClock(progress: number, hud: HudCopy) {
  if (progress >= 0.985) return `+3' ${hud.addedTime}`;
  if (progress >= 0.49 && progress <= 0.51) return hud.halfTime;
  const minute = Math.max(0, Math.min(90, Math.round(progress * 90)));
  return `${progress < 0.5 ? hud.firstHalf : hud.secondHalf} — ${String(minute).padStart(2, "0")}'`;
}

const Corner = ({ className }: { className: string }) => (
  <span className={`absolute h-3 w-3 ${className}`}>
    <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-fg/40" />
    <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-fg/40" />
  </span>
);

/** Moldura de HUD fixa (docs/art-direction.md §4). Puramente decorativa. */
export function HudFrame({ hud, liveResenha }: { hud: HudCopy; liveResenha: string }) {
  const pathname = usePathname();
  const resenha = useApp((s) => s.resenha);
  const clock = React.useRef<HTMLSpanElement>(null);
  const match = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    let last = -1;
    let lastSecond = -1;
    const tick = () => {
      const pct = Math.round(motionState.progress * 200);
      if (pct !== last && match.current) {
        match.current.textContent = matchClock(motionState.progress, hud);
        last = pct;
      }
      const now = new Date();
      if (now.getSeconds() !== lastSecond && clock.current) {
        lastSecond = now.getSeconds();
        clock.current.textContent = now.toLocaleTimeString("pt-BR", { hour12: false });
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [hud]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-[var(--hud-inset)] z-40 text-fg">
      <Corner className="-left-1.5 -top-1.5" />
      <Corner className="-right-1.5 -top-1.5" />
      <Corner className="-bottom-1.5 -left-1.5" />
      <Corner className="-bottom-1.5 -right-1.5" />

      <div className="label absolute bottom-0 left-4 hidden items-center gap-3 text-muted md:flex">
        <span>
          {hud.node}
          {hud.port} · {hud.build}
        </span>
        <span className="text-fg">{pathname}</span>
      </div>

      <div className="label absolute bottom-0 right-4 hidden items-center gap-5 text-muted md:flex">
        <span ref={match} className="tabular-nums text-fg">
          {matchClock(0, hud)}
        </span>
        <span className="tabular-nums" ref={clock}>
          --:--:--
        </span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
          {resenha ? liveResenha : hud.live}
        </span>
      </div>
    </div>
  );
}
