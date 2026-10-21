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

test.describe("pênaltis (WebGL)", () => {
  test("o jogo 3D monta e uma cobrança com o mouse dá resultado", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.addInitScript(() => sessionStorage.setItem("gd:booted", "1"));
    await page.goto("/penalti");
    const field = page.getByRole("application");
    await field.scrollIntoViewIfNeeded();
    await expect(field.locator("canvas")).toHaveCount(1, { timeout: 15_000 });
    await page.waitForTimeout(1500);
    const box = (await field.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.45);
    await page.mouse.down();
    await page.waitForTimeout(500);
    await page.mouse.up();
    await expect(page.locator("#penalty-status")).toHaveText(/Gol!|Defendeu!|Na trave!|Pra fora!/, { timeout: 10_000 });
    expect(errors).toEqual([]);
  });
});
