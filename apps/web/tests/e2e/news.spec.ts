import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { newsEditorialImageKeys } from "@/config/images";
import { newsContent } from "@/content/news";

import { scrollThroughPage, verifyPageImages } from "./helpers/homepage-media";
import { getCanonicalRouteHref } from "./helpers/routes";
import { reviewArtefactOnly } from "./helpers/review-only";

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
    reviewArtefactOnly();
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
    // The three desks, each named in Tamil and English.
    for (const stream of newsContent.streams) {
      await expect(
        page.getByRole("heading", { level: 3, name: stream.title }),
      ).toBeVisible();
      await expect(page.getByText(stream.tamilTitle).first()).toBeVisible();
    }
    await expect(
      page.getByRole("heading", { name: newsContent.principles.title }),
    ).toBeVisible();
    await expect(page.locator("main")).not.toContainText(
      /planned|proposed|in development|future newsroom/i,
    );

    const main = page.locator("main#main-content");
    // Same rule, same exception: the federation dates none of its own copy,
    // and a syndicated headline keeps its publisher's dateline.
    expect(
      await main.evaluate((element) => {
        const ours = element.cloneNode(true) as HTMLElement;
        for (const quoted of ours.querySelectorAll(
          "[data-external-headlines]",
        )) {
          quoted.remove();
        }
        return ours.textContent ?? "";
      }),
    ).not.toMatch(/\b20\d{2}\b/);
    await expect(main).not.toContainText(/published today|byline:/i);
    // The federation timestamps nothing of its own — it has no dated stories
    // to timestamp. The syndicated headlines are dated because their
    // publishers dated them, and dropping that would misrepresent them.
    expect(
      await main.evaluate(
        (element) =>
          [...element.querySelectorAll("time")].filter(
            (node) => !node.closest("[data-external-headlines]"),
          ).length,
      ),
    ).toBe(0);
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
      .getByRole("link", { name: "Contact the newsroom" })
      .first()
      .focus();
    await expect(page.locator(":focus")).toHaveText("Contact the newsroom");
    // Where the newsroom actually sends a reader now: contribute by
    // registering an organisation, or reach the desk directly.
    await expect(
      page.getByRole("link", { name: "Register an organisation" }).first(),
    ).toHaveAttribute("href", getCanonicalRouteHref("/join/organisation"));
    await expect(
      page.getByRole("link", { name: "Contact the newsroom" }).first(),
    ).toHaveAttribute("href", getCanonicalRouteHref("/contact"));
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
});
