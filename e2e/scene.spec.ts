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

  test("com compilação paralela, monta em etapas e fica pronta", async ({ page }) => {
    // O Chromium de teste (SwiftShader) não tem KHR_parallel_shader_compile: simula a
    // extensão para exercitar a montagem em etapas. Sem ela, o teste acima cobre o
    // caminho direto.
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.addInitScript(() => {
      sessionStorage.setItem("gd:booted", "1");
      const COMPLETION_STATUS_KHR = 0x91b1;
      for (const Ctx of [WebGLRenderingContext, WebGL2RenderingContext]) {
        const proto = Ctx.prototype as unknown as {
          getExtension(name: string): unknown;
          getProgramParameter(program: WebGLProgram, pname: number): unknown;
        };
        const { getExtension, getProgramParameter } = proto;
        proto.getExtension = function (name) {
          return name === "KHR_parallel_shader_compile" ? { COMPLETION_STATUS_KHR } : getExtension.call(this, name);
        };
        proto.getProgramParameter = function (program, pname) {
          return pname === COMPLETION_STATUS_KHR ? true : getProgramParameter.call(this, program, pname);
        };
      }
    });
    await page.goto("/?tier=low&debug");
    await expect(page.locator("canvas")).toHaveCount(1, { timeout: 15_000 });
    await expect(page.locator(".static-stadium")).toHaveClass(/opacity-0/, { timeout: 30_000 });
    // O overlay do ?debug confirma o caminho: compilação paralela e tempo até a cena ficar pronta.
    const overlay = page.getByRole("status").filter({ hasText: "compilação paralela" });
    await expect(overlay.locator("div", { hasText: "compilação paralela" })).toContainText("sim");
    await expect(overlay.locator("div", { hasText: "cena pronta" })).toContainText(/\d+\.\d s/);
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
