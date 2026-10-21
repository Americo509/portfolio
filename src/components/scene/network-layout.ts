/**
 * Layout determinístico dos nós da rede. Usado tanto pela cena 3D quanto pelo
 * fallback em SVG, para que os dois mostrem "o mesmo sistema".
 */
export type NetNode = { x: number; y: number; z: number; r: number; hub: boolean };

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildNetwork(count = 42, seed = 509) {
  const rand = mulberry32(seed);
  const nodes: NetNode[] = [{ x: 0, y: 0, z: 0, r: 1, hub: true }];

  for (let i = 1; i < count; i++) {
    // Distribuição em casca elipsoidal, achatada em y (mais cinematográfica em 16:9).
    const u = rand() * 2 - 1;
    const theta = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const radius = 2.2 + rand() * 3.6;
    nodes.push({
      x: s * Math.cos(theta) * radius * 1.45,
      y: u * radius * 0.7,
      z: s * Math.sin(theta) * radius,
      r: 0.35 + rand() * 0.5,
      hub: rand() > 0.82
    });
  }

  // Cada nó conecta aos 2 vizinhos mais próximos; hubs conectam também ao núcleo.
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  const add = (a: number, b: number) => {
    const k = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (a === b || seen.has(k)) return;
    seen.add(k);
    edges.push([a, b]);
  };

  nodes.forEach((n, i) => {
    const near = nodes
      .map((m, j) => ({ j, d: (m.x - n.x) ** 2 + (m.y - n.y) ** 2 + (m.z - n.z) ** 2 }))
      .filter((o) => o.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2);
    near.forEach((o) => add(i, o.j));
    if (n.hub) add(i, 0);
  });

  return { nodes, edges };
}
