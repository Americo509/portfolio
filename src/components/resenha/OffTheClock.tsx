"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import type { MatchDay, Portfolio, Resenha } from "@/types/portfolio.types";
import { createJukebox } from "./jukebox";

type Copy = Portfolio["copy"]["resenha"];

/** Agora no fuso de São Paulo (a pelada é no Brasil, não importa onde o visitante esteja). */
function nowInSaoPaulo() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { weekday, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

/** Próxima pelada: minutos até o próximo horário (ou "agora", se começou há menos de 90 min). */
export function nextMatch(days: MatchDay[]) {
  const now = nowInSaoPaulo();
  let best: { day: MatchDay; minutes: number } | null = null;
  for (const day of days) {
    const [h, m] = day.time.split(":").map(Number);
    let diff = ((day.weekday - now.weekday + 7) % 7) * 1440 + h * 60 + m - now.minutes;
    if (diff < -90) diff += 7 * 1440;
    if (!best || diff < best.minutes) best = { day, minutes: diff };
  }
  return best;
}

function Countdown({ days, copy }: { days: MatchDay[]; copy: Copy }) {
  const [state, setState] = React.useState<ReturnType<typeof nextMatch>>(null);
  React.useEffect(() => {
    const tick = () => setState(nextMatch(days));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [days]);

  if (!state) return <p className="label text-muted">—</p>;
  const { day, minutes } = state;
  const live = minutes <= 0;
  const d = Math.floor(minutes / 1440);
  const h = Math.floor((minutes % 1440) / 60);
  const m = minutes % 60;
  return (
    <div>
      <p className="label text-muted">
        {copy.nextMatch} · {copy.weekdays[day.weekday]}, {day.time.replace(":00", "h")}
      </p>
      <p className="mt-3 font-display text-[clamp(2.6rem,5vw,4.2rem)] leading-none tabular-nums">
        {live ? (
          <span className="text-signal-ink">{copy.now}</span>
        ) : (
          <>
            <span className="label mr-3 align-middle text-muted">{copy.left}</span>
            {d > 0 ? `${d}d ` : ""}
            {String(h).padStart(2, "0")}h {String(m).padStart(2, "0")}m
          </>
        )}
      </p>
    </div>
  );
}

function Cromo({ card, copy }: { card: Resenha["cards"][number]; copy: Copy }) {
  return (
    <figure className="relative aspect-[3/4] overflow-hidden border border-fg/25 bg-surface">
      {card.src ? (
        <Image src={card.src} alt={card.alt} fill sizes="(max-width: 768px) 50vw, 20vw" className="object-cover grayscale contrast-125" />
      ) : (
        <div
          aria-hidden="true"
          data-n={card.number}
          className="absolute inset-0 flex items-center justify-center font-display text-[clamp(3rem,7vw,6rem)] text-fg/10 before:content-[attr(data-n)]"
        />
      )}
      {/* Cantos a giz, como figurinha técnica. */}
      <span aria-hidden="true" className="absolute left-2 top-2 h-4 w-4 border-l border-t border-fg/60" />
      <span aria-hidden="true" className="absolute right-2 top-2 h-4 w-4 border-r border-t border-fg/60" />
      <span aria-hidden="true" className="absolute bottom-2 left-2 h-4 w-4 border-b border-l border-fg/60" />
      <span aria-hidden="true" className="absolute bottom-2 right-2 h-4 w-4 border-b border-r border-fg/60" />
      <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-bg/90 to-transparent p-3 pt-10">
        <span className="label text-fg">{card.caption}</span>
        <span className="label tabular-nums text-signal-ink">{card.number}</span>
      </figcaption>
      {!card.src ? <span className="label absolute left-3 top-8 text-muted">{copy.photoSoon}</span> : null}
    </figure>
  );
}

/** "Fora do terminal": o lado humano. Aparece na ficha do jogador e no pós-jogo do Modo Resenha. */
export function OffTheClock({ resenha, copy, className }: { resenha: Resenha; copy: Copy; className?: string }) {
  const jukebox = React.useRef<ReturnType<typeof createJukebox> | null>(null);
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => () => jukebox.current?.stop(), []);

  const toggleJukebox = () => {
    jukebox.current ??= createJukebox();
    if (jukebox.current.playing) {
      jukebox.current.stop();
      setPlaying(false);
    } else {
      jukebox.current.start();
      setPlaying(true);
    }
  };

  return (
    <div className={cn("grid-editorial gap-y-12", className)}>
      <div className="col-span-12 md:col-span-6">
        <h3 className="font-display text-section leading-[0.9]">{resenha.title}</h3>
        <p className="mt-6 max-w-[44ch] text-[clamp(1.15rem,1.6vw,1.4rem)] leading-snug">{resenha.intro}</p>
      </div>

      <div className="col-span-12 flex flex-col justify-end gap-6 md:col-span-5 md:col-start-8">
        <Countdown days={resenha.nextMatchDays} copy={copy} />
        <button
          type="button"
          onClick={toggleJukebox}
          aria-pressed={playing}
          className="label inline-flex w-fit items-center gap-3 border border-fg/30 px-5 py-3 text-fg transition-colors hover:border-signal"
        >
          <span aria-hidden="true" className="flex h-3 items-end gap-[2px]">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn("w-[3px] bg-signal", playing ? "animate-pulse" : "")}
                style={{ height: playing ? `${40 + ((i * 37) % 60)}%` : "30%", animationDelay: `${i * 120}ms` }}
              />
            ))}
          </span>
          {copy.jukebox} · {playing ? copy.stop : copy.play}
        </button>
      </div>

      <ul className="col-span-12 grid grid-cols-1 gap-6 border-t border-line pt-8 md:grid-cols-3">
        {resenha.blocks.map((b) => (
          <li key={b.title}>
            <p className="label text-signal-ink">{b.title}</p>
            <p className="mt-2 text-muted">{b.body}</p>
          </li>
        ))}
      </ul>

      <div className="col-span-12 border-t border-line pt-8">
        <p className="label text-muted">
          {resenha.radar.title} · {resenha.radar.question}
        </p>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          {resenha.radar.options.map((o, i) => (
            <React.Fragment key={o}>
              {i > 0 ? <span className="font-accent text-[clamp(1.5rem,3vw,2.5rem)] text-signal-ink">{copy.versus}</span> : null}
              <span className="font-display text-[clamp(2rem,5vw,4.5rem)] leading-none">{o}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="col-span-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        {resenha.cards.map((c) => (
          <Cromo key={c.number} card={c} copy={copy} />
        ))}
      </div>
    </div>
  );
}
