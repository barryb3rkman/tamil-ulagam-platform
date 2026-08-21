import { expect, test } from "@playwright/test";

const publicRoutes = [
  "",
  "about/",
  "initiatives/",
  "initiatives/healthcare/",
  "initiatives/education/",
  "initiatives/business/",
  "initiatives/jobs/",
  "initiatives/research/",
  "initiatives/tourism/",
  "initiatives/arts-culture/",
  "initiatives/global-events/",
  "tamil-id/",
  "chapters/",
  "roadmap/",
  "partners/",
  "events/",
  "news/",
  "contact/",
  "privacy/",
  "terms/",
] as const;

const applicationRoutes = [
  "login/",
  "signup/",
  "forgot-password/",
  "auth/callback/",
  "register/",
  "register/review/",
  "dashboard/",
  "dashboard/registration/",
  "dashboard/account/",
  "admin/",
  "admin/registrations/",
  "admin/registrations/registration-toronto/",
  "admin/registrations/registration-learning/",
  "admin/registrations/registration-anbu/",
  "admin/registrations/registration-enterprise/",
  "admin/registrations/registration-foundation/",
  "admin/registrations/registration-current/",
  "admin/registrations/review/",
] as const;

test("all exported public routes support direct navigation", async ({
  page,
}) => {
  for (const route of publicRoutes) {
    const response = await page.goto(`./${route}`, {
      waitUntil: "domcontentloaded",
    });

    expect(response?.status(), route || "homepage").toBe(200);
    await expect(page.locator("main")).toBeVisible();
  }
});

test("all exported application routes support project-subpath navigation", async ({
  page,
}) => {
  for (const route of applicationRoutes) {
    const response = await page.goto(`./${route}`, {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("main")).toBeVisible();
  }
});

test("project-site navigation and assets retain the repository base path", async ({
  page,
}) => {
  const failedApplicationRequests: string[] = [];
  const browserErrors: string[] = [];

  page.on("requestfailed", (request) => {
    if (request.failure()?.errorText !== "net::ERR_ABORTED") {
      failedApplicationRequests.push(request.url());
    }
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      browserErrors.push(message.text());
    }
  });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("./", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();

  const firstImageSource = await page
    .locator("img")
    .first()
    .getAttribute("src");
  expect(firstImageSource).toContain(
    "/tamil-ulagam-platform/images/tamil-ulagam/",
  );

  await page.getByRole("link", { name: "About" }).first().click();
  await expect(page).toHaveURL(/\/tamil-ulagam-platform\/about\/$/);
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goBack({ waitUntil: "networkidle" });
  await page.goForward({ waitUntil: "networkidle" });

  expect(failedApplicationRequests).toEqual([]);
  expect(browserErrors).toEqual([]);
});

test("mobile project-site rendering has working navigation and no overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./", { waitUntil: "networkidle" });

  const menuButton = page.getByRole("button", { name: "Open menu" });
  await expect(menuButton).toBeVisible();
  await menuButton.click();
  await expect(
    page.getByRole("navigation", { name: "Mobile primary navigation" }),
  ).toBeVisible();
  await expect(page.getByText("English / தமிழ்", { exact: true })).toHaveCount(
    0,
  );

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("project-site motion and layout remain stable at representative viewports", async ({
  page,
}) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("./", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-preference",
    "reduced",
  );
  await expect(page.locator("[data-route-transition]")).toHaveCSS(
    "opacity",
    "1",
  );

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("./", { waitUntil: "domcontentloaded" });
  const header = page.getByRole("banner");
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: "auto" }));
  await expect(header).toHaveAttribute("data-scrolled", "true");

  await page.goto("./roadmap/", { waitUntil: "domcontentloaded" });
  const phases = page.locator("[data-roadmap-phase]");
  await expect(phases.first()).toHaveAttribute("data-roadmap-active", "true");
  await phases.last().scrollIntoViewIfNeeded();
  await expect(phases.last()).toHaveAttribute("data-roadmap-active", "true");
});

test("metadata endpoints and missing routes behave as static resources", async ({
  request,
}) => {
  const sitemap = await request.get("./sitemap.xml");
  const robots = await request.get("./robots.txt");
  const favicon = await request.get("./icon.svg");
  const missing = await request.get("./missing-public-route/");

  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("/tamil-ulagam-platform/about");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("/tamil-ulagam-platform/sitemap.xml");
  expect(favicon.status()).toBe(200);
  expect(favicon.headers()["content-type"]).toContain("image/svg+xml");
  expect(missing.status()).toBe(404);
});
