"use client";

import * as React from "react";
import { lens } from "./stadium/lens-state";

/**
 * Barras 2.39:1 sobre a cena (docs/plano-awwwards.md, "Lente"): só no túnel, na
 * saída dele e no apito final. A câmera escreve lens.letterbox; aqui o valor vira
 * scaleY a cada quadro, sem re-render do React. Ficam abaixo do conteúdo, que
 * continua legível por cima.
 */
export function Letterbox() {
  const top = React.useRef<HTMLDivElement>(null);
  const bottom = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let raf = 0;
    let last = -1;
    const tick = () => {
      const v = Math.round(lens.letterbox * 1000) / 1000;
      if (v !== last && top.current && bottom.current) {
        last = v;
        top.current.style.transform = bottom.current.style.transform = `scaleY(${v})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <div ref={top} className="letterbox-bar letterbox-bar--top" style={{ transform: "scaleY(0)" }} />
      <div ref={bottom} className="letterbox-bar letterbox-bar--bottom" style={{ transform: "scaleY(0)" }} />
    </>
  );
}
