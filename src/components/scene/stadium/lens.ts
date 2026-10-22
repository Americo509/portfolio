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
  out[i] = clamp01(cr + high * 0.012 - shadow * 0.004);
  out[i + 1] = clamp01(cg + high * 0.01);
  out[i + 2] = clamp01(cb + shadow * 0.012 - high * 0.008);
};

/** Resenha: noite âmbar de balcão de bar; o dourado vira grading, não só troca de cor. */
const gradeResenha: Grade = (r, g, b, out, i) => {
  const y = luma(r, g, b);
  const t = contrast(y, 0.4, 1.3, 1.08);
  const warm = THREE.MathUtils.smoothstep(t, 0.0, 0.85);
  // Sombras em marrom de madeira escura, altas em dourado de chope; 28% da cor original fica.
  const keep = 0.28;
  out[i] = clamp01(t * (0.62 + 0.38 * warm) * (1 - keep) + (y + (r - y) * 1.1) * keep);
  out[i + 1] = clamp01(t * (0.4 + 0.44 * warm) * (1 - keep) + (y + (g - y) * 1.1) * keep);
  out[i + 2] = clamp01(t * (0.22 + 0.34 * warm) * (1 - keep) + (y + (b - y) * 1.1) * keep);
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
