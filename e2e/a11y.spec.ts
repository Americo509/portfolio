import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = ["/", "/projects", "/projects/yourbest", "/about", "/contact", "/penalti", "/en", "/nao-existe"];

async function skipBoot(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem("gd:booted", "1"));
}

/** O atalho só funciona depois da hidratação: tenta até o diálogo aparecer. */
async function openTerminal(page: Page) {
  await expect(async () => {
    await page.keyboard.press("Backquote");
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 500 });
  }).toPass({ timeout: 10_000 });
}

/** Auditoria axe (WCAG 2.1 A/AA) nas páginas principais, nos dois temas e no Modo Resenha. */
async function audit(page: Page) {
  // Revelações por scroll começam esmaecidas: percorre a página (como quem lê) para
  // o axe avaliar o estado final do texto, e volta ao topo.
  await page.waitForTimeout(600);
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.6;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(900);
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    // O grão e os canvases são decorativos (aria-hidden); o canvas da cena não tem texto.
    .exclude(".grain")
    .analyze();
  return violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
}

test.describe("acessibilidade (axe)", () => {
  for (const path of PAGES) {
    test(`${path} sem violações WCAG AA`, async ({ page }) => {
      await skipBoot(page);
      await page.goto(path);
      await expect(page.locator("main#conteudo")).toBeVisible();
      expect(await audit(page)).toEqual([]);
    });
  }

  test("tema claro sem violações", async ({ page }) => {
    await skipBoot(page);
    await page.addInitScript(() => localStorage.setItem("gustavo-portfolio-theme", "light"));
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/light/);
    expect(await audit(page)).toEqual([]);
  });

  test("Modo Resenha sem violações", async ({ page }) => {
    await skipBoot(page);
    await page.addInitScript(() => localStorage.setItem("gd:resenha", "1"));
    await page.goto("/about");
    await expect(page.locator("html")).toHaveClass(/resenha/);
    expect(await audit(page)).toEqual([]);
  });

  test("terminal aberto sem violações", async ({ page }) => {
    await skipBoot(page);
    await page.goto("/");
    await openTerminal(page);
    expect(await audit(page)).toEqual([]);
  });
});
