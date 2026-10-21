import { cn } from "@/lib/cn";

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/**
 * Capa de prancheta: usada quando o projeto ainda não tem key art em /public.
 * Determinística por slug (mesma "jogada" sempre para o mesmo projeto).
 */
export function BlueprintCover({ slug, label, className }: { slug: string; label: string; className?: string }) {
  const rand = hash(slug);
  const W = 1600;
  const H = 1000;
  const players = Array.from({ length: 7 }, (_, i) => ({
    x: 260 + (i % 4) * 330 + rand() * 120,
    y: 220 + Math.floor(i / 4) * 360 + rand() * 160
  }));
  const passes = players.slice(0, -1).map((p, i) => [p, players[i + 1]] as const);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full bg-surface", className)}
      role="img"
      aria-label={label}
    >
      <g stroke="rgb(var(--c-fg))" strokeOpacity="0.16" fill="none" strokeWidth="2">
        <rect x="60" y="60" width={W - 120} height={H - 120} />
        <line x1={W / 2} y1="60" x2={W / 2} y2={H - 60} />
        <circle cx={W / 2} cy={H / 2} r="130" />
        <rect x="60" y={H / 2 - 220} width="220" height="440" />
        <rect x={W - 280} y={H / 2 - 220} width="220" height="440" />
      </g>
      <g stroke="rgb(var(--c-fg))" strokeOpacity="0.5" strokeWidth="2.5" strokeDasharray="10 12" fill="none">
        {passes.map(([a, b], i) => (
          <path key={i} d={`M${a.x} ${a.y} Q ${(a.x + b.x) / 2} ${Math.min(a.y, b.y) - 80} ${b.x} ${b.y}`} />
        ))}
      </g>
      {players.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="16" fill="none" stroke="rgb(var(--c-fg))" strokeWidth="3" />
          {i === players.length - 1 ? <circle cx={p.x} cy={p.y} r="9" fill="rgb(var(--c-signal))" /> : null}
        </g>
      ))}
      <text x="96" y={H - 96} fill="rgb(var(--c-muted))" fontFamily="var(--font-jetbrains), monospace" fontSize="26" letterSpacing="4">
        {label.toUpperCase()}
      </text>
    </svg>
  );
}
