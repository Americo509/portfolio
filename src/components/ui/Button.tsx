"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Magnetic } from "@/components/ui/Magnetic";

type Variant = "primary" | "secondary" | "ghost";

const styles: Record<Variant, string> = {
  primary: "bg-signal text-[#07080A] hover:bg-fg hover:text-bg",
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
