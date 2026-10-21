"use client";

import * as React from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { fxRegistry } from "@/lib/fx";
import { useApp } from "@/lib/store";

/**
 * Imagem com tratamento WebGL (ripple no mouse, RGB shift, curvatura pela
 * velocidade do scroll, reveal com borda de ruído). Sem o canvas de efeitos,
 * é só uma next/image em P&B que ganha cor no hover.
 */
export function FxImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 66vw",
  priority
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const fxOn = useApp((s) => s.fxEnabled);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || !fxOn) return;
    const item = fxRegistry.add(el, src);

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      item.mouse.x = (e.clientX - r.left) / r.width;
      item.mouse.y = 1 - (e.clientY - r.top) / r.height;
      item.hoverTarget = 1;
    };
    const onLeave = () => (item.hoverTarget = 0);
    // O efeito também reage ao hover do card inteiro (o link que envolve a imagem).
    const host = el.closest("a") ?? el;
    host.addEventListener("pointermove", onMove as EventListener);
    host.addEventListener("pointerleave", onLeave);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(item, { reveal: 1, duration: 1.8, ease: "cine" });
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      host.removeEventListener("pointermove", onMove as EventListener);
      host.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(item);
      delete el.dataset.fx;
      fxRegistry.remove(item.id);
    };
  }, [fxOn, src]);

  return (
    // O posicionamento vem de quem usa (ex.: "absolute inset-0"); a next/image usa fill.
    <div ref={ref} className={cn("fx-image overflow-hidden bg-surface", className ?? "relative")}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover grayscale-[0.85] transition duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
      />
    </div>
  );
}
