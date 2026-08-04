import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

const showcaseRoutes = [
  { path: "/", name: "home" },
  { path: "/about", name: "about" },
  { path: "/initiatives", name: "initiatives" },
  { path: "/initiatives/healthcare", name: "initiative-healthcare" },
  { path: "/initiatives/education", name: "initiative-education" },
  { path: "/initiatives/business", name: "initiative-business" },
  { path: "/initiatives/jobs", name: "initiative-jobs" },
  { path: "/initiatives/research", name: "initiative-research" },
  { path: "/initiatives/tourism", name: "initiative-tourism" },
  { path: "/initiatives/arts-culture", name: "initiative-arts-culture" },
  { path: "/initiatives/global-events", name: "initiative-global-events" },
  { path: "/tamil-id", name: "tamil-id" },
  { path: "/chapters", name: "chapters" },
  { path: "/partners", name: "partners" },
  { path: "/events", name: "events" },
  { path: "/news", name: "news" },
  { path: "/contact", name: "contact" },
] as const;

const exceptionRoutes = [
  { path: "/roadmap", name: "roadmap" },
  { path: "/privacy", name: "privacy" },
  { path: "/terms", name: "terms" },
] as const;

const reviewRoutes = [...showcaseRoutes, ...exceptionRoutes] as const;

const reviewViewports = [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
] as const;

const bannedShowcaseLanguage =
  /\b(?:planned|proposed|in development|readiness|unresolved)\b|future (?:phase|service|platform|capability|member access|operating model|organiser process|registration|recordings|updates|collaboration|member benefits|membership pricing|qr verification|article submission|corrections process|chapter formation)|subject to (?:confirmation|approval)|pending (?:approval|confirmation)|not currently available|not yet available|applications are not open|registration is not open|no live (?:event )?calendar|no active (?:newsroom|chapters)|no approved partners|concept (?:only|preview)|public website foundation|original ppt target|deliberately excluded|launch gate|operational trigger/i;

const bannedMetadataLanguage =
  /\b(?:draft|planned|proposed|future|in development|concept)\b/i;

async function prepareFullPageCapture(page: Page) {
  const images = page.locator("main img");

  for (let index = 0; index < (await images.count()); index += 1) {
    const image = images.nth(index);

    if (!(await image.isVisible())) {
      continue;
    }

    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((element) => {
          const htmlImage = element as HTMLImageElement;

          return htmlImage.complete && htmlImage.naturalWidth > 0;
        }),
      )
      .toBe(true);
  }

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "auto" }));
}

test.describe("showcase language integrity", () => {
  for (const route of showcaseRoutes) {
    test(`${route.path} uses direct showcase language`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const failedRequests: string[] = [];

      page.on("console", (message) => {
        if (message.type() === "error") {
          consoleErrors.push(message.text());
        }
      });
      page.on("requestfailed", (request) => {
        failedRequests.push(request.url());
      });

      await page.goto(route.path, { waitUntil: "domcontentloaded" });

      const main = page.locator("main");
      await expect(main.locator("h1")).toHaveCount(1);
      await expect(page.locator("body")).not.toContainText(
        bannedShowcaseLanguage,
      );
      await expect(main).not.toContainText(/\b(?:19|20)\d{2}\b/);
      expect(await page.title()).not.toMatch(bannedMetadataLanguage);

      const description =
        (await page
          .locator('meta[name="description"]')
          .getAttribute("content")) ?? "";
      expect(description).not.toMatch(bannedMetadataLanguage);
      expect(consoleErrors).toEqual([]);
      expect(failedRequests).toEqual([]);
    });
  }

  test("preserves the intentional roadmap and legal exceptions", async ({
    page,
  }) => {
    await page.goto("/roadmap", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toContainText("Foundation");
    await expect(page.locator("main")).toContainText("Connected Community");
    await expect(page.locator("main")).toContainText("Global Services");
    await expect(page.locator("main")).toContainText(
      /in development|readiness/i,
    );

    for (const pathName of ["/privacy", "/terms"] as const) {
      await page.goto(pathName, { waitUntil: "domcontentloaded" });
      await expect(page.locator("main")).toContainText(
        /draft for legal review/i,
      );
      await expect(page.locator("main")).toContainText(/not yet approved/i);
    }
  });

  test("preserves essential public safety and truthfulness boundaries", async ({
    page,
  }) => {
    await page.goto("/tamil-id", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toContainText(
      /not a government identity document/i,
    );
    await expect(page.locator("main")).toContainText(
      /not proof of citizenship, nationality or travel authority/i,
    );
    await expect(page.locator("main")).not.toContainText(
      /app store|google play|download (?:the )?app/i,
    );

    await page.goto("/initiatives/healthcare", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("main")).toContainText(
      /not an emergency or crisis-support service/i,
    );
    await expect(page.locator("main")).toContainText(
      /does not provide medical care or telemedicine/i,
    );

    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toContainText(
      /do not share identity documents or sensitive personal information/i,
    );
    await expect(page.locator("main")).toContainText(
      /not an emergency or crisis-response service/i,
    );
    await expect(page.locator("form")).toHaveCount(0);

    await page.goto("/partners", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toContainText(
      /does not imply endorsement, contract or confirmed partnership/i,
    );
    await expect(page.locator("main")).not.toContainText(
      /our partners|trusted by/i,
    );

    await page.goto("/chapters", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).not.toContainText(
      /\d+\+?\s+active chapters/i,
    );
  });

  test("keeps internal navigation and footer links resolvable", async ({
    page,
    request,
  }) => {
    const internalLinks = new Set<string>();

    for (const route of showcaseRoutes) {
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      const hrefs = await page
        .locator('a[href^="/"]')
        .evaluateAll((links) =>
          links.map((link) => link.getAttribute("href")).filter(Boolean),
        );

      for (const href of hrefs) {
        if (href) {
          internalLinks.add(href.split("#")[0] ?? href);
        }
      }
    }

    for (const href of internalLinks) {
      const response = await request.get(href);
      expect(response.status(), `${href} should resolve`).toBeLessThan(400);
    }
  });

  test("captures every reviewed route at desktop and mobile sizes", async ({
    page,
  }) => {
    test.skip(
      process.env.SHOWCASE_LANGUAGE_REVIEW !== "1",
      "Review captures run only for the dedicated visual-review command.",
    );
    test.setTimeout(300_000);

    const reviewDirectory = path.resolve(
      process.cwd(),
      "../../artifacts/showcase-language-cleanup",
    );
    await mkdir(reviewDirectory, { recursive: true });

    for (const route of reviewRoutes) {
      for (const viewport of reviewViewports) {
        await page.setViewportSize(viewport);
        await page.goto(route.path, { waitUntil: "domcontentloaded" });
        await expect(page.locator("main h1")).toHaveCount(1);
        await prepareFullPageCapture(page);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        ).toBe(true);
        await page.screenshot({
          path: path.join(
            reviewDirectory,
            `${route.name}-${viewport.width}x${viewport.height}.png`,
          ),
          fullPage: true,
        });
      }
    }
  });
});
