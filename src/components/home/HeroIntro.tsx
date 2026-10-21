"use client";

import * as React from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useApp } from "@/lib/store";

/**
 * Entrada do hero sincronizada com a abertura do preloader. Só prepara o texto
 * se o preloader estiver cobrindo a tela; caso contrário o hero já chega
 * pronto no HTML. O parágrafo (elemento de LCP) nunca fica transparente.
 */
export function HeroIntro({ children, className }: { children: React.ReactNode; className?: string }) {
  const scope = React.useRef<HTMLDivElement>(null);
  const booted = useApp((s) => s.booted);
  const covered = React.useRef<boolean | null>(null);

  useGSAP(
    () => {
      if (covered.current === null) {
        covered.current = document.documentElement.dataset.boot === "1";
        if (covered.current) {
          gsap.set("[data-line]", { yPercent: 110 });
          // Só desloca (sem opacidade): o texto é pintado sob o obturador e já conta como LCP.
          gsap.set("[data-fade]", { y: 24 });
          gsap.set("[data-band]", { scaleX: 0 });
        }
      }
      if (!booted || !covered.current) return;
      covered.current = false;
      gsap
        .timeline({ delay: 0.25 })
        .to("[data-line]", { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.09 })
        .to("[data-fade]", { y: 0, duration: 0.9, ease: "expo.out", stagger: 0.06 }, "<0.35")
        .to("[data-band]", { scaleX: 1, duration: 1.4, ease: "cine", stagger: 0.12 }, "<0.1");
    },
    { scope, dependencies: [booted] }
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
