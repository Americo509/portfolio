"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { motionState } from "@/lib/store";

const ROUTES: Record<string, string> = {
  "/": "01 / index",
  "/projects": "02 / projects",
  "/about": "03 / about",
  "/contact": "04 / contact"
};

function routeLabel(pathname: string) {
  if (ROUTES[pathname]) return ROUTES[pathname];
  if (pathname.startsWith("/projects/")) return `02 / case — ${pathname.split("/")[2]}`;
  return "00 / 404";
}

const Corner = ({ className }: { className: string }) => (
  <span className={`absolute h-3 w-3 ${className}`}>
    <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-fg/40" />
    <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-fg/40" />
  </span>
);

/** Moldura de HUD fixa (docs/art-direction.md §4). Puramente decorativa. */
export function HudFrame() {
  const pathname = usePathname();
  const clock = React.useRef<HTMLSpanElement>(null);
  const scroll = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    let last = -1;
    let lastSecond = -1;
    const tick = () => {
      const pct = Math.round(motionState.progress * 100);
      if (pct !== last && scroll.current) {
        scroll.current.textContent = String(pct).padStart(3, "0");
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
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-[var(--hud-inset)] z-40 text-fg">
      <Corner className="-left-1.5 -top-1.5" />
      <Corner className="-right-1.5 -top-1.5" />
      <Corner className="-bottom-1.5 -left-1.5" />
      <Corner className="-bottom-1.5 -right-1.5" />

      <div className="label absolute bottom-0 left-4 hidden items-center gap-3 text-muted md:flex">
        <span className="text-fg">{routeLabel(pathname)}</span>
      </div>

      <div className="label absolute bottom-0 right-4 hidden items-center gap-5 text-muted md:flex">
        <span>
          scroll <span ref={scroll} className="tabular-nums text-fg">000</span>%
        </span>
        <span className="tabular-nums" ref={clock}>
          --:--:--
        </span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
          system online
        </span>
      </div>
    </div>
  );
}
