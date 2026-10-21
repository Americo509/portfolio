"use client";

import * as React from "react";
import { gsap } from "@/lib/gsap";
import { useFinePointer, useReducedMotion } from "@/lib/use-media";

const INTERACTIVE = "a, button, [role='button'], [data-cursor], label, summary";

/**
 * Cursor customizado: ponto (segue 1:1) + anel (com atraso). Elementos com
 * data-cursor="Texto" mostram o texto dentro do anel. Desligado em touch e
 * com reduced motion.
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const enabled = fine && !reduce;
  const dot = React.useRef<HTMLDivElement>(null);
  const ring = React.useRef<HTMLDivElement>(null);
  const [label, setLabel] = React.useState("");

  React.useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");

    const dx = gsap.quickTo(dot.current, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3" });
    let shown = false;

    const onMove = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.set([dot.current, ring.current], { x: e.clientX, y: e.clientY });
        gsap.to([dot.current, ring.current], { autoAlpha: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };

    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest?.(INTERACTIVE) as HTMLElement | null;
      const text = target?.dataset.cursor ?? "";
      setLabel(text);
      if (ring.current) ring.current.dataset.state = text ? "label" : target ? "hover" : "";
      gsap.to(ring.current, { scale: target ? (text ? 2.6 : 1.7) : 1, duration: 0.35, ease: "snap" });
      gsap.to(dot.current, { scale: target ? 0 : 1, duration: 0.25, ease: "snap" });
    };

    const onLeave = () => {
      shown = false;
      gsap.to([dot.current, ring.current], { autoAlpha: 0, duration: 0.2 });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[90]">
      <div
        ref={ring}
        className="invisible absolute -left-5 -top-5 flex h-10 w-10 items-center justify-center rounded-full border border-fg/50 opacity-0 transition-colors duration-300 data-[state=hover]:border-signal data-[state=label]:border-signal data-[state=label]:bg-signal"
      >
        <span className="label scale-[0.4] whitespace-nowrap font-semibold text-[#07080A]">{label}</span>
      </div>
      <div ref={dot} className="invisible absolute -left-[3px] -top-[3px] h-1.5 w-1.5 rounded-full bg-signal opacity-0" />
    </div>
  );
}
