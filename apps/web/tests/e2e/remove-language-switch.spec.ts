import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

const publicRoutes = [
  "/",
  "/about",
  "/initiatives",
  "/initiatives/healthcare",
  "/initiatives/education",
  "/initiatives/business",
  "/initiatives/jobs",
  "/initiatives/research",
  "/initiatives/tourism",
  "/initiatives/arts-culture",
  "/initiatives/global-events",
  "/tamil-id",
  "/chapters",
  "/roadmap",
  "/partners",
  "/events",
  "/news",
  "/contact",
  "/privacy",
  "/terms",
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

const desktopViewports = requiredViewports.slice(4);
const mobileViewports = requiredViewports.slice(0, 3);

async function expectLanguageControlAbsent(page: Page) {
  const header = page.getByRole("banner");

  await expect(header.locator('[aria-label="Language selection"]')).toHaveCount(
    0,
  );
  await expect(header.getByText("EN", { exact: true })).toHaveCount(0);
  await expect(header.getByText("தமிழ்", { exact: true })).toHaveCount(0);
  await expect(header.locator('[lang="ta"]')).toHaveCount(0);
}

async function expectReviewStateReady(page: Page) {
  const heroImage = page.locator("main img").first();
  await expect
    .poll(() =>
      heroImage.evaluate((element) => {
        const image = element as HTMLImageElement;
        return image.complete && image.naturalWidth > 0;
      }),
    )
    .toBe(true);
  await expect
    .poll(() =>
      page
        .locator("[data-route-transition]")
        .evaluate((element) => element.getAnimations().length),
    )
    .toBe(0);
}

test.describe("language-switch removal", () => {
  test("keeps every public header clean across the required viewport matrix", async ({
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
        const response = await page.goto(route, {
          waitUntil: "domcontentloaded",
        });
        expect(response?.status(), `${route} should resolve`).toBeLessThan(400);

        await expectLanguageControlAbsent(page);
        const header = page.getByRole("banner");
        const partnerLink = header.getByRole("link", {
          name: "Partner With Us",
          includeHidden: true,
        });
        await expect(partnerLink).toBeAttached();

        if (viewport.width >= 1280) {
          await expect(partnerLink).toBeVisible();
        }

        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
          `${route} should not overflow at ${viewport.width}px`,
        ).toBe(true);
      }
    }

    expect(browserErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });

  test("preserves Tamil identity and legitimate bilingual content", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("banner").getByText("த")).toBeVisible();
    await expect(page.getByText("தமிழ் உலகம்", { exact: true })).toBeVisible();

    await page.goto("/about", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", {
        name: "யாதும் ஊரே யாவரும் கேளிர்",
      }),
    ).toBeVisible();
    await expect(
      page.getByText("Every place is our home; everyone is our kin."),
    ).toBeVisible();
  });

  test("keeps desktop navigation balanced and header geometry stable", async ({
    page,
  }) => {
    for (const viewport of desktopViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/", { waitUntil: "domcontentloaded" });

      const header = page.getByRole("banner");
      const logo = header.getByRole("link", { name: "Tamil Ulagam home" });
      const navigation = page.getByRole("navigation", {
        name: "Primary navigation",
      });
      const partnerLink = header.getByRole("link", {
        name: "Partner With Us",
      });
      const initialBounds = await header.boundingBox();
      const logoBounds = await logo.boundingBox();
      const navigationBounds = await navigation.boundingBox();

      expect(logoBounds).not.toBeNull();
      expect(navigationBounds).not.toBeNull();
      expect(
        (navigationBounds?.x ?? 0) -
          ((logoBounds?.x ?? 0) + (logoBounds?.width ?? 0)),
      ).toBeGreaterThanOrEqual(24);

      if (viewport.width >= 1280) {
        const partnerBounds = await partnerLink.boundingBox();
        expect(partnerBounds).not.toBeNull();
        expect(
          (partnerBounds?.x ?? 0) -
            ((navigationBounds?.x ?? 0) + (navigationBounds?.width ?? 0)),
        ).toBeGreaterThanOrEqual(24);
        expect(
          Math.abs(
            (navigationBounds?.x ?? 0) +
              (navigationBounds?.width ?? 0) / 2 -
              viewport.width / 2,
          ),
        ).toBeLessThanOrEqual(2);
      }

      await page.evaluate(() =>
        window.scrollTo({ top: 900, behavior: "auto" }),
      );
      await expect(header).toHaveAttribute("data-scrolled", "true");
      expect((await header.boundingBox())?.height).toBe(initialBounds?.height);
    }
  });

  test("keeps the mobile menu compact and keyboard accessible", async ({
    page,
  }) => {
    for (const viewport of mobileViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/", { waitUntil: "domcontentloaded" });

      const menuButton = page.getByRole("button", { name: "Open menu" });
      await menuButton.focus();
      await page.keyboard.press("Enter");

      const navigation = page.getByRole("navigation", {
        name: "Mobile primary navigation",
      });
      await expect(navigation).toBeVisible();
      await expectLanguageControlAbsent(page);
      await expect(navigation.locator(":scope > div")).toHaveCount(0);
      await expect(page.locator(":focus")).toHaveRole("link");
      await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("button", { name: "Open menu" }),
      ).toBeFocused();
      await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    }
  });

  test("keeps reduced-motion behavior unchanged", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-preference",
      "reduced",
    );
    await expectLanguageControlAbsent(page);
    await expect(page.locator("[data-route-transition]")).toHaveCSS(
      "transform",
      "none",
    );
  });

  test("captures the requested header and mobile-menu review states", async ({
    page,
  }) => {
    test.skip(
      process.env.REMOVE_LANGUAGE_SWITCH_REVIEW !== "1",
      "Language-switch review captures run only for the dedicated review command.",
    );

    const reviewDirectory = path.resolve(
      process.cwd(),
      "../../artifacts/remove-language-switch-review",
    );
    await mkdir(reviewDirectory, { recursive: true });

    for (const viewport of desktopViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await expectLanguageControlAbsent(page);
      await expectReviewStateReady(page);
      await page.screenshot({
        path: path.join(
          reviewDirectory,
          `header-${viewport.width}x${viewport.height}.png`,
        ),
      });
    }

    for (const viewport of mobileViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await expectReviewStateReady(page);
      await page.getByRole("button", { name: "Open menu" }).click();
      const navigation = page.getByRole("navigation", {
        name: "Mobile primary navigation",
      });
      await expect(navigation).toBeVisible();
      await expect
        .poll(() =>
          navigation.evaluate(
            (element) =>
              element.closest("#mobile-navigation-panel")?.getAnimations({
                subtree: true,
              }).length ?? 0,
          ),
        )
        .toBe(0);
      await expectLanguageControlAbsent(page);
      await page.screenshot({
        path: path.join(
          reviewDirectory,
          `mobile-menu-${viewport.width}x${viewport.height}.png`,
        ),
      });
    }

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expectReviewStateReady(page);
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: "auto" }));
    await expect(page.getByRole("banner")).toHaveAttribute(
      "data-scrolled",
      "true",
    );
    await expect
      .poll(() =>
        page
          .getByRole("banner")
          .evaluate((element) => element.getAnimations().length),
      )
      .toBe(0);
    await page.screenshot({
      path: path.join(reviewDirectory, "scrolled-header-1440x1000.png"),
    });
  });
});
