import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

import { aboutEditorialImageKeys } from "@/config/images";

import { scrollThroughPage, verifyPageImages } from "./helpers/homepage-media";
import { getCanonicalRouteHref } from "./helpers/routes";

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

async function visitPublicRoute(page: Page, route: string) {
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });

  expect(
    response,
    `${route} did not return a document response`,
  ).not.toBeNull();
  expect(
    response?.status(),
    `${route} returned an unexpected document response status`,
  ).toBeLessThan(400);
  expect(
    new URL(page.url()).pathname,
    `${route} did not complete navigation`,
  ).toBe(getCanonicalRouteHref(route));

  const mainContent = page.locator("main#main-content");
  await expect(
    mainContent,
    `${route} did not mount the shared main-content landmark`,
  ).toBeAttached();

  const skipLink = page.getByRole("link", {
    name: "Skip to main content",
  });
  await expect(
    skipLink,
    `${route} did not render exactly one shared skip link`,
  ).toHaveCount(1);
  await expect(skipLink).toHaveAttribute("href", "#main-content");

  return { mainContent, skipLink };
}

test.describe("public route controls", () => {
  test("keeps floating controls out of public routes", async ({ page }) => {
    const browserErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));

    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of publicRoutes) {
      await visitPublicRoute(page, route);
      await expect(page.locator("#devtools-indicator")).toBeHidden();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }

    const { mainContent, skipLink } = await visitPublicRoute(page, "/about");
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(mainContent).toBeFocused();
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
