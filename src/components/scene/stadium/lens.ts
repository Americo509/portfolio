import * as THREE from "three";
import { BlendFunction, Effect, EffectAttribute, LookupTexture } from "postprocessing";
import { lens } from "./lens-state";

export { lens };

// ---------------------------------------------------------------------------
// Grading por LUT: uma para o Expediente e outra para a Resenha. As LUTs são
// geradas em código (32³), operam sobre a imagem já com o tone mapping AgX e em
// sRGB (o LUT3DEffect converte na entrada e na saída).

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const luma = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/** Curva em S com pivô: sombras mais fundas, meios-tons firmes, altas suaves. */
function contrast(x: number, pivot: number, low: number, high: number) {
  x = clamp01(x);
  return x < pivot ? pivot * Math.pow(x / pivot, low) : 1 - (1 - pivot) * Math.pow((1 - x) / (1 - pivot), high);
}

// As funções de grading escrevem direto no buffer da LUT (sem criar arrays por cor):
// são 32³ cores, e no celular a geração entra no tempo de bloqueio da abertura.
type Grade = (r: number, g: number, b: number, out: Float32Array, i: number) => void;

/** Matiz em graus (0–360) e saturação (0–1) de uma cor sRGB. */
function hueSat(r: number, g: number, b: number): [number, number] {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const d = mx - mn;
  if (d < 1e-6) return [0, 0];
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return [h < 0 ? h + 360 : h, d / mx];
}

/**
 * O acento da identidade volta depois do AgX: dentro da faixa de matiz dele, a cor
 * vai para o tom exato da marca (só a luminosidade varia), em proporção à saturação
 * que sobrou. O núcleo do sinalizador chega no tom cheio; o rosado fraco em volta
 * só esquenta um pouco, e as sombras ficam neutras. O AgX dessatura altas luzes;
 * sem isso o sinalizador sai salmão.
 */
function accent(
  r: number,
  g: number,
  b: number,
  base: [number, number, number],
  target: [number, number, number],
  hue: number,
  width: number,
  satLow: number,
  satHigh: number,
  /** Fração da luminosidade do tom em que ele já sai cheio (o âmbar é claro e precisa de menos). */
  reach: number,
  /** Faixa de luminância em que o acento entra: abaixo dela, a sombra fica neutra. */
  yLow: number,
  yHigh: number,
  out: Float32Array,
  i: number
) {
  const [h, sat] = hueSat(r, g, b);
  const dh = Math.min(Math.abs(h - hue), 360 - Math.abs(h - hue));
  const y = luma(r, g, b);
  const w =
    (1 - THREE.MathUtils.smoothstep(dh, width, width * 1.8)) *
    clamp01((sat - satLow) / (satHigh - satLow)) *
    THREE.MathUtils.smoothstep(y, yLow, yHigh);
  // Luminosidade relativa à do tom da marca: o núcleo claro chega no tom cheio.
  const k = Math.min(1, Math.max(0.16, y / (luma(...target) * reach)));
  out[i] = base[0] + (target[0] * k - base[0]) * w;
  out[i + 1] = base[1] + (target[1] * k - base[1]) * w;
  out[i + 2] = base[2] + (target[2] * k - base[2]) * w;
}

/** #E61919 e #F59E0B em sRGB 0–1. */
const SIGNAL: [number, number, number] = [0.902, 0.098, 0.098];
const AMBER: [number, number, number] = [0.961, 0.62, 0.043];
const tmp: [number, number, number] = [0, 0, 0];

/** Expediente: preto e branco de cartaz, com o vermelho do sinalizador preservado. */
const gradeNight: Grade = (r, g, b, out, i) => {
  const y = luma(r, g, b);
  // Quanto o vermelho domina o pixel: só ele mantém (e ganha) saturação.
  const red = clamp01((r - Math.max(g, b)) * 4.5 - 0.02);
  const sat = 0.06 + red * 1.7;
  // Pretos esmagados de leve, depois a curva em S.
  const cr = contrast(Math.max(0, y + (r - y) * sat - 0.01) / 0.99, 0.42, 1.38, 1.12);
  const cg = contrast(Math.max(0, y + (g - y) * sat - 0.01) / 0.99, 0.42, 1.38, 1.12);
  const cb = contrast(Math.max(0, y + (b - y) * sat - 0.01) / 0.99, 0.42, 1.38, 1.12);
  // Split toning discreto: sombras um pouco frias, altas no creme do papel (#F5F5F0).
  const yy = luma(cr, cg, cb);
  const shadow = (1 - yy) * (1 - yy) * (1 - yy);
  const high = yy * yy;
  tmp[0] = clamp01(cr + high * 0.012 - shadow * 0.004);
  tmp[1] = clamp01(cg + high * 0.01);
  tmp[2] = clamp01(cb + shadow * 0.012 - high * 0.008);
  // O vermelho que já é vermelho (o halo do sinalizador, que o AgX deixa salmão) volta
  // ao tom da marca; o rosado fraco em volta fica como está, para a mancha não crescer.
  accent(r, g, b, tmp, SIGNAL, 0, 16, 0.16, 0.5, 1, 0.05, 0.16, out, i);
};

/** Creme das luzes da Resenha, normalizado para luminância 1 (saturação ~0,34). */
const CREAM: [number, number, number] = [1 / 0.875, 0.86 / 0.875, 0.66 / 0.875];

/**
 * Resenha: noite de balcão de bar. As sombras fundas ficam neutras (preto é preto);
 * o calor entra dos meios-tons para cima e não passa do creme. O âmbar cheio fica só
 * para os sinalizadores, via accent.
 */
const gradeResenha: Grade = (r, g, b, out, i) => {
  const y = luma(r, g, b);
  const t = contrast(y, 0.4, 1.3, 1.08);
  // 0 nas sombras fundas, 1 dos meios-tons em diante.
  const warm = THREE.MathUtils.smoothstep(t, 0.06, 0.45);
  // Parte da cor original (60%) volta junto com o calor, nunca nas sombras: é o que
  // deixa os feixes e a névoa dourados (#F0D29A na cena) sem saturar a arquibancada.
  const keep = 0.6 * warm;
  tmp[0] = clamp01(t * (1 + (CREAM[0] - 1) * warm) + (r - y) * keep);
  tmp[1] = clamp01(t * (1 + (CREAM[1] - 1) * warm) + (g - y) * keep);
  tmp[2] = clamp01(t * (1 + (CREAM[2] - 1) * warm) + (b - y) * keep);
  // Só a luz dos sinalizadores vai para o âmbar cheio. Ela chega aqui em ~33° e
  // saturação ~0,45, mais laranja e mais saturada que o dourado dos feixes (#F0D29A,
  // 0,36) e o creme das luzes (#F7D9A8, 0,32): faixa de matiz estreita e saturação
  // mínima acima da deles. O gramado no escuro fica de fora pela luminância.
  accent(r, g, b, tmp, AMBER, 33, 4, 0.34, 0.5, 0.7, 0.18, 0.4, out, i);
};

function buildLut(grade: Grade, size = 32) {
  const data = new Float32Array(size * size * size * 4);
  const s = 1 / (size - 1);
  let i = 0;
  for (let z = 0; z < size; z++)
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++, i += 4) {
        grade(x * s, y * s, z * s, data, i);
        data[i + 3] = 1;
      }
  const lut = new LookupTexture(data, size);
  lut.needsUpdate = true;
  return lut;
}

/** Só a LUT do modo em uso é gerada; a outra, na primeira troca para ela. */
const cache: Partial<Record<"night" | "resenha", LookupTexture>> = {};
export function getLut(mode: "night" | "resenha") {
  return (cache[mode] ??= buildLut(mode === "night" ? gradeNight : gradeResenha));
}

// ---------------------------------------------------------------------------
// Lente: motion blur direcional nos movimentos rápidos de câmera e aberração
// cromática radial pela velocidade do scroll, num efeito só (os dois leem o
// buffer em outras coordenadas, então dividem a mesma passada).

const lensFragment = /* glsl */ `
  uniform vec2 uVelocity;
  uniform float uAberration;
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec4 color = inputColor;
    if (length(uVelocity) > 0.0006) {
      vec4 acc = vec4(0.0);
      for (int i = 0; i < 8; i++) {
        float t = float(i) / 7.0 - 0.5;
        acc += texture2D(inputBuffer, uv + uVelocity * t);
      }
      color = acc / 8.0;
    }
    if (uAberration > 0.00001) {
      vec2 off = (uv - 0.5) * uAberration;
      color.r = mix(color.r, texture2D(inputBuffer, uv + off).r, 0.85);
      color.b = mix(color.b, texture2D(inputBuffer, uv - off).b, 0.85);
    }
    outputColor = color;
  }
`;

export class LensEffect extends Effect {
  constructor() {
    super("LensEffect", lensFragment, {
      blendFunction: BlendFunction.NORMAL,
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map<string, THREE.Uniform>([
        ["uVelocity", new THREE.Uniform(new THREE.Vector2())],
        ["uAberration", new THREE.Uniform(0)]
      ])
    });
  }
  update() {
    (this.uniforms.get("uVelocity")!.value as THREE.Vector2).set(lens.blur.x, lens.blur.y);
    this.uniforms.get("uAberration")!.value = lens.aberration;
  }
}
