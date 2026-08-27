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

async function signIn(
  page: Page,
  email: string,
  password: string,
  // E1: a submitted/needs_changes/verified applicant's post-login /dashboard
  // landing now immediately client-redirects on into the Organisation
  // Workspace — /workspace/ is included here (alongside the pre-existing
  // /dashboard and /register outcomes) so this default assertion isn't
  // racing that redirect.
  expectedUrl: RegExp = /\/(?:dashboard|register|workspace)\/?/,
) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(expectedUrl);
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
    await page.getByRole("checkbox", { name: /Terms of Use/ }).check();
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(
      page.getByRole("heading", { name: "Account created" }),
    ).toBeVisible();

    // E1: /dashboard now routes an authenticated visitor into the
    // relevant V3 workspace rather than showing content itself — before
    // a draft exists, that's the Member workspace (every authenticated
    // user has one).
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/workspace\/member\/?$/);
    await expect(
      page.getByRole("heading", { name: "Your affiliations" }),
    ).toBeVisible();
    await signOut(page);
    await signIn(page, applicant.email, applicant.password);
    // E1.5: a fresh member-only login no longer defaults into Organisation
    // registration (that used to silently create a blank draft the
    // moment anyone signed in) — it lands on /dashboard, which routes an
    // application-less account to the Member workspace. Registration is
    // now always a deliberate visit to /join/organisation.
    await expect(page).toHaveURL(/\/workspace\/member\/?$/);
    await page.goto("/join/organisation");

    // Step 1 — Organisation
    await page.getByLabel("Business / Company").check();
    await page.getByLabel("Organisation name").fill("Nila Global Services");
    await page.getByLabel("Country").fill("Canada");
    await page.getByLabel("State / Province / Region").fill("Ontario");
    await page.getByLabel("City").fill("Toronto");
    await page
      .getByLabel("Short description")
      .fill(
        "A professional services company supporting international community organisations.",
      );
    await page.getByRole("button", { name: "Save progress" }).click();
    await expect(page.getByText("Saved just now.")).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Business / Company")).toBeChecked();
    await expect(page.getByLabel("Organisation name")).toHaveValue(
      "Nila Global Services",
    );
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 2 — Contact & representative
    await page.getByLabel("Official email").fill("office@nilaglobal.example");
    await page.getByLabel("Official phone").fill("+1 416 555 0199");
    await page.getByLabel("Representative full name").fill("Nila Raj");
    await page.getByLabel(/^Phone/).fill("+1 416 555 0188");
    await page.getByLabel("Representative role").selectOption("leadership");
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 3 — Registration & trust
    await page.getByLabel("Unregistered / informal organisation").check();
    await page.getByLabel("Business type").selectOption("Private Company");
    await page.getByLabel("Industry").selectOption("Professional Services");
    await page
      .getByLabel(
        "I confirm that I am authorised to represent this organisation and that the information provided is accurate.",
      )
      .check();
    await page.getByRole("button", { name: "Review & submit" }).click();
    await page.getByRole("button", { name: "Submit registration" }).click();
    await page.getByRole("button", { name: "Confirm submission" }).click();
    // V3: submitting transitions in place into a real status screen at
    // /register itself rather than bouncing to /dashboard.
    await expect(
      page.getByRole("heading", { name: "Registration submitted" }),
    ).toBeVisible();
    await expect(
      page.getByText("Submitted", { exact: true }).first(),
    ).toBeVisible();

    await signOut(page);
    await signIn(page, reviewer.email, reviewer.password, /\/admin\/?$/);
    await page.goto("/admin/registrations");
    await expect(page.getByText("Nila Global Services")).toBeVisible();
    // Scoped to this application's own row: the shared local Supabase
    // instance may carry other applications/organisations seeded by
    // other e2e specs (e.g. member-affiliation-lifecycle.spec.ts), so a
    // page-wide "Review" link locator is no longer reliably singular.
    await page
      .getByRole("listitem")
      .filter({ hasText: "Nila Global Services" })
      .getByRole("link", { name: "Review" })
      .click();
    await expect(page).toHaveURL(
      /\/admin\/registrations\/review\/?\?application=/,
    );
    await page.getByRole("button", { name: "Request Changes" }).click();
    await page
      .getByLabel("Feedback message")
      .fill("Please confirm the industry selection.");
    await page.getByRole("button", { name: "Send change request" }).click();
    await expect(
      page.getByText("Changes Requested", { exact: true }).first(),
    ).toBeVisible();

    await signOut(page);
    await signIn(page, applicant.email, applicant.password);
    // E1: /dashboard redirects on to the Organisation Workspace, the
    // now-unambiguous single managed organisation.
    await expect(page).toHaveURL(/\/workspace\/organisation\/?\?organization=/);
    await expect(
      page.getByText("Please confirm the industry selection."),
    ).toBeVisible();
    await page.getByRole("link", { name: "Update Registration" }).click();
    await page.getByLabel("Industry").selectOption("Technology");
    await page.getByRole("button", { name: "Review & submit" }).click();
    await page.getByRole("button", { name: "Submit registration" }).click();
    await page.getByRole("button", { name: "Confirm submission" }).click();
    await expect(
      page.getByText("Submitted", { exact: true }).first(),
    ).toBeVisible();

    await signOut(page);
    await signIn(page, reviewer.email, reviewer.password, /\/admin\/?$/);
    await page.goto("/admin/registrations");
    await page
      .getByRole("listitem")
      .filter({ hasText: "Nila Global Services" })
      .getByRole("link", { name: "Review" })
      .click();
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
    await expect(page).toHaveURL(/\/workspace\/organisation\/?\?organization=/);
    await expect(
      page.getByText("Verified", { exact: true }).first(),
    ).toBeVisible();
  });
});
