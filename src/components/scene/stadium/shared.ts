import * as THREE from "three";
import { CONE_TAN, FLARES, LIGHTS, LIGHTS_PER_SECTOR } from "./config";

// Os materiais recebem os uniforms pelo construtor (args): assim o three guarda a
// MESMA referência e o useFrame consegue animá-los. Como prop (uniforms={...}),
// os wrappers são copiados e valores primitivos (uTime, uScale) congelam.

/**
 * Uniforms compartilhados pela arena. offsetZ desloca a luz e os sinalizadores
 * no mundo: a cena do pênalti monta a torcida norte com o gol dela em z = 0.
 */
export function createShared(offsetZ = 0) {
  const shift = new THREE.Vector3(0, 0, offsetZ);
  return {
    uTime: { value: 0 },
    uLightPos: { value: LIGHTS.map((l) => l.pos.clone().add(shift)) },
    uLightDir: { value: LIGHTS.map((l) => l.dir.clone()) },
    uConeTan: { value: CONE_TAN },
    uFg: { value: new THREE.Color() },
    /** Cor da luz dos refletores no ar (feixes e névoa): a do tema, ou dourada na Resenha. */
    uBeam: { value: new THREE.Color() },
    uBg: { value: new THREE.Color() },
    uSignal: { value: new THREE.Color() },
    uFlares: { value: FLARES.map((f) => f.clone().add(shift)) },
    uFlare: { value: 1 },
    /** Ânimo da torcida: 1 na home; menos nas páginas internas (pula e balança menos). */
    uEnergy: { value: 1 },
    uDim: { value: 0 },
    uFogMul: { value: 1 },
    uLightOn: { value: [1, 1, 1, 1] },
    // Cada setor como um segmento entre o primeiro e o último grupo de refletores.
    uSectorA: { value: [0, 1, 2, 3].map((s) => LIGHTS[s * LIGHTS_PER_SECTOR].pos.clone().add(shift)) },
    uSectorB: { value: [0, 1, 2, 3].map((s) => LIGHTS[s * LIGHTS_PER_SECTOR + LIGHTS_PER_SECTOR - 1].pos.clone().add(shift)) },
    uScale: { value: 1 },
    uCamPos: { value: new THREE.Vector3() },
    // Luz assada (docs/bake-luz.md): lightmap RGBA por setor, escala de cada canal, a
    // mistura com a luz analítica e a UV da ilha-reserva (faces fora do atlas).
    uLightmap: { value: null as THREE.Texture | null },
    uLightScale: { value: new THREE.Vector4(1, 1, 1, 1) },
    uBaked: { value: 0 },
    uReserveUv: { value: new THREE.Vector2() }
  };
}

export type Shared = ReturnType<typeof createShared>;

const luminance = (c: THREE.Color) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
/** Luminância (linear) do vermelho do Expediente, a referência de energia do sinalizador. */
const SIGNAL_LUMINANCE = luminance(new THREE.Color("#E61919"));

/**
 * A luz do sinalizador com a mesma energia em qualquer modo: só o filtro muda. O
 * âmbar da Resenha é ~2,5x mais luminoso que o vermelho e, com o mesmo ganho,
 * estourava (e o AgX o lavava de creme).
 */
export function signalLight(c: THREE.Color) {
  return c.clone().multiplyScalar(Math.min(1, SIGNAL_LUMINANCE / luminance(c)));
}
