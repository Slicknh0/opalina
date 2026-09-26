import { expect, test } from "@playwright/test";

// Any uncaught page error (e.g. a hydration mismatch) fails the test.
let pageErrors: string[] = [];
test.beforeEach(({ page }) => {
  pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
});
test.afterEach(() => {
  expect(pageErrors).toEqual([]);
});

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

  test("moves focus to an invalid field only after it is marked invalid", async ({
    page,
  }) => {
    await page.evaluate(() => {
      (window as unknown as { seen: string[] }).seen = [];
      document.addEventListener("focusin", (e) => {
        const el = e.target as HTMLElement;
        (window as unknown as { seen: string[] }).seen.push(
          `${el.getAttribute("name")}:${el.getAttribute("aria-invalid")}:${el.getAttribute("aria-describedby") ?? ""}`,
        );
      });
    });
    const form = page.locator("#contato form");
    await form.getByRole("button", { name: "Enviar pelo WhatsApp" }).click();
    await expect(form.getByLabel("Nome")).toBeFocused();
    const seen = await page.evaluate(
      () => (window as unknown as { seen: string[] }).seen,
    );
    expect(seen.at(-1)).toMatch(/^name:true:.+/);
    await expect(form.locator("output")).toContainText("Revise");
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

test.describe("on a 320px screen", () => {
  test.use({ viewport: { width: 320, height: 700 } });

  test("treatment names wrap only between words", async ({ page }) => {
    await page.goto("/");
    const words = page.locator("#tratamentos button [data-roll-word]");
    expect(await words.count()).toBeGreaterThan(10);
    const broken = await words.evaluateAll((els) =>
      els
        .filter((el) => el.getClientRects().length > 1)
        .map((el) => el.textContent),
    );
    expect(broken).toEqual([]);
  });
});

test.describe("mobile menu", () => {
  test.skip(({ isMobile }) => !isMobile, "menu exists below lg only");

  test("keeps keyboard focus inside while open", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    for (let i = 0; i < 9; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(
        () =>
          !!document.activeElement?.closest("[role=dialog]") ||
          document.activeElement?.getAttribute("aria-controls") !== null,
      );
      expect(inside).toBe(true);
    }
  });

  test("following a link does not send focus back to the menu button", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    await page
      .getByRole("dialog")
      .getByRole("link", { name: "Método" })
      .press("Enter");
    await expect(page.getByRole("button", { name: "Menu" })).not.toBeFocused();
  });
});
