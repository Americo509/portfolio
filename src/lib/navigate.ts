/** Pede à RouteTransition uma navegação com cortina (usado fora de links, ex.: terminal). */
export const NAVIGATE_EVENT = "gd:navigate";

export function navigate(href: string) {
  window.dispatchEvent(new CustomEvent<string>(NAVIGATE_EVENT, { detail: href }));
}
