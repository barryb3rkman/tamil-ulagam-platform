import { expect, test, type Page } from "@playwright/test";

import { getCanonicalRouteHref } from "./helpers/routes";

const desktopViewports = [
  { width: 1366, height: 900 },
  { width: 1440, height: 1000 },
  { width: 1920, height: 1080 },
] as const;

const mobileViewports = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
] as const;

async function expectVisibleHeaderControlsNotToOverlap(page: Page) {
  const controls = page
    .getByRole("banner")
    .locator("a:visible, button:visible");
  const items = await Promise.all(
    Array.from({ length: await controls.count() }, async (_, index) => {
      const control = controls.nth(index);
      return {
        label:
          (await control.getAttribute("aria-label")) ??
          (await control.innerText()).replace(/\s+/g, " ").trim(),
        bounds: await control.boundingBox(),
      };
    }),
  );

  for (let index = 0; index < items.length; index += 1) {
    for (let other = index + 1; other < items.length; other += 1) {
      const first = items[index];
      const second = items[other];
      expect(first?.bounds, first?.label).not.toBeNull();
      expect(second?.bounds, second?.label).not.toBeNull();
      if (!first?.bounds || !second?.bounds) continue;

      const overlaps =
        first.bounds.x < second.bounds.x + second.bounds.width &&
        first.bounds.x + first.bounds.width > second.bounds.x &&
        first.bounds.y < second.bounds.y + second.bounds.height &&
        first.bounds.y + first.bounds.height > second.bounds.y;
      expect(overlaps, `${first.label} must not overlap ${second.label}`).toBe(
        false,
      );
    }
  }
}

test.describe("public enrollment navigation", () => {
  test("provides stable desktop Login and Join Tamil Ulagam actions", async ({
    page,
  }) => {
    for (const viewport of desktopViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/", { waitUntil: "domcontentloaded" });

      const header = page.getByRole("banner");
      const primaryNavigation = header.getByRole("navigation", {
        name: "Primary navigation",
      });
      const login = header.getByRole("link", { name: "Login", exact: true });
      const register = header.getByRole("link", {
        name: "Join Tamil Ulagam",
        exact: true,
      });
      const partner = header.getByRole("link", {
        name: "Partner With Us",
        exact: true,
      });

      await expect(primaryNavigation).toBeVisible();
      await expect(login).toBeVisible();
      await expect(register).toBeVisible();
      await expect(partner).toBeVisible();
      await expect(login).toHaveAttribute(
        "href",
        getCanonicalRouteHref("/login"),
      );
      await expect(register).toHaveAttribute(
        "href",
        getCanonicalRouteHref("/join"),
      );
      await login.focus();
      await expect(login).toBeFocused();
      await register.focus();
      await expect(register).toBeFocused();

      await expectVisibleHeaderControlsNotToOverlap(page);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  });

  test("keeps both actions reachable in the existing mobile menu", async ({
    page,
  }) => {
    for (const viewport of mobileViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.getByRole("button", { name: "Open menu" }).click();

      const mobileNavigation = page.getByRole("navigation", {
        name: "Mobile primary navigation",
      });
      const login = mobileNavigation.getByRole("link", {
        name: "Login",
        exact: true,
      });
      const register = mobileNavigation.getByRole("link", {
        name: "Join Tamil Ulagam",
        exact: true,
      });

      await expect(mobileNavigation).toBeVisible();
      await expect(
        page.getByRole("navigation", {
          name: "Primary navigation",
          exact: true,
        }),
      ).toBeHidden();
      await login.scrollIntoViewIfNeeded();
      await expect(login).toBeVisible();
      await expect(register).toBeVisible();
      await expect(login).toHaveAttribute(
        "href",
        getCanonicalRouteHref("/login"),
      );
      await expect(register).toHaveAttribute(
        "href",
        getCanonicalRouteHref("/join"),
      );
      expect((await login.boundingBox())?.height).toBeGreaterThanOrEqual(44);
      expect((await register.boundingBox())?.height).toBeGreaterThanOrEqual(44);
      await register.focus();
      await expect(register).toBeFocused();
      const loginBounds = await login.boundingBox();
      const registerBounds = await register.boundingBox();
      expect(loginBounds).not.toBeNull();
      expect(registerBounds).not.toBeNull();
      if (loginBounds && registerBounds) {
        const actionsOverlap =
          loginBounds.x < registerBounds.x + registerBounds.width &&
          loginBounds.x + loginBounds.width > registerBounds.x &&
          loginBounds.y < registerBounds.y + registerBounds.height &&
          loginBounds.y + loginBounds.height > registerBounds.y;
        expect(actionsOverlap).toBe(false);
      }

      const landmarkLabels = await page
        .locator("nav[aria-label]")
        .evaluateAll((landmarks) =>
          landmarks.map((landmark) => landmark.getAttribute("aria-label")),
        );
      expect(new Set(landmarkLabels).size).toBe(landmarkLabels.length);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  });
});
