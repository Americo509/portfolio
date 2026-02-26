import { cn } from "@/lib/cn";

export function SectionHeader({
  eyebrow,
  title,
  description,
  className
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      {eyebrow ? (
        <p className="text-xs font-medium tracking-[0.18em] uppercase text-ink-4 dark:text-paper-1/60">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-ink-4 dark:text-paper-1/70 leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}
