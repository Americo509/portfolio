import * as THREE from "three";
import { CONE_TAN, FLARES, LIGHTS } from "./config";

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
    uBg: { value: new THREE.Color() },
    uSignal: { value: new THREE.Color() },
    uFlares: { value: FLARES.map((f) => f.clone().add(shift)) },
    uFlare: { value: 1 },
    uDim: { value: 0 },
    uFogMul: { value: 1 },
    uLightOn: { value: [1, 1, 1, 1] },
    uScale: { value: 1 },
    uCamPos: { value: new THREE.Vector3() }
  };
}

export type Shared = ReturnType<typeof createShared>;
