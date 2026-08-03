import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import {
  scrollThroughHomepage,
  verifyMajorHomepageImages,
} from "./helpers/homepage-media";

test.describe("public homepage", () => {
  test("captures the requested visual review viewports", async ({ page }) => {
    test.setTimeout(90_000);
    const reviewDirectory =
      process.env.HOMEPAGE_REVIEW_DIR ??
      path.resolve(process.cwd(), "../../artifacts/homepage-media-fix");
    await mkdir(reviewDirectory, { recursive: true });
    for (const viewport of [
      { width: 1920, height: 1080 },
      { width: 1440, height: 1000 },
      { width: 1024, height: 768 },
      { width: 768, height: 1024 },
      { width: 430, height: 932 },
      { width: 390, height: 844 },
      { width: 375, height: 812 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await page.locator("#home-title").waitFor({ state: "visible" });
      await scrollThroughHomepage(page);
      await verifyMajorHomepageImages(page);
      await page.screenshot({
        path: `${reviewDirectory}/homepage-${viewport.width}x${viewport.height}.png`,
        fullPage: true,
      });
    }
  });

  test("loads major editorial imagery after a controlled scroll", async ({
    page,
  }) => {
    const failedImageRequests: string[] = [];
    page.on("requestfailed", (request) => {
      const requestUrl = request.url();

      if (requestUrl.includes(".png") || requestUrl.includes("/_next/image")) {
        failedImageRequests.push(requestUrl);
      }
    });

    for (const viewport of [
      { width: 1440, height: 1000 },
      { width: 768, height: 1024 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await page.locator("#home-title").waitFor({ state: "visible" });
      await scrollThroughHomepage(page);
      await verifyMajorHomepageImages(page);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }

    expect(failedImageRequests).toEqual([]);
  });

  test("loads the hero, navigation, initiatives, and key routes", async ({
    page,
  }) => {
    const browserErrors: string[] = [];
    const failedRequests: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));
    page.on("requestfailed", (request) => {
      failedRequests.push(`${request.method()} ${request.url()}`);
    });
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Connecting the Global Tamil Community",
      }),
    ).toBeVisible();
    const primaryNavigation = page.getByRole("navigation", {
      name: "Primary navigation",
    });
    await expect(primaryNavigation).toBeVisible();
    await primaryNavigation.getByRole("link", { name: "About" }).focus();
    await expect(page.locator(":focus")).toHaveText("About");
    await expect(
      page.getByRole("link", { name: "Explore Our Vision" }),
    ).toHaveAttribute("href", "/about");
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Building an ecosystem for every dimension of Tamil life.",
      }),
    ).toBeVisible();
    await expect(page.getByText("Healthcare").first()).toBeVisible();
    await expect(page.getByText("Planned").first()).toBeVisible();
    await expect(
      page
        .getByTestId("initiative-desktop-grid")
        .getByTestId("initiative-card"),
    ).toHaveCount(8);
    await expect(
      page.getByRole("link", { name: /Explore All Initiatives/ }),
    ).toHaveAttribute("href", "/initiatives");

    const internalLinks = await page
      .locator('a[href^="/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    const implementedRoutes = [
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
      "/events",
      "/news",
      "/partners",
      "/roadmap",
      "/contact",
      "/privacy",
      "/terms",
    ];
    expect(
      internalLinks
        .filter((href): href is string => href !== null)
        .every((href) => implementedRoutes.includes(href)),
    ).toBe(true);
    expect(browserErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });

  test("supports keyboard focus and has no horizontal overflow on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
    await page.getByRole("link", { name: "Explore Our Vision" }).focus();
    await expect(page.locator(":focus")).toHaveText("Explore Our Vision");
    await expect(
      page.getByTestId("initiative-mobile-grid").getByTestId("initiative-card"),
    ).toHaveCount(4);
  });

  test("keeps the composition within the requested responsive viewports", async ({
    page,
  }) => {
    for (const viewport of [
      { width: 375, height: 844 },
      { width: 430, height: 932 },
      { width: 768, height: 1024 },
      { width: 1024, height: 900 },
      { width: 1280, height: 900 },
      { width: 1440, height: 1000 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await expect(page.locator("#home-title")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  });
});
