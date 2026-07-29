import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { aboutEditorialImageKeys } from "@/config/images";

import { scrollThroughPage, verifyPageImages } from "./helpers/homepage-media";

const publicRoutes = [
  "/",
  "/about",
  "/initiatives",
  "/tamil-id",
  "/chapters",
  "/roadmap",
  "/partners",
  "/news",
  "/contact",
];

test.describe("public route controls", () => {
  test("keeps floating controls out of public routes", async ({ page }) => {
    const browserErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));

    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of publicRoutes) {
      await page.goto(route);
      await expect(page.locator("#devtools-indicator")).toBeHidden();
      await expect(
        page.getByRole("link", { name: "Skip to main content" }),
      ).toHaveCount(1);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }

    await page.goto("/about");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(
      page.getByRole("navigation", { name: "Mobile primary navigation" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Close menu" }).click();
    expect(browserErrors).toEqual([]);
  });

  test("captures corrected About-page review viewports", async ({ page }) => {
    const reviewDirectory = path.resolve(
      process.cwd(),
      "../../artifacts/about-floating-control-fix",
    );
    await mkdir(reviewDirectory, { recursive: true });

    for (const viewport of [
      { width: 1440, height: 1000 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/about");
      await expect(page.locator("#devtools-indicator")).toBeHidden();
      await scrollThroughPage(page, aboutEditorialImageKeys);
      await verifyPageImages(page, aboutEditorialImageKeys);
      await page.screenshot({
        path: `${reviewDirectory}/about-${viewport.width}x${viewport.height}.png`,
        fullPage: true,
      });
    }
  });
});
