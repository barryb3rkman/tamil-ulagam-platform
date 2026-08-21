import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "../../src/lib/supabase/database.types";

const applicant = {
  fullName: "Nila Raj",
  email: "local-browser-applicant@tamil-ulagam.test",
  password: "LocalBrowser!2048Aa",
} as const;

const reviewer = {
  fullName: "Local Review Officer",
  email: "local-browser-reviewer@tamil-ulagam.test",
  password: "LocalReviewer!2048Aa",
} as const;

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/(?:dashboard|register)\/?$/);
}

async function signOut(page: Page) {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login\/?$/);
}

test.describe("local Supabase browser enrollment", () => {
  test.skip(
    process.env.RUN_SUPABASE_E2E !== "true",
    "Runs only against the explicit local Supabase environment.",
  );

  test.beforeAll(async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      throw new Error("Local Supabase reviewer setup is not configured.");
    }
    const admin = createClient<Database>(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await admin.auth.admin.createUser({
      email: reviewer.email,
      password: reviewer.password,
      email_confirm: true,
      user_metadata: { full_name: reviewer.fullName },
    });
    if (error) throw new Error(`Create local reviewer: ${error.message}`);
    const role = await admin.from("user_roles").insert({
      user_id: data.user.id,
      role: "reviewer",
    });
    if (role.error) {
      throw new Error(`Grant local reviewer role: ${role.error.message}`);
    }
  });

  test("completes signup, enrollment, changes, resubmission and verification", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.goto("/signup");
    await page.getByLabel("Full name").fill(applicant.fullName);
    await page.getByLabel("Email address").fill(applicant.email);
    await page
      .locator('input[type="password"]')
      .first()
      .fill(applicant.password);
    await page.getByLabel("Confirm password").fill(applicant.password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(
      page.getByRole("heading", { name: "Account created" }),
    ).toBeVisible();

    await page.goto("/dashboard");
    await expect(
      page.getByText("Welcome, Nila", { exact: true }),
    ).toBeVisible();
    await signOut(page);
    await signIn(page, applicant.email, applicant.password);
    await expect(page).toHaveURL(/\/register\/?$/);

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
    await page.getByRole("button", { name: "Submit Registration" }).click();
    await page.getByRole("button", { name: "Confirm submission" }).click();
    await expect(page).toHaveURL(/\/dashboard\/?$/);
    await expect(
      page.getByText("Submitted", { exact: true }).first(),
    ).toBeVisible();

    await signOut(page);
    await signIn(page, reviewer.email, reviewer.password);
    await page.goto("/admin/registrations");
    await expect(page.getByText("Nila Global Services")).toBeVisible();
    await page.getByRole("link", { name: "Review" }).click();
    await expect(page).toHaveURL(
      /\/admin\/registrations\/review\/?\?application=/,
    );
    await page.getByRole("button", { name: "Request Changes" }).click();
    await page
      .getByLabel("Feedback message")
      .fill("Please confirm the representative designation.");
    await page.getByRole("button", { name: "Send change request" }).click();
    await expect(
      page.getByText("Changes Requested", { exact: true }).first(),
    ).toBeVisible();

    await signOut(page);
    await signIn(page, applicant.email, applicant.password);
    await expect(page).toHaveURL(/\/dashboard\/?$/);
    await expect(
      page.getByText("Please confirm the representative designation."),
    ).toBeVisible();
    await page.getByRole("link", { name: "Update Registration" }).click();
    await page.getByLabel("Designation").fill("Founder and Director");
    await page.getByRole("button", { name: "Review registration" }).click();
    await page.getByRole("button", { name: "Submit Registration" }).click();
    await page.getByRole("button", { name: "Confirm submission" }).click();
    await expect(
      page.getByText("Submitted", { exact: true }).first(),
    ).toBeVisible();

    await signOut(page);
    await signIn(page, reviewer.email, reviewer.password);
    await page.goto("/admin/registrations");
    await page.getByRole("link", { name: "Review" }).click();
    await page.getByRole("button", { name: "Mark Under Review" }).click();
    await expect(
      page.getByText("Under Review", { exact: true }).first(),
    ).toBeVisible();
    await page.getByRole("button", { name: "Verify", exact: true }).click();
    await page.getByRole("button", { name: "Confirm verification" }).click();
    await expect(
      page.getByText("Verified", { exact: true }).first(),
    ).toBeVisible();

    await signOut(page);
    await signIn(page, applicant.email, applicant.password);
    await expect(page).toHaveURL(/\/dashboard\/?$/);
    await expect(
      page.getByText("Verified", { exact: true }).first(),
    ).toBeVisible();
  });
});
