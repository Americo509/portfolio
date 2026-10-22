import { cn } from "@/lib/cn";
import type { Project } from "@/types/portfolio.types";

/** Número do projeto na Campanha (o mesmo do cabeçalho da súmula: #07, #11…). */
export function projectNumber(projects: Project[], slug: string) {
  return String(projects.findIndex((p) => p.slug === slug) + 1).padStart(2, "0");
}

/**
 * Capa única das Categorias de base (docs/plano-awwwards.md, revisão da etapa 1): o
 * número do projeto em cartaz, sobre o campo a giz e a faixa diagonal. Substitui os
 * prints dos projetos de estudo (alguns mostravam marca de terceiros) e deixa a
 * seção coesa; base compacta não precisa de screenshot.
 */
export function BaseCover({ number, label, className }: { number: string; label: string; className?: string }) {
  const W = 1600;
  const H = 1000;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full bg-surface", className)}
      role="img"
      aria-label={label}
    >
      <g stroke="rgb(var(--c-fg))" strokeOpacity="0.12" fill="none" strokeWidth="2">
        <rect x="60" y="60" width={W - 120} height={H - 120} />
        <line x1={W / 2} y1="60" x2={W / 2} y2={H - 60} />
        <circle cx={W / 2} cy={H / 2} r="130" />
      </g>
      {/* Faixa diagonal alvinegra, o elemento recorrente da identidade. */}
      <polygon points={`0,${H * 0.72} ${W},${H * 0.28} ${W},${H * 0.4} 0,${H * 0.84}`} fill="rgb(var(--c-fg))" fillOpacity="0.9" />
      <text
        x={W / 2}
        y={H / 2 + 190}
        textAnchor="middle"
        fill="rgb(var(--c-fg))"
        stroke="rgb(var(--c-bg))"
        strokeWidth="10"
        paintOrder="stroke"
        fontFamily="var(--font-archivo), sans-serif"
        fontWeight="800"
        fontSize="560"
        style={{ fontStretch: "62%" }}
      >
        #{number}
      </text>
      <text x="96" y={H - 96} fill="rgb(var(--c-muted))" fontFamily="var(--font-jetbrains), monospace" fontSize="26" letterSpacing="4">
        {label.toUpperCase()}
      </text>
    </svg>
  );
}
