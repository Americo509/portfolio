"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-media";

/**
 * Transição de rota com cortina. Intercepta cliques em links internos (antes
 * do next/link, que respeita defaultPrevented), cobre a tela, navega e revela
 * a nova rota. Com reduced motion, a navegação é a padrão.
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const curtain = React.useRef<HTMLDivElement>(null);
  const label = React.useRef<HTMLSpanElement>(null);
  const pending = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (reduce) return;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.hasAttribute("download") || a.dataset.noTransition !== undefined) return;
      if (a.target && a.target !== "_self") return;

      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // âncoras e mesma página: comportamento padrão

      e.preventDefault();
      if (pending.current) return;
      const href = url.pathname + url.search + url.hash;
      pending.current = url.pathname;
      if (label.current) label.current.textContent = url.pathname;

      gsap
        .timeline()
        .set(curtain.current, { autoAlpha: 1, clipPath: "inset(100% 0% 0% 0%)" })
        .to(curtain.current, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.65, ease: "cine" })
        .fromTo(curtain.current!.querySelector("[data-bar]"), { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "cine" }, "<0.15")
        .add(() => router.push(href));

      // Failsafe: se a navegação não concluir, não deixa a cortina presa.
      window.setTimeout(() => {
        if (pending.current !== url.pathname) return;
        pending.current = null;
        gsap.to(curtain.current, { autoAlpha: 0, duration: 0.3 });
      }, 5000);
    };

    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [reduce, router]);

  // Nova rota montada: revela.
  React.useEffect(() => {
    if (!pending.current) return;
    pending.current = null;
    const id = requestAnimationFrame(() => {
      gsap
        .timeline()
        .to(curtain.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.8, ease: "cine", delay: 0.05 })
        .set(curtain.current, { autoAlpha: 0 });
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <>
      {children}
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
