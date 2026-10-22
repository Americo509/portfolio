import { deflateSync } from "node:zlib";
import { KTX2Container, read, write } from "ktx-parse";
import { encodeToKTX2 } from "ktx2-encoder";

/**
 * Pós-processamento do bake, no Node: dilatação das ilhas, mipmaps em espaço linear,
 * raiz quadrada com dither e KTX2 UASTC montado nível a nível (docs/bake-luz.md §5).
 */

/**
 * Push-pull: estica as ilhas para os texels vazios em volta, com a média dos vizinhos
 * preenchidos em níveis cada vez menores. Sem isso, o filtro bilinear e os mipmaps
 * puxam preto pelas bordas das ilhas.
 */
export function dilate(data: Float32Array, mask: Uint8Array, res: number) {
  const levels: { v: Float32Array; w: Float32Array; r: number }[] = [];
  let v = new Float32Array(res * res);
  let w = new Float32Array(res * res);
  for (let i = 0; i < v.length; i++) {
    w[i] = mask[i] ? 1 : 0;
    v[i] = mask[i] ? data[i] : 0;
  }
  levels.push({ v, w, r: res });
  let r = res;
  while (r > 1) {
    const h = r >> 1;
    const nv = new Float32Array(h * h);
    const nw = new Float32Array(h * h);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < h; x++) {
        let sv = 0;
        let sw = 0;
        for (let dy = 0; dy < 2; dy++)
          for (let dx = 0; dx < 2; dx++) {
            const j = (y * 2 + dy) * r + x * 2 + dx;
            sv += v[j] * w[j];
            sw += w[j];
          }
        nw[y * h + x] = Math.min(1, sw);
        nv[y * h + x] = sw > 0 ? sv / sw : 0;
      }
    v = nv;
    w = nw;
    r = h;
    levels.push({ v, w, r });
  }
  // Volta preenchendo o que estava vazio com o nível de baixo.
  for (let k = levels.length - 2; k >= 0; k--) {
    const cur = levels[k];
    const low = levels[k + 1];
    for (let y = 0; y < cur.r; y++)
      for (let x = 0; x < cur.r; x++) {
        const i = y * cur.r + x;
        if (cur.w[i] >= 1) continue;
        const lv = low.v[(y >> 1) * low.r + (x >> 1)];
        cur.v[i] = cur.w[i] > 0 ? cur.v[i] * cur.w[i] + lv * (1 - cur.w[i]) : lv;
        cur.w[i] = 1;
      }
  }
  const out = new Float32Array(res * res);
  for (let i = 0; i < out.length; i++) out[i] = mask[i] ? data[i] : levels[0].v[i];
  return out;
}

/** Redução 2x por média (em espaço linear: irradiância, antes da raiz). */
export function downsample(data: Float32Array, res: number) {
  const h = res >> 1;
  const out = new Float32Array(h * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < h; x++) {
      const j = y * 2 * res + x * 2;
      out[y * h + x] = (data[j] + data[j + 1] + data[j + res] + data[j + res + 1]) / 4;
    }
  return out;
}

/** Cadeia de mipmaps, do tamanho dado até 1×1, toda em espaço linear. */
export function mipChain(data: Float32Array, res: number) {
  const chain = [{ data, res }];
  while (chain[chain.length - 1].res > 1) {
    const last = chain[chain.length - 1];
    chain.push({ data: downsample(last.data, last.res), res: last.res >> 1 });
  }
  return chain;
}

/** PRNG determinístico para o dither. */
export function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Raiz quadrada (mais precisão perto do preto) e quantização em 8 bits com dither
 * triangular de ±1 nível. Os 4 canais entram crus no RGBA, sem pré-multiplicação.
 */
export function encodeRGBA8(channels: Float32Array[], res: number, scale: number[], seed: number) {
  const random = rng(seed);
  const out = new Uint8Array(res * res * 4);
  for (let i = 0; i < res * res; i++)
    for (let c = 0; c < 4; c++) {
      const v = Math.sqrt(Math.min(1, Math.max(0, channels[c][i] / scale[c])));
      const q = Math.round(v * 255 + (random() - random()));
      out[i * 4 + c] = Math.min(255, Math.max(0, q));
    }
  return out;
}

/** Os mesmos valores, sem quantizar: a referência float da verificação. */
export function encodeFloat(channels: Float32Array[], res: number, scale: number[]) {
  const out = new Float32Array(res * res * 4);
  for (let i = 0; i < res * res; i++)
    for (let c = 0; c < 4; c++) out[i * 4 + c] = Math.sqrt(Math.min(1, Math.max(0, channels[c][i] / scale[c])));
  return out;
}

/**
 * KTX2 UASTC de um nível: não perceptual (os 4 canais com o mesmo peso), alfa como
 * dado, transferência linear (sem sRGB), sem mipmaps do basis (vêm prontos), com
 * Zstandard e sem RDO.
 */
async function encodeLevel(rgba: Uint8Array, res: number) {
  return encodeToKTX2(rgba, {
    isUASTC: true,
    isPerceptual: false,
    isSetKTX2SRGBTransferFunc: false,
    generateMipmap: false,
    needSupercompression: true,
    enableRDO: false,
    uastcLDRQualityLevel: 3,
    imageDecoder: async (buffer) => ({ width: res, height: res, data: buffer })
  });
}

/** Codifica cada nível à parte e monta um KTX2 só com todos eles (nível 0 = o maior). */
export async function encodeKTX2(levels: { rgba: Uint8Array; res: number }[]) {
  const parts: KTX2Container[] = [];
  for (const l of levels) parts.push(read(await encodeLevel(l.rgba, l.res)));
  const base = parts[0];
  const container = base;
  container.levelCount = levels.length;
  container.levels = parts.map((p) => p.levels[0]);
  return write(container);
}

/** PNG em escala de cinza (8 bits) para as pranchas do relatório. */
export function grayPNG(values: Float32Array | Uint8Array, w: number, h: number, map: (v: number) => number = (v) => v) {
  const raw = Buffer.alloc((w + 1) * h);
  for (let y = 0; y < h; y++) {
    // A linha 0 do lightmap é o v = 0 (embaixo); o PNG começa em cima.
    const src = h - 1 - y;
    raw[y * (w + 1)] = 0;
    for (let x = 0; x < w; x++) raw[y * (w + 1) + 1 + x] = Math.max(0, Math.min(255, Math.round(map(values[src * w + x]) * 255)));
  }
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(td) >>> 0);
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

let crcTable: Int32Array | null = null;
function crc32(buf: Buffer) {
  if (!crcTable) {
    crcTable = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c;
    }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return c ^ -1;
}
