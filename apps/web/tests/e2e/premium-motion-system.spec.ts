import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

const publicRoutes = [
  { path: "/", name: "home" },
  { path: "/about", name: "about" },
  { path: "/initiatives", name: "initiatives" },
  { path: "/initiatives/healthcare", name: "initiative-healthcare" },
  { path: "/initiatives/education", name: "initiative-education" },
  { path: "/initiatives/business", name: "initiative-business" },
  { path: "/initiatives/jobs", name: "initiative-jobs" },
  { path: "/initiatives/research", name: "initiative-research" },
  { path: "/initiatives/tourism", name: "initiative-tourism" },
  { path: "/initiatives/arts-culture", name: "initiative-arts-culture" },
  { path: "/initiatives/global-events", name: "initiative-global-events" },
  { path: "/tamil-id", name: "tamil-id" },
  { path: "/chapters", name: "chapters" },
  { path: "/partners", name: "partners" },
  { path: "/events", name: "events" },
  { path: "/news", name: "news" },
  { path: "/contact", name: "contact" },
  { path: "/privacy", name: "privacy" },
  { path: "/terms", name: "terms" },
] as const;

const requiredViewports = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 1000 },
  { width: 1920, height: 1080 },
] as const;

const requestedCaptureRoutes = new Set(
  process.env.PREMIUM_MOTION_REVIEW_ROUTE?.split(",") ?? [],
);
const captureRoutes =
  requestedCaptureRoutes.size > 0
    ? publicRoutes.filter((route) => requestedCaptureRoutes.has(route.name))
    : publicRoutes;

async function revealCompletePage(page: Page) {
  const targets = page.locator("[data-motion-reveal], [data-motion-group]");

  for (let index = 0; index < (await targets.count()); index += 1) {
    const target = targets.nth(index);
    if (
      (await target.evaluate(
        (element) => getComputedStyle(element).display,
      )) === "none"
    ) {
      continue;
    }
    await target.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        target.evaluate((element) => {
          const subjects = element.hasAttribute("data-motion-group")
            ? Array.from(element.children)
            : [element];

          return subjects.every(
            (subject) =>
              Number.parseFloat(getComputedStyle(subject).opacity) >= 0.99,
          );
        }),
      )
      .toBe(true);
  }

  await expect
    .poll(() =>
      page
        .locator("[data-route-transition]")
        .evaluate((element) =>
          element
            .getAnimations()
            .every((animation) => animation.playState === "finished"),
        ),
    )
    .toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "auto" }));
}

test.describe("premium motion system", () => {
  test("keeps all public routes stable across the required viewport matrix", async ({
    page,
  }) => {
    test.setTimeout(600_000);
    const browserErrors: string[] = [];
    const failedRequests: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));
    page.on("requestfailed", (request) => failedRequests.push(request.url()));

    for (const viewport of requiredViewports) {
      await page.setViewportSize(viewport);

      for (const route of publicRoutes) {
        const response = await page.goto(route.path, {
          waitUntil: "domcontentloaded",
        });
        expect(response?.status(), `${route.path} should resolve`).toBeLessThan(
          400,
        );
        await expect(page.locator("main h1")).toHaveCount(1);
        await expect(page.locator("main h1")).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
          `${route.path} should not overflow at ${viewport.width}px`,
        ).toBe(true);
      }
    }

    expect(browserErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });

  test("keeps the complete public site visible when JavaScript is disabled", async ({
    browser,
  }) => {
    test.setTimeout(180_000);
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();

    for (const route of publicRoutes) {
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await expect(
        page.locator("main h1"),
        `${route.path} should render its primary heading without JavaScript`,
      ).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible();
    }

    await context.close();
  });

  test("honours reduced motion without hiding content", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-preference",
      "reduced",
    );

    const reducedState = await page
      .locator("[data-route-transition]")
      .evaluate((element) => ({
        animationDuration: getComputedStyle(element).animationDuration,
        opacity: getComputedStyle(element).opacity,
        transform: getComputedStyle(element).transform,
      }));
    expect(
      Number.parseFloat(reducedState.animationDuration),
    ).toBeLessThanOrEqual(0.00001);
    expect(reducedState.opacity).toBe("1");
    expect(reducedState.transform).toBe("none");

    await revealCompletePage(page);
    await expect(page.locator("main h1")).toBeVisible();

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/about", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-preference",
      "standard",
    );
    await expect
      .poll(() =>
        page.locator("[data-route-transition]").evaluate((element) =>
          element.getAnimations().some((animation) => {
            const duration = Number(animation.effect?.getTiming().duration);
            return duration >= 120 && duration <= 400;
          }),
        ),
      )
      .toBe(true);
  });

  test("keeps navigation, header geometry, and the mobile menu accessible", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const header = page.getByRole("banner");
    const initialBounds = await header.boundingBox();
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: "auto" }));
    await expect(header).toHaveAttribute("data-scrolled", "true");
    const scrolledBounds = await header.boundingBox();
    expect(scrolledBounds?.height).toBe(initialBounds?.height);

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "auto" }));
    await expect(header).toHaveAttribute("data-scrolled", "false");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText("Skip to main content");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveAttribute("aria-label", /home$/);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const menuButton = page.getByRole("button", { name: "Open menu" });
    await menuButton.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("navigation", { name: "Mobile primary navigation" }),
    ).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await expect(page.locator(":focus")).toHaveRole("link");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });

  test("uses transform-only card feedback", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const card = page.locator(".motion-card").first();
    await card.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        card.evaluate(
          (element) =>
            element.closest("[data-motion-reveal]")?.getAnimations().length ??
            0,
        ),
      )
      .toBe(0);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "auto" }));
    await card.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        card.evaluate(
          (element) =>
            element.closest("[data-motion-reveal]")?.getAnimations().length ??
            0,
        ),
      )
      .toBe(0);
    await card.evaluate(async (element) => {
      await Promise.all(
        element
          .getAnimations({ subtree: true })
          .map((animation) => animation.finished.catch(() => undefined)),
      );
    });
    const cardOffsets = await card.evaluate((element) => ({
      left: (element as HTMLElement).offsetLeft,
      top: (element as HTMLElement).offsetTop,
    }));
    await card.hover();
    expect(
      await card.evaluate((element) => getComputedStyle(element).transform),
    ).not.toBe("none");
    expect(
      await card.evaluate((element) => ({
        left: (element as HTMLElement).offsetLeft,
        top: (element as HTMLElement).offsetTop,
      })),
    ).toEqual(cardOffsets);

    expect(
      Number(
        await page.locator("html").getAttribute("data-motion-observer-count"),
      ),
    ).toBeLessThanOrEqual(1);
  });

  test("captures the 40 route review screenshots", async ({ page }) => {
    test.skip(
      process.env.PREMIUM_MOTION_REVIEW !== "1",
      "Static motion review runs only for the dedicated review command.",
    );
    test.setTimeout(600_000);
    const reviewDirectory = path.resolve(
      process.cwd(),
      "../../artifacts/premium-motion-review/static",
    );
    await mkdir(reviewDirectory, { recursive: true });

    for (const viewport of [
      { width: 1440, height: 1000 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      for (const route of captureRoutes) {
        await page.goto(route.path, { waitUntil: "domcontentloaded" });
        await revealCompletePage(page);
        await page.screenshot({
          path: path.join(
            reviewDirectory,
            `${route.name}-${viewport.width}x${viewport.height}.png`,
          ),
          fullPage: true,
        });
      }
    }
  });

  test("captures representative interaction and motion states", async ({
    page,
  }) => {
    test.skip(
      process.env.PREMIUM_MOTION_TARGETED !== "1",
      "Targeted motion review runs only for the dedicated review command.",
    );
    const reviewDirectory = path.resolve(
      process.cwd(),
      "../../artifacts/premium-motion-review/targeted",
    );
    await mkdir(reviewDirectory, { recursive: true });

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.screenshot({
      path: path.join(reviewDirectory, "hero-initial.png"),
    });
    await expect(page.locator("main h1")).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator("main h1")
          .evaluate((element) =>
            element
              .getAnimations()
              .every((animation) => animation.playState === "finished"),
          ),
      )
      .toBe(true);
    await page.screenshot({
      path: path.join(reviewDirectory, "hero-completed.png"),
    });
    await page.locator(".motion-card").first().scrollIntoViewIfNeeded();
    await page.locator(".motion-card").first().hover();
    await page.screenshot({
      path: path.join(reviewDirectory, "card-hover.png"),
    });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "auto" }));
    await page.getByRole("link", { name: "Explore our vision" }).hover();
    await page.screenshot({
      path: path.join(reviewDirectory, "button-hover.png"),
    });
    await page.getByRole("link", { name: "Explore our vision" }).focus();
    await page.screenshot({
      path: path.join(reviewDirectory, "button-focus.png"),
    });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "auto" }));
    await page.screenshot({
      path: path.join(reviewDirectory, "header-top.png"),
    });
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: "auto" }));
    await expect(page.getByRole("banner")).toHaveAttribute(
      "data-scrolled",
      "true",
    );
    await page.screenshot({
      path: path.join(reviewDirectory, "header-scrolled.png"),
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.screenshot({
      path: path.join(reviewDirectory, "mobile-menu-open.png"),
    });

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.screenshot({
      path: path.join(reviewDirectory, "reduced-motion.png"),
    });
  });
});
