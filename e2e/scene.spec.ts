import { test, expect } from "@playwright/test";

test.describe("cena 3D (estádio)", () => {
  test("monta depois do preloader, sem erros, e some o fallback", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.addInitScript(() => sessionStorage.setItem("gd:booted", "1"));
    await page.goto("/?tier=low");
    await expect(page.locator("canvas")).toHaveCount(1, { timeout: 15_000 });
    // O fallback estático esmaece quando a cena sinaliza "pronta".
    await expect(page.locator(".static-stadium")).toHaveClass(/opacity-0/, { timeout: 20_000 });
    expect(errors).toEqual([]);
  });

  test("a cena também monta nas páginas internas (modo ambiente)", async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem("gd:booted", "1"));
    await page.goto("/about?tier=low");
    await expect(page.locator("canvas")).toHaveCount(1, { timeout: 15_000 });
  });
});
