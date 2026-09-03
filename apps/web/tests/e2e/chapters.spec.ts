import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { chaptersEditorialImageKeys, images } from "@/config/images";
import { chaptersContent } from "@/content/chapters";

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
] as const;

test.describe("public Chapters page", () => {
  test("captures the requested visual review viewports", async ({ page }) => {
    test.setTimeout(120_000);
    const reviewDirectory =
      process.env.CHAPTERS_REVIEW_DIR ??
      path.resolve(process.cwd(), "../../artifacts/chapters-page-review");
    await mkdir(reviewDirectory, { recursive: true });

    for (const viewport of reviewViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/chapters", { waitUntil: "domcontentloaded" });
      await page.locator("#chapters-title").waitFor({ state: "visible" });
      await scrollThroughPage(page, chaptersEditorialImageKeys);
      await verifyPageImages(page, chaptersEditorialImageKeys);
      await page.screenshot({
        path: `${reviewDirectory}/chapters-${viewport.width}x${viewport.height}.png`,
        fullPage: true,
      });
    }
  });

  test("loads the chapter vision, links, navigation, and approved media", async ({
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
    await page.goto("/chapters", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { level: 1, name: chaptersContent.hero.title }),
    ).toBeVisible();
    await expect(page.getByText(chaptersContent.hero.caption)).toBeVisible();
    await expect(
      page.getByText(/does not imply control over them/i),
    ).toBeVisible();
    await expect(page.locator("main")).not.toContainText(
      /planned|proposed|applications are not open/i,
    );
    await expect(
      page.getByRole("img", { name: images.globalChapters.alt }),
    ).toHaveCount(0);

    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText("Skip to main content");
    const navigation = page.getByRole("navigation", {
      name: "Primary navigation",
    });
    await navigation.getByRole("link", { name: "Chapters" }).focus();
    await expect(page.locator(":focus")).toHaveText("Chapters");
    await expect(
      navigation.getByRole("link", { name: "Chapters" }),
    ).toHaveAttribute("aria-current", "page");
    await page
      .getByRole("link", { name: "Understand the Chapter Vision" })
      .focus();
    await expect(page.locator(":focus")).toHaveText(
      "Understand the Chapter Vision",
    );
    await page
      .getByRole("link", { name: "Understand the Chapter Vision" })
      .click();
    await expect(page).toHaveURL(/#chapter-vision$/);
    await expect(
      page.locator("main").getByRole("link", { name: "Partner With Us" }),
    ).toHaveAttribute("href", getCanonicalRouteHref("/partners"));
    await expect(page.locator("#devtools-indicator")).toBeHidden();

    await scrollThroughPage(page, chaptersEditorialImageKeys);
    await verifyPageImages(page, chaptersEditorialImageKeys);
    expect(browserErrors).toEqual([]);
    expect(failedImageRequests).toEqual([]);
  });

  test("keeps the Chapters page responsive without horizontal overflow", async ({
    page,
  }) => {
    for (const viewport of reviewViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/chapters", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#chapters-title")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  });
});
