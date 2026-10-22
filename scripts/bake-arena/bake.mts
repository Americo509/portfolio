/**
 * Bake de luz da arena (docs/bake-luz.md). Uso:
 *   pnpm bake:arena                       headless (sem GPU aqui, lento)
 *   pnpm bake:arena --headed              navegador visível, com a GPU da máquina
 *   pnpm bake:arena --headed --chrome     idem, com o Chrome instalado
 *   pnpm bake:arena --res 1024 --iterations 128   bake rápido de conferência
 */
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { build } from "esbuild";
import { chromium } from "@playwright/test";
import { Document, NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { meshopt, quantize } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";
import { ARENA_PARTS, buildArenaPart, type ArenaPart } from "../../src/components/scene/stadium/geometry";
import { ATLAS_PADDING, BAKE_VERSION, CHANNELS, TIER_RES, analyticSpill, type BakeTier } from "./common";
import { arenaHash } from "./hash";
import { dilate, downsample, encodeFloat, encodeKTX2, encodeRGBA8, grayPNG, mipChain } from "./post";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const opt = (name: string, def: number) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? Number(args[i + 1]) : def;
};

const RES = opt("res", TIER_RES.high);
const ITERATIONS = opt("iterations", 512);
const SHADOW = opt("shadow", 2048);
const SEED = 1977;
const OUT = join(root, "public/models");
const WORK = join(here, "out");
mkdirSync(OUT, { recursive: true });
mkdirSync(WORK, { recursive: true });

const t0 = Date.now();
const elapsed = () => `${((Date.now() - t0) / 1000).toFixed(0)} s`;
const say = (m: string) => console.log(`[bake ${elapsed()}] ${m}`);

// ---------------------------------------------------------------------------
// 1. Geometria: as mesmas partes que o site desenha, com os vértices soldados por
// posição (sem isso o xatlas faria uma ilha por triângulo).

type Welded = { name: ArenaPart; position: Float32Array; index: Uint32Array };
const welded: Welded[] = ARENA_PARTS.map((name) => {
  const g = mergeVertices(buildArenaPart(name), 1e-4);
  return { name, position: g.getAttribute("position").array as Float32Array, index: Uint32Array.from(g.index!.array) };
});
say(`geometria: ${welded.map((w) => `${w.name} ${w.index.length / 3}`).join(", ")} triângulos`);

// ---------------------------------------------------------------------------
// 2. Página do bake, servida localmente; os resultados grandes chegam por POST.

const pageDir = join(WORK, "page");
mkdirSync(pageDir, { recursive: true });
await build({
  entryPoints: [join(here, "page.ts")],
  bundle: true,
  format: "esm",
  platform: "browser",
  outfile: join(pageDir, "page.js"),
  logLevel: "warning"
});
writeFileSync(
  join(pageDir, "index.html"),
  `<!doctype html><meta charset="utf-8"><title>Bake da arena</title>
<style>body{margin:0;background:#111;color:#eee;font:14px monospace}#status{padding:8px}canvas{display:block;width:512px;height:512px}</style>
<div id="status">carregando…</div><canvas id="view" width="1024" height="1024"></canvas>
<script type="module" src="page.js"></script>`
);

const uploads = new Map<string, Buffer>();
const server = createServer((req, res) => {
  if (req.method === "POST" && req.url?.startsWith("/upload/")) {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      uploads.set(req.url!.slice("/upload/".length), Buffer.concat(chunks));
      res.end("ok");
    });
    return;
  }
  const file = join(pageDir, req.url === "/" ? "index.html" : req.url!.slice(1));
  try {
    const body = readFileSync(file);
    res.setHeader("Content-Type", file.endsWith(".js") ? "text/javascript" : "text/html");
    res.end(body);
  } catch {
    res.statusCode = 404;
    res.end();
  }
});
await new Promise<void>((r) => server.listen(0, r));
const port = (server.address() as { port: number }).port;

const headed = flag("headed");
const browser = await chromium.launch({
  headless: !headed,
  channel: flag("chrome") ? "chrome" : undefined,
  // Sem GPU (aqui), o SwiftShader; com --headed, a GPU da máquina.
  args: headed ? ["--ignore-gpu-blocklist", "--enable-gpu-rasterization"] : ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
});
const page = await browser.newPage({ viewport: { width: 560, height: 600 } });
let lastProgress = 0;
page.on("console", (m) => {
  if (m.type() === "error") console.error("[página]", m.text());
  // Progresso do bake a cada ~30 s (setor, iteração, tempo restante).
  else if (m.text().startsWith("setor ") && Date.now() - lastProgress > 30_000) {
    lastProgress = Date.now();
    say(m.text());
  }
});
page.on("pageerror", (e) => console.error("[página]", e.message));
await page.goto(`http://localhost:${port}/`);
await page.waitForFunction(() => "bake" in window, null, { timeout: 60_000 });
const renderer = await page.evaluate(() => {
  const gl = document.createElement("canvas").getContext("webgl2")!;
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
});
say(`navegador: ${headed ? "visível" : "headless"} · ${renderer}`);

// ---------------------------------------------------------------------------
// 3. Visibilidade pelas câmeras reais.

const vis = (await page.evaluate(
  (parts) => (window as unknown as { bake: { visibility: (p: unknown) => Promise<unknown> } }).bake.visibility(parts),
  welded.map((w) => ({ name: w.name, position: Array.from(w.position), index: Array.from(w.index) }))
)) as { samples: number; parts: number[][] };

const triArea = (p: Float32Array, a: number, b: number, c: number) => {
  const A = new THREE.Vector3().fromArray(p, a * 3);
  const B = new THREE.Vector3().fromArray(p, b * 3);
  const C = new THREE.Vector3().fromArray(p, c * 3);
  return B.sub(A).cross(C.sub(A)).length() / 2;
};
// Margem: uma face fina (menor altura do triângulo abaixo de 1,5 m: borda de laje,
// pilar, faixa do tubo do arco) vizinha de uma face vista também entra, porque pode
// aparecer por um pixel na resolução da tela e não na das amostras. Faces grandes (o
// lado de cima das coberturas) continuam fora.
const THIN = 1.5;
welded.forEach((w, k) => {
  const seen = vis.parts[k];
  const near = new Uint8Array(w.position.length / 3);
  for (let t = 0; t < seen.length; t++) if (seen[t]) for (let c = 0; c < 3; c++) near[w.index[t * 3 + c]] = 1;
  const v = (i: number) => new THREE.Vector3().fromArray(w.position, i * 3);
  for (let t = 0; t < seen.length; t++) {
    const [a, b, c] = [w.index[t * 3], w.index[t * 3 + 1], w.index[t * 3 + 2]];
    if (seen[t] || !(near[a] || near[b] || near[c])) continue;
    const longest = Math.max(v(a).distanceTo(v(b)), v(b).distanceTo(v(c)), v(c).distanceTo(v(a)));
    if ((2 * triArea(w.position, a, b, c)) / longest < THIN) seen[t] = 2;
  }
});

let facesTotal = 0;
let facesOut = 0;
let areaTotal = 0;
let areaOut = 0;
welded.forEach((w, k) => {
  for (let t = 0; t < w.index.length / 3; t++) {
    const area = triArea(w.position, w.index[t * 3], w.index[t * 3 + 1], w.index[t * 3 + 2]);
    facesTotal++;
    areaTotal += area;
    if (!vis.parts[k][t]) {
      facesOut++;
      areaOut += area;
    }
  }
});
say(`visibilidade: ${vis.samples} câmeras · ${facesOut}/${facesTotal} faces e ${((areaOut / areaTotal) * 100).toFixed(1)}% da área fora do atlas`);

// ---------------------------------------------------------------------------
// 4. Atlas (xatlas, no Node): só as faces vistas, mais uma ilha-reserva sem luz para
// as faces nunca vistas.

const { Api } = await import("xatlasjs/dist/node/api.mjs");
const { default: createXAtlasModule } = await import("xatlasjs/dist/node/xatlas.js");
const XAtlas = Api(createXAtlasModule);
const xatlas = await new Promise<InstanceType<typeof XAtlas>>((r) => {
  const api: InstanceType<typeof XAtlas> = new XAtlas(() => r(api), (p: string) => join(here, "../../node_modules/xatlasjs/dist/node", p));
});
xatlas.createAtlas();

type Sub = { name: string; position: Float32Array; index: Uint16Array; map: number[] };
const subs: Sub[] = welded.map((w, k) => {
  const used = new Map<number, number>();
  const map: number[] = [];
  const idx: number[] = [];
  for (let t = 0; t < w.index.length / 3; t++) {
    if (!vis.parts[k][t]) continue;
    for (let c = 0; c < 3; c++) {
      const v = w.index[t * 3 + c];
      if (!used.has(v)) {
        used.set(v, map.length);
        map.push(v);
      }
      idx.push(used.get(v)!);
    }
  }
  const position = new Float32Array(map.length * 3);
  map.forEach((v, i) => position.set(w.position.subarray(v * 3, v * 3 + 3), i * 3));
  return { name: w.name, position, index: Uint16Array.from(idx), map };
});
// Ilha-reserva: um quadrado de 2 m, longe de tudo (o Node zera a luz dela depois).
const reserve = { name: "reserve", position: new Float32Array([0, -100, 0, 2, -100, 0, 2, -100, 2, 0, -100, 2]), index: Uint16Array.from([0, 1, 2, 0, 2, 3]), map: [] };
for (const s of [...subs, reserve]) if (s.index.length) xatlas.addMesh(s.index, s.position, null, null, s.name);
// Densidade de texels: o xatlas só estima a partir da resolução e às vezes passa do
// tamanho. Ajusta até caber num atlas só, exatamente RES × RES.
// A margem acompanha a resolução: 8 texels no 2048 (2 no tier de 512); no bake rápido, menos.
const pack = { resolution: RES, padding: Math.max(2, Math.round((ATLAS_PADDING * RES) / TIER_RES.high)), bilinear: true, blockAlign: true };
let atlas = xatlas.generateAtlas({}, pack, true);
let tpu = atlas.texelsPerUnit * Math.min(RES / atlas.width, RES / atlas.height);
for (let tries = 0; tries < 40; tries++) {
  atlas = xatlas.generateAtlas({}, { ...pack, texelsPerUnit: tpu }, true);
  if (atlas.atlasCount === 1 && atlas.width <= RES && atlas.height <= RES) break;
  tpu *= 0.95;
}
if (atlas.atlasCount !== 1) throw new Error(`o atlas não coube em ${RES}×${RES}`);
say(`atlas: ${atlas.width}×${atlas.height}, ${atlas.texelsPerUnit.toFixed(2)} texels/m`);
const byName = new Map<string, (typeof atlas.meshes)[number]>();
for (const m of atlas.meshes) byName.set(m.mesh, m);

const resMesh = byName.get("reserve")!;
let ru = 0;
let rv = 0;
for (let i = 0; i < resMesh.vertexCount; i++) {
  // O xatlasjs já devolve a UV normalizada (0–1).
  ru += resMesh.vertex.coords1[i * 2] / resMesh.vertexCount;
  rv += resMesh.vertex.coords1[i * 2 + 1] / resMesh.vertexCount;
}
const reserveUv: [number, number] = [ru, rv];

// Partes finais: faces vistas (vértices do xatlas) e, à parte, as nunca vistas com a UV na reserva.
type Final = { name: ArenaPart; position: number[]; index: number[]; uv: number[] };
const finals: Final[] = welded.map((w, k) => {
  const m = byName.get(w.name);
  const position: number[] = [];
  const uv: number[] = [];
  const index: number[] = [];
  if (m) {
    for (let i = 0; i < m.vertexCount; i++) {
      position.push(m.vertex.vertices[i * 3], m.vertex.vertices[i * 3 + 1], m.vertex.vertices[i * 3 + 2]);
      uv.push(m.vertex.coords1[i * 2], m.vertex.coords1[i * 2 + 1]);
    }
    index.push(...m.index);
  }
  for (let t = 0; t < w.index.length / 3; t++) {
    if (vis.parts[k][t]) continue;
    for (let c = 0; c < 3; c++) {
      const v = w.index[t * 3 + c];
      index.push(position.length / 3);
      position.push(w.position[v * 3], w.position[v * 3 + 1], w.position[v * 3 + 2]);
      uv.push(reserveUv[0], reserveUv[1]);
    }
  }
  return { name: w.name, position, index, uv };
});
xatlas.destroyAtlas();
for (const f of finals) {
  const us = f.uv.filter((_, i) => i % 2 === 0);
  const vs = f.uv.filter((_, i) => i % 2 === 1);
  say(`parte ${f.name}: ${f.position.length / 3} vértices, ${f.index.length / 3} faces, u ${Math.min(...us).toFixed(3)}–${Math.max(...us).toFixed(3)}, v ${Math.min(...vs).toFixed(3)}–${Math.max(...vs).toFixed(3)}`);
}

// ---------------------------------------------------------------------------
// 5. Bake na página: 4 setores e o mapa de posições.

await page.evaluate(
  (input) => (window as unknown as { bake: { bake: (i: unknown) => Promise<unknown> } }).bake.bake(input),
  { parts: finals, res: RES, iterations: ITERATIONS, shadowSize: SHADOW, seed: SEED }
);
await browser.close();
server.close();
say("bake na página concluído");

const asF32 = (b: Buffer) => new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
const sectors = [0, 1, 2, 3].map((s) => asF32(uploads.get(`sector-${s}`)!));
const positions = asF32(uploads.get("positions")!);
{
  const max = (a: Float32Array) => a.reduce((m, v) => (v > m ? v : m), 0);
  let alpha = 0;
  for (let i = 3; i < positions.length; i += 4) alpha += positions[i] > 0.5 ? 1 : 0;
  say(`retorno: setores máx ${sectors.map((s) => max(s).toExponential(2)).join(" ")} · posições ${positions.length / 4} texels, ${alpha} cobertos`);
}

// ---------------------------------------------------------------------------
// 6. Calibração contra a luz analítica de hoje, normalização e dilatação.

const N = RES * RES;
const mask = new Uint8Array(N);
const p = new THREE.Vector3();
const analytic = [0, 0, 0, 0];
const baked = [0, 0, 0, 0];
for (let i = 0; i < N; i++) {
  if (positions[i * 4 + 3] < 0.5) continue;
  mask[i] = 1;
  p.set(positions[i * 4], positions[i * 4 + 1], positions[i * 4 + 2]);
  if (p.y < -50) {
    // Ilha-reserva: sem luz.
    for (let s = 0; s < 4; s++) sectors[s][i] = 0;
    continue;
  }
  for (let s = 0; s < 4; s++) {
    analytic[s] += analyticSpill(p, s);
    baked[s] += sectors[s][i];
  }
}
const gain = [0, 1, 2, 3].map((s) => (baked[s] > 0 ? analytic[s] / baked[s] : 0));
const lit = sectors.map((ch, s) => {
  const out = new Float32Array(N);
  for (let i = 0; i < N; i++) out[i] = ch[i] * gain[s];
  return out;
});
const scale = lit.map((ch) => {
  const vals: number[] = [];
  for (let i = 0; i < N; i++) if (mask[i]) vals.push(ch[i]);
  vals.sort((a, b) => a - b);
  return Math.max(1e-6, vals[Math.floor(vals.length * 0.999)] ?? 1);
});
const filled = lit.map((ch) => dilate(ch, mask, RES));
let covered = 0;
for (let i = 0; i < N; i++) covered += mask[i];
say(`calibração: ganho ${gain.map((g) => g.toExponential(2)).join(" ")} · escala ${scale.map((s) => s.toFixed(3)).join(" ")} · ocupação do atlas ${((covered / N) * 100).toFixed(1)}%`);

// Pranchas do relatório: cada setor em escala de cinza (raiz).
filled.forEach((ch, s) => writeFileSync(join(WORK, `setor-${s}-${CHANNELS[s]}.png`), grayPNG(ch, RES, RES, (v) => Math.sqrt(Math.min(1, v / scale[s])))));

// ---------------------------------------------------------------------------
// 7. Texturas por tier: mipmaps em espaço linear, depois raiz + dither, KTX2.

for (const f of readdirSync(OUT)) if (/^arena-light-\d+\.ktx2$/.test(f)) rmSync(join(OUT, f));
const tiers = Object.entries(TIER_RES) as [BakeTier, number][];
const files: Record<string, string> = {};
const sizes: Record<string, number> = {};
for (const [tier, full] of tiers) {
  // No bake rápido (--res menor), os tiers encolhem junto.
  const res = Math.max(4, (full / TIER_RES.high) * RES);
  let base = filled;
  for (let r = RES; r > res; r >>= 1) base = base.map((ch) => downsample(ch, r));
  const chains = base.map((ch) => mipChain(ch, res));
  const levels = chains[0].map((lvl, k) => ({ rgba: encodeRGBA8(chains.map((c) => c[k].data), lvl.res, scale, SEED + k), res: lvl.res }));
  const ktx = await encodeKTX2(levels);
  const name = `arena-light-${res}.ktx2`;
  writeFileSync(join(OUT, name), ktx);
  files[tier] = `/models/${name}`;
  sizes[tier] = ktx.byteLength;
  if (tier === "high") {
    // Referência float (mesma cadeia, sem quantizar, sem comprimir) para a verificação.
    const ref = chains[0].map((lvl, k) => encodeFloat(chains.map((c) => c[k].data), lvl.res, scale));
    const total = ref.reduce((n, a) => n + a.length, 0);
    const buf = new Float32Array(total);
    let o = 0;
    for (const a of ref) {
      buf.set(a, o);
      o += a.length;
    }
    writeFileSync(join(WORK, "ref-high.f32"), Buffer.from(buf.buffer));
  }
  say(`${tier}: ${name} ${(ktx.byteLength / 1024).toFixed(0)} KB (${levels.length} níveis)`);
}

// ---------------------------------------------------------------------------
// 8. glTF: as partes com a UV do lightmap, quantizadas e com meshopt.

const doc = new Document();
const buffer = doc.createBuffer();
const scene = doc.createScene("arena");
for (const f of finals) {
  const prim = doc
    .createPrimitive()
    .setAttribute("POSITION", doc.createAccessor().setType("VEC3").setArray(new Float32Array(f.position)).setBuffer(buffer))
    .setAttribute("TEXCOORD_0", doc.createAccessor().setType("VEC2").setArray(new Float32Array(f.uv)).setBuffer(buffer))
    .setIndices(doc.createAccessor().setType("SCALAR").setArray(f.position.length / 3 > 65535 ? new Uint32Array(f.index) : new Uint16Array(f.index)).setBuffer(buffer));
  const mesh = doc.createMesh(f.name).addPrimitive(prim);
  scene.addChild(doc.createNode(f.name).setMesh(mesh));
}
await MeshoptEncoder.ready;
await doc.transform(quantize({ quantizePosition: 14, quantizeTexcoord: 16 }), meshopt({ encoder: MeshoptEncoder, level: "medium" }));
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder });
const glb = await io.writeBinary(doc);
writeFileSync(join(OUT, "arena.glb"), glb);
say(`arena.glb ${(glb.byteLength / 1024).toFixed(0)} KB`);

// ---------------------------------------------------------------------------
// 9. Metadados: escalas, canais, hash (bake vencido) e o relatório.

const meta = {
  version: BAKE_VERSION,
  hash: arenaHash(),
  channels: CHANNELS,
  encoding: "sqrt",
  /** Luz do setor s = scale[s] × canal² (o shader soma os 4, pesados por uLightOn). */
  scale,
  reserveUv,
  glb: "/models/arena.glb",
  lightmap: files,
  bake: { res: RES, iterations: ITERATIONS, shadow: SHADOW, renderer },
  stats: {
    cameras: vis.samples,
    faces: facesTotal,
    facesOutside: facesOut,
    areaOutside: Number((areaOut / areaTotal).toFixed(4)),
    atlasOccupancy: Number((covered / N).toFixed(4)),
    texelsPerUnit: Number(atlas.texelsPerUnit.toFixed(3)),
    bytes: { glb: glb.byteLength, ...sizes }
  }
};
writeFileSync(join(OUT, "arena-light.json"), JSON.stringify(meta, null, 2) + "\n");
copyFileSync(join(OUT, "arena-light.json"), join(WORK, "arena-light.json"));
say(`pronto: public/models/arena-light.json (hash ${meta.hash.slice(0, 12)}…)`);
