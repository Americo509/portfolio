import * as THREE from "three";
import type { ChapterKey } from "@/lib/store";

/**
 * Plano-sequência da home na linguagem de transmissão de TV (docs/plano-awwwards.md,
 * "A linguagem: transmissão de TV" e "Câmera autorada").
 *
 * Uma trilha só, contínua, atravessando os capítulos: posição e alvo correm por
 * splines Catmull-Rom centrípetas parametrizadas por comprimento de arco (a
 * velocidade não dá trancos nos pontos de controle). Os quadros-chave marcam onde a
 * câmera muda de intenção: chega, desacelera para a leitura (trechos longos no
 * scroll e curtos no espaço), acelera na transição, passando por quadros de "via"
 * (grua, mergulho, trilho). Cada segmento tem o próprio easing.
 *
 * `at` é o progresso global da home: índice do capítulo + progresso dentro dele
 * (0 a 1). Para dirigir, use a ferramenta do ?debug: câmera livre, slider da
 * trilha e o botão que copia o quadro no formato abaixo.
 *
 * Lente: focus/range em metros (profundidade de campo, só no tier alto), bokeh de
 * 0 a ~4, letterbox de 0 a 1 (barras 2.39:1).
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

/** Easing do segmento que SAI deste quadro até o próximo. */
export type Ease = "linear" | "in" | "out" | "inOut";

export type Key = Shot & { at: number; ease: Ease };

type KeyInput = Partial<Shot> & Pick<Shot, "pos" | "look"> & { at: number; ease?: Ease };

/** Quadro-chave com os padrões da lente; os campos omitidos herdam do quadro anterior. */
function keys(list: KeyInput[]): Key[] {
  let prev: Shot = { pos: [0, 0, 0], look: [0, 0, 0], fov: 42, dim: 0, fog: 1, focus: 110, range: 90, bokeh: 0, letterbox: 0 };
  return list.map((k) => {
    const full: Key = { ...prev, ease: "linear", ...k };
    prev = full;
    return full;
  });
}

/** Ordem dos capítulos na home: o progresso global é índice + progresso no capítulo. */
export const CHAPTER_ORDER: ChapterKey[] = ["hero", "lineup", "matches", "method", "academy", "penalties", "final"];

const DESKTOP = keys([
  // 01 Entrada em campo: do gramado, a torcida norte sob o telão e o arco. O hero já
  // começa ativo em ~0,55 (a seção ocupa a primeira tela e o gatilho fica a 55%).
  { at: 0.5, pos: [-10, 3.4, 52], look: [8, 9, -40], fov: 42 },
  { at: 0.92, pos: [-6, 3, 45], look: [6, 9.5, -45], fov: 40, ease: "in" },
  // Grua: sobe atrás do gol sul.
  { at: 1.08, pos: [0, 26, 58], look: [0, 4, -10], fov: 46, dim: 0.15, fog: 0.6, ease: "out" },
  // 02 Escalação: spidercam quase a pino (x da câmera = x do alvo); desliza devagar na leitura.
  { at: 1.22, pos: [0, 64, 42], look: [0, 0, -4], fov: 44, dim: 0.35, fog: 0.2, focus: 75, range: 80 },
  { at: 1.78, pos: [0, 70, 30], look: [0, 0, -10], fov: 42, ease: "in" },
  // Mergulho até o canto oeste da linha de fundo.
  { at: 2.06, pos: [-30, 22, 34], look: [6, 6, -30], fov: 40, dim: 0.55, fog: 0.5, focus: 60, range: 50, ease: "out" },
  // 03 Jogos históricos: replay, travelling baixo pela linha de fundo.
  { at: 2.18, pos: [-36, 6.5, 22], look: [18, 6, -40], fov: 38, dim: 0.72, fog: 0.8, bokeh: 0.6 },
  { at: 2.84, pos: [10, 6.5, 22], look: [42, 6, -40], ease: "in" },
  // Desce para o gramado, perto do círculo central.
  { at: 3.08, pos: [4, 2.6, 26], look: [0, 3, -30], fov: 34, dim: 0.78, focus: 8, range: 6, bokeh: 2, ease: "out" },
  // 04 Preleção: close rasteiro; o foco vem para perto e o estádio desfoca.
  { at: 3.18, pos: [0, 1.6, 22], look: [0, 3, -30], fov: 32, dim: 0.8, focus: 4, range: 3, bokeh: 3.5 },
  { at: 3.82, pos: [0, 1.4, 14], look: [0, 3.5, -30], fov: 30, ease: "in" },
  // Sai do close em direção ao trilho da lateral leste.
  { at: 4.06, pos: [24, 3.5, 26], look: [2, 3, 10], fov: 36, dim: 0.82, focus: 10, range: 8, bokeh: 2, ease: "out" },
  // 05 Categorias de base: câmera de trilho, velocidade constante e mais rápida.
  { at: 4.15, pos: [40, 4, 34], look: [2, 3, 22], fov: 38, dim: 0.84, focus: 14, range: 10, bokeh: 1.5 },
  { at: 4.85, pos: [40, 4, -34], look: [2, 3, -46], ease: "inOut" },
  // Contorna por cima da lateral até ficar atrás do batedor.
  { at: 5.05, pos: [30, 9, 12], look: [4, 2, 44], fov: 40, dim: 0.85, bokeh: 0, focus: 110, range: 90, ease: "out" },
  // 06 Disputa de pênaltis: atrás do batedor (a cena pausa quando o jogo está na tela).
  { at: 5.18, pos: [0, 2.2, 38], look: [0, 1.5, 52.5], fov: 38 },
  { at: 5.82, pos: [0, 2, 40], look: [0, 1.4, 52.5], ease: "in" },
  // Grua para trás, por cima da arquibancada sul; o letterbox começa a entrar.
  { at: 6.0, pos: [-12, 10, 52], look: [-16, 8, -30], fov: 42, dim: 0.3, letterbox: 0.6, ease: "out" },
  // 07 Apito final: plano geral com a torcida no terço direito e o fundo escurecido,
  // para o título e o CTA (à esquerda) não disputarem contraste com o vermelho.
  { at: 6.12, pos: [-28, 16, 46], look: [-30, 8, -66], fov: 40, dim: 0.42, focus: 120, range: 60, bokeh: 0.8, letterbox: 1 },
  { at: 6.9, pos: [-18, 12, 38], look: [-34, 8, -68], fov: 36 }
]);

/** Retrato: FOV vertical maior e câmera centrada, para o arco e a torcida caberem em pé. */
const MOBILE = keys([
  { at: 0.5, pos: [0, 4, 60], look: [0, 11, -40], fov: 62 },
  { at: 0.92, pos: [0, 3.6, 52], look: [0, 11.5, -45], fov: 60, ease: "in" },
  { at: 1.08, pos: [0, 34, 64], look: [0, 4, -8], fov: 62, dim: 0.15, fog: 0.6, ease: "out" },
  { at: 1.22, pos: [0, 92, 10], look: [0, 0, -2], fov: 60, dim: 0.35, fog: 0.2, focus: 95, range: 90 },
  { at: 1.78, pos: [0, 96, 4], look: [0, 0, -6], fov: 58, ease: "in" },
  { at: 2.06, pos: [-18, 26, 40], look: [4, 6, -30], fov: 58, dim: 0.55, fog: 0.5, focus: 60, range: 50, ease: "out" },
  { at: 2.18, pos: [-20, 8, 30], look: [8, 7, -40], fov: 56, dim: 0.72, fog: 0.8, bokeh: 0.6 },
  { at: 2.84, pos: [6, 8, 30], look: [24, 7, -40], ease: "in" },
  { at: 3.08, pos: [2, 2.8, 26], look: [0, 4, -30], fov: 52, dim: 0.78, focus: 8, range: 6, bokeh: 2, ease: "out" },
  { at: 3.18, pos: [0, 1.7, 22], look: [0, 4, -30], fov: 50, dim: 0.8, focus: 4, range: 3, bokeh: 3.5 },
  { at: 3.82, pos: [0, 1.5, 15], look: [0, 4.5, -30], fov: 48, ease: "in" },
  { at: 4.06, pos: [20, 4, 26], look: [4, 4, 10], fov: 54, dim: 0.82, focus: 10, range: 8, bokeh: 2, ease: "out" },
  { at: 4.15, pos: [36, 5, 30], look: [4, 4, 18], fov: 56, dim: 0.84, focus: 14, range: 10, bokeh: 1.5 },
  { at: 4.85, pos: [36, 5, -30], look: [4, 4, -42], ease: "inOut" },
  { at: 5.05, pos: [26, 10, 14], look: [4, 2, 44], fov: 56, dim: 0.85, bokeh: 0, focus: 110, range: 90, ease: "out" },
  { at: 5.18, pos: [0, 2.4, 36], look: [0, 1.6, 52.5], fov: 55 },
  { at: 5.82, pos: [0, 2.2, 38], look: [0, 1.5, 52.5], ease: "in" },
  { at: 6.0, pos: [0, 12, 58], look: [0, 9, -30], fov: 58, dim: 0.3, letterbox: 0.6, ease: "out" },
  { at: 6.12, pos: [0, 14, 54], look: [0, 9, -66], fov: 58, dim: 0.42, focus: 120, range: 60, bokeh: 0.8, letterbox: 1 },
  { at: 6.9, pos: [0, 11, 46], look: [-4, 9, -68], fov: 54 }
]);

/** Páginas internas: um quadro fixo, escurecido, atrás do conteúdo. */
export const AMBIENT = {
  desktop: { pos: [-10, 3.4, 56], look: [10, 9, -40], fov: 42, dim: 0.9, fog: 1, focus: 110, range: 90, bokeh: 0, letterbox: 0 } as Shot,
  mobile: { pos: [0, 4, 60], look: [0, 11, -40], fov: 62, dim: 0.9, fog: 1, focus: 110, range: 90, bokeh: 0, letterbox: 0 } as Shot
};

/**
 * Saída do túnel: dolly zoom de cima da cobertura sul (tele, longe) até a borda
 * da cobertura (grande-angular, perto), com a torcida norte do mesmo tamanho na
 * tela; depois a descida até o primeiro quadro do hero.
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

// ---------------------------------------------------------------------------
// Avaliação: splines por comprimento de arco.

export type Track = {
  keys: Key[];
  pos: THREE.CatmullRomCurve3;
  look: THREE.CatmullRomCurve3;
  /** Fração do comprimento de arco em cada quadro-chave (posição e alvo). */
  posU: number[];
  lookU: number[];
};

/** Fração do comprimento de arco em que a curva passa por cada ponto de controle. */
function arcFractions(curve: THREE.CatmullRomCurve3, count: number) {
  const divisions = (count - 1) * 64;
  const lengths = curve.getLengths(divisions);
  const total = lengths[lengths.length - 1] || 1;
  return Array.from({ length: count }, (_, i) => lengths[i * 64] / total);
}

function buildTrack(list: Key[]): Track {
  const pos = new THREE.CatmullRomCurve3(list.map((k) => new THREE.Vector3(...k.pos)), false, "centripetal");
  const look = new THREE.CatmullRomCurve3(list.map((k) => new THREE.Vector3(...k.look)), false, "centripetal");
  // Mais divisões que o padrão (200) para getPointAt seguir o arco com precisão.
  pos.arcLengthDivisions = look.arcLengthDivisions = (list.length - 1) * 64;
  return { keys: list, pos, look, posU: arcFractions(pos, list.length), lookU: arcFractions(look, list.length) };
}

export const TRACKS = { desktop: buildTrack(DESKTOP), mobile: buildTrack(MOBILE) };

const EASE: Record<Ease, (t: number) => number> = {
  linear: (t) => t,
  in: (t) => t * t,
  out: (t) => 1 - (1 - t) * (1 - t),
  inOut: (t) => t * t * (3 - 2 * t)
};

const LENS_KEYS = ["fov", "dim", "fog", "focus", "range", "bokeh", "letterbox"] as const;

/** Avalia a trilha no progresso global g (índice do capítulo + progresso dentro dele). */
export function sampleTrack(track: Track, g: number, out: { pos: THREE.Vector3; look: THREE.Vector3; lens: Omit<Shot, "pos" | "look"> }) {
  const k = track.keys;
  const last = k.length - 1;
  const x = THREE.MathUtils.clamp(g, k[0].at, k[last].at);
  let i = 0;
  while (i < last - 1 && x > k[i + 1].at) i++;
  const a = k[i];
  const b = k[i + 1];
  const e = EASE[a.ease](THREE.MathUtils.clamp((x - a.at) / Math.max(1e-6, b.at - a.at), 0, 1));
  track.pos.getPointAt(THREE.MathUtils.clamp(THREE.MathUtils.lerp(track.posU[i], track.posU[i + 1], e), 0, 1), out.pos);
  track.look.getPointAt(THREE.MathUtils.clamp(THREE.MathUtils.lerp(track.lookU[i], track.lookU[i + 1], e), 0, 1), out.look);
  for (const key of LENS_KEYS) out.lens[key] = THREE.MathUtils.lerp(a[key], b[key], e);
  return out;
}

/** Linha de código de um quadro-chave, no formato de DESKTOP/MOBILE (ferramenta do ?debug). */
export function keyToCode(at: number, pos: THREE.Vector3, look: THREE.Vector3, fov: number) {
  const r = (v: number) => Math.round(v * 10) / 10;
  return `{ at: ${Math.round(at * 100) / 100}, pos: [${r(pos.x)}, ${r(pos.y)}, ${r(pos.z)}], look: [${r(look.x)}, ${r(look.y)}, ${r(look.z)}], fov: ${Math.round(fov)} },`;
}
