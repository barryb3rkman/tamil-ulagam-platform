import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

import { initiativesEditorialImageKeys, images } from "@/config/images";
import { initiatives } from "@/content/initiatives";

const reviewViewports = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 1000 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 430, height: 932 },
  { width: 390, height: 844 },
  { width: 375, height: 812 },
];

async function loadInitiativeImages(page: Page) {
  for (const key of initiativesEditorialImageKeys) {
    const imageLocator = page.getByRole("img", { name: images[key].alt });
    const imageCount = await imageLocator.count();

    expect(imageCount, `${key} should render`).toBeGreaterThan(0);

    for (let index = 0; index < imageCount; index += 1) {
      const image = imageLocator.nth(index);

      await image.scrollIntoViewIfNeeded();
      await expect(image).toBeVisible();
      await expect
        .poll(
          () =>
            image.evaluate((element) => {
              const htmlImage = element as HTMLImageElement;

              return htmlImage.complete && htmlImage.naturalWidth > 0;
            }),
          {
            message: `${key} instance ${index + 1} did not decode`,
            timeout: 15_000,
          },
        )
        .toBe(true);
    }
  }

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "auto" }));
  await page.waitForTimeout(180);
}

test.describe("public Initiatives overview page", () => {
  test("captures the requested visual review viewports", async ({ page }) => {
    test.setTimeout(120_000);
    const reviewDirectory = path.resolve(
      process.cwd(),
      "../../artifacts/initiatives-overview-review",
    );
    await mkdir(reviewDirectory, { recursive: true });

    for (const viewport of reviewViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/initiatives");
      await page.locator("#initiatives-title").waitFor({ state: "visible" });
      await loadInitiativeImages(page);
      await page.screenshot({
        path: `${reviewDirectory}/initiatives-${viewport.width}x${viewport.height}.png`,
        fullPage: true,
      });
    }
  });

  test("loads all initiatives, routes, media, and primary navigation", async ({
    page,
  }) => {
    const browserErrors: string[] = [];
    const failedImageRequests: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));
    page.on("requestfailed", (request) => {
      const requestUrl = request.url();

      if (requestUrl.includes(".png") || requestUrl.includes("/_next/image")) {
        failedImageRequests.push(requestUrl);
      }
    });
    await page.goto("/initiatives");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Building an ecosystem for every dimension of Tamil life.",
      }),
    ).toBeVisible();
    await expect(page.getByText("Building the foundation")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    const primaryNavigation = page.getByRole("navigation", {
      name: "Primary navigation",
    });
    await expect(
      primaryNavigation.getByRole("link", { name: "Initiatives" }),
    ).toHaveAttribute("aria-current", "page");
    await page.getByRole("link", { name: "Explore the ecosystem" }).focus();
    await expect(page.locator(":focus")).toHaveText("Explore the ecosystem");

    for (const initiative of initiatives) {
      await expect(page.getByText(initiative.title).first()).toBeVisible();
      await expect(
        page.getByRole("link", { name: new RegExp(initiative.title) }).first(),
      ).toHaveAttribute("href", initiative.href);
    }

    await loadInitiativeImages(page);
    expect(browserErrors).toEqual([]);
    expect(failedImageRequests).toEqual([]);
  });

  test("keeps the directory usable and overflow-free on responsive viewports", async ({
    page,
  }) => {
    for (const viewport of reviewViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/initiatives");
      await expect(page.locator("#initiatives-title")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/initiatives");
    await expect(
      page.getByTestId("initiatives-directory").getByRole("listitem"),
    ).toHaveCount(initiatives.length);
  });
});
