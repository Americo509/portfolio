"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { motion, useReducedMotion } from "framer-motion";

export function Chip({
  children,
  active,
  onClick,
  className,
  asButton = false
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  asButton?: boolean;
}) {
  const reduce = useReducedMotion();
  const Comp: any = asButton ? "button" : "span";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "focus-ring inline-flex items-center rounded-full border px-3 py-1.5 text-xs tracking-tight transition",
        active
          ? "border-transparent bg-accent-soft text-ink-1 dark:text-paper-1"
          : "border-borderSubtle bg-paper-2/70 text-ink-4 dark:bg-ink-2/70 dark:text-paper-1/70",
        asButton && "hover:bg-paper-3 dark:hover:bg-ink-3 cursor-pointer",
        className
      )}
      type={asButton ? "button" : undefined}
      aria-pressed={asButton ? !!active : undefined}
    >
      <motion.span
        initial={false}
        animate={
          reduce
            ? {}
            : {
                opacity: 1
              }
        }
        whileHover={reduce ? {} : { y: -1 }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
      >
        {children}
      </motion.span>
    </Comp>
  );
}
