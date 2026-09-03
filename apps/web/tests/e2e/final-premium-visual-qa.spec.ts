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

const finalViewports = [
  { width: 1440, height: 1000 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
] as const;

const extendedViewports = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 1000 },
  { width: 1920, height: 1080 },
] as const;

const reviewViewports = process.env.FINAL_PREMIUM_QA_EXTENDED
  ? extendedViewports
  : finalViewports;
const selectedRoutes = process.env.FINAL_PREMIUM_QA_ROUTE
  ? publicRoutes.filter(
      (route) => route.name === process.env.FINAL_PREMIUM_QA_ROUTE,
    )
  : publicRoutes;

async function prepareFullPageCapture(page: Page) {
  const images = page.locator("main img");

  for (let index = 0; index < (await images.count()); index += 1) {
    const image = images.nth(index);
    if (!(await image.isVisible())) continue;

    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((element) => {
          const htmlImage = element as HTMLImageElement;
          return htmlImage.complete && htmlImage.naturalWidth > 0;
        }),
      )
      .toBe(true);
  }

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "auto" }));
}

test.describe("final public-site visual quality", () => {
  for (const route of selectedRoutes) {
    test(`${route.name} remains complete and responsive`, async ({ page }) => {
      test.setTimeout(300_000);
      const browserErrors: string[] = [];
      const failedRequests: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") browserErrors.push(message.text());
      });
      page.on("pageerror", (error) => browserErrors.push(error.message));
      page.on("requestfailed", (request) => {
        if (
          request.resourceType() === "image" &&
          request.failure()?.errorText !== "net::ERR_ABORTED"
        ) {
          failedRequests.push(request.url());
        }
      });

      const reviewDirectory = path.resolve(
        process.cwd(),
        "../../artifacts/final-premium-visual-qa",
      );
      await mkdir(reviewDirectory, { recursive: true });

      for (const viewport of reviewViewports) {
        await page.setViewportSize(viewport);
        const response = await page.goto(route.path, {
          waitUntil: "domcontentloaded",
        });
        expect(response?.status(), `${route.path} should resolve`).toBeLessThan(
          400,
        );
        await expect(page.locator("main h1")).toHaveCount(1);
        await expect(page.locator("main h1")).toBeVisible();
        if (route.name === "partners") {
          await expect(
            page.locator('[data-partnership-form-ready="true"]'),
          ).toBeVisible();
        }
        await prepareFullPageCapture(page);

        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
          `${route.path} should not overflow at ${viewport.width}px`,
        ).toBe(true);

        const visibleHeadings = page
          .locator("main h1, main h2, main h3")
          .filter({
            visible: true,
          });
        expect(await visibleHeadings.count()).toBeGreaterThan(0);
        await expect(page.getByRole("contentinfo")).toBeAttached();

        await page.screenshot({
          path: path.join(
            reviewDirectory,
            `${route.name}-${viewport.width}x${viewport.height}.png`,
          ),
          fullPage: true,
        });
      }

      expect(browserErrors).toEqual([]);
      expect(failedRequests).toEqual([]);
    });
  }
});
