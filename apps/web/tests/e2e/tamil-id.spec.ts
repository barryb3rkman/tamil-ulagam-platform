import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { images, tamilIdEditorialImageKeys } from "@/config/images";
import { tamilIdContent } from "@/content/tamil-id";

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

test.describe("public Tamil ID concept page", () => {
  test("captures the requested visual review viewports", async ({ page }) => {
    test.setTimeout(120_000);
    const reviewDirectory =
      process.env.TAMIL_ID_REVIEW_DIR ??
      path.resolve(process.cwd(), "../../artifacts/tamil-id-page-review");
    await mkdir(reviewDirectory, { recursive: true });

    for (const viewport of reviewViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/tamil-id", { waitUntil: "domcontentloaded" });
      await page.locator("#tamil-id-title").waitFor({ state: "visible" });
      await scrollThroughPage(page, tamilIdEditorialImageKeys);
      await verifyPageImages(page, tamilIdEditorialImageKeys);
      await page.screenshot({
        path: `${reviewDirectory}/tamil-id-${viewport.width}x${viewport.height}.png`,
        fullPage: true,
      });
    }
  });

  test("loads the concept, route links, navigation, and approved image", async ({
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
    await page.goto("/tamil-id", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { level: 1, name: tamilIdContent.hero.title }),
    ).toBeVisible();
    await expect(page.getByText(tamilIdContent.hero.status)).toBeVisible();
    await expect(page.getByText(tamilIdContent.hero.caption)).toBeVisible();
    await expect(
      page.getByText(
        "A community membership credential — not a government identity document.",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: tamilIdContent.journey.title }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: tamilIdContent.verification.title }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /Clear answers for a concept still being built/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("img", {
        name: images[tamilIdContent.hero.imageKey].alt,
      }),
    ).toBeVisible();

    const navigation = page.getByRole("navigation", {
      name: "Primary navigation",
    });
    await navigation.getByRole("link", { name: "Tamil ID" }).focus();
    await expect(page.locator(":focus")).toHaveText("Tamil ID");
    await expect(
      navigation.getByRole("link", { name: "Tamil ID" }),
    ).toHaveAttribute("aria-current", "page");
    await page.getByRole("link", { name: "Understand the Tamil ID" }).focus();
    await expect(page.locator(":focus")).toHaveText("Understand the Tamil ID");
    await expect(
      page.getByRole("link", { name: "View the Roadmap" }),
    ).toHaveAttribute("href", "/roadmap");
    await expect(
      page.getByRole("link", { name: "Partner With Tamil Ulagam" }),
    ).toHaveAttribute("href", "/partners");
    await page.getByRole("link", { name: "Understand the Tamil ID" }).click();
    await expect(page).toHaveURL(/#what-is-tamil-id$/);
    await expect(page.locator("#devtools-indicator")).toBeHidden();

    await scrollThroughPage(page, tamilIdEditorialImageKeys);
    await verifyPageImages(page, tamilIdEditorialImageKeys);
    expect(browserErrors).toEqual([]);
    expect(failedImageRequests).toEqual([]);
  });

  test("keeps the Tamil ID page responsive without horizontal overflow", async ({
    page,
  }) => {
    for (const viewport of reviewViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/tamil-id", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#tamil-id-title")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  });
});
