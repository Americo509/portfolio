import * as THREE from "three";
import type { GpuTier } from "@/lib/webgl";
import { ARENA_MODEL } from "./config";
import { ARENA_PARTS, type ArenaPart } from "./geometry";

/**
 * Carrega a luz assada da arena (docs/bake-luz.md): o .glb com a UV do lightmap e o
 * KTX2 do tier. Uma promessa só por página: o estádio e o pênalti usam a mesma.
 */

export type BakedMeta = {
  version: number;
  hash: string;
  channels: string[];
  encoding: "sqrt";
  scale: [number, number, number, number];
  reserveUv: [number, number];
  glb: string;
  lightmap: Record<GpuTier, string>;
};

export type BakedArena = {
  meta: BakedMeta;
  /** Uma malha por parte, com a transformação do glTF (posições quantizadas). */
  meshes: Partial<Record<ArenaPart, THREE.Mesh>>;
  lightmap: THREE.Texture;
};

let cache: Promise<BakedArena> | null = null;

export function loadBakedArena(gl: THREE.WebGLRenderer, tier: GpuTier) {
  if (!ARENA_MODEL) return Promise.reject(new Error("sem luz assada"));
  return (cache ??= load(gl, tier, ARENA_MODEL).catch((e) => {
    cache = null;
    throw e;
  }));
}

async function load(gl: THREE.WebGLRenderer, tier: GpuTier, url: string): Promise<BakedArena> {
  const meta = (await (await fetch(url)).json()) as BakedMeta;
  const [{ GLTFLoader }, { KTX2Loader }, { MeshoptDecoder }] = await Promise.all([
    import("three/examples/jsm/loaders/GLTFLoader.js"),
    import("three/examples/jsm/loaders/KTX2Loader.js"),
    import("three/examples/jsm/libs/meshopt_decoder.module.js")
  ]);
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const ktx2 = new KTX2Loader().setTranscoderPath("/basis/").detectSupport(gl);
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.has("debug") ? params.get("bakeRef") : null;
    const [gltf, lightmap] = await Promise.all([loader.loadAsync(meta.glb), ref ? loadReference(ref) : ktx2.loadAsync(meta.lightmap[tier])]);
    // Dados, não cor: sem conversão de espaço de cor; mipmaps vêm prontos do bake.
    lightmap.colorSpace = THREE.NoColorSpace;
    lightmap.minFilter = THREE.LinearMipmapLinearFilter;
    lightmap.magFilter = THREE.LinearFilter;
    lightmap.wrapS = lightmap.wrapT = THREE.ClampToEdgeWrapping;
    lightmap.needsUpdate = true;
    gltf.scene.updateMatrixWorld(true);
    const meshes: BakedArena["meshes"] = {};
    gltf.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && (ARENA_PARTS as readonly string[]).includes(mesh.name)) meshes[mesh.name as ArenaPart] = mesh;
    });
    return { meta, meshes, lightmap };
  } finally {
    ktx2.dispose();
  }
}

/**
 * ?debug&bakeRef=URL: a referência float da verificação (mesma cadeia de mipmaps, sem
 * quantizar nem comprimir), no lugar do KTX2.
 */
export async function loadReference(url: string) {
  const data = new Float32Array(await (await fetch(url)).arrayBuffer());
  const levels: { data: Float32Array; width: number; height: number }[] = [];
  // Níveis quadrados, do maior ao 1×1: 4/3 × base² × 4 floats no total.
  let res = Math.round(Math.sqrt((data.length / 4) * 0.75));
  res = 2 ** Math.round(Math.log2(res));
  let offset = 0;
  for (let r = res; r >= 1; r >>= 1) {
    levels.push({ data: data.subarray(offset, offset + r * r * 4), width: r, height: r });
    offset += r * r * 4;
  }
  const tex = new THREE.DataTexture(levels[0].data, res, res, THREE.RGBAFormat, THREE.FloatType);
  tex.mipmaps = levels as unknown as THREE.DataTexture["mipmaps"];
  tex.generateMipmaps = false;
  tex.flipY = false;
  tex.colorSpace = THREE.NoColorSpace;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}
