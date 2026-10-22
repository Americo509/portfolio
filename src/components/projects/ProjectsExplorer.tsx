"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { localeHref, type Locale } from "@/lib/i18n";
import { useFinePointer, useReducedMotion } from "@/lib/use-media";
import { StatusBadge } from "@/components/projects/StatusBadge";
import type { Portfolio, Project } from "@/types/portfolio.types";
import { BaseCover, projectNumber } from "./BaseCover";

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

/**
 * Campanha: índice de todas as partidas como tabela de campeonato. A lógica
 * de busca (sem acento) e filtro por tag é a mesma de sempre.
 */
export function ProjectsExplorer({
  projects,
  tags,
  copy,
  locale
}: {
  projects: Project[];
  tags: string[];
  copy: Pick<Portfolio["copy"], "status" | "projectsPage" | "matchCard">;
  locale: Locale;
}) {
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState<string | null>(null);
  const [hovered, setHovered] = React.useState<Project | null>(null);
  const preview = React.useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const follow = fine && !reduce;
  const pc = copy.projectsPage;

  const filtered = React.useMemo(() => {
    const query = normalize(q.trim());
    return projects.filter((p) => {
      const matchesTag = active ? p.tags.includes(active) : true;
      const hay = normalize([p.title, p.summary, p.tags.join(" "), p.stack.join(" ")].join(" "));
      const matchesQuery = query ? hay.includes(query) : true;
      return matchesTag && matchesQuery;
    });
  }, [projects, q, active]);

  React.useEffect(() => {
    if (!follow || !preview.current) return;
    const el = preview.current;
    const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
    const onMove = (e: PointerEvent) => {
      x(e.clientX + 24);
      y(e.clientY - 100);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [follow]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 items-end gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
        <label className="block">
          <span className="sr-only">{pc.searchLabel}</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={pc.search}
            className="w-full border-b border-fg/30 bg-transparent py-3 text-[clamp(1.2rem,2vw,1.6rem)] placeholder:text-muted/60 focus:border-signal focus:outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label={pc.columns.lineup}>
          {[null, ...tags].map((t) => (
            <button
              key={t ?? "all"}
              type="button"
              aria-pressed={active === t}
              onClick={() => setActive(t)}
              className={cn(
                "label border px-3 py-2 transition-colors",
                active === t ? "border-fg bg-fg text-bg" : "border-fg/25 text-muted hover:border-fg hover:text-fg"
              )}
            >
              {t ?? pc.all}
            </button>
          ))}
        </div>
      </div>

      <div onPointerLeave={() => setHovered(null)}>
        <div className="label hidden grid-cols-[3rem_minmax(0,1.4fr)_minmax(0,1fr)_9rem_minmax(0,1fr)_2rem] gap-4 border-b border-line pb-3 text-muted md:grid">
          <span>#</span>
          <span>{pc.columns.match}</span>
          <span>{pc.columns.competition}</span>
          <span>{pc.columns.status}</span>
          <span>{pc.columns.lineup}</span>
          <span />
        </div>
        <ol>
          {filtered.map((p) => (
            <li key={p.slug} className="border-b border-line">
              <Link
                href={localeHref(locale, `/projects/${p.slug}`)}
                data-cursor={copy.matchCard.open}
                onPointerEnter={() => setHovered(p)}
                onFocus={() => setHovered(p)}
                className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 py-5 md:grid-cols-[3rem_minmax(0,1.4fr)_minmax(0,1fr)_9rem_minmax(0,1fr)_2rem]"
              >
                {/* O número da Campanha, o mesmo da súmula e da capa, filtrado ou não. */}
                <span className="label tabular-nums text-muted">{projectNumber(projects, p.slug)}</span>
                <span>
                  <span className="block text-[clamp(1.25rem,2.4vw,2.1rem)] leading-tight transition-transform duration-500 ease-cine group-hover:translate-x-2">
                    {p.title}
                  </span>
                  <span className="label mt-1 block text-muted">{pc.tiers[p.tier]}</span>
                </span>
                <span aria-hidden="true" className="label text-muted transition-colors group-hover:text-signal-ink md:order-last">
                  ↗
                </span>
                <span className="label col-span-2 col-start-2 text-muted md:col-span-1 md:col-start-auto">{p.competition}</span>
                <span className="col-span-2 col-start-2 md:col-span-1 md:col-start-auto">
                  <StatusBadge project={p} copy={copy} />
                </span>
                <span className="label col-span-2 col-start-2 hidden text-muted md:col-span-1 md:col-start-auto md:block">
                  {p.stack.slice(0, 3).join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      {filtered.length === 0 ? <p className="text-muted">{pc.empty}</p> : null}

      {follow ? (
        <div
          ref={preview}
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-30 h-48 w-80 overflow-hidden border border-line bg-surface transition-opacity duration-300"
          style={{ opacity: hovered?.cover || hovered?.tier === "base" ? 1 : 0 }}
        >
          {projects.map((p) =>
            p.cover ? (
              <Image
                key={p.slug}
                src={p.cover.src}
                alt=""
                fill
                sizes="320px"
                className="object-cover grayscale transition-opacity duration-300"
                style={{ opacity: hovered?.slug === p.slug ? 1 : 0 }}
              />
            ) : p.tier === "base" ? (
              <div
                key={p.slug}
                className="absolute inset-0 transition-opacity duration-300"
                style={{ opacity: hovered?.slug === p.slug ? 1 : 0 }}
              >
                <BaseCover number={projectNumber(projects, p.slug)} label={p.title} />
              </div>
            ) : null
          )}
        </div>
      ) : null}
    </div>
  );
}
