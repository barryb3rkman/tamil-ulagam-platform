import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { eventsEditorialImageKeys, images } from "@/config/images";
import { eventsContent } from "@/content/events";

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

test.describe("public Events page", () => {
  test("captures the requested visual review viewports", async ({ page }) => {
    test.setTimeout(120_000);
    const reviewDirectory =
      process.env.EVENTS_REVIEW_DIR ??
      path.resolve(process.cwd(), "../../artifacts/events-page-review");
    await mkdir(reviewDirectory, { recursive: true });

    for (const viewport of reviewViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/events", { waitUntil: "domcontentloaded" });
      await page.locator("#events-title").waitFor({ state: "visible" });
      await scrollThroughPage(page, eventsEditorialImageKeys);
      await verifyPageImages(page, eventsEditorialImageKeys);
      await page.screenshot({
        path: `${reviewDirectory}/events-${viewport.width}x${viewport.height}.png`,
        fullPage: true,
      });
    }
  });

  test("loads the planned model, routes, navigation, and approved media", async ({
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
    await page.goto("/events", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { level: 1, name: eventsContent.hero.title }),
    ).toBeVisible();
    await expect(page.getByText(eventsContent.hero.caption)).toBeVisible();
    await expect(
      page.getByRole("img", { name: images.initiativeGlobalEvents.alt }),
    ).toHaveCount(0);
    await expect(
      page.getByText(eventsContent.definition.statement),
    ).toBeVisible();
    await expect(page.locator("main")).not.toContainText(
      /planned|proposed|no live event calendar/i,
    );
    await expect(page.locator("main")).not.toContainText(/\b20\d{2}\b/);
    await expect(page.locator("main")).not.toContainText(/venue:\s/i);

    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText("Skip to main content");
    const navigation = page.getByRole("navigation", {
      name: "Primary navigation",
    });
    await navigation.getByRole("link", { name: "Events" }).focus();
    await expect(page.locator(":focus")).toHaveText("Events");
    await expect(
      navigation.getByRole("link", { name: "Events" }),
    ).toHaveAttribute("aria-current", "page");
    await page
      .getByRole("link", { name: "Understand the Events Model" })
      .focus();
    await expect(page.locator(":focus")).toHaveText(
      "Understand the Events Model",
    );
    await page
      .getByRole("link", { name: "Understand the Events Model" })
      .click();
    await expect(page).toHaveURL(/#events-model$/);
    await expect(
      page.getByRole("link", { name: "Explore Global Events" }).first(),
    ).toHaveAttribute(
      "href",
      getCanonicalRouteHref("/initiatives/global-events"),
    );
    await expect(
      page.getByRole("link", { name: "Contact Tamil Ulagam" }).first(),
    ).toHaveAttribute("href", getCanonicalRouteHref("/contact"));
    await expect(page.locator("#devtools-indicator")).toBeHidden();

    await scrollThroughPage(page, eventsEditorialImageKeys);
    await verifyPageImages(page, eventsEditorialImageKeys);
    expect(browserErrors).toEqual([]);
    expect(failedImageRequests).toEqual([]);
  });

  test("keeps the Events page responsive without horizontal overflow", async ({
    page,
  }) => {
    for (const viewport of reviewViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/events", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#events-title")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  });
});
