"use client";

import * as React from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-media";
import type { Portfolio } from "@/types/portfolio.types";

/**
 * Preleção: as 5 fases do método como jogada ensaiada. Um traço de giz desce
 * pela coluna acompanhando o scroll, e cada fase entra palavra por palavra.
 */
export function TeamTalk({ method, principles }: { method: Portfolio["method"]; principles: Portfolio["principles"] }) {
  const scope = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      if (reduce) return;
      gsap.from("[data-chalk-line]", {
        drawSVG: "0%",
        ease: "none",
        scrollTrigger: { trigger: "[data-steps]", start: "top 70%", end: "bottom 60%", scrub: true }
      });
      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((step) => {
        const body = step.querySelector("[data-body]") as HTMLElement;
        const split = SplitText.create(body, { type: "words", aria: "none" });
        gsap
          .timeline({ scrollTrigger: { trigger: step, start: "top 78%" } })
          .from(step.querySelector("[data-num]"), { yPercent: 100, autoAlpha: 0, duration: 0.9, ease: "expo.out" })
          .from(step.querySelector("[data-dot]"), { scale: 0, duration: 0.5, ease: "back.out(3)" }, "<")
          // Giz sendo escrito: desfoque e deslocamento, sem opacidade (o contraste nunca cai).
          .from(split.words, { filter: "blur(6px)", yPercent: 35, duration: 0.6, stagger: 0.02, ease: "power2.out", clearProps: "filter" }, "<0.15");
      });
    },
    { scope, dependencies: [reduce] }
  );

  return (
    <div ref={scope} className="grid-editorial gap-y-12">
      <div className="col-span-12 md:col-span-4">
        <div className="md:sticky md:top-32">
          <p className="max-w-[34ch] text-[clamp(1.15rem,1.6vw,1.4rem)] leading-snug">{method.intro}</p>
          <div className="mt-10 border-t border-line pt-6">
            <p className="label text-fg">{principles.title}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{principles.body}</p>
          </div>
        </div>
      </div>

      <ol data-steps className="relative col-span-12 md:col-span-7 md:col-start-6">
        <svg
          aria-hidden="true"
          className="absolute left-[0.6rem] top-0 h-full w-6 overflow-visible"
          viewBox="0 0 24 1000"
          preserveAspectRatio="none"
        >
          <path
            data-chalk-line
            d="M12 0 C 6 120, 18 220, 12 340 S 6 560, 12 680 S 18 880, 12 1000"
            fill="none"
            stroke="rgb(var(--c-fg))"
            strokeOpacity="0.45"
            strokeWidth="2"
          />
        </svg>
        {method.steps.map((step) => (
          <li key={step.number} data-step className="relative grid grid-cols-[3rem_1fr] gap-x-4 pb-16 last:pb-0 md:grid-cols-[3rem_9rem_1fr]">
            <span data-dot aria-hidden="true" className="relative z-10 mt-3 h-3 w-3 justify-self-center rounded-full border-2 border-fg bg-bg" />
            <span className="line-mask block">
              <span data-num className="block font-display text-[clamp(3.5rem,6vw,5.5rem)] leading-[0.8]">
                {step.number}
              </span>
            </span>
            <div className="col-start-2 md:col-start-3">
              <h3 className="text-[clamp(1.4rem,2.2vw,2rem)] leading-tight">
                {step.name} <span className="font-accent text-signal-ink">— {step.verb}</span>
              </h3>
              <p data-body className="mt-3 max-w-[52ch] text-muted">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
