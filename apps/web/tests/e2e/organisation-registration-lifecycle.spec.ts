import { expect, test, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../src/lib/supabase/database.types";

const registrant = {
  fullName: "Priya Anand",
  email: "local-browser-org-registrant@tamil-ulagam.test",
  password: "LocalBrowserOrg!2048Aa",
} as const;

const reviewer = {
  fullName: "Local Org Review Officer",
  email: "local-browser-org-reviewer@tamil-ulagam.test",
  password: "LocalOrgReviewer!2048Aa",
} as const;

const member = {
  email: "local-browser-org-member@tamil-ulagam.test",
  password: "LocalBrowserOrgMember!2048Aa",
} as const;

const organisationName = "Local Browser Meridian Health Clinic";

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

test.describe("local Supabase real V3 Organisation registration lifecycle", () => {
  test.skip(
    process.env.RUN_SUPABASE_E2E !== "true",
    "Runs only against the explicit local Supabase environment.",
  );

  test.beforeAll(async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      throw new Error("Local Supabase setup is not configured.");
    }
    const admin: SupabaseClient<Database> = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const createdReviewer = await admin.auth.admin.createUser({
      email: reviewer.email,
      password: reviewer.password,
      email_confirm: true,
      user_metadata: { full_name: reviewer.fullName },
    });
    if (createdReviewer.error) {
      throw new Error(`Create reviewer: ${createdReviewer.error.message}`);
    }
    const role = await admin.from("user_roles").insert({
      user_id: createdReviewer.data.user.id,
      role: "reviewer",
    });
    if (role.error)
      throw new Error(`Grant reviewer role: ${role.error.message}`);

    const createdMember = await admin.auth.admin.createUser({
      email: member.email,
      password: member.password,
      email_confirm: true,
      user_metadata: { full_name: "Local Browser Org Member" },
    });
    if (createdMember.error) {
      throw new Error(`Create member: ${createdMember.error.message}`);
    }
  });

  test("register -> needs_changes -> resume -> resubmit -> verify -> Workspace -> People -> member requests -> manager approves", async ({
    browser,
  }) => {
    test.setTimeout(180_000);

    const registrantContext = await browser.newContext();
    const registrantPage = await registrantContext.newPage();
    const reviewerContext = await browser.newContext();
    const reviewerPage = await reviewerContext.newPage();
    const memberContext = await browser.newContext();
    const memberPage = await memberContext.newPage();

    try {
      // --- Registrant: sign up, then the real /join/organisation journey ---
      await registrantPage.goto("/signup");
      await registrantPage.getByLabel("Full name").fill(registrant.fullName);
      await registrantPage.getByLabel("Email address").fill(registrant.email);
      await registrantPage
        .locator('input[type="password"]')
        .first()
        .fill(registrant.password);
      await registrantPage
        .getByLabel("Confirm password")
        .fill(registrant.password);
      await registrantPage
        .getByRole("checkbox", { name: /Terms of Use/ })
        .check();
      await registrantPage
        .getByRole("button", { name: "Create account" })
        .click();
      await expect(
        registrantPage.getByRole("heading", { name: "Account created" }),
      ).toBeVisible();

      await registrantPage.goto("/join/organisation");
      await expect(
        registrantPage.getByRole("link", { name: /Create account & begin/ }),
      ).toHaveCount(0);

      // Stage 1 — Your Organisation
      await registrantPage.getByLabel("Healthcare").check();
      await registrantPage
        .getByLabel("Organisation name")
        .fill(organisationName);
      await registrantPage.getByLabel("Country").fill("Canada");
      await registrantPage
        .getByLabel("State / Province / Region")
        .fill("Nova Scotia");
      await registrantPage.getByLabel("City").fill("Halifax");
      await registrantPage
        .getByLabel("Short description")
        .fill(
          "A community health clinic serving the Halifax region with primary care services.",
        );
      await registrantPage.getByRole("button", { name: "Continue" }).click();

      // Stage 2 — Contact & Representative
      await registrantPage
        .getByLabel("Official email")
        .fill("office@coastal-clinic.example");
      await registrantPage.getByLabel("Official phone").fill("+1 902 555 0177");
      await registrantPage
        .getByLabel("Representative full name")
        .fill(registrant.fullName);
      await registrantPage.getByLabel(/^Phone/).fill("+1 902 555 0188");
      await registrantPage
        .getByLabel("Representative role")
        .selectOption("leadership");
      await registrantPage.getByRole("button", { name: "Continue" }).click();

      // Stage 3 — Standing & Confirmation
      await registrantPage
        .getByLabel("Unregistered / informal organisation")
        .check();
      await registrantPage.getByLabel("Facility type").selectOption("Clinic");
      await registrantPage
        .getByLabel(
          "I confirm that I am authorised to represent this organisation and that the information provided is accurate.",
        )
        .check();
      await registrantPage
        .getByRole("button", { name: "Review & submit" })
        .click();

      await expect(
        registrantPage.getByRole("heading", {
          name: "Review your registration",
        }),
      ).toBeVisible();
      await registrantPage
        .getByRole("button", { name: "Submit registration" })
        .click();
      await registrantPage
        .getByRole("button", { name: "Confirm submission" })
        .click();
      await expect(
        registrantPage.getByRole("heading", { name: "Registration submitted" }),
      ).toBeVisible();

      // --- Reviewer: requests changes ---
      await signIn(reviewerPage, reviewer.email, reviewer.password);
      await reviewerPage.goto("/admin/registrations");
      await expect(reviewerPage.getByText(organisationName)).toBeVisible();
      await reviewerPage
        .getByRole("listitem")
        .filter({ hasText: organisationName })
        .getByRole("link", { name: "Review" })
        .click();
      await expect(reviewerPage).toHaveURL(/\/admin\/reviews\/?\?application=/);
      await reviewerPage
        .getByRole("button", { name: "Request Changes" })
        .click();
      await reviewerPage
        .getByLabel("Feedback message")
        .fill("Please confirm the official phone number.");
      await reviewerPage
        .getByRole("button", { name: "Send change request" })
        .click();
      await expect(
        reviewerPage.getByText("Changes Requested", { exact: true }).first(),
      ).toBeVisible();

      await registrantPage.goto("/join/organisation");
      await expect(
        registrantPage.getByText("Please confirm the official phone number."),
      ).toBeVisible();
      await registrantPage.getByRole("button", { name: "Back" }).click();
      await registrantPage.getByLabel("Official phone").fill("+1 902 555 0199");
      await registrantPage.getByRole("button", { name: "Continue" }).click();
      await registrantPage
        .getByRole("button", { name: "Review & submit" })
        .click();
      await registrantPage
        .getByRole("button", { name: "Submit registration" })
        .click();
      await registrantPage
        .getByRole("button", { name: "Confirm submission" })
        .click();
      await expect(
        registrantPage.getByRole("heading", { name: "Registration submitted" }),
      ).toBeVisible();

      // --- Reviewer: verifies ---
      await reviewerPage.goto("/admin/registrations");
      await reviewerPage
        .getByRole("listitem")
        .filter({ hasText: organisationName })
        .getByRole("link", { name: "Review" })
        .click();
      await reviewerPage
        .getByRole("button", { name: "Verify", exact: true })
        .click();
      await reviewerPage
        .getByRole("button", { name: "Confirm verification" })
        .click();
      await expect(
        reviewerPage.getByText("Verified", { exact: true }).first(),
      ).toBeVisible();

      // --- Registrant: Organisation Workspace opens, People is accessible ---
      await registrantPage.goto("/workspace/organisation");
      await expect(
        registrantPage.getByRole("heading", { name: organisationName }),
      ).toBeVisible();
      await expect(
        registrantPage.locator('[data-status-badge="Verified"]'),
      ).toBeVisible();
      await registrantPage.getByRole("link", { name: "Open People" }).click();
      await expect(registrantPage).toHaveURL(
        /\/workspace\/organisation\/people\/?\?organization=/,
      );
      await expect(
        registrantPage.getByRole("heading", {
          name: organisationName,
          exact: true,
        }),
      ).toBeVisible();

      await signIn(memberPage, member.email, member.password);
      await memberPage.goto("/join/member");
      await memberPage
        .getByRole("heading", { name: "Your details" })
        .waitFor({ timeout: 15000 });
      await memberPage.getByLabel("Full name").fill("Local Browser Org Member");
      await memberPage.getByLabel("Mobile number").fill("+1 416 555 0199");
      await memberPage.getByLabel("Country").fill("Canada");
      await memberPage
        .getByLabel(/State \/ Province \/ Region/)
        .fill("Ontario");
      await memberPage.getByLabel("City").fill("Toronto");
      await memberPage.getByRole("button", { name: "Continue" }).click();

      await memberPage.getByRole("button", { name: /^Organisation/ }).click();
      await memberPage
        .getByLabel("Search", { exact: true })
        .fill("Local Browser Meridian Health");
      await expect(memberPage.getByText(organisationName)).toBeVisible();
      await memberPage.getByRole("button", { name: "Select" }).click();

      await expect(
        memberPage.getByRole("heading", { name: "Confirm your affiliation" }),
      ).toBeVisible();
      await memberPage.getByRole("radio", { name: "Community member" }).check();
      await memberPage
        .getByRole("button", { name: "Submit affiliation" })
        .click();
      await expect(
        memberPage.getByRole("heading", { name: "Affiliation submitted" }),
      ).toBeVisible();

      // --- Registrant (the organisation's own manager): confirms ---
      await registrantPage.reload();
      await expect(
        registrantPage.getByText("Local Browser Org Member"),
      ).toBeVisible();
      await registrantPage
        .getByRole("button", { name: "Confirm member" })
        .click();
      await expect(
        registrantPage.locator('[data-status-badge="Active"]'),
      ).toBeVisible();

      // --- Member: workspace reflects the active affiliation ---
      await memberPage.goto("/workspace/member");
      await expect(
        memberPage.getByRole("heading", {
          name: organisationName,
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        memberPage.locator('[data-status-badge="Active"]'),
      ).toBeVisible();
    } finally {
      await registrantContext.close();
      await reviewerContext.close();
      await memberContext.close();
    }
  });
});
