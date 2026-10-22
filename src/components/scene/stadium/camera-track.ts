import * as THREE from "three";
import type { ChapterKey } from "@/lib/store";

/**
 * Plano-sequência da home na linguagem de transmissão de TV (docs/plano-awwwards.md,
 * "A linguagem: transmissão de TV"). Cada capítulo tem dois keyframes (entrada e
 * saída); a câmera percorre uma spline contínua por todos eles, dirigida pelo
 * scroll, em vez de saltar entre presets. Há uma trilha para desktop e outra para
 * celular em retrato, com enquadramentos verticais próprios.
 *
 * Campos da lente: focus/range em metros (profundidade de campo, só no tier alto),
 * bokeh de 0 a ~4, letterbox de 0 a 1 (barras 2.39:1).
 */
export type Shot = {
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
  dim: number;
  fog: number;
  focus: number;
  range: number;
  bokeh: number;
  letterbox: number;
};

type ChapterShots = Record<ChapterKey, [Shot, Shot]>;

const shot = (s: Partial<Shot> & Pick<Shot, "pos" | "look" | "fov">): Shot => ({
  dim: 0,
  fog: 1,
  focus: 110,
  range: 90,
  bokeh: 0,
  letterbox: 0,
  ...s
});

/** Ordem dos capítulos na home: o progresso global é índice + progresso no capítulo. */
export const CHAPTER_ORDER: ChapterKey[] = ["hero", "lineup", "matches", "method", "academy", "penalties", "final"];

/**
 * Onde cada keyframe cai dentro do capítulo. O hero já começa ativo em ~0,55
 * (a seção ocupa a primeira tela inteira e o gatilho fica a 55% da altura).
 */
const AT: Record<ChapterKey, [number, number]> = {
  hero: [0.55, 0.95],
  lineup: [0.15, 0.85],
  matches: [0.15, 0.85],
  method: [0.15, 0.85],
  academy: [0.15, 0.85],
  penalties: [0.15, 0.85],
  final: [0.1, 0.9]
};

const DESKTOP: ChapterShots = {
  // 01 Entrada em campo: do gramado, a torcida norte sob o telão e o arco; empurra devagar.
  hero: [
    shot({ pos: [-10, 3.4, 52], look: [8, 9, -40], fov: 42 }),
    shot({ pos: [-6, 3, 44], look: [6, 9.5, -45], fov: 40 })
  ],
  // 02 Escalação: câmera tática (spidercam), o gramado vira a prancheta.
  lineup: [
    // Quase a pino: x da câmera igual ao do alvo, senão o quadro gira; a spidercam desliza em z.
    shot({ pos: [0, 66, 40], look: [0, 0, -4], fov: 44, dim: 0.35, fog: 0.2, focus: 75, range: 80 }),
    shot({ pos: [0, 70, 30], look: [0, 0, -10], fov: 42, dim: 0.35, fog: 0.2, focus: 75, range: 80 })
  ],
  // 03 Jogos históricos: replay, travelling baixo pela linha de fundo.
  matches: [
    shot({ pos: [-36, 6.5, 22], look: [18, 6, -40], fov: 38, dim: 0.72, fog: 0.8, focus: 60, range: 50, bokeh: 0.6 }),
    shot({ pos: [10, 6.5, 22], look: [42, 6, -40], fov: 38, dim: 0.72, fog: 0.8, focus: 60, range: 50, bokeh: 0.6 })
  ],
  // 04 Preleção: close rasteiro no círculo central; o foco vem para perto e o estádio desfoca.
  method: [
    shot({ pos: [0, 1.6, 22], look: [0, 3, -30], fov: 32, dim: 0.8, focus: 4, range: 3, bokeh: 3.5 }),
    shot({ pos: [0, 1.4, 14], look: [0, 3.5, -30], fov: 30, dim: 0.8, focus: 4, range: 3, bokeh: 3.5 })
  ],
  // 05 Categorias de base: câmera de trilho na lateral, travelling mais rápido.
  academy: [
    shot({ pos: [40, 4, 34], look: [2, 3, 22], fov: 38, dim: 0.84, focus: 14, range: 10, bokeh: 1.5 }),
    shot({ pos: [40, 4, -34], look: [2, 3, -46], fov: 38, dim: 0.84, focus: 14, range: 10, bokeh: 1.5 })
  ],
  // 06 Disputa de pênaltis: atrás do batedor (a cena pausa quando o jogo está ativo).
  penalties: [
    shot({ pos: [0, 2.2, 38], look: [0, 1.5, 52.5], fov: 38, dim: 0.85 }),
    shot({ pos: [0, 2, 40], look: [0, 1.4, 52.5], fov: 38, dim: 0.85 })
  ],
  // 07 Apito final: plano geral; os setores apagam e sobram os sinalizadores. A
  // torcida fica no terço direito e o fundo escurece: o título e o CTA, à esquerda,
  // não podem disputar contraste com o vermelho dos sinalizadores.
  final: [
    shot({ pos: [-28, 16, 46], look: [-30, 8, -66], fov: 40, dim: 0.42, focus: 120, range: 60, bokeh: 0.8, letterbox: 1 }),
    shot({ pos: [-18, 12, 38], look: [-34, 8, -68], fov: 36, dim: 0.42, focus: 115, range: 50, bokeh: 0.8, letterbox: 1 })
  ]
};

/** Retrato: FOV vertical maior e câmera centrada, para o arco e a torcida caberem em pé. */
const MOBILE: ChapterShots = {
  hero: [
    shot({ pos: [0, 4, 60], look: [0, 11, -40], fov: 62 }),
    shot({ pos: [0, 3.6, 52], look: [0, 11.5, -45], fov: 60 })
  ],
  lineup: [
    shot({ pos: [0, 92, 10], look: [0, 0, -2], fov: 60, dim: 0.35, fog: 0.2, focus: 95, range: 90 }),
    shot({ pos: [0, 96, 4], look: [0, 0, -6], fov: 58, dim: 0.35, fog: 0.2, focus: 95, range: 90 })
  ],
  matches: [
    shot({ pos: [-20, 8, 30], look: [8, 7, -40], fov: 56, dim: 0.72, fog: 0.8, focus: 60, range: 50, bokeh: 0.6 }),
    shot({ pos: [6, 8, 30], look: [24, 7, -40], fov: 56, dim: 0.72, fog: 0.8, focus: 60, range: 50, bokeh: 0.6 })
  ],
  method: [
    shot({ pos: [0, 1.7, 22], look: [0, 4, -30], fov: 50, dim: 0.8, focus: 4, range: 3, bokeh: 3.5 }),
    shot({ pos: [0, 1.5, 15], look: [0, 4.5, -30], fov: 48, dim: 0.8, focus: 4, range: 3, bokeh: 3.5 })
  ],
  academy: [
    shot({ pos: [36, 5, 30], look: [4, 4, 18], fov: 56, dim: 0.84, focus: 14, range: 10, bokeh: 1.5 }),
    shot({ pos: [36, 5, -30], look: [4, 4, -42], fov: 56, dim: 0.84, focus: 14, range: 10, bokeh: 1.5 })
  ],
  penalties: [
    shot({ pos: [0, 2.4, 36], look: [0, 1.6, 52.5], fov: 55, dim: 0.85 }),
    shot({ pos: [0, 2.2, 38], look: [0, 1.5, 52.5], fov: 55, dim: 0.85 })
  ],
  final: [
    shot({ pos: [0, 14, 54], look: [0, 9, -66], fov: 58, dim: 0.42, focus: 120, range: 60, bokeh: 0.8, letterbox: 1 }),
    shot({ pos: [0, 11, 46], look: [-4, 9, -68], fov: 54, dim: 0.42, focus: 115, range: 50, bokeh: 0.8, letterbox: 1 })
  ]
};

/** Páginas internas: um quadro fixo, escurecido, atrás do conteúdo. */
export const AMBIENT = {
  desktop: shot({ pos: [-10, 3.4, 56], look: [10, 9, -40], fov: 42, dim: 0.82 }),
  mobile: shot({ pos: [0, 4, 60], look: [0, 11, -40], fov: 62, dim: 0.82 })
};

/**
 * Saída do túnel: dolly zoom de cima da cobertura sul (tele, longe) até a borda
 * da cobertura (grande-angular, perto), com a torcida norte do mesmo tamanho na
 * tela; depois a descida até o primeiro keyframe do hero.
 */
export const INTRO = {
  subject: new THREE.Vector3(0, 8, -72),
  from: { pos: new THREE.Vector3(52, 74, 130), fov: 28 },
  mid: { pos: new THREE.Vector3(34, 40, 62) },
  fromMobile: { pos: new THREE.Vector3(18, 80, 150), fov: 40 },
  midMobile: { pos: new THREE.Vector3(10, 44, 76) },
  /** Segundos: dolly zoom, depois a descida. */
  dolly: 1.6,
  descent: 2.2
};

type Key = { at: number; shot: Shot };

function buildKeys(shots: ChapterShots): Key[] {
  return CHAPTER_ORDER.flatMap((c, i) => [
    { at: i + AT[c][0], shot: shots[c][0] },
    { at: i + AT[c][1], shot: shots[c][1] }
  ]);
}

export const TRACKS = { desktop: buildKeys(DESKTOP), mobile: buildKeys(MOBILE) };

const v = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];

function catmull(out: THREE.Vector3, p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, t: number) {
  const t2 = t * t;
  const t3 = t2 * t;
  return out.set(
    0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    0.5 * (2 * p1.z + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3)
  );
}

const ease = (t: number) => t * t * (3 - 2 * t);

/** Avalia a trilha no progresso global g (índice do capítulo + progresso dentro dele). */
export function sampleTrack(keys: Key[], g: number, out: { pos: THREE.Vector3; look: THREE.Vector3; lens: Omit<Shot, "pos" | "look"> }) {
  const last = keys.length - 1;
  const x = THREE.MathUtils.clamp(g, keys[0].at, keys[last].at);
  let i = 0;
  while (i < last - 1 && x > keys[i + 1].at) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const t = (x - a.at) / Math.max(1e-6, b.at - a.at);
  const k0 = keys[Math.max(0, i - 1)].shot;
  const k3 = keys[Math.min(last, i + 2)].shot;
  catmull(out.pos, v[0].set(...k0.pos), v[1].set(...a.shot.pos), v[2].set(...b.shot.pos), v[3].set(...k3.pos), t);
  catmull(out.look, v[0].set(...k0.look), v[1].set(...a.shot.look), v[2].set(...b.shot.look), v[3].set(...k3.look), t);
  const e = ease(t);
  const L = out.lens;
  L.fov = THREE.MathUtils.lerp(a.shot.fov, b.shot.fov, e);
  L.dim = THREE.MathUtils.lerp(a.shot.dim, b.shot.dim, e);
  L.fog = THREE.MathUtils.lerp(a.shot.fog, b.shot.fog, e);
  L.focus = THREE.MathUtils.lerp(a.shot.focus, b.shot.focus, e);
  L.range = THREE.MathUtils.lerp(a.shot.range, b.shot.range, e);
  L.bokeh = THREE.MathUtils.lerp(a.shot.bokeh, b.shot.bokeh, e);
  L.letterbox = THREE.MathUtils.lerp(a.shot.letterbox, b.shot.letterbox, e);
  return out;
}
