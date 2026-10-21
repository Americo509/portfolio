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
  /** O preloader terminou (ou não foi exibido). */
  booted: boolean;
  sceneStatus: SceneStatus;
  setBooted: (v: boolean) => void;
  setSceneStatus: (s: SceneStatus) => void;
};

export const useApp = create<AppState>((set) => ({
  booted: false,
  sceneStatus: "idle",
  setBooted: (booted) => set({ booted }),
  setSceneStatus: (sceneStatus) => set({ sceneStatus })
}));
