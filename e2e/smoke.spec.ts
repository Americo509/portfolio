import { test, expect, type Page } from "@playwright/test";

const ROUTES = ["/", "/projects", "/about", "/contact", "/projects/yourbest"];

/** Pula o preloader (como numa segunda visita na mesma sessão). */
async function skipBoot(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem("gd:booted", "1"));
}

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return errors;
}

test.describe("rotas", () => {
  for (const path of ROUTES) {
    test(`${path} carrega sem erros`, async ({ page }) => {
      await skipBoot(page);
      const errors = collectErrors(page);
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("main#conteudo")).toBeVisible();
      await page.waitForTimeout(500);
      expect(errors).toEqual([]);
    });
  }

  test("rota inexistente mostra 404", async ({ page }) => {
    await skipBoot(page);
    const res = await page.goto("/nao-existe");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
  });
});

test.describe("projetos", () => {
  test.beforeEach(async ({ page }) => {
    await skipBoot(page);
    await page.goto("/projects");
  });

  test("busca ignora acentos e filtra", async ({ page }) => {
    const search = page.getByPlaceholder(/Buscar/);
    await search.fill("pagina");
    await expect(page.getByRole("link", { name: "Página de Vendas — Apple Watch" })).toBeVisible();
    await expect(page.getByRole("link", { name: "YourBest", exact: true })).toHaveCount(0);
  });

  test("filtro por tag", async ({ page }) => {
    await page.getByRole("button", { name: "Mobile", exact: true }).click();
    await expect(page.getByRole("link", { name: "YourBest", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "CookShow", exact: true })).toHaveCount(0);
  });

  test("estado vazio", async ({ page }) => {
    await page.getByPlaceholder(/Buscar/).fill("zzzzzz");
    await expect(page.getByText(/Nenhum projeto encontrado/)).toBeVisible();
  });
});

test.describe("contato", () => {
  test("valida e envia (API mockada)", async ({ page }) => {
    await skipBoot(page);
    let payload: Record<string, unknown> | null = null;
    await page.route("**/api/contact", async (route) => {
      payload = route.request().postDataJSON();
      await route.fulfill({ json: { ok: true } });
    });
    await page.goto("/contact");

    await page.getByRole("button", { name: /Enviar mensagem/ }).click();
    await expect(page.getByText("Informe seu nome.")).toBeVisible();
    await expect(page.getByText("Email inválido.")).toBeVisible();

    await page.getByPlaceholder("Seu nome").fill("Ada Lovelace");
    await page.getByPlaceholder("voce@exemplo.com").fill("ada@example.com");
    await page.getByPlaceholder(/Me conte sobre o projeto/).fill("Quero conversar sobre um sistema distribuído.");
    await page.getByRole("button", { name: /Enviar mensagem/ }).click();

    await expect(page.getByText(/Mensagem enviada/)).toBeVisible();
    expect(payload).toMatchObject({ name: "Ada Lovelace", email: "ada@example.com", company: "" });
  });
});

test.describe("navegação e acessibilidade", () => {
  test("skip link é o primeiro foco", async ({ page, isMobile }) => {
    test.skip(isMobile, "teclado só no desktop");
    await skipBoot(page);
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Pular para o conteúdo" })).toBeFocused();
  });

  test("navega pelo header com transição", async ({ page, isMobile }) => {
    await skipBoot(page);
    await page.goto("/");
    if (isMobile) await page.getByRole("button", { name: "Menu" }).click();
    const nav = page.getByRole("navigation", { name: isMobile ? "Navegação móvel" : "Navegação principal" });
    await nav.getByRole("link", { name: /Projetos/ }).click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.getByPlaceholder(/Buscar/)).toBeVisible();
  });
});

test.describe("preloader e fallbacks", () => {
  test("preloader aparece na 1ª visita e pode ser pulado", async ({ page }) => {
    await page.goto("/");
    const boot = page.locator(".boot-screen");
    await expect(boot).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(boot).toHaveCount(0, { timeout: 3000 });
    await expect(page.locator("html")).not.toHaveAttribute("data-boot", "1");
  });

  test("reduced motion: sem preloader e com fallback estático", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.locator(".boot-screen")).toBeHidden();
    await expect(page.locator("svg[aria-hidden='true'] radialGradient#sn-glow")).toHaveCount(1);
    await expect(page.locator("canvas")).toHaveCount(0);
    await ctx.close();
  });

  test("conteúdo do hero está no HTML inicial", async ({ request }) => {
    const html = await (await request.get("/")).text();
    expect(html).toContain("Gustavo Américo Rosa");
    expect(html).toContain("Projeto e construo sistemas escaláveis");
  });
});
