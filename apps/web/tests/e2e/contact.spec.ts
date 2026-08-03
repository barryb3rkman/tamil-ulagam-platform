import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { contactContent } from "@/content/contact";

import { scrollThroughPage } from "./helpers/homepage-media";

const reviewViewports = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 1000 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 430, height: 932 },
  { width: 390, height: 844 },
  { width: 375, height: 812 },
] as const;

test.describe("public Contact page", () => {
  test("captures the requested visual review viewports", async ({ page }) => {
    test.setTimeout(120_000);
    const reviewDirectory =
      process.env.CONTACT_REVIEW_DIR ??
      path.resolve(process.cwd(), "../../artifacts/contact-page-review");
    await mkdir(reviewDirectory, { recursive: true });

    for (const viewport of reviewViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/contact", { waitUntil: "domcontentloaded" });
      await page.locator("#contact-title").waitFor({ state: "visible" });
      await scrollThroughPage(page, []);
      await page.screenshot({
        path: `${reviewDirectory}/contact-${viewport.width}x${viewport.height}.png`,
        fullPage: true,
      });
    }
  });

  test("loads the guidance, routes and honest contact limitations", async ({
    page,
  }) => {
    const browserErrors: string[] = [];
    const failedRequests: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));
    page.on("requestfailed", (request) => failedRequests.push(request.url()));

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/contact", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { level: 1, name: contactContent.hero.title }),
    ).toBeVisible();
    await expect(
      page.getByText(contactContent.hero.status, { exact: true }),
    ).toBeVisible();
    await expect(page.locator("form")).toHaveCount(0);
    await expect(page.locator("input, textarea, select")).toHaveCount(0);
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
    await expect(page.locator("address")).toHaveCount(0);

    for (const category of contactContent.categories.items) {
      await expect(
        page.getByRole("heading", { name: category.title }),
      ).toBeVisible();
    }
    await expect(
      page.getByText(contactContent.informationNotToSend.statement),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: contactContent.urgentMatters.title }),
    ).toBeVisible();
    await expect(
      page.getByText(contactContent.urgentMatters.statement),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Clear answers before contact channels open.",
      }),
    ).toBeVisible();

    const primaryNavigation = page.getByRole("navigation", {
      name: "Primary navigation",
    });
    await expect(
      primaryNavigation.locator('[aria-current="page"]'),
    ).toHaveCount(0);
    await expect(
      page
        .getByRole("navigation", { name: "Footer navigation" })
        .getByRole("link", {
          name: "Contact",
        }),
    ).toHaveAttribute("href", "/contact");

    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText("Skip to main content");
    await page.getByRole("link", { name: "Choose an Enquiry Path" }).focus();
    await expect(page.locator(":focus")).toHaveText("Choose an Enquiry Path");
    await page.getByRole("link", { name: "Choose an Enquiry Path" }).click();
    await expect(page).toHaveURL(/#contact-paths$/);

    const routes = ["/about", "/partners", "/roadmap", "/initiatives"] as const;
    for (const route of routes) {
      const response = await page.request.get(route);
      expect(response.status(), `${route} should resolve`).toBeLessThan(400);
    }
    await expect(page.locator("#devtools-indicator")).toBeHidden();

    await scrollThroughPage(page, []);
    expect(browserErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });

  test("keeps the Contact page responsive without horizontal overflow", async ({
    page,
  }) => {
    for (const viewport of reviewViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/contact", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#contact-title")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  });
});
