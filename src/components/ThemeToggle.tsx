"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/cn";

function IconSun(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M5 19l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconMoon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M21 13.2A7.5 7.5 0 0 1 10.8 3 6.8 6.8 0 1 0 21 13.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const current = theme === "system" ? systemTheme : theme;

  return (
    <button
      type="button"
      className={cn(
        "focus-ring inline-flex items-center gap-2 rounded-full border border-borderSubtle bg-paper-2/70 dark:bg-ink-2/70 px-3 py-2 text-sm text-ink-4 dark:text-paper-1/70 hover:bg-paper-3 dark:hover:bg-ink-3 transition",
        className
      )}
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
      aria-label="Alternar tema"
      aria-live="polite"
    >
      <span className="inline-flex h-4 w-4 items-center justify-center">
        {mounted ? (
          current === "dark" ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />
        ) : (
          <span className="h-4 w-4 rounded-full bg-borderSubtle" />
        )}
      </span>
      <span className="hidden sm:inline">{mounted ? (current === "dark" ? "Escuro" : "Claro") : "Tema"}</span>
    </button>
  );
}
