"use client";

import * as React from "react";
import type { Project } from "../../types/portfolio.types";
import { ProjectCard } from "@/components/ProjectCard";
import { Chip } from "@/components/ui/Chip";

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export function ProjectsExplorer({
  projects,
  tags
}: {
  projects: Project[];
  tags: string[];
}) {
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    const query = normalize(q.trim());
    return projects.filter((p) => {
      const matchesTag = active ? p.tags.includes(active) : true;
      const hay = normalize([p.title, p.summary, p.tags.join(" "), p.stack.join(" ")].join(" "));
      const matchesQuery = query ? hay.includes(query) : true;
      return matchesTag && matchesQuery;
    });
  }, [projects, q, active]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 items-start">
        <label className="block">
          <span className="sr-only">Buscar projetos</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título, stack ou tag…"
            className="focus-ring w-full rounded-xl2 border border-borderSubtle bg-paper-2/70 dark:bg-ink-2/60 px-4 py-3 text-sm placeholder:text-ink-4/60 dark:placeholder:text-paper-1/40"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <Chip asButton active={!active} onClick={() => setActive(null)}>
            Todos
          </Chip>
          {tags.map((t) => (
            <Chip key={t} asButton active={active === t} onClick={() => setActive(t)}>
              {t}
            </Chip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {filtered.map((p) => (
          <ProjectCard key={p.slug} project={p} variant="normal" />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-4 dark:text-paper-1/70">
          Nenhum projeto encontrado. Tente remover filtros ou ajustar a busca.
        </p>
      ) : null}
    </div>
  );
}
