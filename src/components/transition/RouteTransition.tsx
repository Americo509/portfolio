"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { NAVIGATE_EVENT } from "@/lib/navigate";
import { useReducedMotion } from "@/lib/use-media";

/**
 * Faixa diagonal: paralelogramo com bordas inclinadas (SLANT) que varre a tela
 * da esquerda para a direita. As bordas esquerda (l) e direita (r) andam em %
 * da largura; com o mesmo número de pontos o GSAP interpola o polygon().
 */
const SLANT = 22;
const band = (l: number, r: number) => `polygon(${l + SLANT}% 0%, ${r + SLANT}% 0%, ${r}% 100%, ${l}% 100%)`;
const HIDDEN_LEFT = band(-2 * SLANT, -2 * SLANT);
const COVER = band(-2 * SLANT, 100);
const HIDDEN_RIGHT = band(100, 100);

/**
 * Transição de rota com faixa diagonal. Intercepta cliques em links internos
 * (antes do next/link, que respeita defaultPrevented) e o evento gd:navigate;
 * a faixa vermelha entra, a cortina cobre, navega e as duas saem pela direita.
 * Com reduced motion, a navegação é a padrão.
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const curtain = React.useRef<HTMLDivElement>(null);
  const stripe = React.useRef<HTMLDivElement>(null);
  const label = React.useRef<HTMLSpanElement>(null);
  const pending = React.useRef<string | null>(null);

  const go = React.useCallback(
    (href: string) => {
      const url = new URL(href, window.location.href);
      if (reduce || url.pathname === window.location.pathname) {
        router.push(url.pathname + url.search + url.hash);
        return;
      }
      if (pending.current) return;
      pending.current = url.pathname;
      if (label.current) label.current.textContent = url.pathname;

      gsap
        .timeline()
        .set([stripe.current, curtain.current], { autoAlpha: 1, clipPath: HIDDEN_LEFT })
        .to(stripe.current, { clipPath: COVER, duration: 0.6, ease: "cine" })
        .to(curtain.current, { clipPath: COVER, duration: 0.6, ease: "cine" }, "<0.1")
        .fromTo(curtain.current!.querySelector("[data-bar]"), { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "cine" }, "<0.2")
        .add(() => router.push(url.pathname + url.search + url.hash));

      // Failsafe: se a navegação não concluir, não deixa a cortina presa.
      window.setTimeout(() => {
        if (pending.current !== url.pathname) return;
        pending.current = null;
        gsap.to([stripe.current, curtain.current], { autoAlpha: 0, duration: 0.3 });
      }, 5000);
    },
    [reduce, router]
  );

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (reduce) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.hasAttribute("download") || a.dataset.noTransition !== undefined) return;
      if (a.target && a.target !== "_self") return;

      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // âncoras e mesma página: comportamento padrão

      e.preventDefault();
      go(url.href);
    };
    const onNavigate = (e: Event) => go((e as CustomEvent<string>).detail);

    window.addEventListener("click", onClick, true);
    window.addEventListener(NAVIGATE_EVENT, onNavigate);
    return () => {
      window.removeEventListener("click", onClick, true);
      window.removeEventListener(NAVIGATE_EVENT, onNavigate);
    };
  }, [reduce, go]);

  // Nova rota montada: a cortina sai pela direita e a faixa vermelha fecha o movimento.
  React.useEffect(() => {
    if (!pending.current) return;
    pending.current = null;
    const id = requestAnimationFrame(() => {
      gsap
        .timeline({ delay: 0.05 })
        .to(curtain.current, { clipPath: HIDDEN_RIGHT, duration: 0.75, ease: "cine" })
        .to(stripe.current, { clipPath: HIDDEN_RIGHT, duration: 0.75, ease: "cine" }, "<0.08")
        .set([stripe.current, curtain.current], { autoAlpha: 0 });
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <>
      {children}
      <div ref={stripe} aria-hidden="true" className="invisible fixed inset-0 z-[74] bg-signal opacity-0" />
      <div
        ref={curtain}
        aria-hidden="true"
        className="invisible fixed inset-0 z-[75] flex flex-col justify-end bg-surface p-[var(--margin)] opacity-0"
      >
        <div className="flex items-end justify-between gap-6">
          <span className="label text-muted">routing →</span>
          <span ref={label} className="font-display text-section text-fg" />
        </div>
        <div data-bar className="mt-6 h-px origin-left bg-signal" />
      </div>
    </>
  );
}
