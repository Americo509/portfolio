import * as THREE from "three";
import { ProgressiveLightMap } from "three/examples/jsm/misc/ProgressiveLightMap.js";
import { AMBIENT, INTRO, TRACKS, sampleTrack, type Shot } from "../../src/components/scene/stadium/camera-track";
import { NORTH_OFFSET, PENALTY_CAMERA, penaltyFov } from "../../src/components/penalty/camera";
import { sectorLights } from "./common";

/**
 * Página do bake (roda no Chromium aberto pelo bake.ts). Só renderiza: o Node manda a
 * geometria, a página devolve quais faces as câmeras veem e, depois, a luz assada
 * de cada setor (docs/bake-luz.md §3 e §4).
 */

type PartInput = { name: string; position: number[]; index: number[] };
type BakePart = { name: string; position: number[]; index: number[]; uv: number[] };

const status = document.getElementById("status")!;
const log = (msg: string) => {
  status.textContent = msg;
  console.log(msg);
};

const canvas = document.getElementById("view") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);

// ---------------------------------------------------------------------------
// Visibilidade: cada amostra de câmera renderiza a estrutura com o número da face
// como cor; uma face conta como vista se aparece em pelo menos um pixel.

type Cam = { pos: THREE.Vector3; look: THREE.Vector3; fov: number; aspect: number };

const ID_W = 960;

/** O mesmo "para cima" do CameraRig: nas tomadas quase a pino, o norte vira o topo da tela. */
function upFor(pos: THREE.Vector3, look: THREE.Vector3) {
  const dir = look.clone().sub(pos).normalize();
  const steep = THREE.MathUtils.smoothstep(-dir.y, 0.75, 0.95);
  return new THREE.Vector3(0, 1 - steep, -steep).normalize();
}

/** Amostras de câmera: trilhas desktop e mobile, abertura, páginas internas e pênalti. */
function cameraSamples(): Cam[] {
  const cams: Cam[] = [];
  // Margem de proporção (21:9 e 9:20) e de FOV (+10%): o que escapa por um pixel de borda não fica escuro.
  const ASPECT = { desktop: 21 / 9, mobile: 9 / 20 };
  const widen = (fov: number) => fov * 1.1;
  const pointer = [
    [0, 0],
    [2.4, 1],
    [-2.4, 1],
    [2.4, -1],
    [-2.4, -1]
  ];
  const sample = { pos: new THREE.Vector3(), look: new THREE.Vector3(), lens: { ...AMBIENT.desktop } as Omit<Shot, "pos" | "look"> };

  for (const track of ["desktop", "mobile"] as const) {
    for (let g = 0; g <= 7.0001; g += 0.02) {
      sampleTrack(TRACKS[track], g, sample);
      for (const [px, py] of pointer) {
        cams.push({ pos: sample.pos.clone().add(new THREE.Vector3(px, py, 0)), look: sample.look.clone(), fov: widen(sample.lens.fov), aspect: ASPECT[track] });
      }
    }
    // Cordas: a câmera é amortecida, então num scroll rápido ela corta caminho em linha
    // reta entre pontos distantes da trilha (e mostra o que a spline não mostra).
    const a = { pos: new THREE.Vector3(), look: new THREE.Vector3(), lens: { ...sample.lens } };
    const b = { pos: new THREE.Vector3(), look: new THREE.Vector3(), lens: { ...sample.lens } };
    for (let g = 0; g <= 7.0001; g += 0.1) {
      sampleTrack(TRACKS[track], g, a);
      sampleTrack(TRACKS[track], g + 0.5, b);
      for (const u of [0.25, 0.5, 0.75]) {
        cams.push({ pos: a.pos.clone().lerp(b.pos, u), look: a.look.clone().lerp(b.look, u), fov: widen(Math.max(a.lens.fov, b.lens.fov)), aspect: ASPECT[track] });
      }
    }
    // Abertura: dolly zoom (a torcida norte do mesmo tamanho) e a descida até o hero.
    const from = track === "desktop" ? INTRO.from : { pos: INTRO.fromMobile.pos, fov: INTRO.fromMobile.fov };
    const mid = track === "desktop" ? INTRO.mid : INTRO.midMobile;
    sampleTrack(TRACKS[track], 0, sample);
    const halfSize = from.pos.distanceTo(INTRO.subject) * Math.tan(THREE.MathUtils.degToRad(from.fov / 2));
    const vertigo = (p: THREE.Vector3) => THREE.MathUtils.radToDeg(2 * Math.atan(halfSize / p.distanceTo(INTRO.subject)));
    const total = INTRO.dolly + INTRO.descent;
    for (let i = 0; i <= 120; i++) {
      const T = (i / 120) * total;
      let pos: THREE.Vector3, look: THREE.Vector3, fov: number;
      if (T < INTRO.dolly) {
        const u = THREE.MathUtils.smootherstep(T / INTRO.dolly, 0, 1);
        pos = from.pos.clone().lerp(mid.pos, u);
        look = INTRO.subject.clone();
        fov = vertigo(pos);
      } else {
        const u = THREE.MathUtils.smootherstep((T - INTRO.dolly) / INTRO.descent, 0, 1);
        pos = mid.pos.clone().lerp(sample.pos, u);
        look = INTRO.subject.clone().lerp(sample.look, u);
        fov = THREE.MathUtils.lerp(vertigo(mid.pos), sample.lens.fov, u);
      }
      // Tremor da câmera na mão no começo, nos extremos.
      const shake = Math.max(0, 1 - T / 1.2);
      for (const [sx, sy] of [
        [0, 0],
        [0.35, 0.3],
        [-0.35, -0.3]
      ]) {
        const p = pos.clone().add(new THREE.Vector3(sx * shake, sy * shake, 0));
        const l = look.clone().add(new THREE.Vector3(sx * 1.4 * shake, 0, 0));
        cams.push({ pos: p, look: l, fov: widen(fov), aspect: ASPECT[track] });
      }
    }
    // Páginas internas.
    const amb = AMBIENT[track];
    for (const [px, py] of pointer) {
      cams.push({ pos: new THREE.Vector3(...amb.pos).add(new THREE.Vector3(px, py, 0)), look: new THREE.Vector3(...amb.look), fov: widen(amb.fov), aspect: ASPECT[track] });
    }
    // Pênalti, levado para as coordenadas da arena (o gol dele é a linha de fundo norte).
    const aspect = track === "desktop" ? 16 / 9 : 9 / 14;
    for (const [sx, sy] of [
      [0, 0],
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1]
    ]) {
      const s = PENALTY_CAMERA.shake / 2;
      const pos = new THREE.Vector3(PENALTY_CAMERA.pos[0] + sx * s, PENALTY_CAMERA.pos[1] + sy * s, PENALTY_CAMERA.pos[2] - NORTH_OFFSET);
      const look = new THREE.Vector3(PENALTY_CAMERA.look[0], PENALTY_CAMERA.look[1], PENALTY_CAMERA.look[2] - NORTH_OFFSET);
      cams.push({ pos, look, fov: widen(penaltyFov(aspect)), aspect: aspect > 1 ? Math.max(aspect, 21 / 9) : Math.min(aspect, 9 / 20) });
    }
  }
  return cams;
}

function idScene(parts: PartInput[]) {
  const scene = new THREE.Scene();
  const mat = new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      attribute vec3 aId;
      varying vec3 vId;
      void main() { vId = aId; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      varying vec3 vId;
      void main() { gl_FragColor = vec4(vId, 1.0); }`,
    side: THREE.DoubleSide
  });
  let face = 0;
  const offsets: number[] = [];
  for (const part of parts) {
    offsets.push(face);
    const tri = part.index.length / 3;
    const pos = new Float32Array(part.index.length * 3);
    const id = new Float32Array(part.index.length * 3);
    for (let t = 0; t < tri; t++) {
      // Id + 1 (0 é o fundo), em 24 bits, um byte por canal.
      const n = face + t + 1;
      const c = [(n & 255) / 255, ((n >> 8) & 255) / 255, ((n >> 16) & 255) / 255];
      for (let k = 0; k < 3; k++) {
        const vi = part.index[t * 3 + k];
        pos.set(part.position.slice(vi * 3, vi * 3 + 3), (t * 3 + k) * 3);
        id.set(c, (t * 3 + k) * 3);
      }
    }
    face += tri;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aId", new THREE.BufferAttribute(id, 3));
    scene.add(new THREE.Mesh(g, mat));
  }
  return { scene, offsets, faces: face };
}

async function visibility(parts: PartInput[]) {
  const { scene, offsets, faces } = idScene(parts);
  const seen = new Uint8Array(faces);
  const cams = cameraSamples();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 600);
  const targets = new Map<string, THREE.WebGLRenderTarget>();
  const buf = new Map<string, Uint8Array>();
  renderer.setClearColor(0x000000, 0);
  for (let i = 0; i < cams.length; i++) {
    const c = cams[i];
    const w = c.aspect >= 1 ? ID_W : Math.round(ID_W * c.aspect * 1.4);
    const h = c.aspect >= 1 ? Math.round(ID_W / c.aspect) : Math.round(ID_W * 1.4);
    const key = `${w}x${h}`;
    if (!targets.has(key)) {
      targets.set(key, new THREE.WebGLRenderTarget(w, h, { type: THREE.UnsignedByteType }));
      buf.set(key, new Uint8Array(w * h * 4));
    }
    const rt = targets.get(key)!;
    camera.fov = c.fov;
    camera.aspect = w / h;
    camera.position.copy(c.pos);
    camera.up.copy(upFor(c.pos, c.look));
    camera.lookAt(c.look);
    camera.updateProjectionMatrix();
    renderer.setRenderTarget(rt);
    renderer.clear();
    renderer.render(scene, camera);
    const px = buf.get(key)!;
    renderer.readRenderTargetPixels(rt, 0, 0, w, h, px);
    for (let p = 0; p < px.length; p += 4) {
      const n = px[p] | (px[p + 1] << 8) | (px[p + 2] << 16);
      if (n > 0) seen[n - 1] = 1;
    }
    if (i % 200 === 0) log(`visibilidade: ${i}/${cams.length} câmeras`);
  }
  renderer.setRenderTarget(null);
  targets.forEach((t) => t.dispose());
  // Uma lista de faces vistas por parte.
  return {
    samples: cams.length,
    parts: parts.map((p, k) => Array.from(seen.subarray(offsets[k], offsets[k] + p.index.length / 3)))
  };
}

// ---------------------------------------------------------------------------
// Bake: um ProgressiveLightMap por setor, com só as luzes daquele setor.

/** PRNG determinístico (o bake sai igual a cada execução). */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bakeMesh(parts: BakePart[]) {
  // Uma malha só, sem índice (normais de face), com o atlas no atributo uv: o potpack
  // do ProgressiveLightMap vira a identidade e o uv1 sai igual ao atlas.
  const pos: number[] = [];
  const uv: number[] = [];
  for (const part of parts) {
    for (const vi of part.index) {
      pos.push(part.position[vi * 3], part.position[vi * 3 + 1], part.position[vi * 3 + 2]);
      uv.push(part.uv[vi * 2], part.uv[vi * 2 + 1]);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x000000, side: THREE.DoubleSide }));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makeLight(l: ReturnType<typeof sectorLights>[number], shadowSize: number) {
  const light = new THREE.SpotLight(0xffffff, l.intensity * 4000, 0, l.angle, l.penumbra, 2);
  light.position.set(...l.pos);
  light.target.position.set(...l.target);
  light.castShadow = true;
  light.shadow.mapSize.set(shadowSize, shadowSize);
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 260;
  light.shadow.bias = -0.0004;
  light.shadow.normalBias = 0.04;
  return light;
}

async function upload(path: string, data: ArrayBufferView) {
  const res = await fetch(path, { method: "POST", body: data as unknown as BodyInit });
  if (!res.ok) throw new Error(`upload ${path}: ${res.status}`);
}

/** Mostra o lightmap acumulando (útil no --headed). */
function preview(texture: THREE.Texture) {
  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms: { map: { value: texture } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: "uniform sampler2D map; varying vec2 vUv; void main(){ gl_FragColor = vec4(sqrt(texture2D(map, vUv).rgb * 0.5), 1.0); }"
    })
  );
  const s = new THREE.Scene();
  s.add(quad);
  renderer.setRenderTarget(null);
  renderer.render(s, new THREE.Camera());
  quad.geometry.dispose();
  (quad.material as THREE.Material).dispose();
}

async function bake(input: { parts: BakePart[]; res: number; iterations: number; shadowSize: number; seed: number }) {
  const { parts, res, iterations, shadowSize } = input;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 600);
  camera.position.set(0, 60, 120);
  camera.lookAt(0, 0, 0);
  const random = rng(input.seed);

  for (let sector = 0; sector < 4; sector++) {
    const mesh = bakeMesh(parts);
    const world = new THREE.Scene();
    world.add(mesh);
    const specs = sectorLights(sector);
    const lights = specs.map((l) => makeLight(l, shadowSize));
    const plm = new ProgressiveLightMap(renderer, res);
    // Sem especular: o mapa guarda só a irradiância difusa.
    const uvMat = (plm as unknown as { uvMat: THREE.MeshPhongMaterial }).uvMat;
    uvMat.specular = new THREE.Color(0x000000);
    uvMat.shininess = 0;
    // O xatlas pode espelhar ilhas: no espaço da UV, o triângulo fica no sentido
    // horário e o material de um lado só o descartaria (ilha preta). Os dois lados,
    // sem inverter a normal no verso (o verso aqui é só a UV espelhada).
    uvMat.side = THREE.DoubleSide;
    const patch = uvMat.onBeforeCompile.bind(uvMat);
    uvMat.onBeforeCompile = (shader, r) => {
      patch(shader, r);
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <normal_fragment_begin>",
        THREE.ShaderChunk.normal_fragment_begin.replace("gl_FrontFacing ? 1.0 : - 1.0", "1.0")
      );
    };
    plm.addObjectsToLightMap([mesh, ...lights] as unknown as THREE.Mesh[]);
    // Os alvos dos spots precisam estar na cena interna (o addObjects trataria como malha).
    lights.forEach((l) => (plm as unknown as { scene: THREE.Scene }).scene.add(l.target));
    const t0 = performance.now();
    for (let i = 0; i < iterations; i++) {
      // Jitter dentro do retângulo de cada luz: penumbra das sombras.
      specs.forEach((s, k) => {
        const a = new THREE.Vector3(...s.along);
        const u = (random() - 0.5) * s.jitter[0];
        const v = (random() - 0.5) * s.jitter[1];
        lights[k].position.set(...s.pos).addScaledVector(a, u).add(new THREE.Vector3(0, v, 0));
      });
      // Janela = número da iteração: média de verdade, não a média móvel da classe.
      plm.update(camera, i + 1, true);
      if (i % 16 === 0 || i === iterations - 1) {
        const latest = (plm as unknown as { buffer1Active: boolean }).buffer1Active ? plm.progressiveLightMap2 : plm.progressiveLightMap1;
        preview(latest.texture);
        const eta = ((performance.now() - t0) / (i + 1)) * (iterations - i - 1);
        log(`setor ${sector + 1}/4 · iteração ${i + 1}/${iterations} · faltam ~${Math.round(eta / 1000)} s`);
        await new Promise((r) => setTimeout(r, 0));
      }
    }
    const latest = (plm as unknown as { buffer1Active: boolean }).buffer1Active ? plm.progressiveLightMap2 : plm.progressiveLightMap1;
    const rgba = new Float32Array(res * res * 4);
    renderer.readRenderTargetPixels(latest, 0, 0, res, res, rgba);
    const gray = new Float32Array(res * res);
    for (let i = 0; i < gray.length; i++) gray[i] = rgba[i * 4];
    await upload(`/upload/sector-${sector}`, gray);
    plm.progressiveLightMap1.dispose();
    plm.progressiveLightMap2.dispose();
    lights.forEach((l) => l.dispose());
    mesh.geometry.dispose();
    world.clear();
  }

  // Mapa de posições no espaço do lightmap: calibração contra a luz analítica e
  // máscara de cobertura (alfa 1 onde há ilha).
  const mesh: THREE.Mesh = bakeMesh(parts);
  mesh.material = new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() { vWorld = position; gl_Position = vec4(uv * 2.0 - 1.0, 0.0, 1.0); }`,
    fragmentShader: /* glsl */ `
      varying vec3 vWorld;
      void main() { gl_FragColor = vec4(vWorld, 1.0); }`,
    side: THREE.DoubleSide
  });
  const s = new THREE.Scene();
  s.add(mesh);
  const rt = new THREE.WebGLRenderTarget(res, res, { type: THREE.FloatType });
  renderer.setClearColor(0x000000, 0);
  renderer.setRenderTarget(rt);
  renderer.clear();
  renderer.render(s, camera);
  const posMap = new Float32Array(res * res * 4);
  renderer.readRenderTargetPixels(rt, 0, 0, res, res, posMap);
  renderer.setRenderTarget(null);
  rt.dispose();
  await upload("/upload/positions", posMap);
  log("bake concluído");
  return { ok: true };
}

Object.assign(window, { bake: { visibility, bake } });
log("pronto");
