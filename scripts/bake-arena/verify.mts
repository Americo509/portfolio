/**
 * Verificação do bake (docs/bake-luz.md §5 e §7), contra o site rodando. Uso:
 *   pnpm bake:verify http://localhost:3000 [setores|degraus|claro|atlas]
 * Gera em scripts/bake-arena/out/verify/: grade por setor, comparação float × KTX2 e
 * teste de degraus (tudo aceso e só o norte), tema claro e a prancha da abertura com
 * as faces fora do atlas em magenta. Imprime o resumo e grava resumo.json.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Page } from "@playwright/test";
import { PNG } from "pngjs";

const here = dirname(fileURLToPath(import.meta.url));
const site = process.argv[2] ?? "http://localhost:3000";
const OUT = join(here, "out/verify");
mkdirSync(OUT, { recursive: true });
const say = (m: string) => console.log(`[verificação] ${m}`);

// A referência float sai do bake (out/ref-high.f32), servida com CORS para o site.
const ref = readFileSync(join(here, "out/ref-high.f32"));
const server = createServer((_, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(ref);
});
await new Promise<void>((r) => server.listen(0, r));
const refUrl = `http://localhost:${(server.address() as { port: number }).port}/ref.f32`;

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });

type Opts = { query?: string; storage?: Record<string, string>; viewport?: { width: number; height: number } };
async function open({ query = "", storage = {}, viewport = { width: 1440, height: 900 } }: Opts) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  // Sem GPU, um quadro em 1440 × 900 pode levar segundos.
  page.setDefaultTimeout(180_000);
  page.on("pageerror", (e) => say(`erro na página: ${e.message}`));
  await page.addInitScript((st: Record<string, string>) => {
    sessionStorage.setItem("gd:booted", "1");
    for (const [k, v] of Object.entries(st)) localStorage.setItem(k, v);
  }, storage);
  await page.goto(`${site}/?debug&nograin${query}`, { waitUntil: "load", timeout: 180_000 });
  await page.waitForFunction(() => {
    const w = window as unknown as { __bake?: { loaded: boolean }; __intro?: unknown };
    return w.__bake?.loaded && w.__intro;
  }, null, { timeout: 240_000, polling: 250 });
  // Abertura no fim, relógio congelado e só a cena no quadro.
  await page.evaluate(() => {
    const w = window as unknown as { __intro: { t: number; wait: number }; __bake: { freeze: number }; __scene: { traverse: (f: (o: { material?: { depthTest?: boolean }; visible: boolean }) => void) => void } };
    w.__intro.t = 1;
    w.__intro.wait = 0;
    w.__bake.freeze = 20;
    w.__scene.traverse((o) => {
      if (o.material && o.material.depthTest === false) o.visible = false;
    });
  });
  await page.addStyleTag({ content: "body *:not(canvas){visibility:hidden !important} canvas{visibility:visible !important}" });
  await page.evaluate(() => {
    let el: HTMLElement | null = document.querySelector("canvas");
    while (el) {
      el.style.visibility = "visible";
      el = el.parentElement;
    }
  });
  return page;
}

async function shot(page: Page, set: { baked?: number; sectors?: number[] | null; scrub?: number | null }, settle = 3500) {
  await page.evaluate((s) => {
    const w = window as unknown as { __bake: { baked: number | null; sectors: number[] | null }; __cameraDebug: { getState: () => { set: (p: object) => void } } };
    if (s.baked !== undefined) w.__bake.baked = s.baked;
    if (s.sectors !== undefined) w.__bake.sectors = s.sectors;
    if (s.scrub !== undefined) w.__cameraDebug.getState().set({ scrub: s.scrub });
  }, set);
  await page.waitForTimeout(settle);
  return PNG.sync.read(await page.screenshot());
}

const save = (png: PNG, name: string) => writeFileSync(join(OUT, name), PNG.sync.write(png));
const luma = (d: Buffer, i: number) => (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;

/**
 * Float × KTX2 nas regiões escuras (luminância < 0,1 na referência): diferença média e
 * máxima (em níveis de 8 bits) e degraus: pixels onde a referência é lisa (vizinhos a
 * menos de 1 nível) e o KTX2 salta 2 níveis ou mais.
 */
function compare(a: PNG, b: PNG) {
  const { width: w, height: h } = a;
  let n = 0;
  let sum = 0;
  let max = 0;
  let smooth = 0;
  let steps = 0;
  const diff = new PNG({ width: w, height: h });
  for (let y = 1; y < h; y++)
    for (let x = 1; x < w; x++) {
      const i = (y * w + x) * 4;
      diff.data[i + 3] = 255;
      if (luma(a.data, i) >= 0.1) continue;
      n++;
      let d = 0;
      for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(a.data[i + c] - b.data[i + c]));
      sum += d;
      max = Math.max(max, d);
      diff.data[i] = diff.data[i + 1] = diff.data[i + 2] = Math.min(255, d * 40);
      for (const j of [i - 4, i - w * 4]) {
        let ga = 0;
        let gb = 0;
        for (let c = 0; c < 3; c++) {
          ga = Math.max(ga, Math.abs(a.data[i + c] - a.data[j + c]));
          gb = Math.max(gb, Math.abs(b.data[i + c] - b.data[j + c]));
        }
        if (ga < 1) {
          smooth++;
          if (gb >= 2) steps++;
        }
      }
    }
  return { darkPixels: n, meanDiff: n ? sum / n : 0, maxDiff: max, smoothPairs: smooth, steps, stepRatio: smooth ? steps / smooth : 0, diff };
}

const result: Record<string, unknown> = {};

const only = process.argv[3];
const run = (step: string) => !only || only === step;

// 1. Grade por setor (hero, tier alto).
if (run("setores")) {
  const page = await open({ query: "&tier=high" });
  const names = ["sul", "leste", "oeste", "norte"];
  const tiles: PNG[] = [];
  for (let s = 0; s < 4; s++) tiles.push(await shot(page, { baked: 1, sectors: [0, 1, 2, 3].map((k) => (k === s ? 1 : 0)) }));
  tiles.forEach((t, s) => save(t, `setor-${s}-${names[s]}.png`));
  await page.close();
  say("grade por setor: ok");
}

// 2. Float × KTX2 na mesma página (mesma fumaça, mesmo quadro congelado): hero com tudo
// aceso e o fim do apito final com só o norte.
for (const [name, set] of (run("degraus") ? [
  ["hero-tudo-aceso", { sectors: null, scrub: null }],
  ["apito-final-so-norte", { sectors: [0, 0, 0, 1], scrub: 6.62 }]
] as const : [])) {
  const page = await open({ query: "&tier=high" });
  await page.evaluate((url) => (window as unknown as { __bake: { loadRef: (u: string) => Promise<void> } }).__bake.loadRef(url), refUrl);
  const b = await shot(page, { baked: 1, ...set }, 5000);
  await page.evaluate(() => ((window as unknown as { __bake: { useRef: boolean } }).__bake.useRef = true));
  const a = await shot(page, {}, 3000);
  await page.close();
  save(a, `${name}-float.png`);
  save(b, `${name}-ktx2.png`);
  const c = compare(a, b);
  save(c.diff, `${name}-diferenca-x40.png`);
  const { diff: _diff, ...stats } = c;
  void _diff;
  result[name] = stats;
  say(`${name}: diferença média ${stats.meanDiff.toFixed(3)} nível, máx ${stats.maxDiff}, degraus ${stats.steps}/${stats.smoothPairs} (${(stats.stepRatio * 100).toFixed(3)}%) em ${stats.darkPixels} pixels escuros`);
}

// 3. Tema claro com o bake.
if (run("claro")) {
  const page = await open({ query: "&tier=high", storage: { "gustavo-portfolio-theme": "light" } });
  save(await shot(page, { baked: 1, sectors: null }), "tema-claro.png");
  await page.close();
  say("tema claro: ok");
}

// 4. Faces fora do atlas em magenta (tier baixo, sem pós: o magenta chega puro na tela),
// nos quadros da abertura e ao longo das trilhas.
if (run("atlas")) {
  let magenta = 0;
  let frames = 0;
  const sheet: PNG[] = [];
  for (const [label, viewport] of [
    ["desktop", { width: 960, height: 540 }],
    ["mobile", { width: 390, height: 844 }]
  ] as const) {
    const page = await open({ query: "&tier=low&bakeCheck", viewport });
    const count = (png: PNG) => {
      let m = 0;
      for (let i = 0; i < png.data.length; i += 4) if (png.data[i] > 200 && png.data[i + 1] < 60 && png.data[i + 2] > 200) m++;
      return m;
    };
    for (let k = 0; k <= 12; k++) {
      await page.evaluate((t) => {
        const w = window as unknown as { __intro: { t: number; wait: number } };
        w.__intro.t = t;
      }, k / 12);
      const png = await shot(page, { baked: 1 }, 1200);
      const m = count(png);
      if (m) {
        say(`  magenta: ${m} px na abertura t=${(k / 12).toFixed(2)} (${label})`);
        save(png, `magenta-abertura-${label}-${k}.png`);
      }
      magenta += m;
      frames++;
      if (label === "desktop") sheet.push(png);
    }
    for (let g = 0; g <= 7; g += 0.25) {
      const png = await shot(page, { baked: 1, scrub: g }, 1200);
      const m = count(png);
      if (m) {
        say(`  magenta: ${m} px na trilha g=${g} (${label})`);
        save(png, `magenta-trilha-${label}-${g}.png`);
      }
      magenta += m;
      frames++;
    }
    await page.close();
  }
  // Prancha: 13 quadros da abertura (desktop), 4 por linha.
  const tw = 240;
  const th = 135;
  const out = new PNG({ width: tw * 4, height: th * Math.ceil(sheet.length / 4) });
  sheet.forEach((png, k) => {
    for (let y = 0; y < th; y++)
      for (let x = 0; x < tw; x++) {
        const sx = Math.floor((x / tw) * png.width);
        const sy = Math.floor((y / th) * png.height);
        const si = (sy * png.width + sx) * 4;
        const di = ((Math.floor(k / 4) * th + y) * out.width + (k % 4) * tw + x) * 4;
        png.data.copy(out.data, di, si, si + 4);
      }
  });
  save(out, "abertura-faces-fora-do-atlas.png");
  result.facesForaDoAtlas = { quadros: frames, pixelsMagenta: magenta };
  say(`faces fora do atlas: ${magenta} pixels magenta em ${frames} quadros (abertura e trilhas, desktop e mobile)`);
}

writeFileSync(join(OUT, "resumo.json"), JSON.stringify(result, null, 2) + "\n");
await browser.close();
server.close();
