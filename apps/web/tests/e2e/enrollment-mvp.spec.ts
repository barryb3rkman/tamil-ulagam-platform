import { expect, test, type Page } from "@playwright/test";

import { images } from "../../src/config/images";

const demo = {
  email: "arun.kumar@example.org",
  password: "TamilUlagam1!",
} as const;

async function loginDemo(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(demo.email);
  await page.getByLabel("Password").fill(demo.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/dashboard\/?$/);
}

test.describe("organisation enrollment MVP", () => {
  test("validates signup and completes the dynamic registration journey", async ({
    page,
  }) => {
    await page.goto("/signup");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Enter your full name.")).toBeVisible();
    await expect(page.getByText("Enter an email address.")).toBeVisible();

    await page.getByLabel("Full name").fill("Nila Raj");
    await page.getByLabel("Email address").fill("nila.raj@example.org");
    await page.locator('input[type="password"]').first().fill("TamilMvp1!");
    await page.getByLabel("Confirm password").fill("TamilMvp1!");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(
      page.getByRole("heading", { name: "Account created" }),
    ).toBeVisible();
    await expect(page.getByText(/mock account/i)).toHaveCount(0);
    await page
      .getByRole("button", { name: "Start organisation registration" })
      .click();

    await page.getByLabel("Business / Company").check();
    await page.getByRole("button", { name: "Save progress" }).click();
    await expect(page.getByText("Progress saved.")).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Business / Company")).toBeChecked();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByLabel("Organisation name").fill("Nila Global Services");
    await page.getByLabel("Country").fill("Canada");
    await page.getByLabel("State / Province / Region").fill("Ontario");
    await page.getByLabel("City").fill("Toronto");
    await page.getByLabel("Street address").fill("125 Community Street");
    await page.getByLabel("Official email").fill("office@nilaglobal.example");
    await page.getByLabel("Official phone").fill("+1 416 555 0199");
    await page
      .getByLabel("Short description")
      .fill(
        "A professional services company supporting international community organisations.",
      );
    await page.getByLabel("Unregistered / informal organisation").check();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByLabel("Business type").selectOption("Private Company");
    await page.getByLabel("Industry").selectOption("Professional Services");
    await page
      .getByLabel("Products / services description")
      .fill("Advisory and digital programme services.");
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByLabel("Phone").fill("+1 416 555 0188");
    await page.getByLabel("Designation").fill("Founder");
    await page
      .getByLabel("Relationship to organisation")
      .selectOption("founder");
    await page
      .getByLabel(
        "I confirm that I am authorised to submit this organisation's information.",
      )
      .check();
    await page
      .getByLabel(
        "I confirm that the information provided is accurate to the best of my knowledge.",
      )
      .check();
    await page.getByRole("button", { name: "Review registration" }).click();

    await expect(
      page.getByRole("heading", { name: "Review your registration" }),
    ).toBeVisible();
    await expect(
      page.getByText("Nila Global Services", { exact: true }).first(),
    ).toBeVisible();
    await page.getByRole("button", { name: "Submit Registration" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Confirm submission" }).click();
    await expect(page).toHaveURL(/\/dashboard\/?$/);
    await expect(
      page.getByText("Submitted", { exact: true }).first(),
    ).toBeVisible();
  });

  test("uses the mock login service and renders the current dashboard status", async ({
    page,
  }) => {
    await loginDemo(page);
    await expect(
      page.getByRole("heading", { name: "Welcome back, Arun" }),
    ).toBeVisible();
    await expect(page.getByText("Toronto Tamil Sangam")).toBeVisible();
    await expect(
      page.getByText("Under Review", { exact: true }).first(),
    ).toBeVisible();
  });

  test("uses dedicated portal chrome and the approved visual assets", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("navigation", { name: "Primary navigation" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("navigation", { name: "Footer navigation" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("navigation", { name: "Portal legal navigation" }),
    ).toBeVisible();
    await expect(
      page.getByRole("img", {
        name: images.portalAuthHero.alt,
      }),
    ).toBeVisible();

    await page.goto("/register");
    await expect(
      page.getByRole("img", {
        name: /multi-generational group collaborating/i,
      }),
    ).toBeVisible();

    await loginDemo(page);
    await expect(
      page.getByRole("navigation", { name: "Account navigation" }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Primary navigation" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("navigation", { name: "Footer navigation" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("img", {
        name: /community representatives gathered in discussion/i,
      }),
    ).toBeVisible();

    await page.goto("/admin");
    await expect(
      page.getByRole("navigation", { name: "Admin navigation" }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Primary navigation" }),
    ).toHaveCount(0);
  });

  test("does not expose implementation-only copy in enrollment interfaces", async ({
    page,
  }) => {
    const routes = [
      "/login",
      "/signup",
      "/forgot-password",
      "/register",
      "/dashboard",
      "/dashboard/registration",
      "/dashboard/account",
      "/admin",
      "/admin/registrations",
      "/admin/registrations/registration-toronto",
    ] as const;
    const implementationCopy =
      /frontend demonstration|no live account|no live submission|mock review workspace|demo access|mock application|demo records|current mock account|mock verification|demo information/i;

    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("body")).not.toContainText(implementationCopy);
    }

    await page.goto("/forgot-password");
    await page.getByLabel("Email address").fill("member@example.org");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByText(/mock mode|no email is sent/i)).toHaveCount(0);
  });

  test("handles recovery, confirmation and invalid static callbacks", async ({
    page,
  }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email address").fill("member@example.org");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(
      page.getByRole("heading", { name: "Reset request received" }),
    ).toBeVisible();

    await page.goto("/auth/callback?flow=recovery&mock=recovery");
    await expect(
      page.getByRole("heading", { name: "Set a new password" }),
    ).toBeVisible();
    const recoveryPasswords = page.locator(
      'input[autocomplete="new-password"]',
    );
    await recoveryPasswords.first().fill("TamilMvp2!");
    await recoveryPasswords.last().fill("different");
    await page.getByRole("button", { name: "Set new password" }).click();
    await expect(page.getByText("Passwords do not match.")).toBeVisible();
    await recoveryPasswords.last().fill("TamilMvp2!");
    await page.getByRole("button", { name: "Set new password" }).click();
    await expect(
      page.getByRole("heading", { name: "Password updated" }),
    ).toBeVisible();

    await page.goto("/auth/callback?flow=confirmation&mock=confirmation");
    await expect(
      page.getByRole("heading", { name: "Email confirmed" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Continue registration" }),
    ).toHaveAttribute("href", /\/register\/?$/);

    await page.goto("/auth/callback?flow=recovery");
    await expect(
      page.getByRole("heading", { name: "Link unavailable" }),
    ).toBeVisible();
  });

  test("admin change requests update the same user application", async ({
    page,
  }) => {
    await loginDemo(page);
    await page.goto("/admin/registrations/registration-toronto");
    await page.getByRole("button", { name: "Request Changes" }).click();
    await page.getByRole("button", { name: "Send change request" }).click();
    await expect(
      page.getByText("Enter the changes the applicant needs to make."),
    ).toBeVisible();
    await page
      .getByLabel("Feedback message")
      .fill(
        "Please confirm the official email address and registration number.",
      );
    await page.getByRole("button", { name: "Send change request" }).click();
    await expect(
      page.getByText("Changes Requested", { exact: true }).first(),
    ).toBeVisible();
    await page.goto("/dashboard");
    await expect(
      page.getByText(
        "Please confirm the official email address and registration number.",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Update Registration" }),
    ).toBeVisible();
  });

  test("admin verification and rejection require deliberate review actions", async ({
    page,
  }) => {
    await loginDemo(page);
    await page.goto("/admin/registrations/registration-toronto");
    await page.getByRole("button", { name: "Verify", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Confirm verification" }).click();
    await expect(
      page.getByText("Verified", { exact: true }).first(),
    ).toBeVisible();
    await page.getByRole("button", { name: "Suspend", exact: true }).click();
    await page.getByRole("button", { name: "Confirm suspension" }).click();
    await expect(
      page.getByText("Enter a reason for suspension."),
    ).toBeVisible();
    await page
      .getByLabel("Feedback message")
      .fill("Access is paused pending a governance review.");
    await page.getByRole("button", { name: "Confirm suspension" }).click();
    await expect(
      page.getByText("Suspended", { exact: true }).first(),
    ).toBeVisible();

    await page.goto("/admin/registrations/registration-enterprise");
    await page.getByRole("button", { name: "Reject", exact: true }).click();
    await page
      .getByLabel("Feedback message")
      .fill("The representative authority could not be confirmed.");
    await page.getByRole("button", { name: "Confirm rejection" }).click();
    await expect(
      page.getByText("Rejected", { exact: true }).first(),
    ).toBeVisible();
  });

  test("keeps the admin review dialog within the mobile viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/admin/registrations/registration-toronto");
    await page.getByRole("button", { name: "Request Changes" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const bounds = await dialog.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(375);
    expect(bounds?.y ?? -1).toBeGreaterThanOrEqual(0);
    expect((bounds?.y ?? 0) + (bounds?.height ?? 0)).toBeLessThanOrEqual(812);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
  });

  test("keeps auth, registration, dashboard and admin routes responsive", async ({
    page,
  }) => {
    test.setTimeout(240_000);
    for (const viewport of [
      { width: 375, height: 812 },
      { width: 390, height: 844 },
      { width: 430, height: 932 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1280, height: 900 },
      { width: 1366, height: 900 },
      { width: 1440, height: 1000 },
      { width: 1920, height: 1080 },
    ]) {
      await page.setViewportSize(viewport);
      for (const route of [
        "/login",
        "/signup",
        "/forgot-password",
        "/auth/callback?flow=recovery",
        "/register",
        "/register/review",
        "/dashboard",
        "/dashboard/registration",
        "/dashboard/account",
        "/admin",
        "/admin/registrations",
        "/admin/registrations/registration-toronto",
      ] as const) {
        await page.goto(route);
        await expect(page.locator("h1")).toHaveCount(1);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth - window.innerWidth,
          ),
          `${route} at ${viewport.width}px`,
        ).toBeLessThanOrEqual(1);
      }
    }
  });
});
