"use client";

import { cn } from "@/lib/cn";
import { useApp } from "@/lib/store";

/** Convite do pós-jogo: liga o Modo Resenha. */
export function ResenhaInvite({ label, className }: { label: string; className?: string }) {
  const setResenha = useApp((s) => s.setResenha);
  return (
    <button
      type="button"
      onClick={() => setResenha(true)}
      className={cn("label w-fit border-b border-signal pb-1 text-signal-ink transition-colors hover:text-fg", className)}
    >
      {label} →
    </button>
  );
}
