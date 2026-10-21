"use client";

import * as React from "react";
import { useApp } from "@/lib/store";

import { RESENHA_KEY as KEY } from "@/lib/inline-scripts";

/** Sincroniza o estado do Modo Resenha com a classe do <html> e o localStorage. */
export function ResenhaRoot() {
  const resenha = useApp((s) => s.resenha);
  const setResenha = useApp((s) => s.setResenha);
  const ready = React.useRef(false);

  React.useEffect(() => {
    setResenha(document.documentElement.classList.contains("resenha"));
    ready.current = true;
  }, [setResenha]);

  React.useEffect(() => {
    if (!ready.current) return;
    document.documentElement.classList.toggle("resenha", resenha);
    try {
      localStorage.setItem(KEY, resenha ? "1" : "0");
    } catch {}
  }, [resenha]);

  return null;
}
