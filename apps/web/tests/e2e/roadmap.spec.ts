import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { images, roadmapEditorialImageKeys } from "@/config/images";
import { roadmapPageContent } from "@/content/roadmap-page";
import { roadmapPhases } from "@/content/roadmap";

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

test.describe("public Roadmap page", () => {
  test("captures the requested visual review viewports", async ({ page }) => {
    test.setTimeout(120_000);
    const reviewDirectory =
      process.env.ROADMAP_REVIEW_DIR ??
      path.resolve(process.cwd(), "../../artifacts/roadmap-page-review");
    await mkdir(reviewDirectory, { recursive: true });

    for (const viewport of reviewViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/roadmap", { waitUntil: "domcontentloaded" });
      await page.locator("#roadmap-title").waitFor({ state: "visible" });
      await scrollThroughPage(page, roadmapEditorialImageKeys);
      await verifyPageImages(page, roadmapEditorialImageKeys);
      await page.screenshot({
        path: `${reviewDirectory}/roadmap-${viewport.width}x${viewport.height}.png`,
        fullPage: true,
      });
    }
  });

  test("loads the roadmap sequence, links, navigation, and approved media", async ({
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
    await page.goto("/roadmap", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: roadmapPageContent.hero.title,
      }),
    ).toBeVisible();
    await expect(page.getByText(roadmapPageContent.hero.status)).toBeVisible();
    await expect(page.getByText(roadmapPageContent.hero.caption)).toBeVisible();
    await expect(
      page.getByRole("img", { name: images.roadmapFuture.alt }),
    ).toBeVisible();
    for (const phase of roadmapPhases) {
      await expect(
        page.getByRole("heading", { name: phase.title, exact: true }),
      ).toBeVisible();
    }
    await expect(
      page.getByRole("heading", { name: roadmapPageContent.readiness.title }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Clear answers for a roadmap still being built responsibly.",
      }),
    ).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/\b20\d{2}\b/);
    await expect(page.locator("body")).not.toContainText(/\b\d{1,3}%\b/);

    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText("Skip to main content");
    const navigation = page.getByRole("navigation", {
      name: "Primary navigation",
    });
    await navigation.getByRole("link", { name: "About" }).focus();
    await expect(page.locator(":focus")).toHaveText("About");
    await page.getByRole("link", { name: "Explore the Phases" }).focus();
    await expect(page.locator(":focus")).toHaveText("Explore the Phases");
    await page.getByRole("link", { name: "Explore the Phases" }).click();
    await expect(page).toHaveURL(/#roadmap-phases$/);
    await expect(
      page.getByRole("link", { name: "Explore Tamil ID" }).first(),
    ).toHaveAttribute("href", "/tamil-id");
    await expect(
      page.getByRole("link", { name: "Explore Chapters" }).first(),
    ).toHaveAttribute("href", "/chapters");
    await expect(
      page.getByRole("link", { name: "Explore Initiatives" }).first(),
    ).toHaveAttribute("href", "/initiatives");
    await expect(
      page.getByRole("link", { name: "Partner With Tamil Ulagam" }),
    ).toHaveAttribute("href", "/partners");
    await expect(
      page.getByRole("link", { name: "Contact Us" }).first(),
    ).toHaveAttribute("href", "/contact");
    await expect(page.locator("#devtools-indicator")).toBeHidden();

    await scrollThroughPage(page, roadmapEditorialImageKeys);
    await verifyPageImages(page, roadmapEditorialImageKeys);
    expect(browserErrors).toEqual([]);
    expect(failedImageRequests).toEqual([]);
  });

  test("keeps the Roadmap page responsive without horizontal overflow", async ({
    page,
  }) => {
    for (const viewport of reviewViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/roadmap", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#roadmap-title")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  });
});
