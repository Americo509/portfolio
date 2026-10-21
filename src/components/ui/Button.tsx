"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Magnetic } from "@/components/ui/Magnetic";

type Variant = "primary" | "secondary" | "ghost";

const styles: Record<Variant, string> = {
  // Off-white sobre preto; o vermelho do sinalizador entra como barra no hover
  // (texto pequeno sobre vermelho não passa em contraste AA).
  primary:
    "relative overflow-hidden bg-fg text-bg after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-signal after:transition-transform after:duration-500 after:ease-cine after:content-[''] hover:after:scale-x-100",
  secondary: "border border-fg/25 text-fg hover:border-fg hover:bg-fg hover:text-bg",
  ghost: "text-fg underline decoration-fg/30 underline-offset-[6px] hover:decoration-signal"
};

export function Button({
  as = "button",
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: {
  as?: "button" | "link";
  href?: string;
  variant?: Variant;
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "label inline-flex items-center justify-center gap-3 transition-colors duration-300 ease-snap disabled:opacity-50 disabled:pointer-events-none";
  const sizing = variant === "ghost" ? "py-2" : size === "sm" ? "h-10 px-4" : "h-12 px-6 sm:h-14 sm:px-7";
  const cls = cn(base, sizing, styles[variant], className);

  const el =
    as === "link" && href ? (
      <Link href={href} className={cls}>
        {children}
      </Link>
    ) : (
      <button className={cls} {...props}>
        {children}
      </button>
    );

  return variant === "ghost" ? el : <Magnetic>{el}</Magnetic>;
}
