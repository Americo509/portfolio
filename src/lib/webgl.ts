export function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Tier de GPU aproximado, usado para escolher densidade de partículas e DPR. */
export type GpuTier = "low" | "mid" | "high";

export function guessTier(): GpuTier {
  // Override para QA/prints: ?tier=low|mid|high
  const forced = new URLSearchParams(window.location.search).get("tier");
  if (forced === "low" || forced === "mid" || forced === "high") return forced;
  const cores = navigator.hardwareConcurrency ?? 4;
  const small = window.matchMedia("(max-width: 768px)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (cores <= 4 || (small && coarse && cores <= 6)) return "low";
  if (small || coarse) return "mid";
  return "high";
}
