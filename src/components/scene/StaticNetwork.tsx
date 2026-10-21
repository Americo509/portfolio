import { buildNetwork } from "./network-layout";

const { nodes, edges } = buildNetwork();

// Projeção ortográfica simples dos nós para o fallback estático.
const W = 1600;
const H = 900;
const project = (x: number, y: number) => [W * 0.62 + x * 120, H * 0.5 - y * 120] as const;

/**
 * Fallback visual intencional: usado sem WebGL, com reduced motion e enquanto
 * a cena 3D não carregou. Mostra a mesma rede, parada.
 */
export function StaticNetwork({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="sn-glow" cx="62%" cy="50%" r="55%">
          <stop offset="0%" stopColor="rgb(var(--c-signal))" stopOpacity="0.10" />
          <stop offset="100%" stopColor="rgb(var(--c-signal))" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#sn-glow)" />
      <g stroke="rgb(var(--c-fg))" strokeOpacity="0.14" strokeWidth="1">
        {edges.map(([a, b]) => {
          const [x1, y1] = project(nodes[a].x, nodes[a].y);
          const [x2, y2] = project(nodes[b].x, nodes[b].y);
          return <line key={`${a}-${b}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>
      <g>
        {nodes.map((n, i) => {
          const [cx, cy] = project(n.x, n.y);
          const depth = 0.45 + (n.z + 6) / 16;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={i === 0 ? 7 : n.hub ? 4 : 2.2}
              fill={i === 0 || n.hub ? "rgb(var(--c-signal))" : "rgb(var(--c-fg))"}
              fillOpacity={i === 0 ? 1 : Math.min(0.9, depth)}
            />
          );
        })}
      </g>
    </svg>
  );
}
