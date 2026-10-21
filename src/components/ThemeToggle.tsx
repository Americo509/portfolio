"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const dark = resolvedTheme !== "light";

  return (
    <button
      type="button"
      className={cn("label inline-flex items-center gap-2 py-2 text-fg", className)}
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      <span className="text-muted">[</span>
      <span className="w-[6.5ch] text-center">{mounted ? (dark ? "dark" : "light") : "theme"}</span>
      <span className="text-muted">]</span>
    </button>
  );
}
