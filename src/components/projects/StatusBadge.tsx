import { cn } from "@/lib/cn";
import type { Portfolio, Project } from "@/types/portfolio.types";

export function StatusBadge({ project, copy }: { project: Project; copy: Pick<Portfolio["copy"], "status"> }) {
  const live = project.status === "production" || project.status === "operating";
  return (
    <span className="label inline-flex items-center gap-2 text-muted">
      <span className={cn("h-1.5 w-1.5 rounded-full", live ? "animate-pulse bg-signal" : "bg-muted")} />
      {copy.status[project.status]}
    </span>
  );
}
