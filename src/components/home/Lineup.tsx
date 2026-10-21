"use client";

import * as React from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { useMediaQuery, useReducedMotion } from "@/lib/use-media";
import type { Lineup as LineupData, Portfolio } from "@/types/portfolio.types";

// Prancheta em coordenadas de um campo horizontal 1000 × 640 (defesa à esquerda).
const W = 1000;
const H = 640;
const SPOTS: Record<number, [number, number]> = {
  1: [70, 320],
  2: [235, 100],
  3: [215, 245],
  4: [215, 395],
  6: [235, 540],
  5: [410, 320],
  8: [535, 185],
  10: [535, 455],
  7: [780, 110],
  9: [840, 320],
  11: [780, 530]
};

/** O caminho de uma requisição: goleiro → zaga → meio → ataque. */
const FLOW: [number, number][] = [
  [1, 4],
  [4, 5],
  [5, 10],
  [10, 9]
];
const SUPPORT: [number, number][] = [
  [3, 8],
  [8, 7],
  [6, 11],
  [2, 3]
];

const PITCH_LINES = [
  "M20 20 H980 V620 H20 Z",
  "M500 20 V620",
  "M20 142 H171 V498 H20",
  "M980 142 H829 V498 H980",
  "M20 240 H70 V400 H20",
  "M980 240 H930 V400 H980",
  "M171 252.8 A84 84 0 0 1 171 387.2",
  "M829 252.8 A84 84 0 0 0 829 387.2"
];

function curve(a: [number, number], b: [number, number]) {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  // Curva leve, como seta de prancheta.
  const nx = -(b[1] - a[1]) * 0.18;
  const ny = (b[0] - a[0]) * 0.18;
  return `M${a[0]} ${a[1]} Q ${mx + nx} ${my + ny} ${b[0]} ${b[1]}`;
}

export function Lineup({
  lineup,
  copy
}: {
  lineup: LineupData;
  copy: Portfolio["copy"]["lineup"];
}) {
  const scope = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const vertical = useMediaQuery("(max-width: 767px)");
  const players = React.useMemo(
    () => lineup.sectors.flatMap((s) => s.players.map((p) => ({ ...p, sector: s }))),
    [lineup]
  );
  const [selected, setSelected] = React.useState<number>(8);
  const current = players.find((p) => p.number === selected) ?? players[0];

  // No mobile o campo fica em pé (ataque para cima); os rótulos continuam retos.
  const map = React.useCallback(
    ([x, y]: [number, number]): [number, number] => (vertical ? [y, W - x] : [x, y]),
    [vertical]
  );
  const vw = vertical ? H : W;
  const vh = vertical ? W : H;

  useGSAP(
    () => {
      if (reduce) return;
      // fromTo com valores finais explícitos: a orientação do campo muda depois da
      // hidratação (mobile) e a animação é recriada do zero sem herdar estado parcial.
      const tl = gsap.timeline({ scrollTrigger: { trigger: scope.current, start: "top 70%" } });
      tl.fromTo("[data-chalk]", { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.4, ease: "power2.inOut", stagger: 0.06 })
        .fromTo("[data-player]", { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(2)", stagger: 0.05 }, "-=0.6")
        .fromTo("[data-pass]", { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.7, ease: "power2.out", stagger: 0.12 }, "-=0.2")
        .fromTo("[data-flow-label]", { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.1 }, "-=0.4");

      // Um "pacote" (a requisição) percorre o fluxo inteiro, em loop.
      const pulse = gsap.timeline({ repeat: -1, repeatDelay: 0.6, delay: 2.2 });
      gsap.utils.toArray<SVGPathElement>("[data-flow]").forEach((path) => {
        pulse.to("[data-pulse]", {
          motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
          duration: 0.7,
          ease: "power1.inOut"
        });
      });
      pulse.set("[data-pulse]", { autoAlpha: 0 }).set("[data-pulse]", { autoAlpha: 1 }, "+=0.6");
    },
    { scope, dependencies: [reduce, vertical], revertOnUpdate: true }
  );

  return (
    <div ref={scope} className="grid-editorial gap-y-10">
      <div className="col-span-12 lg:col-span-8">
        <div
          className="relative w-full border border-line bg-bg/85 backdrop-blur-[2px] md:bg-bg/70"
          style={{ aspectRatio: `${vw} / ${vh}` }}
        >
          <svg viewBox={`0 0 ${vw} ${vh}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <filter id="chalk" x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="1977" result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" />
              </filter>
            </defs>
            <g
              filter="url(#chalk)"
              fill="none"
              stroke="rgb(var(--c-fg))"
              strokeOpacity="0.5"
              strokeWidth="2"
              transform={vertical ? `translate(0 ${W}) rotate(-90)` : undefined}
            >
              {PITCH_LINES.map((d) => (
                <path key={d} d={d} data-chalk />
              ))}
              <circle cx="500" cy="320" r="84" data-chalk />
              <circle cx="120" cy="320" r="2.5" fill="rgb(var(--c-fg))" />
              <circle cx="880" cy="320" r="2.5" fill="rgb(var(--c-fg))" />
            </g>

            <g fill="none" strokeLinecap="round" filter="url(#chalk)">
              {SUPPORT.map(([a, b]) => (
                <path
                  key={`${a}-${b}`}
                  d={curve(map(SPOTS[a]), map(SPOTS[b]))}
                  data-pass
                  stroke="rgb(var(--c-fg))"
                  strokeOpacity="0.3"
                  strokeWidth="1.6"
                  strokeDasharray="6 9"
                />
              ))}
              {FLOW.map(([a, b]) => (
                <path
                  key={`${a}-${b}`}
                  d={curve(map(SPOTS[a]), map(SPOTS[b]))}
                  data-pass
                  data-flow
                  stroke="rgb(var(--c-fg))"
                  strokeOpacity="0.75"
                  strokeWidth="2"
                />
              ))}
            </g>

            {FLOW.map(([a, b], i) => {
              const [x1, y1] = map(SPOTS[a]);
              const [x2, y2] = map(SPOTS[b]);
              return (
                <text
                  key={i}
                  data-flow-label
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 18}
                  textAnchor="middle"
                  fill="rgb(var(--c-muted))"
                  fontFamily="var(--font-jetbrains), monospace"
                  fontSize="15"
                  letterSpacing="2"
                >
                  {copy.flow[i].toUpperCase()}
                </text>
              );
            })}

            {reduce ? null : <circle data-pulse r="6" fill="rgb(var(--c-signal))" cx={map(SPOTS[1])[0]} cy={map(SPOTS[1])[1]} />}
          </svg>

          {players.map((p) => {
            const [x, y] = map(SPOTS[p.number]);
            const active = p.number === selected;
            return (
              <button
                key={p.number}
                type="button"
                data-player
                data-cursor={p.position}
                aria-pressed={active}
                aria-label={`${String(p.number).padStart(2, "0")} — ${p.position} — ${p.role}`}
                onClick={() => setSelected(p.number)}
                onMouseEnter={() => setSelected(p.number)}
                className={cn(
                  "label absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 transition-colors duration-300 sm:h-11 sm:w-11",
                  active ? "border-fg bg-fg text-bg" : "border-fg/70 bg-bg text-fg hover:border-fg"
                )}
                style={{ left: `${(x / vw) * 100}%`, top: `${(y / vh) * 100}%` }}
              >
                {String(p.number).padStart(2, "0")}
                {p.number === 8 ? (
                  <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-signal" />
                ) : null}
              </button>
            );
          })}

          <p className="label absolute bottom-3 left-3 text-muted">
            {copy.formationLabel} {lineup.formation}
          </p>
        </div>
        <p className="label mt-3 text-muted">{copy.hint}</p>
      </div>

      <aside className="col-span-12 lg:col-span-4" aria-live="polite">
        <div key={current.number} className="border-t border-line pt-6 motion-safe:animate-[fade-up_0.45s_ease-out]">
          <p className="label text-muted">
            {copy.sectorLabel}: {current.sector.label} · {current.sector.subtitle}
          </p>
          <p className="mt-4 font-display text-[clamp(5rem,10vw,9rem)] leading-[0.8]">
            #{String(current.number).padStart(2, "0")}
          </p>
          <p className="mt-4 text-[clamp(1.25rem,1.8vw,1.6rem)] leading-tight">
            {current.position} <span className="font-accent text-signal-ink">— {current.role}</span>
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {current.items.map((item) => (
              <li key={item} className="label border border-line px-3 py-2 text-fg">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 space-y-5 border-t border-line pt-6">
          {lineup.sectors.map((s) => (
            <div key={s.key} className="flex items-baseline justify-between gap-4">
              <p className="label text-fg">
                {s.label} <span className="text-muted">· {s.subtitle}</span>
              </p>
              <p className="label tabular-nums text-muted">
                {s.players.map((p) => String(p.number).padStart(2, "0")).join(" ")}
              </p>
            </div>
          ))}
          <div className="pt-2">
            <p className="label text-muted">{lineup.bench.label}</p>
            <p className="mt-2 text-sm text-muted">{lineup.bench.items.join(" · ")}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
