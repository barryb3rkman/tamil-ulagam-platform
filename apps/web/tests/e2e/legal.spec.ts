import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

import {
  privacyPolicy,
  termsOfUse,
  type LegalPolicyDocument,
} from "@/content/legal";

const responsiveViewports = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 1000 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 430, height: 932 },
  { width: 390, height: 844 },
  { width: 375, height: 812 },
] as const;

const screenshotViewports = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 1000 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
] as const;

const legalRoutes = [
  { path: "/privacy", document: privacyPolicy },
  { path: "/terms", document: termsOfUse },
] as const;

function observeBrowserFailures(page: Page) {
  const browserErrors: string[] = [];
  const failedRequests: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("requestfailed", (request) => failedRequests.push(request.url()));

  return { browserErrors, failedRequests };
}

async function expectSharedDraftState(
  page: Page,
  document: LegalPolicyDocument<string>,
) {
  await expect(page).toHaveTitle(document.metadataTitle);
  await expect(
    page.getByRole("heading", { level: 1, name: document.title }),
  ).toBeVisible();
  await expect(
    page.getByText(document.status.label, { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Not yet approved", { exact: true })).toHaveCount(
    2,
  );
  await expect(
    page.getByText("Pending confirmation", { exact: true }),
  ).toHaveCount(2);
  await expect(page.locator("form")).toHaveCount(0);
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(page.locator("address")).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator("#devtools-indicator")).toBeHidden();
}

test.describe("draft public legal pages", () => {
  test("captures the required Privacy and Terms review screenshots", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const reviewDirectory = path.resolve(
      process.cwd(),
      "../../artifacts/legal-pages-review",
    );
    await mkdir(reviewDirectory, { recursive: true });

    for (const route of legalRoutes) {
      for (const viewport of screenshotViewports) {
        await page.setViewportSize(viewport);
        await page.goto(route.path, { waitUntil: "domcontentloaded" });
        await page
          .getByRole("heading", { level: 1, name: route.document.title })
          .waitFor({ state: "visible" });
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({
          path: `${reviewDirectory}/${route.document.key}-${viewport.width}x${viewport.height}.png`,
          fullPage: true,
        });
      }
    }
  });

  test("keeps Privacy status, navigation and current processing limits explicit", async ({
    page,
  }) => {
    const failures = observeBrowserFailures(page);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/privacy", { waitUntil: "domcontentloaded" });

    await expectSharedDraftState(page, privacyPolicy);
    await expect(
      page.getByText("No membership account creation", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Account information", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: privacyPolicy.reviewChecklist.title }),
    ).toBeVisible();

    const contents = page.getByRole("navigation", {
      name: `${privacyPolicy.title} table of contents`,
    });
    await expect(contents.getByRole("link")).toHaveCount(
      privacyPolicy.sections.length,
    );
    const retentionLink = contents.getByRole("link", { name: "Retention" });
    await retentionLink.focus();
    await expect(page.locator(":focus")).toContainText("Retention");
    await retentionLink.click();
    await expect(page).toHaveURL(/#retention$/);

    await page.goto("/privacy", { waitUntil: "domcontentloaded" });
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText("Skip to main content");
    await expect(
      page.getByRole("link", { name: "Read the draft Terms of Use" }),
    ).toHaveAttribute("href", "/terms");

    const footer = page.getByRole("navigation", { name: "Footer navigation" });
    await expect(footer.getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "href",
      "/privacy",
    );
    await expect(footer.getByRole("link", { name: "Terms" })).toHaveAttribute(
      "href",
      "/terms",
    );

    const termsResponse = await page.request.get("/terms");
    expect(termsResponse.status()).toBeLessThan(400);
    expect(failures.browserErrors).toEqual([]);
    expect(failures.failedRequests).toEqual([]);
  });

  test("keeps Terms unresolved and connects every referenced public route", async ({
    page,
  }) => {
    const failures = observeBrowserFailures(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/terms", { waitUntil: "domcontentloaded" });

    await expectSharedDraftState(page, termsOfUse);
    await expect(
      page.getByRole("heading", {
        name: "Planned services are not currently available",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Qualified legal drafting required" }),
    ).toBeVisible();
    await expect(
      page.getByText(
        /No country, state, city, court or arbitral venue is selected/,
      ),
    ).toBeVisible();

    const expectedRoutes = [
      "/tamil-id",
      "/partners",
      "/chapters",
      "/events",
      "/news",
      "/privacy",
    ] as const;
    for (const route of expectedRoutes) {
      await expect(
        page.locator(`main a[href="${route}"]`).first(),
      ).toBeVisible();
      const response = await page.request.get(route);
      expect(response.status(), `${route} should resolve`).toBeLessThan(400);
    }

    const contents = page.getByRole("navigation", {
      name: `${termsOfUse.title} table of contents`,
    });
    const disputeLink = contents.getByRole("link", {
      name: "Governing law and disputes",
    });
    await disputeLink.click();
    await expect(page).toHaveURL(/#governing-law-disputes$/);
    expect(failures.browserErrors).toEqual([]);
    expect(failures.failedRequests).toEqual([]);
  });

  test("keeps both legal documents usable across expanded viewports", async ({
    page,
  }) => {
    test.setTimeout(120_000);

    for (const route of legalRoutes) {
      for (const viewport of responsiveViewports) {
        await page.setViewportSize(viewport);
        await page.goto(route.path, { waitUntil: "domcontentloaded" });
        await expect(
          page.getByRole("heading", {
            level: 1,
            name: route.document.title,
          }),
        ).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
          `${route.path} should not overflow at ${viewport.width}px`,
        ).toBe(true);
      }
    }
  });

  test("keeps long legal tables of contents compact and navigable", async ({
    page,
  }) => {
    const contents = page.getByRole("navigation", {
      name: `${privacyPolicy.title} table of contents`,
    });
    const sectionList = contents.locator("ol");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/privacy", { waitUntil: "domcontentloaded" });
    const mobileDimensions = await sectionList.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }));
    expect(mobileDimensions.clientHeight).toBeLessThan(
      mobileDimensions.scrollHeight,
    );
    await contents.getByRole("link", { name: "Individual rights" }).focus();
    await expect(page.locator(":focus")).toContainText("Individual rights");

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/privacy", { waitUntil: "domcontentloaded" });
    const firstItem = await sectionList.locator("li").nth(0).boundingBox();
    const secondItem = await sectionList.locator("li").nth(1).boundingBox();
    expect(firstItem?.y).toBeCloseTo(secondItem?.y ?? 0, 0);

    await page.setViewportSize({ width: 1440, height: 800 });
    await page.goto("/privacy", { waitUntil: "domcontentloaded" });
    const desktopList = await sectionList.boundingBox();
    expect(desktopList?.height ?? 0).toBeLessThan(800 - 112);
  });
});
