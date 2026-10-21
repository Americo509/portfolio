import { create } from "zustand";

/**
 * Estado contínuo (lido a cada frame pela cena e pelo HUD). Fica fora do React
 * de propósito: atualizar isso a 60fps via setState causaria re-render.
 */
export const motionState = {
  /** Velocidade instantânea do Lenis (px/frame). */
  velocity: 0,
  /** Velocidade suavizada e normalizada em [-1, 1]. */
  velocityNorm: 0,
  /** Progresso do scroll da página em [0, 1]. */
  progress: 0,
  /** Ponteiro normalizado em [-1, 1]. */
  pointer: { x: 0, y: 0 }
};

export type SceneStatus = "idle" | "loading" | "ready" | "fallback";

type AppState = {
  /** O obturador do preloader começou a abrir (ou não houve preloader): o hero entra. */
  booted: boolean;
  /** O preloader saiu de cena por completo: só então a cena 3D compila (evita travar a abertura). */
  bootDone: boolean;
  sceneStatus: SceneStatus;
  setBooted: (v: boolean) => void;
  setBootDone: (v: boolean) => void;
  setSceneStatus: (s: SceneStatus) => void;
};

export const useApp = create<AppState>((set) => ({
  booted: false,
  bootDone: false,
  sceneStatus: "idle",
  setBooted: (booted) => set({ booted }),
  setBootDone: (bootDone) => set({ bootDone }),
  setSceneStatus: (sceneStatus) => set({ sceneStatus })
}));
