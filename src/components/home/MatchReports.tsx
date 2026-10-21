import Link from "next/link";
import { cn } from "@/lib/cn";
import { FxImage } from "@/components/fx/FxImage";
import { StatusBadge } from "@/components/ProjectCard";
import { BlueprintCover } from "@/components/projects/BlueprintCover";
import type { Portfolio, Project } from "@/types/portfolio.types";

/** Minutos decorativos dos lances: distribuídos pela partida a partir da ordem (não são dados). */
const minute = (i: number, n: number) => `${String(Math.round(((i + 1) * 90) / (n + 1))).padStart(2, "0")}'`;

function MatchCard({ project, index, copy }: { project: Project; index: number; copy: Portfolio["copy"] }) {
  const moments = project.caseStudy.technicalDecisions.slice(0, 3);
  const even = index % 2 === 0;
  return (
    <article
      className={cn(
        "col-span-12 md:col-span-8",
        even ? "md:col-start-1" : "md:col-start-5"
      )}
    >
      <Link href={`/projects/${project.slug}`} className="group block" data-cursor={copy.matchCard.open} aria-label={`${copy.matchCard.open}: ${project.title}`}>
        <div className="label flex items-center justify-between gap-4 text-muted">
          <span>
            <span className="text-fg">#{String(index + 1).padStart(2, "0")}</span> · {copy.matchReport.title}
          </span>
          <StatusBadge project={project} copy={copy} />
        </div>

        <div className="relative mt-3 aspect-[16/10] w-full border border-line">
          {project.cover ? (
            <FxImage src={project.cover.src} alt={project.cover.alt} className="absolute inset-0" />
          ) : (
            <BlueprintCover slug={project.slug} label={`${copy.matchReport.title} · ${project.title}`} />
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[1.1fr_1fr]">
          <div>
            <h3 className="skew-on-scroll font-display text-section leading-[0.85]">{project.title}</h3>
            <p className="label mt-4 text-muted">
              {project.competition} · {project.position}
            </p>
            <p className="mt-4 max-w-[46ch] text-muted">{project.summary}</p>
          </div>
          <div>
            <p className="label text-fg">{copy.matchReport.keyMoments}</p>
            <ol className="mt-3 space-y-2 border-t border-line pt-3">
              {moments.map((m, i) => (
                <li key={m} className="grid grid-cols-[3.2rem_1fr] gap-2 text-sm">
                  <span className="label tabular-nums text-signal-ink">{minute(i, moments.length)}</span>
                  <span className="text-muted">{m}</span>
                </li>
              ))}
            </ol>
            <p className="label mt-5 leading-relaxed text-muted">{project.stack.slice(0, 6).join(" · ")}</p>
            <p className="label mt-6 inline-flex border-b border-fg/40 pb-1 text-fg transition-colors group-hover:border-signal">
              {copy.matchCard.full}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function MatchReports({ projects, copy }: { projects: Project[]; copy: Portfolio["copy"] }) {
  return (
    <div className="grid-editorial gap-y-24 md:gap-y-36">
      {projects.map((p, i) => (
        <MatchCard key={p.slug} project={p} index={i} copy={copy} />
      ))}
    </div>
  );
}
