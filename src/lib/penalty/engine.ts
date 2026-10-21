/**
 * Lógica pura da disputa de pênaltis (sem React, sem three). Tudo determinístico
 * dado um gerador aleatório, para poder ser testado.
 *
 * Coordenadas no plano do gol (metros): x ∈ [-3.66, 3.66] (traves), y ∈ [0, 2.44]
 * (travessão). O gol é dividido em 3 × 3 zonas.
 */

export type Rng = () => number;

export const GOAL = { halfWidth: 3.66, height: 2.44, post: 0.12 };

export type Outcome = "goal" | "save" | "post" | "miss";
export type Shot = { x: number; y: number; power: number; curve: number };
export type ShotResult = {
  outcome: Outcome;
  /** Zona (0-8) onde a bola foi, ou null se foi para fora. */
  shotZone: number | null;
  keeperZone: number;
  /** Onde a bola efetivamente chega no plano do gol (já com chute por cima, etc.). */
  target: { x: number; y: number };
};

export function mulberry32(seed: number): Rng {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Zona 0-8 (linha × 3 + coluna; linha 0 = rasteira, coluna 0 = esquerda de quem bate). */
export function zoneOf(x: number, y: number): number | null {
  if (Math.abs(x) > GOAL.halfWidth || y < 0 || y > GOAL.height) return null;
  const col = Math.min(2, Math.floor(((x + GOAL.halfWidth) / (GOAL.halfWidth * 2)) * 3));
  const row = Math.min(2, Math.floor((y / GOAL.height) * 3));
  return row * 3 + col;
}

export function zoneCenter(zone: number) {
  const col = zone % 3;
  const row = Math.floor(zone / 3);
  return {
    x: -GOAL.halfWidth + (GOAL.halfWidth * 2 * (col + 0.5)) / 3,
    y: (GOAL.height * (row + 0.5)) / 3
  };
}

/**
 * Goleiro com IA honesta: decide ANTES de ver a bola, com base na frequência
 * das zonas onde o batedor já chutou (90% leitura do histórico, 10% aleatório).
 */
export function createKeeper(rng: Rng = Math.random) {
  const history = new Array(9).fill(0) as number[];
  let total = 0;
  return {
    history,
    pick(): number {
      if (total === 0 || rng() < 0.1) return Math.floor(rng() * 9);
      // Suavização de Laplace: zonas nunca escolhidas ainda têm alguma chance.
      const weights = history.map((h) => h + 0.25);
      const sum = weights.reduce((a, b) => a + b, 0);
      let r = rng() * sum;
      for (let i = 0; i < 9; i++) {
        r -= weights[i];
        if (r <= 0) return i;
      }
      return 8;
    },
    record(zone: number | null) {
      if (zone === null) return;
      history[zone] += 1;
      total += 1;
    }
  };
}

/** Probabilidade de defesa dado onde a bola foi e onde o goleiro pulou. */
export function saveChance(shotZone: number, keeperZone: number, power: number, muralha: boolean) {
  const dc = Math.abs((shotZone % 3) - (keeperZone % 3));
  const dr = Math.abs(Math.floor(shotZone / 3) - Math.floor(keeperZone / 3));
  const reach = muralha ? 0.22 : 0;
  let p = 0;
  if (dc === 0 && dr === 0) p = 0.92 - power * 0.3;
  else if (dc === 0 && dr === 1) p = 0.42 - power * 0.2 + reach;
  else if (dc === 1 && dr === 0) p = 0.18 - power * 0.1 + reach;
  else if (dc === 1 && dr === 1) p = 0.05 + reach * 0.5;
  return Math.max(0, Math.min(0.97, p));
}

export function resolveShot(shot: Shot, keeperZone: number, muralha: boolean, rng: Rng = Math.random): ShotResult {
  // Força demais isola por cima do travessão; o efeito desloca a bola na horizontal.
  const over = Math.max(0, shot.power - 0.93) * 18;
  const target = { x: shot.x + shot.curve * 0.6, y: shot.y + over };

  const nearPost =
    (Math.abs(Math.abs(target.x) - GOAL.halfWidth) < GOAL.post && target.y <= GOAL.height + GOAL.post) ||
    (Math.abs(target.y - GOAL.height) < GOAL.post && Math.abs(target.x) <= GOAL.halfWidth + GOAL.post);
  if (nearPost) return { outcome: "post", shotZone: null, keeperZone, target };

  const shotZone = zoneOf(target.x, target.y);
  if (shotZone === null) return { outcome: "miss", shotZone: null, keeperZone, target };

  const saved = rng() < saveChance(shotZone, keeperZone, shot.power, muralha);
  return { outcome: saved ? "save" : "goal", shotZone, keeperZone, target };
}

/** Cobrança simulada do "Gustavo" (78% de conversão). */
export const gustavoScores = (rng: Rng = Math.random) => rng() < 0.78;

export type Shootout = {
  you: boolean[];
  gustavo: boolean[];
  /** Defesas seguidas do goleiro (para o Modo Muralha 2012). */
  streak: number;
};

export const newShootout = (): Shootout => ({ you: [], gustavo: [], streak: 0 });

const goals = (a: boolean[]) => a.filter(Boolean).length;

/** Vencedor da disputa, ou null se ainda não decidiu. Regras oficiais: 5 cobranças e morte súbita. */
export function winner(s: Shootout): "you" | "gustavo" | null {
  const y = goals(s.you);
  const g = goals(s.gustavo);
  const n = Math.max(s.you.length, s.gustavo.length);
  if (n <= 5) {
    const yLeft = 5 - s.you.length;
    const gLeft = 5 - s.gustavo.length;
    if (y + yLeft < g) return "gustavo";
    if (g + gLeft < y) return "you";
    return null;
  }
  // Morte súbita: decide quando os dois já bateram o mesmo número de vezes.
  if (s.you.length === s.gustavo.length && y !== g) return y > g ? "you" : "gustavo";
  return null;
}

/** De quem é a vez: você abre e as cobranças alternam. */
export const nextTurn = (s: Shootout): "you" | "gustavo" => (s.you.length > s.gustavo.length ? "gustavo" : "you");

/** Muralha liga depois de 2 defesas seguidas e desliga no primeiro gol. */
export function updateStreak(s: Shootout, outcome: Outcome): Shootout {
  const streak = outcome === "save" ? s.streak + 1 : 0;
  return { ...s, streak };
}

export const isMuralha = (s: Shootout) => s.streak >= 2;

/** Quanto o goleiro "leu" o batedor: fração de cobranças em que pulou na zona certa. */
export function readRate(kicks: { shotZone: number | null; keeperZone: number }[]) {
  const onTarget = kicks.filter((k) => k.shotZone !== null);
  if (onTarget.length === 0) return 0;
  return onTarget.filter((k) => k.shotZone === k.keeperZone).length / onTarget.length;
}
