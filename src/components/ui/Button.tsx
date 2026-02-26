"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { motion } from "framer-motion";

type Variant = "primary" | "secondary" | "ghost";

const styles: Record<Variant, string> = {
  primary:
    "bg-ink-1 text-paper-1 dark:bg-paper-1 dark:text-ink-1 shadow-soft hover:shadow-lift",
  secondary:
    "bg-paper-2 text-ink-1 dark:bg-ink-2 dark:text-paper-1 border border-borderSubtle hover:bg-paper-3 dark:hover:bg-ink-3",
  ghost:
    "bg-transparent text-ink-1 dark:text-paper-1 hover:bg-paper-2/70 dark:hover:bg-ink-2/60"
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
    "focus-ring inline-flex items-center justify-center gap-2 rounded-xl2 px-5 py-3 font-medium tracking-tight transition will-change-transform";
  const sizing = size === "sm" ? "text-sm px-4 py-2.5" : "text-[15px]";
  const cls = cn(base, sizing, styles[variant], className);

  const inner = (
    <motion.span
      className="inline-flex items-center gap-2"
      whileHover={{ y: -1 }}
      whileTap={{ y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      {children}
    </motion.span>
  );

  if (as === "link" && href) {
    return (
      <Link href={href} className={cls} aria-label={typeof children === "string" ? children : undefined}>
        {inner}
      </Link>
    );
  }

  return (
    <button className={cls} {...props}>
      {inner}
    </button>
  );
}
