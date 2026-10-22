/**
 * Sem dependências de propósito: o letterbox do DOM lê este objeto, e ele não pode
 * puxar o three para o pacote principal.
 *
 * Estado da lente, escrito pela câmera (CameraRig) a cada quadro e lido pelo
 * pós-processamento e pelo letterbox do DOM (docs/plano-awwwards.md, "Lente").
 */
export const lens = {
  /** Profundidade de campo (tier alto): distância e faixa em foco, em metros, e força do bokeh. */
  focus: 110,
  range: 90,
  bokeh: 0,
  /** Barras 2.39:1, de 0 a 1. */
  letterbox: 0,
  /** Velocidade da câmera na tela (fração da tela por quadro), para o motion blur. */
  blur: { x: 0, y: 0 },
  /** Aberração cromática, pela velocidade do scroll. */
  aberration: 0
};
