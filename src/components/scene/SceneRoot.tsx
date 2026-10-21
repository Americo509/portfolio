"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { motionState, useApp } from "@/lib/store";
import { useReducedMotion } from "@/lib/use-media";
import { guessTier, hasWebGL, type GpuTier } from "@/lib/webgl";
import { loadScene } from "./load";
import { StaticStadium } from "./StaticStadium";

const Scene = dynamic(loadScene, { ssr: false });

class SceneBoundary extends React.Component<
  { onError: () => void; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function idle(cb: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(cb, { timeout: 1200 });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(cb, 300);
  return () => clearTimeout(id);
}

/**
 * Camada visual fixa atrás do conteúdo. O canvas só é montado depois do
 * preloader e em idle, fora do caminho crítico do LCP. Enquanto isso (ou se
 * WebGL falhar, ou com reduced motion) o fallback em SVG fica visível.
 */
export function SceneRoot() {
  const reduce = useReducedMotion();
  const booted = useApp((s) => s.bootDone);
  const status = useApp((s) => s.sceneStatus);
  const setStatus = useApp((s) => s.setSceneStatus);
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const [tier, setTier] = React.useState<GpuTier | null>(null);

  React.useEffect(() => {
    if (!booted) return;
    if (reduce || !hasWebGL()) {
      setStatus("fallback");
      return;
    }
    return idle(() => {
      setTier(guessTier());
      setStatus("loading");
    });
  }, [booted, reduce, setStatus]);

  React.useEffect(() => {
    const onMove = (e: PointerEvent) => {
      motionState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      motionState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const showCanvas = tier !== null && !reduce && status !== "fallback";

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <StaticStadium
        className={cn("transition-opacity duration-1000", status === "ready" ? "opacity-0" : "opacity-100")}
      />
      {showCanvas ? (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-[1600ms]",
            status === "ready" ? "opacity-100" : "opacity-0"
          )}
        >
          <SceneBoundary onError={() => setStatus("fallback")}>
            <Scene
              tier={tier}
              theme={resolvedTheme === "light" ? "light" : "dark"}
              mode={pathname === "/" ? "hero" : "ambient"}
              onReady={() => setStatus("ready")}
            />
          </SceneBoundary>
        </div>
      ) : null}
    </div>
  );
}
