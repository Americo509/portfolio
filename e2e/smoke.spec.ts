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
    await expect(page.getByRole("heading", { name: "Impedimento." })).toBeVisible();
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
    await expect(page.locator('main ol a[href="/projects/yourbest"]')).toHaveCount(0);
  });

  test("filtro por tag", async ({ page }) => {
    await page.getByRole("button", { name: "Mobile", exact: true }).click();
    await expect(page.locator('main ol a[href="/projects/yourbest"]')).toBeVisible();
    await expect(page.locator('main ol a[href="/projects/cookshow"]')).toHaveCount(0);
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
    await expect(page.locator(".static-stadium")).toHaveCount(1);
    await expect(page.locator("canvas")).toHaveCount(0);
    await ctx.close();
  });

  test("conteúdo do hero está no HTML inicial", async ({ request }) => {
    const html = await (await request.get("/")).text();
    expect(html).toContain("Gustavo Américo Rosa");
    expect(html).toContain("Projeto e construo sistemas escaláveis");
  });
});

test.describe("súmulas", () => {
  test.beforeEach(async ({ page }) => skipBoot(page));

  test("sistema privado: selo, sem botão de código e capa de prancheta", async ({ page }) => {
    await page.goto("/projects/conecta-plantao");
    await expect(page.getByText(/Repositório privado/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Código →" })).toHaveCount(0);
    await expect(page.getByRole("img", { name: /CONECTA Plantão/ })).toBeVisible();
  });

  test("sem desafios informados, a seção VAR não aparece", async ({ page }) => {
    await page.goto("/projects/gustavo-os");
    await expect(page.getByRole("heading", { name: "Lances decisivos" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "VAR" })).toHaveCount(0);
  });

  test("sistema clínico da Sol Poretti: privado, sem link público, com a decisão de IA", async ({ page }) => {
    await page.goto("/projects/sol-poretti-clinico");
    await expect(page.getByRole("heading", { level: 1, name: /Sistema Clínico/ })).toBeVisible();
    await expect(page.getByText(/Repositório privado/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver ao vivo →" })).toHaveCount(0);
    await expect(page.getByText(/nada vira prontuário sem o "Aprovar"/)).toBeVisible();
  });

  test("Sol Poretti aponta para o site público", async ({ page }) => {
    await page.goto("/projects/sol-poretti");
    await expect(page.getByRole("link", { name: "Ver ao vivo →" })).toHaveAttribute("href", "https://solporettinutri.com.br");
  });
});

test.describe("sem WebGL", () => {
  test("usa o estádio estático e não monta canvas", async ({ page }) => {
    await skipBoot(page);
    await page.goto("/");
    await expect(page.locator(".static-stadium")).toHaveCount(1);
    await page.waitForTimeout(1500);
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});

test.describe("home em capítulos", () => {
  test.beforeEach(async ({ page }) => {
    await skipBoot(page);
    await page.goto("/");
  });

  test("tem os 7 capítulos da partida", async ({ page }) => {
    await expect(page.locator("[data-chapter]")).toHaveCount(7);
    for (const name of ["Escalação", "Jogos históricos", "Preleção", "Categorias de base"]) {
      await expect(page.getByRole("heading", { level: 2, name })).toBeAttached();
    }
  });

  test("escalação: escolher um jogador mostra a ficha", async ({ page }) => {
    // Os jogadores entram em cena quando a prancheta chega na tela.
    await page.locator("#ch-lineup").scrollIntoViewIfNeeded();
    const nine = page.getByRole("button", { name: /^09 — Centroavante/ });
    await expect(nine).toBeVisible({ timeout: 10_000 });
    await nine.click();
    await expect(nine).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("#09")).toBeVisible();
    await expect(page.getByText("Offline-first", { exact: true })).toBeVisible();
  });

  test("súmula da home leva ao case", async ({ page }) => {
    await page.locator('[data-chapter=matches] a[href="/projects/conecta-plantao"]').click();
    await expect(page).toHaveURL(/\/projects\/conecta-plantao$/);
  });

  test("categorias de base listam os projetos de estudo", async ({ page }) => {
    const section = page.locator("[data-chapter=academy]");
    await expect(section.getByRole("link")).toHaveCount(5);
  });
});

test.describe("pênaltis (sem WebGL: gol em grade)", () => {
  test("disputa completa em /penalti até o fim", async ({ page }) => {
    test.setTimeout(180_000);
    await skipBoot(page);
    await page.goto("/penalti");
    await expect(page.getByRole("heading", { level: 1, name: "Disputa de pênaltis" })).toBeVisible();
    const field = page.getByRole("application");
    const again = page.getByRole("button", { name: "Jogar de novo" });
    for (let i = 0; i < 14; i++) {
      const zone = field.getByRole("button", { name: i % 2 ? "ângulo direito" : "rasteiro à esquerda" });
      // Espera a próxima cobrança liberar (ou o fim da disputa).
      await expect(zone.and(page.locator(":enabled")).or(again)).toBeVisible({ timeout: 30_000 });
      if (await again.isVisible()) break;
      await zone.click();
    }
    await expect(again).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/O goleiro leu \d+% das suas cobranças/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Bateu bem. Agora bate um papo." })).toHaveAttribute("href", "/contact");
  });

  test("teaser na home: uma cobrança e link para a disputa completa", async ({ page }) => {
    await skipBoot(page);
    await page.goto("/");
    const section = page.locator("[data-chapter=penalties]");
    await section.scrollIntoViewIfNeeded();
    await section.getByRole("button", { name: "no meio", exact: true }).click();
    await expect(section.getByRole("link", { name: "Jogar a disputa completa →" })).toBeVisible({ timeout: 10_000 });
  });

  test("teclado: setas escolhem o canto e espaço bate", async ({ page, isMobile }) => {
    test.skip(isMobile, "teclado só no desktop");
    await skipBoot(page);
    await page.goto("/penalti");
    const field = page.getByRole("application");
    await field.focus();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#penalty-status")).toHaveText("ângulo direito");
    await page.keyboard.down("Space");
    await page.waitForTimeout(400);
    await page.keyboard.up("Space");
    await expect(page.locator("#penalty-status")).toHaveText(/Gol!|Defendeu!|Na trave!|Pra fora!/, { timeout: 5000 });
  });
});

test.describe("idiomas (PT/EN)", () => {
  test("/en está em inglês, com lang correto e vocabulário de transmissão", async ({ page }) => {
    await skipBoot(page);
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 2, name: "Starting XI" })).toBeAttached();
    await page.goto("/en/projects/conecta-plantao");
    await expect(page.getByText("Full-time", { exact: true })).toBeVisible();
    await expect(page.getByText(/Private repository/)).toBeVisible();
  });

  test("seletor de idioma leva para a mesma página no outro idioma", async ({ page }) => {
    await skipBoot(page);
    await page.goto("/about");
    await page.getByRole("link", { name: "Read in English" }).click();
    await expect(page).toHaveURL(/\/en\/about$/);
    await page.getByRole("link", { name: "Ler em português" }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  });

  test("404 em inglês é 'Offside.'", async ({ page }) => {
    await skipBoot(page);
    const res = await page.goto("/en/nope");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Offside." })).toBeVisible();
  });
});

test.describe("Modo Resenha", () => {
  test("a chave liga a resenha, persiste e mostra o 'Fora do terminal' no pós-jogo", async ({ page, isMobile }) => {
    await skipBoot(page);
    await page.goto("/");
    if (isMobile) await page.getByRole("button", { name: "Menu" }).click();
    const toggle = page.getByRole("switch", { name: /Modo Resenha/ }).first();
    await toggle.click();
    await expect(page.locator("html")).toHaveClass(/resenha/);
    await expect(page.getByText("Resenha aberta")).toBeAttached();
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/resenha/);
    const off = page.locator("[data-chapter=final] .resenha-only");
    await off.scrollIntoViewIfNeeded();
    await expect(off.getByRole("heading", { name: "Fora do terminal" })).toBeVisible();
    await expect(off.getByText(/Próxima pelada/)).toBeVisible();
  });
});

test.describe("páginas internas", () => {
  test("ficha do jogador tem o histórico de clubes e o 'Fora do terminal'", async ({ page }) => {
    await skipBoot(page);
    await page.goto("/about");
    await expect(page.getByText("Histórico de clubes")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Fora do terminal" })).toBeAttached();
    await expect(page.getByText(/Radar 2027 ·/)).toBeAttached();
  });

  test("contato mostra erro amigável quando o envio falha", async ({ page }) => {
    await skipBoot(page);
    await page.route("**/api/contact", (route) => route.fulfill({ status: 503, json: { ok: false, error: "indisponível" } }));
    await page.goto("/contact");
    await page.getByPlaceholder("Seu nome").fill("Ada Lovelace");
    await page.getByPlaceholder("voce@exemplo.com").fill("ada@example.com");
    await page.getByPlaceholder(/Me conte sobre o projeto/).fill("Quero conversar sobre um sistema distribuído.");
    await page.getByRole("button", { name: /Enviar mensagem/ }).click();
    await expect(page.getByText(/Não foi possível enviar agora/)).toBeVisible();
  });

  test("súmula completa leva à próxima partida", async ({ page }) => {
    await skipBoot(page);
    await page.goto("/projects/yourbest");
    await page.getByRole("link", { name: /Próxima partida/ }).click();
    await expect(page).toHaveURL(/\/projects\/conecta-plantao$/);
  });
});

/** O atalho só funciona depois da hidratação: tenta até o diálogo aparecer. */
async function openTerminal(page: Page) {
  await expect(async () => {
    await page.keyboard.press("Backquote");
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 500 });
  }).toPass({ timeout: 10_000 });
}

test.describe("terminal", () => {
  test("abre com ~, responde comandos e fecha com Esc devolvendo o foco", async ({ page }) => {
    await skipBoot(page);
    await page.goto("/");
    await openTerminal(page);
    const dialog = page.getByRole("dialog", { name: /terminal/ });
    const input = dialog.getByRole("textbox", { name: "Comando do terminal" });
    await expect(input).toBeFocused();

    await input.fill("help");
    await input.press("Enter");
    await expect(dialog.getByRole("log")).toContainText("esta lista");

    await input.fill("1910");
    await input.press("Enter");
    await expect(dialog.getByRole("log")).toContainText("Bom Retiro");

    await input.fill("cerveja");
    await input.press("Enter");
    await expect(dialog.getByRole("log")).toContainText("depois do expediente");

    await input.fill("xyz");
    await input.press("Enter");
    await expect(dialog.getByRole("log")).toContainText("comando não encontrado: xyz");

    // Histórico
    await input.press("ArrowUp");
    await expect(input).toHaveValue("xyz");
    await input.fill("");

    await input.fill("clear");
    await input.press("Enter");
    await expect(dialog.getByRole("log")).not.toContainText("Bom Retiro");

    await input.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("resenha liga o modo e a cerveja é servida", async ({ page }) => {
    await skipBoot(page);
    await page.goto("/");
    await openTerminal(page);
    const input = page.getByRole("textbox", { name: "Comando do terminal" });
    await input.fill("resenha");
    await input.press("Enter");
    await expect(page.locator("html")).toHaveClass(/resenha/);
    await input.fill("cerveja");
    await input.press("Enter");
    await expect(page.getByRole("log")).toContainText("Saúde!");
  });

  test("botão do rodapé abre; projects <n> e sudo hire-me navegam", async ({ page }) => {
    await skipBoot(page);
    await page.goto("/projects");
    await page.getByRole("button", { name: "Abrir o terminal" }).click();
    const input = page.getByRole("textbox", { name: "Comando do terminal" });
    await input.fill("projects");
    await input.press("Enter");
    await expect(page.getByRole("log")).toContainText("01");
    await input.fill("projects 1");
    await input.press("Enter");
    await expect(page).toHaveURL(/\/projects\/yourbest$/, { timeout: 10_000 });
    await expect(page.getByRole("dialog")).toBeHidden();

    await openTerminal(page);
    await page.getByRole("textbox", { name: "Comando do terminal" }).fill("sudo hire-me");
    await page.getByRole("textbox", { name: "Comando do terminal" }).press("Enter");
    await expect(page.getByRole("log")).toContainText("Acesso concedido");
    await expect(page).toHaveURL(/\/contact$/, { timeout: 10_000 });
  });

  test("EN: terminal em inglês", async ({ page }) => {
    await skipBoot(page);
    await page.goto("/en");
    await openTerminal(page);
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("log")).toContainText("help");
  });
});
