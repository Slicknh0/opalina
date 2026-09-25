import { expect, test } from "@playwright/test";

test.describe("landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has one h1 and the clinic in the title", async ({ page }) => {
    await expect(page).toHaveTitle(/Opalina/);
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("every navigation anchor has a target", async ({ page }) => {
    for (const id of [
      "tratamentos",
      "escala",
      "metodo",
      "profissional",
      "contato",
    ]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test("treatment index opens rows from the keyboard", async ({ page }) => {
    const first = page.locator("#tratamento-lentes");
    const second = page.locator("#tratamento-facetas");
    await first.focus();
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("ArrowDown");
    await expect(second).toBeFocused();
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#painel-facetas")).toContainText(
      "Indicado para",
    );
  });

  test("shade guide changes shade with arrow keys", async ({ page }) => {
    const live = page.locator("#escala [aria-live]");
    await page.locator('input[name="tom"]:checked').focus();
    await expect(page.locator('input[name="tom"]:checked')).toHaveValue("A1");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator('input[name="tom"]:checked')).toHaveValue("A2");
    await expect(live).toContainText("Natural e quente");
  });

  test("booking form validates and never fakes a send", async ({ page }) => {
    const form = page.locator("#contato form");
    await form.getByRole("button", { name: "Enviar pelo WhatsApp" }).click();
    await expect(form.getByText("Informe seu nome completo.")).toBeVisible();
    await expect(
      form.getByText("Informe um WhatsApp válido com DDD."),
    ).toBeVisible();
    await expect(form.getByText("Escolha uma opção.")).toBeVisible();
    await expect(form.getByLabel("Nome")).toBeFocused();

    await form.getByLabel("Nome").fill("Marina Alves");
    await form.getByLabel("WhatsApp com DDD").fill("(11) 98765-4321");
    await form
      .getByLabel("Tratamento de interesse")
      .selectOption("clareamento");
    await form.getByLabel(/Mensagem/).fill("Olá! Prefiro manhãs & sábados 😊");
    await form.getByRole("button", { name: "Enviar pelo WhatsApp" }).click();
    await expect(form.locator("output")).toContainText(
      "Demonstração: configure o número de WhatsApp",
    );
  });

  test("keeps demo data visibly marked as placeholders", async ({ page }) => {
    await expect(page.locator("footer")).toContainText(
      "Opalina é uma clínica fictícia",
    );
    const count = await page.locator("[data-placeholder]").count();
    expect(count).toBeGreaterThan(5);
  });
});

test.describe("with reduced motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
  });

  test("shows the hero title at once and skips WebGL", async ({ page }) => {
    const h1 = page.locator("h1");
    await expect(h1).toHaveText("Estética dental com a naturalidade da luz.");
    await expect(h1).toHaveCSS("opacity", "1");
    await page.waitForTimeout(1000);
    await expect(page.locator("canvas")).toHaveCount(0);
  });

  test("renders the method arch fully drawn", async ({ page }) => {
    expect(await archDash(page)).toBe("none");
  });
});

test("with motion allowed, the method arch is drawn by scroll", async ({
  page,
}) => {
  await page.goto("/");
  expect(await archDash(page)).not.toBe("none");
});

/** Computed stroke-dasharray of the accent arch path after hydration. */
async function archDash(page: import("@playwright/test").Page) {
  await page.waitForLoadState("networkidle");
  return page.evaluate(async () => {
    document.getElementById("metodo")?.scrollIntoView();
    await new Promise((r) => setTimeout(r, 500));
    const path = document.querySelectorAll("#metodo svg path")[1];
    return path ? getComputedStyle(path).strokeDasharray : "missing";
  });
}
