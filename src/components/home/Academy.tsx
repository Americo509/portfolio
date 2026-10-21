"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import { useFinePointer, useReducedMotion } from "@/lib/use-media";
import { localeHref, type Locale } from "@/lib/i18n";
import type { Project } from "@/types/portfolio.types";

/** Categorias de base: índice compacto dos projetos de estudo, com a capa seguindo o cursor. */
export function Academy({ projects, openLabel, locale }: { projects: Project[]; openLabel: string; locale: Locale }) {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const preview = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState<Project | null>(null);
  const follow = fine && !reduce;

  React.useEffect(() => {
    if (!follow || !preview.current) return;
    const el = preview.current;
    const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
    const onMove = (e: PointerEvent) => {
      x(e.clientX + 24);
      y(e.clientY - 90);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [follow]);

  return (
    <div className="grid-editorial">
      <ul className="col-span-12 border-t border-line" onPointerLeave={() => setActive(null)}>
        {projects.map((p, i) => (
          <li key={p.slug} className="border-b border-line">
            <Link
              href={localeHref(locale, `/projects/${p.slug}`)}
              data-cursor={openLabel}
              onPointerEnter={() => setActive(p)}
              onFocus={() => setActive(p)}
              onBlur={() => setActive(null)}
              className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-5 transition-colors hover:text-fg md:grid-cols-[3rem_1.2fr_1fr_1fr_auto]"
            >
              <span className="label tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[clamp(1.3rem,2.4vw,2.2rem)] leading-tight transition-transform duration-500 ease-cine group-hover:translate-x-2">
                {p.title}
              </span>
              <span className="label hidden text-muted md:block">{p.competition}</span>
              <span className="label hidden text-muted md:block">{p.stack.slice(0, 3).join(" · ")}</span>
              <span aria-hidden="true" className="label text-muted transition-colors group-hover:text-signal-ink">
                ↗
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {follow ? (
        <div
          ref={preview}
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-30 h-44 w-72 overflow-hidden border border-line bg-surface transition-opacity duration-300"
          style={{ opacity: active?.cover ? 1 : 0 }}
        >
          {projects.map((p) =>
            p.cover ? (
              <Image
                key={p.slug}
                src={p.cover.src}
                alt=""
                fill
                sizes="288px"
                className="object-cover object-top grayscale transition-opacity duration-300"
                style={{ opacity: active?.slug === p.slug ? 1 : 0 }}
              />
            ) : null
          )}
        </div>
      ) : null}
    </div>
  );
}
