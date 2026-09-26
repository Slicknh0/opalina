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

  test("shows fictional data under a clear demo disclaimer", async ({
    page,
  }) => {
    await expect(page.locator("footer")).toContainText(
      "Opalina é uma clínica fictícia",
    );
    await expect(page.locator("[data-placeholder]")).toHaveCount(0);
    await expect(page.locator("#contato")).toContainText("(11) 90000-0000");
    await expect(page.locator("a[href^='tel:'], a[href*='wa.me']")).toHaveCount(
      0,
    );
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
    await page.mouse.move(200, 200);
    await page.waitForTimeout(1000);
    await expect(page.locator("canvas:visible")).toHaveCount(0);
  });

  test("stacks the tooth story without pinning", async ({ page }) => {
    const sticky = await page.evaluate(
      () =>
        [...document.querySelectorAll("#inicio *")].filter(
          (el) => getComputedStyle(el).position === "sticky",
        ).length,
    );
    expect(sticky).toBe(0);
    for (const name of ["k1", "cutaway", "implant"]) {
      const still = page.locator(`#inicio img[src*="/tooth/${name}-"]`);
      await still.scrollIntoViewIfNeeded();
      await expect(still).toBeVisible();
      expect(
        await still.evaluate(
          (el) => getComputedStyle(el.parentElement as Element).clipPath,
        ),
      ).not.toMatch(/ellipse\(0%/);
    }
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
    // The arch loads lazily after the first interaction (the scroll above).
    for (let i = 0; i < 40; i++) {
      const path = document.querySelectorAll("#metodo svg path")[1];
      if (path) {
        await new Promise((r) => setTimeout(r, 300));
        return getComputedStyle(path).strokeDasharray;
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    return "missing";
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

test.describe("tooth scene", () => {
  /** Scrolls so the pinned scene is at `progress` (0..1) of its scroll length. */
  async function scrollScene(
    page: import("@playwright/test").Page,
    progress: number,
  ) {
    await page.evaluate((p) => {
      const track = document.querySelector("#inicio > div") as HTMLElement;
      const range = track.offsetHeight - window.innerHeight;
      window.scrollTo({
        top: track.offsetTop + range * p,
        behavior: "instant",
      });
    }, progress);
    await page.waitForTimeout(400);
  }

  test("shows the poster before any interaction", async ({ page }) => {
    await page.goto("/");
    const poster = page.locator('#inicio img[src*="/tooth/k1-"]');
    await expect(poster).toBeVisible();
    await expect
      .poll(() => poster.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
    const frames = await page.evaluate(
      () =>
        performance
          .getEntriesByType("resource")
          .filter((r) => r.name.includes("/tooth/frames/")).length,
    );
    expect(frames).toBe(0);
  });

  test("scrolling scrubs the turn frames", async ({ page }) => {
    await page.goto("/");
    // Interaction only arms the frame loader once the page has hydrated.
    await page.waitForLoadState("networkidle");
    await page.mouse.move(300, 300);
    await page.mouse.move(320, 320);
    await scrollScene(page, 0.05);
    const wrapper = page
      .locator("#inicio canvas[data-scene-frames]")
      .locator("..");
    await expect(wrapper).toHaveCSS("opacity", "1", { timeout: 10_000 });
    const first = await page
      .locator("#inicio canvas[data-scene-frames]")
      .evaluate((c: HTMLCanvasElement) => c.toDataURL());
    await scrollScene(page, 0.3);
    await expect
      .poll(() =>
        page
          .locator("#inicio canvas[data-scene-frames]")
          .evaluate((c: HTMLCanvasElement) => c.toDataURL()),
      )
      .not.toBe(first);
  });

  test("loads the frame set that matches the screen", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");
    // Interaction only arms the frame loader once the page has hydrated.
    await page.waitForLoadState("networkidle");
    await page.mouse.move(300, 300);
    await page.mouse.move(320, 320);
    await scrollScene(page, 0.1);
    await expect
      .poll(() =>
        page.evaluate(() =>
          performance
            .getEntriesByType("resource")
            .some((r) => r.name.includes("/tooth/frames/")),
        ),
      )
      .toBe(true);
    const sets = await page.evaluate(() => [
      ...new Set(
        performance
          .getEntriesByType("resource")
          .map((r) => r.name.match(/\/frames\/(desktop|mobile)\//)?.[1])
          .filter(Boolean),
      ),
    ]);
    expect(sets).toEqual([isMobile ? "mobile" : "desktop"]);
  });

  test("shows the layer labels in the layers beat", async ({ page }) => {
    await page.goto("/");
    await scrollScene(page, 0.6);
    await expect(page.locator("#inicio")).toHaveAttribute(
      "data-beat",
      "layers",
    );
    for (const name of ["Esmalte", "Dentina", "Polpa"]) {
      await expect(
        page.locator("#inicio [data-label]", { hasText: name }),
      ).toHaveCSS("opacity", "1");
    }
    await expect(
      page.getByRole("heading", { name: "Naturalidade antes de brancura." }),
    ).toBeVisible();
  });

  test("renders the right beat when landing mid-scene", async ({ page }) => {
    await page.goto("/");
    await scrollScene(page, 0.85);
    await page.reload();
    await page.waitForLoadState("networkidle");
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    await expect(page.locator("#inicio")).toHaveAttribute(
      "data-beat",
      "implant",
    );
    const clip = await page
      .locator('#inicio img[src*="/tooth/implant-"]')
      .evaluate((el) => getComputedStyle(el.parentElement as Element).clipPath);
    expect(clip).not.toMatch(/ellipse\(0%/);
  });

  test("keyboard reaches the scene's booking link in view", async ({
    page,
  }) => {
    await page.goto("/");
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab");
      const inScene = await page.evaluate(() => {
        const el = document.activeElement;
        return (
          !!el?.closest("#inicio") &&
          el?.textContent?.trim() === "Agendar avaliação"
        );
      });
      if (inScene) break;
    }
    const focused = page.locator("#inicio a:focus");
    await expect(focused).toHaveText("Agendar avaliação");
    await expect(focused).toBeInViewport();
  });
});

test.describe("tooth scene interaction", () => {
  async function scrollScene(
    page: import("@playwright/test").Page,
    progress: number,
  ) {
    await page.evaluate((p) => {
      const track = document.querySelector("#inicio > div") as HTMLElement;
      const range = track.offsetHeight - window.innerHeight;
      window.scrollTo({
        top: track.offsetTop + range * p,
        behavior: "instant",
      });
    }, progress);
    await page.waitForTimeout(900);
  }

  /** Clicks with the real pointer at the element's centre (hit-testing included). */
  async function pointerClick(
    page: import("@playwright/test").Page,
    locator: import("@playwright/test").Locator,
  ) {
    const box = await locator.boundingBox();
    if (!box) throw new Error("no box");
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  }

  test("hero CTAs respond to a real pointer click", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await pointerClick(
      page,
      page.getByRole("link", { name: "Conhecer os tratamentos" }),
    );
    await expect(page).toHaveURL(/#tratamentos$/);
  });

  test("the implant beat CTA responds to a real pointer click", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await scrollScene(page, 0.9);
    const block = page
      .getByRole("heading", {
        name: "Quando falta um dente, devolvemos forma e função.",
      })
      .locator("xpath=..");
    await pointerClick(
      page,
      block.getByRole("link", { name: "Agendar avaliação" }),
    );
    await expect(page).toHaveURL(/#contato$/);
  });

  test("the poster hides once turn frames are drawn (no double exposure)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.mouse.move(300, 300);
    await page.mouse.move(320, 320);
    await scrollScene(page, 0.2);
    await expect(
      page.locator("#inicio canvas[data-scene-frames]").locator(".."),
    ).toHaveCSS("opacity", "1", { timeout: 10_000 });
    await expect(page.locator('#inicio img[src*="/tooth/k1-"]')).toHaveCSS(
      "opacity",
      "0",
    );
  });

  test("keyboard focus never lands on an invisible scene link", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const hidden: string[] = [];
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      const problem = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el?.closest("#inicio")) return null;
        let opacity = 1;
        for (
          let n: HTMLElement | null = el;
          n && n.id !== "inicio";
          n = n.parentElement
        ) {
          const cs = getComputedStyle(n);
          if (cs.visibility === "hidden")
            return `${el.textContent?.trim()} (visibility hidden)`;
          opacity *= Number(cs.opacity);
        }
        return opacity < 0.5
          ? `${el.textContent?.trim()} (opacity ${opacity})`
          : null;
      });
      if (problem) hidden.push(problem);
    }
    expect(hidden).toEqual([]);
  });
});

test.describe("tooth scene with reduced motion", () => {
  test("stacked hero CTAs respond to a real pointer click", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const link = page.getByRole("link", { name: "Conhecer os tratamentos" });
    await link.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const box = await link.boundingBox();
    if (!box) throw new Error("no box");
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page).toHaveURL(/#tratamentos$/);
  });
});
