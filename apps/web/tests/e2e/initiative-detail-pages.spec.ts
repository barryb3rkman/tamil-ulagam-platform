import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

import { images } from "@/config/images";
import {
  getInitiativeDetailIdentity,
  getInitiativeImageKey,
  initiativeDetailSlugs,
  initiativeDetails,
} from "@/content/initiative-details";

import { scrollThroughPage, verifyPageImages } from "./helpers/homepage-media";

const standardDesktop = { width: 1440, height: 1000 };
const standardMobile = { width: 390, height: 844 };
const responsiveViewports = [
  { width: 375, height: 812 },
  standardMobile,
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  standardDesktop,
  { width: 1920, height: 1080 },
] as const;
const representativeViewports = [
  { width: 1920, height: 1080 },
  { width: 768, height: 1024 },
];
const representativeSlugs = ["healthcare", "jobs", "arts-culture"] as const;

function getRoute(slug: (typeof initiativeDetailSlugs)[number]) {
  return getInitiativeDetailIdentity(slug).href;
}

async function waitForHeroImage(
  page: Page,
  imageKey: ReturnType<typeof getInitiativeImageKey>,
) {
  const heroImage = page.getByRole("img", { name: images[imageKey].alt });

  await expect
    .poll(
      () =>
        heroImage.evaluate((image) => (image as HTMLImageElement).naturalWidth),
      {
        message: `${imageKey} hero image did not decode`,
        timeout: 15_000,
      },
    )
    .toBeGreaterThan(0);
}

async function verifyDetailRoute(
  page: Page,
  slug: (typeof initiativeDetailSlugs)[number],
) {
  const detail = initiativeDetails[slug];
  const initiative = getInitiativeDetailIdentity(slug);
  const imageKey = getInitiativeImageKey(slug);
  const browserErrors: string[] = [];
  const failedImageRequests: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    if (
      request.url().includes("/_next/image") ||
      request.url().includes(".png")
    ) {
      failedImageRequests.push(request.url());
    }
  });

  await page.goto(getRoute(slug), { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { level: 1, name: initiative.title }),
  ).toBeVisible();
  await expect(page.getByText("Planned").first()).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Breadcrumb" }),
  ).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(
    page.getByRole("link", { name: detail.primaryCallToAction.label }),
  ).toHaveAttribute("href", "#capabilities");
  await expect(
    page.getByRole("link", { name: detail.secondaryCallToAction.label }),
  ).toHaveAttribute("href", "/partners");
  const primaryNavigation = page.getByRole("navigation", {
    name: "Primary navigation",
  });
  if (await primaryNavigation.isVisible()) {
    await expect(
      primaryNavigation.getByRole("link", { name: "Initiatives" }),
    ).toHaveAttribute("aria-current", "page");
  } else {
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  }
  await expect(page.locator("#devtools-indicator")).toBeHidden();

  await expect(
    page.getByRole("heading", {
      level: 2,
      name: detail.whyThisMatters.heading,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: detail.audienceHeading }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: detail.participationHeading,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: detail.finalCtaHeading }),
  ).toBeVisible();

  const capabilityCards = page.locator("[data-capability-card]");
  await expect(capabilityCards).toHaveCount(detail.capabilities.length);
  for (let index = 0; index < detail.capabilities.length; index += 1) {
    const capabilityCard = capabilityCards.nth(index);
    await expect(capabilityCard).toBeVisible();
    await expect(capabilityCard).not.toBeEmpty();
    await expect(capabilityCard).toContainText(`0${index + 1}`);
  }

  const heroImage = page.getByRole("img", { name: images[imageKey].alt });
  await expect(heroImage).toBeVisible();
  await waitForHeroImage(page, imageKey);

  const relatedLinks = page
    .getByRole("region", { name: "Related initiatives" })
    .getByRole("link");
  await expect(relatedLinks).toHaveCount(3);
  for (const related of detail.related) {
    await expect(
      page
        .getByRole("link", {
          name: getInitiativeDetailIdentity(related.slug).title,
        })
        .first(),
    ).toHaveAttribute("href", getRoute(related.slug));
  }

  expect(browserErrors).toEqual([]);
  expect(failedImageRequests).toEqual([]);
}

test.describe("initiative detail pages", () => {
  test("loads every approved detail route on desktop", async ({ page }) => {
    await page.setViewportSize(standardDesktop);

    for (const slug of initiativeDetailSlugs) {
      await verifyDetailRoute(page, slug);
    }
  });

  test("loads every approved detail route without mobile overflow", async ({
    page,
  }) => {
    await page.setViewportSize(standardMobile);

    for (const slug of initiativeDetailSlugs) {
      await verifyDetailRoute(page, slug);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  });

  test("keeps every detail route within the requested responsive viewports", async ({
    page,
  }) => {
    test.setTimeout(120_000);

    for (const viewport of responsiveViewports) {
      await page.setViewportSize(viewport);
      for (const slug of initiativeDetailSlugs) {
        await page.goto(getRoute(slug), { waitUntil: "domcontentloaded" });
        await expect(page.locator("#initiative-title")).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        ).toBe(true);
      }
    }
  });

  test("keeps representative layout variants responsive and navigable", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    for (const slug of representativeSlugs) {
      for (const viewport of [standardMobile, ...representativeViewports]) {
        await page.setViewportSize(viewport);
        await page.goto(getRoute(slug), { waitUntil: "domcontentloaded" });
        await expect(page.locator("#initiative-title")).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        ).toBe(true);
      }
    }

    await page.setViewportSize(standardMobile);
    await page.goto(getRoute("healthcare"), { waitUntil: "domcontentloaded" });
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Skip to main content" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("main#main-content")).toBeFocused();

    await page.getByRole("button", { name: "Open menu" }).click();
    const mobileNavigation = page.getByRole("navigation", {
      name: "Mobile primary navigation",
    });
    await expect(mobileNavigation).toBeVisible();
    await expect(
      mobileNavigation.getByRole("link", { name: "Initiatives" }),
    ).toHaveAttribute("aria-current", "page");
    await page.keyboard.press("Escape");
    await expect(mobileNavigation).toBeHidden();

    await page.goto(getRoute("education"), { waitUntil: "domcontentloaded" });
    await page
      .getByRole("link", { name: /Previous initiative: Healthcare/ })
      .click();
    await expect(page).toHaveURL(getRoute("healthcare"));
    await page
      .getByRole("link", { name: /Next initiative: Education/ })
      .click();
    await expect(page).toHaveURL(getRoute("education"));

    await page.goto("/initiatives/not-an-approved-initiative", {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible();
    await expect(page.getByText("404", { exact: true })).toBeVisible();
  });

  test("captures every approved detail page for visual review", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const reviewDirectory = path.resolve(
      process.cwd(),
      "../../artifacts/initiative-detail-differentiation",
    );
    await mkdir(reviewDirectory, { recursive: true });

    for (const slug of representativeSlugs) {
      const imageKey = getInitiativeImageKey(slug);
      for (const viewport of [standardDesktop, standardMobile]) {
        await page.setViewportSize(viewport);
        await page.goto(getRoute(slug), { waitUntil: "domcontentloaded" });
        await expect(page.locator("#initiative-title")).toBeVisible();
        await waitForHeroImage(page, imageKey);
        await scrollThroughPage(page, [imageKey]);
        await verifyPageImages(page, [imageKey]);
        await page.screenshot({
          path: `${reviewDirectory}/${slug}-${viewport.width}x${viewport.height}.png`,
          fullPage: true,
        });
      }
    }
  });
});
