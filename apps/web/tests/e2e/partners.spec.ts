import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { images, partnersEditorialImageKeys } from "@/config/images";
import { partnersContent } from "@/content/partners";

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

test.describe("public Partners page", () => {
  test("captures the requested visual review viewports", async ({ page }) => {
    test.setTimeout(120_000);
    const reviewDirectory =
      process.env.PARTNERS_REVIEW_DIR ??
      path.resolve(process.cwd(), "../../artifacts/partners-page-review");
    await mkdir(reviewDirectory, { recursive: true });

    for (const viewport of reviewViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/partners", { waitUntil: "domcontentloaded" });
      await page.locator("#partners-title").waitFor({ state: "visible" });
      await scrollThroughPage(page, partnersEditorialImageKeys);
      await verifyPageImages(page, partnersEditorialImageKeys);
      await page.screenshot({
        path: `${reviewDirectory}/partners-${viewport.width}x${viewport.height}.png`,
        fullPage: true,
      });
    }
  });

  test("loads the partnership model, routes, navigation, and approved media", async ({
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
    await page.goto("/partners", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { level: 1, name: partnersContent.hero.title }),
    ).toBeVisible();
    await expect(
      page.getByText(partnersContent.hero.status, { exact: true }),
    ).toBeVisible();
    await expect(page.getByText(partnersContent.hero.caption)).toBeVisible();
    await expect(
      page.getByRole("img", { name: images.partnerships.alt }),
    ).toBeVisible();
    await expect(page.getByText(partnersContent.interest.notice)).toBeVisible();
    await expect(page.locator("body")).not.toContainText(
      /our partners|trusted by/i,
    );

    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText("Skip to main content");
    const navigation = page.getByRole("navigation", {
      name: "Primary navigation",
    });
    await navigation.getByRole("link", { name: "Partners" }).focus();
    await expect(page.locator(":focus")).toHaveText("Partners");
    await expect(
      navigation.getByRole("link", { name: "Partners" }),
    ).toHaveAttribute("aria-current", "page");
    await page
      .getByRole("link", { name: "Explore the Partnership Model" })
      .focus();
    await expect(page.locator(":focus")).toHaveText(
      "Explore the Partnership Model",
    );
    await page
      .getByRole("link", { name: "Explore the Partnership Model" })
      .click();
    await expect(page).toHaveURL(/#partnership-model$/);
    await expect(
      page.getByRole("link", { name: "View the Roadmap" }).first(),
    ).toHaveAttribute("href", "/roadmap");
    await expect(
      page.getByRole("link", { name: "Explore Initiatives" }).first(),
    ).toHaveAttribute("href", "/initiatives");
    await expect(
      page.getByRole("link", { name: "Contact Tamil Ulagam" }).first(),
    ).toHaveAttribute("href", "/contact");
    await expect(page.locator("#devtools-indicator")).toBeHidden();

    await scrollThroughPage(page, partnersEditorialImageKeys);
    await verifyPageImages(page, partnersEditorialImageKeys);
    expect(browserErrors).toEqual([]);
    expect(failedImageRequests).toEqual([]);
  });

  test("keeps the Partners page responsive without horizontal overflow", async ({
    page,
  }) => {
    for (const viewport of reviewViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/partners", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#partners-title")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  });
});
