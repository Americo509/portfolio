import { test, expect } from "@playwright/test";
import {
  createKeeper,
  GOAL,
  isMuralha,
  mulberry32,
  newShootout,
  nextTurn,
  readRate,
  resolveShot,
  saveChance,
  updateStreak,
  winner,
  zoneOf
} from "../src/lib/penalty/engine";

// Testes unitários da lógica pura (rodam no Node, sem navegador).
test.describe("pênaltis: lógica", () => {
  test("zonas do gol", () => {
    expect(zoneOf(-3, 0.3)).toBe(0);
    expect(zoneOf(0, 1.2)).toBe(4);
    expect(zoneOf(3, 2.3)).toBe(8);
    expect(zoneOf(4, 1)).toBeNull();
    expect(zoneOf(0, 2.6)).toBeNull();
  });

  test("goleiro aprende a zona preferida do batedor", () => {
    const keeper = createKeeper(mulberry32(1977));
    for (let i = 0; i < 6; i++) keeper.record(2);
    const picks = Array.from({ length: 400 }, () => keeper.pick());
    const share = picks.filter((z) => z === 2).length / picks.length;
    expect(share).toBeGreaterThan(0.6);
  });

  test("primeira cobrança: goleiro escolhe sem histórico (qualquer zona)", () => {
    const keeper = createKeeper(mulberry32(8));
    const zones = new Set(Array.from({ length: 200 }, () => keeper.pick()));
    expect(zones.size).toBe(9);
  });

  test("força demais isola por cima; na trave conta como bola na trave", () => {
    expect(resolveShot({ x: 0, y: 2.0, power: 1, curve: 0 }, 4, false).outcome).toBe("miss");
    expect(resolveShot({ x: GOAL.halfWidth, y: 1, power: 0.5, curve: 0 }, 4, false).outcome).toBe("post");
  });

  test("defesa é mais provável na zona certa e com a Muralha", () => {
    expect(saveChance(0, 0, 0.5, false)).toBeGreaterThan(saveChance(0, 2, 0.5, false));
    expect(saveChance(0, 1, 0.5, true)).toBeGreaterThan(saveChance(0, 1, 0.5, false));
    expect(saveChance(0, 8, 0.5, true)).toBe(0);
  });

  test("regras da disputa: decide antes das 5 e morte súbita", () => {
    let s = newShootout();
    // Você perde as 3 primeiras, Gustavo converte as 3: 0 × 3 com 2 restantes → decidido.
    for (let i = 0; i < 3; i++) {
      expect(nextTurn(s)).toBe("you");
      s = { ...s, you: [...s.you, false] };
      s = { ...s, gustavo: [...s.gustavo, true] };
    }
    expect(winner(s)).toBe("gustavo");

    let t = newShootout();
    for (let i = 0; i < 5; i++) t = { ...t, you: [...t.you, true], gustavo: [...t.gustavo, true] };
    expect(winner(t)).toBeNull();
    t = { ...t, you: [...t.you, true] };
    expect(winner(t)).toBeNull();
    t = { ...t, gustavo: [...t.gustavo, false] };
    expect(winner(t)).toBe("you");
  });

  test("Modo Muralha 2012: 2 defesas seguidas", () => {
    let s = newShootout();
    s = updateStreak(s, "save");
    expect(isMuralha(s)).toBe(false);
    s = updateStreak(s, "save");
    expect(isMuralha(s)).toBe(true);
    s = updateStreak(s, "goal");
    expect(isMuralha(s)).toBe(false);
  });

  test("taxa de leitura do goleiro", () => {
    expect(
      readRate([
        { shotZone: 1, keeperZone: 1 },
        { shotZone: 2, keeperZone: 0 },
        { shotZone: null, keeperZone: 4 }
      ])
    ).toBe(0.5);
  });
});
