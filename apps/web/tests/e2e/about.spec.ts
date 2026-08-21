import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { aboutEditorialImageKeys } from "@/config/images";

import { scrollThroughPage, verifyPageImages } from "./helpers/homepage-media";
import { getCanonicalRouteHref } from "./helpers/routes";

const reviewViewports = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 1000 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 430, height: 932 },
  { width: 390, height: 844 },
  { width: 375, height: 812 },
];

test.describe("public About page", () => {
  test("captures the requested visual review viewports", async ({ page }) => {
    test.setTimeout(90_000);
    const reviewDirectory =
      process.env.ABOUT_REVIEW_DIR ??
      path.resolve(process.cwd(), "../../artifacts/about-page-review");
    await mkdir(reviewDirectory, { recursive: true });

    for (const viewport of reviewViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/about");
      await page.locator("#about-title").waitFor({ state: "visible" });
      await scrollThroughPage(page, aboutEditorialImageKeys);
      await verifyPageImages(page, aboutEditorialImageKeys);
      await page.screenshot({
        path: `${reviewDirectory}/about-${viewport.width}x${viewport.height}.png`,
        fullPage: true,
      });
    }
  });

  test("loads the About purpose, content hierarchy, and approved media", async ({
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
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/about");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "A global home for Tamil identity, connection and progress.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Vision and mission" }),
    ).toBeVisible();
    for (const objective of [
      "Connect",
      "Preserve",
      "Empower",
      "Support",
      "Foster",
      "Celebrate",
    ]) {
      await expect(
        page.getByRole("heading", { name: objective, exact: true }),
      ).toHaveCount(1);
    }
    await expect(page.getByText("யாதும் ஊரே யாவரும் கேளிர்")).toBeVisible();
    await expect(page.locator("main")).not.toContainText(
      /planned|proposed|building the foundation/i,
    );
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Explore Our Vision" }),
    ).toHaveAttribute("href", getCanonicalRouteHref("/about#vision-mission"));
    await expect(
      page.getByRole("link", { name: "View Full Roadmap" }),
    ).toHaveAttribute("href", getCanonicalRouteHref("/roadmap"));

    const primaryNavigation = page.getByRole("navigation", {
      name: "Primary navigation",
    });
    await primaryNavigation.getByRole("link", { name: "About" }).focus();
    await expect(page.locator(":focus")).toHaveText("About");
    await expect(
      primaryNavigation.getByRole("link", { name: "About" }),
    ).toHaveAttribute("aria-current", "page");
    await page.getByRole("link", { name: "Explore Our Vision" }).focus();
    await expect(page.locator(":focus")).toHaveText("Explore Our Vision");

    await scrollThroughPage(page, aboutEditorialImageKeys);
    await verifyPageImages(page, aboutEditorialImageKeys);
    expect(browserErrors).toEqual([]);
    expect(failedImageRequests).toEqual([]);
  });

  test("keeps the About page within its responsive viewport boundaries", async ({
    page,
  }) => {
    for (const viewport of reviewViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/about");
      await expect(page.locator("#about-title")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  });
});
