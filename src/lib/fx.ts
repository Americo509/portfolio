/**
 * Registro das imagens com efeito WebGL (FxImage). O canvas sobreposto
 * (ImageFxCanvas) desenha cada item exatamente sobre o elemento do DOM; o DOM
 * continua sendo o fallback (e a fonte de verdade para layout e acessibilidade).
 */
export type FxItem = {
  id: number;
  el: HTMLElement;
  src: string;
  hover: number;
  hoverTarget: number;
  mouse: { x: number; y: number };
  reveal: number;
};

let nextId = 1;
const items = new Map<number, FxItem>();
const listeners = new Set<() => void>();
let snapshot: FxItem[] = [];

function emit() {
  snapshot = Array.from(items.values());
  listeners.forEach((l) => l());
}

export const fxRegistry = {
  add(el: HTMLElement, src: string): FxItem {
    const item: FxItem = { id: nextId++, el, src, hover: 0, hoverTarget: 0, mouse: { x: 0.5, y: 0.5 }, reveal: 0 };
    items.set(item.id, item);
    emit();
    return item;
  },
  remove(id: number) {
    items.delete(id);
    emit();
  },
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
  getSnapshot: () => snapshot
};
