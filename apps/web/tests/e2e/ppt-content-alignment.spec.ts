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
  "/partners",
  "/events",
  "/news",
  "/contact",
  "/privacy",
  "/terms",
] as const;

const reviewRoutes = [
  { path: "/", name: "home" },
  { path: "/about", name: "about" },
  { path: "/initiatives", name: "initiatives" },
  { path: "/tamil-id", name: "tamil-id" },
  { path: "/chapters", name: "chapters" },
  { path: "/partners", name: "partners" },
  { path: "/events", name: "events" },
  { path: "/news", name: "news" },
  { path: "/contact", name: "contact" },
] as const;

const reviewViewports = [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
] as const;

async function prepareFullPageCapture(page: Page) {
  const images = page.locator("main img");

  for (let index = 0; index < (await images.count()); index += 1) {
    const image = images.nth(index);
    if (!(await image.isVisible())) {
      continue;
    }
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

test.describe("PPT-aligned public content", () => {
  test("renders every implemented public route", async ({ request }) => {
    for (const route of publicRoutes) {
      const response = await request.get(route);
      expect(response.status(), `${route} should resolve`).toBeLessThan(400);
    }
  });

  test("retains key safety and truthfulness boundaries", async ({ page }) => {
    await page.goto("/tamil-id", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toContainText(
      /not a government identity/i,
    );
    await expect(page.locator("main")).not.toContainText(
      /now issuing|issued today/i,
    );

    await page.goto("/initiatives/healthcare", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("main")).toContainText(
      /does not provide medical care or telemedicine/i,
    );
    await expect(page.locator("main")).toContainText(
      /for emergencies, contact local emergency services/i,
    );
    await expect(page.locator("main")).not.toContainText(
      /book a consultation|consult now/i,
    );

    await page.goto("/chapters", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).not.toContainText(
      /50\+ active chapters/i,
    );

    await page.goto("/partners", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).not.toContainText(
      /our partners|trusted by/i,
    );

    await page.goto("/events", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).not.toContainText(
      /register now|buy tickets|event date/i,
    );

    await page.goto("/news", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main article")).toHaveCount(0);

    // /roadmap has been removed from the product.
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await expect(page.locator("form")).toHaveCount(0);
    await expect(
      page.locator('a[href^="mailto:"], a[href^="tel:"]'),
    ).toHaveCount(0);

    await page.goto("/privacy", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toContainText(/draft/i);
    await page.goto("/terms", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toContainText(/draft/i);
  });

  test("captures representative desktop and mobile review screenshots", async ({
    page,
  }) => {
    test.setTimeout(240_000);
    const reviewDirectory = path.resolve(
      process.cwd(),
      "../../artifacts/ppt-content-alignment-review",
    );
    await mkdir(reviewDirectory, { recursive: true });

    for (const route of reviewRoutes) {
      for (const viewport of reviewViewports) {
        await page.setViewportSize(viewport);
        await page.goto(route.path, { waitUntil: "domcontentloaded" });
        await expect(page.locator("main h1")).toHaveCount(1);
        await prepareFullPageCapture(page);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        ).toBe(true);
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
});
