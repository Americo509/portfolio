"use client";

import * as React from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMediaQuery, useReducedMotion } from "@/lib/use-media";
import type { TimelineItem } from "@/types/portfolio.types";

/**
 * Histórico de clubes: no desktop, a seção fica pinada e a linha do tempo
 * corre na horizontal com o scroll; no mobile (e com reduced motion), é uma
 * lista vertical comum.
 */
export function CareerTimeline({ items, title }: { items: TimelineItem[]; title: string }) {
  const scope = React.useRef<HTMLDivElement>(null);
  const track = React.useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const wide = useMediaQuery("(min-width: 1024px)");
  const horizontal = wide && !reduce;

  useGSAP(
    () => {
      if (!horizontal || !track.current || !scope.current) return;
      const distance = () => track.current!.scrollWidth - scope.current!.clientWidth;
      gsap.to(track.current, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: scope.current,
          start: "top top+=96",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true
        }
      });
    },
    { scope, dependencies: [horizontal], revertOnUpdate: true }
  );

  return (
    <div ref={scope} className="overflow-hidden py-6">
      <p className="label px-[var(--margin)] text-fg">{title}</p>
      <ol
        ref={track}
        className={horizontal ? "mt-8 flex w-max gap-[var(--gutter)] px-[var(--margin)]" : "mt-8 space-y-10 px-[var(--margin)]"}
      >
        {items.map((t) => (
          <li
            key={`${t.year}-${t.title}`}
            className={horizontal ? "w-[min(34rem,40vw)] shrink-0 border-t border-line pt-6" : "border-t border-line pt-6"}
          >
            <p className="font-display text-[clamp(3.5rem,7vw,6.5rem)] leading-none text-fg/90">{t.year}</p>
            <h3 className="mt-4 text-[clamp(1.2rem,1.8vw,1.5rem)] leading-tight">{t.title}</h3>
            <p className="mt-3 max-w-[48ch] text-muted">{t.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
