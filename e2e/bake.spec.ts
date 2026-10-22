import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { arenaHash } from "../scripts/bake-arena/hash";

// Luz assada (docs/bake-luz.md §6b): o hash da geometria, das luzes e dos parâmetros do
// bake tem que bater com o do arena-light.json. Mexeu na arena ou nas luzes sem refazer
// o bake, o teste falha em vez de o site subir com a luz errada.
test("a luz assada está em dia com a geometria e as luzes", () => {
  const meta = JSON.parse(readFileSync("public/models/arena-light.json", "utf8")) as { hash: string };
  expect(arenaHash(), "Bake vencido: rode pnpm bake:arena").toBe(meta.hash);
});
