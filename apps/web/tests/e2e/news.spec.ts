import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { images, newsEditorialImageKeys } from "@/config/images";
import { newsContent } from "@/content/news";

import { scrollThroughPage, verifyPageImages } from "./helpers/homepage-media";

const reviewViewports = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 1000 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 430, height: 932 },
  { width: 390, height: 844 },
  { width: 375, height: 812 },
] as const;

test.describe("public News page", () => {
  test("captures the requested visual review viewports", async ({ page }) => {
    test.setTimeout(120_000);
    const reviewDirectory =
      process.env.NEWS_REVIEW_DIR ??
      path.resolve(process.cwd(), "../../artifacts/news-page-review");
    await mkdir(reviewDirectory, { recursive: true });

    for (const viewport of reviewViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/news", { waitUntil: "domcontentloaded" });
      await page.locator("#news-title").waitFor({ state: "visible" });
      await scrollThroughPage(page, newsEditorialImageKeys);
      await verifyPageImages(page, newsEditorialImageKeys);
      await page.screenshot({
        path: `${reviewDirectory}/news-${viewport.width}x${viewport.height}.png`,
        fullPage: true,
      });
    }
  });

  test("loads the planned editorial model, links, navigation and approved media", async ({
    page,
  }) => {
    const browserErrors: string[] = [];
    const failedImageRequests: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));
    page.on("requestfailed", (request) => {
      if (
        request.url().includes(".png") ||
        request.url().includes("/_next/image")
      ) {
        failedImageRequests.push(request.url());
      }
    });

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/news", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { level: 1, name: newsContent.hero.title }),
    ).toBeVisible();
    await expect(page.getByText(newsContent.hero.caption)).toBeVisible();
    await expect(
      page.getByRole("img", { name: images.communityStories.alt }),
    ).toBeVisible();
    await expect(
      page.getByText(newsContent.definition.statement),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: newsContent.corrections.title }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: newsContent.multilingualAccessibility.title,
      }),
    ).toBeVisible();
    await expect(page.locator("main")).not.toContainText(
      /planned|proposed|in development|future newsroom/i,
    );

    const main = page.locator("main#main-content");
    await expect(main).not.toContainText(/\b20\d{2}\b/);
    await expect(main).not.toContainText(/published today|byline:/i);
    await expect(main.locator("time")).toHaveCount(0);
    await expect(
      main.locator('[rel="author"], [itemprop="author"], [data-byline]'),
    ).toHaveCount(0);
    await expect(page.locator("article")).toHaveCount(0);
    await expect(page.getByRole("searchbox")).toHaveCount(0);

    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText("Skip to main content");
    const navigation = page.getByRole("navigation", {
      name: "Primary navigation",
    });
    await navigation.getByRole("link", { name: "News" }).focus();
    await expect(page.locator(":focus")).toHaveText("News");
    await expect(
      navigation.getByRole("link", { name: "News" }),
    ).toHaveAttribute("aria-current", "page");
    await page
      .getByRole("link", { name: "Understand the Editorial Model" })
      .focus();
    await expect(page.locator(":focus")).toHaveText(
      "Understand the Editorial Model",
    );
    await page
      .getByRole("link", { name: "Understand the Editorial Model" })
      .click();
    await expect(page).toHaveURL(/#editorial-model$/);
    await expect(
      page.getByRole("link", { name: "Explore Partnerships" }).first(),
    ).toHaveAttribute("href", "/partners");
    await expect(
      page.getByRole("link", { name: "Contact Tamil Ulagam" }).first(),
    ).toHaveAttribute("href", "/contact");
    await expect(
      page.getByRole("link", { name: "Learn About Tamil Ulagam" }),
    ).toHaveAttribute("href", "/about");
    await expect(page.locator("#devtools-indicator")).toBeHidden();

    await scrollThroughPage(page, newsEditorialImageKeys);
    await verifyPageImages(page, newsEditorialImageKeys);
    expect(browserErrors).toEqual([]);
    expect(failedImageRequests).toEqual([]);
  });

  test("keeps the News page responsive without horizontal overflow", async ({
    page,
  }) => {
    for (const viewport of reviewViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/news", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#news-title")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  });

  test("balances publication types without an empty final grid cell", async ({
    page,
  }) => {
    const grid = page.locator("[data-publication-type-grid]");
    const cards = grid.locator("[data-publication-type-card]");

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/news", { waitUntil: "domcontentloaded" });
    await grid.scrollIntoViewIfNeeded();
    await expect(grid).toBeVisible();
    const desktopGrid = await grid.boundingBox();
    const desktopCards = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const rectangle = element.getBoundingClientRect();
        return {
          bottom: rectangle.bottom,
          left: rectangle.left,
          right: rectangle.right,
          top: rectangle.top,
          width: rectangle.width,
        };
      }),
    );

    expect(desktopGrid).not.toBeNull();
    expect(desktopCards).toHaveLength(5);
    expect(desktopCards[0]?.top).toBeCloseTo(desktopCards[2]?.top ?? 0, 0);
    expect(desktopCards[3]?.top).toBeCloseTo(desktopCards[4]?.top ?? 0, 0);
    expect(desktopCards[3]?.top ?? 0).toBeGreaterThanOrEqual(
      desktopCards[0]?.bottom ?? 0,
    );
    expect(desktopCards[3]?.width).toBeCloseTo(desktopCards[4]?.width ?? 0, 0);
    expect(desktopCards[3]?.left).toBeCloseTo(desktopGrid?.x ?? 0, 0);
    expect(desktopCards[4]?.right).toBeCloseTo(
      (desktopGrid?.x ?? 0) + (desktopGrid?.width ?? 0),
      0,
    );

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/news", { waitUntil: "domcontentloaded" });
    await grid.scrollIntoViewIfNeeded();
    const tabletGrid = await grid.boundingBox();
    const finalTabletCard = await cards.last().boundingBox();
    expect(finalTabletCard?.width).toBeCloseTo(tabletGrid?.width ?? 0, 0);
    expect(finalTabletCard?.x).toBeCloseTo(tabletGrid?.x ?? 0, 0);
  });
});
