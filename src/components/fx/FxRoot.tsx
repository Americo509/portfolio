"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useApp } from "@/lib/store";
import { useReducedMotion } from "@/lib/use-media";
import { guessTier, hasWebGL } from "@/lib/webgl";

const ImageFxCanvas = dynamic(() => import("./ImageFxCanvas"), { ssr: false });

/**
 * Liga o canvas de efeitos de imagem só quando faz sentido: depois do
 * preloader, com WebGL, sem reduced motion e fora do tier baixo.
 */
export function FxRoot() {
  const bootDone = useApp((s) => s.bootDone);
  const setFxEnabled = useApp((s) => s.setFxEnabled);
  const reduce = useReducedMotion();
  const [on, setOn] = React.useState(false);

  React.useEffect(() => {
    const enable = bootDone && !reduce && hasWebGL() && guessTier() !== "low";
    setOn(enable);
    setFxEnabled(enable);
  }, [bootDone, reduce, setFxEnabled]);

  return on ? <ImageFxCanvas /> : null;
}
