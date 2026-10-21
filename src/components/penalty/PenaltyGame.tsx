"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { useApp } from "@/lib/store";
import { useReducedMotion } from "@/lib/use-media";
import { hasWebGL } from "@/lib/webgl";
import { useTheme } from "next-themes";
import {
  createKeeper,
  gustavoScores,
  isMuralha,
  newShootout,
  readRate,
  resolveShot,
  updateStreak,
  winner,
  zoneCenter,
  type Outcome,
  type Shootout
} from "@/lib/penalty/engine";
import { createPenaltyAudio } from "./audio";
import type { PenaltySceneHandle } from "./PenaltyScene";
import { localeHref, type Locale } from "@/lib/i18n";
import type { Portfolio } from "@/types/portfolio.types";

const PenaltyScene = dynamic(() => import("./PenaltyScene"), { ssr: false });

type Copy = Portfolio["copy"]["penalty"];
type Phase = "aiming" | "charging" | "flying" | "opponent" | "over";
type Kick = { shotZone: number | null; keeperZone: number };

const BEST_KEY = "gd:penalty-best";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function Dots({ results, label }: { results: boolean[]; label: string }) {
  const slots = Math.max(5, results.length);
  return (
    <div className="flex items-center gap-3">
      <span className="label w-20 text-fg">{label}</span>
      <ol className="flex gap-1.5" aria-label={label}>
        {Array.from({ length: slots }, (_, i) => {
          const r = results[i];
          return (
            <li
              key={i}
              className={cn(
                "h-3 w-3 rounded-full border",
                r === undefined ? "border-fg/40" : r ? "border-fg bg-fg" : "border-signal bg-transparent"
              )}
            >
              <span className="sr-only">{r === undefined ? "—" : r ? "gol" : "perdeu"}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Disputa de pênaltis. mode="single": uma cobrança (teaser da home).
 * mode="full": 5 cobranças + morte súbita, com a vez do "Gustavo" simulada.
 * Sem WebGL, o gol vira uma grade 3 × 3 de botões (mesma lógica).
 */
export function PenaltyGame({
  copy,
  mode = "full",
  locale = "pt",
  className
}: {
  copy: Copy;
  mode?: "single" | "full";
  locale?: Locale;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const setGameActive = useApp((s) => s.setGameActive);
  const resenha = useApp((s) => s.resenha);
  const root = React.useRef<HTMLDivElement>(null);
  const scene = React.useRef<PenaltySceneHandle | null>(null);
  const aim = React.useRef({ x: 0, y: 1.2, visible: true });
  const aimZone = React.useRef(4);
  const power = React.useRef({ v: 0 });
  const powerTween = React.useRef<gsap.core.Tween | null>(null);
  const downX = React.useRef(0);
  const keeper = React.useRef(createKeeper());
  const audio = React.useRef<ReturnType<typeof createPenaltyAudio> | null>(null);
  const powerBar = React.useRef<HTMLDivElement>(null);

  const [webgl, setWebgl] = React.useState<boolean | null>(null);
  const [visible, setVisible] = React.useState(false);
  const [phase, setPhase] = React.useState<Phase>("aiming");
  const [shootout, setShootout] = React.useState<Shootout>(newShootout);
  const [kicks, setKicks] = React.useState<Kick[]>([]);
  const [message, setMessage] = React.useState("");
  const [sound, setSound] = React.useState(false);
  const [best, setBest] = React.useState<string | null>(null);

  const muralha = isMuralha(shootout);
  const result = winner(shootout);

  React.useEffect(() => {
    setWebgl(hasWebGL());
    audio.current = createPenaltyAudio();
    try {
      setBest(localStorage.getItem(BEST_KEY));
    } catch {}
  }, []);

  // Só monta o canvas quando o jogo entra na tela; enquanto isso, pausa o estádio.
  React.useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  React.useEffect(() => {
    setGameActive(visible && !!webgl);
    return () => setGameActive(false);
  }, [visible, webgl, setGameActive]);

  const announce = (text: string) => setMessage(text);

  const renderPower = () => {
    if (powerBar.current) powerBar.current.style.transform = `scaleX(${power.current.v})`;
  };

  const startCharge = () => {
    if (phase !== "aiming") return;
    setPhase("charging");
    power.current.v = 0;
    powerTween.current?.kill();
    powerTween.current = gsap.to(power.current, { v: 1, duration: 1.15, ease: "none", onUpdate: renderPower });
  };

  const finishShootout = (s: Shootout) => {
    setPhase("over");
    const w = winner(s);
    const you = s.you.filter(Boolean).length;
    const gus = s.gustavo.filter(Boolean).length;
    if (mode === "full" && w) {
      try {
        const prev = localStorage.getItem(BEST_KEY);
        const [py, pg] = prev ? prev.split("-").map(Number) : [-1, 99];
        if (you - gus > py - pg) {
          localStorage.setItem(BEST_KEY, `${you}-${gus}`);
          setBest(`${you}-${gus}`);
        }
      } catch {}
      audio.current?.whistle();
      announce(`${w === "you" ? copy.win : copy.lose} ${copy.you} ${you} × ${gus} ${copy.opponent}.`);
    }
  };

  const shoot = async (shotPower: number, curve: number, x: number, y: number) => {
    powerTween.current?.kill();
    setPhase("flying");
    const keeperZone = keeper.current.pick();
    const res = resolveShot({ x, y, power: shotPower, curve }, keeperZone, muralha);
    audio.current?.kick();
    if (scene.current) {
      await scene.current.kick({ target: res.target, outcome: res.outcome, keeperZone, power: shotPower, curve });
    } else {
      await sleep(reduce ? 150 : 500);
    }
    const sfx: Record<Outcome, () => void> = {
      goal: () => {
        audio.current?.net();
        audio.current?.crowd(1);
      },
      save: () => audio.current?.crowd(0.6),
      post: () => audio.current?.post(),
      miss: () => audio.current?.crowd(0.3)
    };
    sfx[res.outcome]();
    keeper.current.record(res.shotZone);

    const k = [...kicks, { shotZone: res.shotZone, keeperZone }];
    setKicks(k);
    let s: Shootout = { ...updateStreak(shootout, res.outcome), you: [...shootout.you, res.outcome === "goal"] };
    setShootout(s);
    const becameMuralha = !isMuralha(shootout) && isMuralha(s);
    announce(`${copy.results[res.outcome]}${becameMuralha ? ` ${copy.muralha}.` : ""}`);
    power.current.v = 0;
    renderPower();

    if (mode === "single") {
      await sleep(900);
      finishShootout(s);
      return;
    }
    if (winner(s)) {
      await sleep(900);
      finishShootout(s);
      return;
    }

    // Vez do Gustavo (simulada).
    await sleep(reduce ? 400 : 1100);
    scene.current?.reset();
    setPhase("opponent");
    announce(copy.opponentKick);
    await sleep(reduce ? 400 : 1100);
    const g = gustavoScores();
    if (g) audio.current?.net();
    s = { ...s, gustavo: [...s.gustavo, g] };
    setShootout(s);
    const sudden = s.you.length >= 5 && s.gustavo.length >= 5;
    announce(`${g ? copy.opponentResults.goal : copy.opponentResults.miss}${sudden && !winner(s) ? ` ${copy.suddenDeath}.` : ""}`);
    await sleep(reduce ? 400 : 1000);
    if (winner(s)) {
      finishShootout(s);
      return;
    }
    setPhase("aiming");
  };

  const releaseCharge = (curve: number) => {
    if (phase !== "charging") return;
    void shoot(Math.max(0.15, power.current.v), curve, aim.current.x, aim.current.y);
  };

  const restart = () => {
    keeper.current = createKeeper();
    setShootout(newShootout());
    setKicks([]);
    setMessage("");
    scene.current?.reset();
    setPhase("aiming");
  };

  // ---------- Controles: ponteiro (mouse/toque) ----------
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || phase !== "aiming") return;
    downX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    startCharge();
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const w = root.current?.getBoundingClientRect().width ?? 1000;
    const curve = Math.max(-1, Math.min(1, ((e.clientX - downX.current) / w) * 4));
    releaseCharge(curve);
  };

  // ---------- Controles: teclado ----------
  const setAimZone = (z: number) => {
    aimZone.current = z;
    const c = zoneCenter(z);
    aim.current.x = c.x;
    aim.current.y = c.y;
    announce(copy.zones[z]);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    const z = aimZone.current;
    const col = z % 3;
    const row = Math.floor(z / 3);
    const moves: Record<string, () => number> = {
      ArrowLeft: () => row * 3 + Math.max(0, col - 1),
      ArrowRight: () => row * 3 + Math.min(2, col + 1),
      ArrowUp: () => Math.min(2, row + 1) * 3 + col,
      ArrowDown: () => Math.max(0, row - 1) * 3 + col
    };
    if (moves[e.key] && phase === "aiming") {
      e.preventDefault();
      setAimZone(moves[e.key]());
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!e.repeat) startCharge();
    }
  };
  const onKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      releaseCharge(0);
    }
  };

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    audio.current?.setEnabled(next);
  };

  const you = shootout.you.filter(Boolean).length;
  const gus = shootout.gustavo.filter(Boolean).length;
  const rate = Math.round(readRate(kicks) * 100);
  const use3d = webgl === true && visible;

  return (
    <div ref={root} className={cn("relative", className)}>
      {/* Placar */}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-4">
        <div className="space-y-2">
          <Dots results={shootout.you} label={copy.you} />
          {mode === "full" ? <Dots results={shootout.gustavo} label={copy.opponent} /> : null}
        </div>
        <div className="flex items-center gap-6">
          {mode === "full" ? (
            <p className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-none tabular-nums" aria-label={`${copy.you} ${you}, ${copy.opponent} ${gus}`}>
              {you} <span className="text-muted">×</span> {gus}
            </p>
          ) : null}
          <button type="button" onClick={toggleSound} className="label text-muted hover:text-fg" aria-pressed={sound}>
            [ {sound ? copy.sound : copy.soundOff} ]
          </button>
        </div>
      </div>

      {/* Campo */}
      <div
        tabIndex={0}
        role="application"
        aria-label={`${copy.title}. ${copy.howTo.keyboard}`}
        aria-describedby="penalty-status"
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onPointerDown={use3d ? onPointerDown : undefined}
        onPointerUp={use3d ? onPointerUp : undefined}
        data-cursor={phase === "aiming" ? copy.aimHint : undefined}
        className="relative mt-4 aspect-square w-full select-none overflow-hidden border border-line bg-surface outline-offset-4 sm:aspect-[16/10] md:aspect-[16/8]"
      >
        {use3d ? (
          <PenaltyScene
            control={scene}
            aim={aim}
            onAim={(x, y) => {
              aim.current.x = x;
              aim.current.y = y;
            }}
            muralha={muralha}
            reduce={reduce}
            dark={resenha || resolvedTheme !== "light"}
          />
        ) : webgl === false ? (
          // Sem WebGL: o gol vira uma grade de 9 cantos clicáveis.
          <div className="absolute inset-[12%_16%_18%] grid grid-cols-3 grid-rows-3 border-x-4 border-t-4 border-fg">
            {[6, 7, 8, 3, 4, 5, 0, 1, 2].map((z) => (
              <button
                key={z}
                type="button"
                disabled={phase !== "aiming"}
                onClick={() => {
                  const c = zoneCenter(z);
                  void shoot(0.7, 0, c.x, c.y);
                }}
                className="label border border-dashed border-fg/20 text-muted transition-colors hover:bg-fg/10 hover:text-fg disabled:opacity-40"
              >
                {copy.zones[z]}
              </button>
            ))}
          </div>
        ) : null}

        {muralha ? (
          <p className="label pointer-events-none absolute left-4 top-4 bg-signal px-3 py-2 text-[#F5F5F0]" aria-hidden="true">
            {copy.muralha}
          </p>
        ) : null}

        {/* Barra de força */}
        {use3d ? (
          <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center gap-3" aria-hidden="true">
            <span className="label text-muted">{copy.power}</span>
            <div className="h-1.5 flex-1 overflow-hidden bg-fg/15">
              <div ref={powerBar} className="h-full origin-left scale-x-0 bg-fg">
                <div className="ml-[93%] h-full w-[7%] bg-signal" />
              </div>
            </div>
          </div>
        ) : null}

        {phase === "over" ? (
          <div className="absolute inset-0 flex flex-col items-start justify-end gap-3 bg-bg/80 p-4 backdrop-blur-sm sm:gap-4 sm:p-6 md:p-10">
            {mode === "full" && result ? (
              <>
                <p className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-none">{result === "you" ? copy.win : copy.lose}</p>
                <p className="max-w-[56ch] text-muted">{copy.readRate.replace("{pct}", String(rate))}</p>
              </>
            ) : (
              <p className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-none">{message}</p>
            )}
            <div className="flex flex-wrap gap-3">
              <Link href={localeHref(locale, "/contact")} className="label inline-flex h-12 items-center bg-fg px-6 text-bg">
                {copy.cta}
              </Link>
              <button type="button" onClick={restart} className="label inline-flex h-12 items-center border border-fg/30 px-6 text-fg hover:bg-fg hover:text-bg">
                {copy.again}
              </button>
              {mode === "single" ? (
                <Link href={localeHref(locale, "/penalti")} className="label inline-flex h-12 items-center px-2 text-fg underline underline-offset-4">
                  {copy.fullGame}
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <p id="penalty-status" role="status" aria-live="polite" className="label min-h-[1.4em] text-fg">
          {message || (webgl === false ? copy.fallbackHint : "")}
        </p>
        <div className="max-w-[60ch] space-y-1 text-sm text-muted">
          {webgl ? <p>{copy.howTo.pointer}</p> : null}
          <p>{copy.howTo.keyboard}</p>
          {mode === "full" && best ? (
            <p className="label">
              {copy.best}: {best.replace("-", " × ")}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
