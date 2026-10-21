"use client";

import * as React from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { motionState, useApp } from "@/lib/store";
import { useReducedMotion } from "@/lib/use-media";

/**
 * Liga a única instância do Lenis ao ticker do GSAP e publica a "física" do
 * scroll (velocidade suavizada e progresso) para a cena 3D, o HUD e o CSS.
 */
function LenisBridge() {
  const lenis = useLenis();
  const booted = useApp((s) => s.booted);
  const pathname = usePathname();

  React.useEffect(() => {
    if (!lenis) return;

    const root = document.documentElement;
    let lastCss = 0;

    const tick = (time: number) => {
      lenis.raf(time * 1000);

      motionState.velocity = lenis.velocity;
      const target = gsap.utils.clamp(-1, 1, lenis.velocity / 40);
      motionState.velocityNorm += (target - motionState.velocityNorm) * 0.12;
      motionState.progress = lenis.limit > 0 ? lenis.scroll / lenis.limit : 0;

      const v = Math.round(motionState.velocityNorm * 1000) / 1000;
      if (v !== lastCss) {
        root.style.setProperty("--scroll-v", String(v));
        lastCss = v;
      }
    };

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(tick);
    };
  }, [lenis]);

  // Trava o scroll enquanto o preloader está na tela.
  React.useEffect(() => {
    if (!lenis) return;
    if (booted) lenis.start();
    else lenis.stop();
  }, [lenis, booted]);

  // Nova rota: começa do topo e recalcula os gatilhos.
  React.useEffect(() => {
    if (!lenis) return;
    lenis.scrollTo(0, { immediate: true, force: true });
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [lenis, pathname]);

  return null;
}

/** Sem Lenis: só mantém o progresso atualizado para o HUD. */
function NativeScrollBridge() {
  React.useEffect(() => {
    const onScroll = () => {
      const limit = document.documentElement.scrollHeight - window.innerHeight;
      motionState.progress = limit > 0 ? window.scrollY / limit : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return null;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <>
        <NativeScrollBridge />
        {children}
      </>
    );
  }

  return (
    <ReactLenis root options={{ autoRaf: false, lerp: 0.085, smoothWheel: true }}>
      <LenisBridge />
      {children}
    </ReactLenis>
  );
}
