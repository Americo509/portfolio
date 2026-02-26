"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Chip } from "@/components/ui/Chip";
import type { Project } from "../types/portfolio.types";
import { motion, useReducedMotion } from "framer-motion";

export function ProjectCard({
  project,
  variant = "normal"
}: {
  project: Project;
  variant?: "normal" | "wide";
}) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={reduce ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative rounded-xl2 border border-borderSubtle bg-paper-2/60 dark:bg-ink-2/50 p-6 sm:p-7 shadow-soft transition will-change-transform",
        "hover:shadow-lift hover:-translate-y-1",
        "focus-within:shadow-lift focus-within:-translate-y-1",
        variant === "wide" && "sm:col-span-2"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-xl2 opacity-0 group-hover:opacity-100 transition",
          "bg-[radial-gradient(800px_240px_at_40%_0%,hsl(217_90%_55%/0.10),transparent_60%)]"
        )}
      />
      <div className="relative">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold tracking-tight">
              <Link
                className="focus-ring"
                href={`/projects/${project.slug}`}
              >
                {project.title}
              </Link>
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-4 dark:text-paper-1/70">
              {project.summary}
            </p>
          </div>
          <Link
            href={`/projects/${project.slug}`}
            className="focus-ring hidden sm:inline-flex text-xs text-ink-4 dark:text-paper-1/60 hover:underline underline-offset-4"
          >
            Ver case →
          </Link>
        </header>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.tags.slice(0, 4).map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2 text-xs text-ink-4 dark:text-paper-1/60">
          {project.stack.slice(0, 6).map((s) => (
            <span key={s} className="rounded-full border border-borderSubtle px-3 py-1.5">
              {s}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
