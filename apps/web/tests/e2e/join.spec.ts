import { expect, test } from "@playwright/test";

import { joinJourneys } from "@/content/join";

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

test.describe("public /join entry hub", () => {
  test("renders the hero and all four journey cards with correct destinations", async ({
    page,
  }) => {
    const browserErrors: string[] = [];
    page.on("pageerror", (error) => browserErrors.push(error.message));

    await page.goto("/join", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Your place in the global Tamil community starts here.",
      }),
    ).toBeVisible();

    for (const journey of joinJourneys) {
      const link = page.getByRole("link").filter({
        has: page.getByRole("heading", { name: journey.title, exact: true }),
      });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute(
        "href",
        getCanonicalRouteHref(journey.href),
      );
    }

    expect(browserErrors).toEqual([]);
  });

  test("has exactly one h1 and a sensible heading order", async ({ page }) => {
    await page.goto("/join", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(
      page.getByRole("heading", { level: 2, name: "Join Tamil Ulagam" }),
    ).toBeVisible();
  });

  test("keeps /join responsive with no horizontal overflow", async ({
    page,
  }) => {
    for (const viewport of reviewViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/join", { waitUntil: "domcontentloaded" });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
        `overflow at ${viewport.width}px`,
      ).toBe(true);
    }
  });

  test("does not link to the /dev design-system QA surface anywhere", async ({
    page,
  }) => {
    await page.goto("/join", { waitUntil: "domcontentloaded" });
    const devLinks = await page.locator('a[href*="/dev"]').count();
    expect(devLinks).toBe(0);
  });

  test("respects reduced motion: ambient hero drift and mask reveal both settle to their end state", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/join", { waitUntil: "domcontentloaded" });

    const reveal = page.locator("[data-motion-reveal]").first();
    await expect(reveal).toHaveCSS("opacity", "1");
    await expect(reveal).toHaveCSS("clip-path", "none");

    const ambient = page.locator("[data-motion-ambient]").first();
    const animationName = await ambient.evaluate(
      (element) => getComputedStyle(element).animationName,
    );
    expect(animationName).toBe("none");
  });

  test("Organisation journey shows the real logged-out journey explanation, with safe return-target auth links", async ({
    page,
  }) => {
    await page.goto("/join/organisation", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { level: 1, name: "Register an Organisation" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "How Organisation registration works",
      }),
    ).toBeVisible();

    const createAccount = page.getByRole("link", {
      name: "Create account & begin",
    });
    await expect(createAccount).toHaveAttribute(
      "href",
      "/signup/?next=%2Fjoin%2Forganisation",
    );
    const signIn = page.getByRole("link", { name: "Sign in" });
    await expect(signIn).toHaveAttribute(
      "href",
      "/login/?next=%2Fjoin%2Forganisation",
    );

    expect(await page.locator("input, textarea, select").count()).toBe(0);
  });

  test("Tamil Sangam journey shows the real logged-out journey explanation, with safe return-target auth links", async ({
    page,
  }) => {
    await page.goto("/join/sangam", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { level: 1, name: "Register a Tamil Sangam" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "How Sangam registration works" }),
    ).toBeVisible();
    await expect(page.getByText("About your Sangam")).toBeVisible();

    const createAccount = page.getByRole("link", {
      name: "Create account & begin",
    });
    await expect(createAccount).toHaveAttribute(
      "href",
      "/signup/?next=%2Fjoin%2Fsangam",
    );
    const signIn = page.getByRole("link", { name: "Sign in" });
    await expect(signIn).toHaveAttribute(
      "href",
      "/login/?next=%2Fjoin%2Fsangam",
    );

    expect(await page.locator("input, textarea, select").count()).toBe(0);
  });

  test("Member journey shows the real logged-out journey explanation, with safe return-target auth links", async ({
    page,
  }) => {
    await page.goto("/join/member", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { level: 1, name: "Connect your membership" }),
    ).toBeVisible();
    await expect(
      page.getByText("Find your Tamil Sangam or Organisation"),
    ).toBeVisible();
    await expect(page.getByText("They confirm your affiliation")).toBeVisible();

    const createAccount = page.getByRole("link", { name: "Create account" });
    await expect(createAccount).toHaveAttribute(
      "href",
      "/signup/?next=%2Fjoin%2Fmember",
    );
    const signIn = page.getByRole("link", { name: "Sign in" });
    await expect(signIn).toHaveAttribute(
      "href",
      "/login/?next=%2Fjoin%2Fmember",
    );

    // No fake submission form on the logged-out journey.
    expect(await page.locator("input, textarea, select").count()).toBe(0);
  });

  test("/register keeps working as a compatibility route to the same V3 Organisation experience", async ({
    page,
  }) => {
    await page.goto("/register", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { level: 1, name: "Register an Organisation" }),
    ).toBeVisible();
  });
});
