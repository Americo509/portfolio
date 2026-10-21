"use client";

import * as React from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-media";

/**
 * Title card de capítulo: numeração "02 / 06", kicker em mono e o título em
 * display gigante, com as palavras se separando na horizontal conforme o scroll.
 */
export function ChapterTitle({
  number,
  total = "07",
  title,
  kicker,
  id
}: {
  number: string;
  total?: string;
  title: string;
  kicker: string;
  id?: string;
}) {
  const scope = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const words = title.split(" ");

  useGSAP(
    () => {
      if (reduce) return;
      const els = gsap.utils.toArray<HTMLElement>("[data-word]");
      // As palavras se afastam (nunca se cruzam): a primeira vai para a esquerda, as outras para a direita.
      els.forEach((el, i) => {
        gsap.fromTo(
          el,
          { x: 0 },
          {
            x: () => (i === 0 ? -1 : 1) * window.innerWidth * 0.04 * (i === 0 ? 1 : i),
            ease: "none",
            scrollTrigger: { trigger: scope.current, start: "top 75%", end: "bottom top", scrub: true, invalidateOnRefresh: true }
          }
        );
      });
      gsap.from("[data-rule]", {
        scaleX: 0,
        duration: 1.2,
        ease: "cine",
        scrollTrigger: { trigger: scope.current, start: "top 80%" }
      });
    },
    { scope, dependencies: [reduce] }
  );

  return (
    <div ref={scope} className="relative overflow-x-clip py-10">
      <div className="grid-editorial items-end gap-y-3">
        <p className="label col-span-12 flex items-center gap-4 text-muted md:col-span-3">
          <span className="text-fg">
            {number} / {total}
          </span>
          <span data-rule className="h-px flex-1 origin-left bg-line" />
        </p>
        <p className="label col-span-12 text-muted md:col-span-6 md:col-start-7 md:text-right">{kicker}</p>
      </div>
      <h2
        id={id}
        className="mt-4 flex flex-wrap gap-x-[0.22em] px-[var(--margin)] pt-[0.08em] font-display text-[clamp(3.5rem,11vw,12rem)] leading-[0.9]"
      >
        {words.map((w, i) => (
          <span key={i} data-word className="inline-block will-change-transform">
            {w}
          </span>
        ))}
      </h2>
    </div>
  );
}
