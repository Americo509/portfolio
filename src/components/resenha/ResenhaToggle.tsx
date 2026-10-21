"use client";

import { cn } from "@/lib/cn";
import { useApp } from "@/lib/store";

/** Chave física "Expediente ●━━○ Resenha" (manual, salva no navegador). */
export function ResenhaToggle({ work, pub, label, className }: { work: string; pub: string; label: string; className?: string }) {
  const resenha = useApp((s) => s.resenha);
  const setResenha = useApp((s) => s.setResenha);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={resenha}
      aria-label={label}
      onClick={() => setResenha(!resenha)}
      className={cn("label group inline-flex items-center gap-2 whitespace-nowrap py-2", className)}
    >
      <span className={cn("transition-colors", resenha ? "text-muted" : "text-fg")}>{work}</span>
      <span className="relative inline-flex h-3.5 w-8 items-center rounded-full border border-fg/40">
        <span
          className={cn(
            "absolute h-2 w-2 rounded-full transition-all duration-500 ease-cine",
            resenha ? "left-[1.1rem] bg-signal" : "left-[0.2rem] bg-fg"
          )}
        />
      </span>
      <span className={cn("transition-colors", resenha ? "text-signal-ink" : "text-muted")}>{pub}</span>
    </button>
  );
}
