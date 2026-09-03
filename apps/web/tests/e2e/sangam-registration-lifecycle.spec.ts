import { expect, test, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../src/lib/supabase/database.types";

const registrant = {
  fullName: "Kavi Selvam",
  email: "local-browser-sangam-registrant@tamil-ulagam.test",
  password: "LocalBrowserSangam!2048Aa",
} as const;

const reviewer = {
  fullName: "Local Sangam Review Officer",
  email: "local-browser-sangam-reviewer@tamil-ulagam.test",
  password: "LocalSangamReviewer!2048Aa",
} as const;

const member = {
  email: "local-browser-sangam-member@tamil-ulagam.test",
  password: "LocalBrowserSangamMember!2048Aa",
} as const;

const sangamName = "Local Browser Coastal Tamil Sangam";

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

test.describe("local Supabase real Tamil Sangam registration lifecycle", () => {
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
      user_metadata: { full_name: "Local Browser Sangam Member" },
    });
    if (createdMember.error) {
      throw new Error(`Create member: ${createdMember.error.message}`);
    }
  });

  test("register -> submit -> admin verifies -> discoverable -> member requests -> Sangam manager approves", async ({
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
      // --- Registrant: sign up, then the real /join/sangam journey ---
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

      await registrantPage.goto("/join/sangam");
      // A logged-out-only heading must not still be showing.
      await expect(
        registrantPage.getByRole("link", { name: /Create account & begin/ }),
      ).toHaveCount(0);

      // Stage 1 — About your Sangam (H3: name, year, member count, location)
      await registrantPage.getByLabel(/Sangam name/).fill(sangamName);
      await registrantPage.getByLabel(/Year of commencement/).fill("2005");
      await registrantPage
        .getByLabel(/Approximate number of members/)
        .fill("180");
      await registrantPage.getByLabel(/Country/).fill("Canada");
      await registrantPage
        .getByLabel(/State \/ Province \/ Region/)
        .fill("Nova Scotia");
      await registrantPage.getByLabel(/City/).fill("Halifax");
      await registrantPage.waitForTimeout(1300);
      await expect(registrantPage.getByText("Saved")).toBeVisible();
      await registrantPage.reload();
      await expect(registrantPage.getByLabel(/Sangam name/)).toHaveValue(
        sangamName,
      );
      await expect(
        registrantPage.getByLabel(/Approximate number of members/),
      ).toHaveValue("180");
      await registrantPage.getByRole("button", { name: "Continue" }).click();

      await expect(
        registrantPage.getByText("Is this Tamil Sangam formally registered?"),
      ).toBeVisible();
      await registrantPage.getByRole("radio", { name: "No" }).first().check();
      await registrantPage.getByRole("button", { name: "Continue" }).click();

      await expect(
        registrantPage.getByText("Single Point of Contact (SPOC)"),
      ).toBeVisible();
      const [spocName, presidentName] = await registrantPage
        .getByLabel(/^Full name/)
        .all();
      const [spocEmail, presidentEmail] = await registrantPage
        .getByLabel(/^Email/)
        .all();
      const [spocPhone, presidentPhone] = await registrantPage
        .getByLabel(/^Phone/)
        .all();
      await spocName!.fill(registrant.fullName);
      await spocEmail!.fill(registrant.email);
      await spocPhone!.fill("+1 902 555 0144");
      await presidentName!.fill("Coastal Sangam President");
      await presidentEmail!.fill("president@coastal-sangam.example");
      await presidentPhone!.fill("+1 902 555 0155");
      await registrantPage
        .getByLabel(
          "I confirm that I am authorised to represent this Tamil Sangam and that the information provided is accurate.",
        )
        .check();
      await registrantPage
        .getByRole("button", { name: "Review & submit" })
        .click();

      // Review & submit
      await expect(
        registrantPage.getByRole("heading", {
          name: "Review your Sangam's registration",
        }),
      ).toBeVisible();
      // Sangam-aware category label, not the generic organisation label.
      await expect(
        registrantPage.getByText("Tamil Sangam", { exact: true }).first(),
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
      await expect(registrantPage.getByText(sangamName)).toBeVisible();

      // --- Reviewer: finds it, verifies it ---
      await signIn(reviewerPage, reviewer.email, reviewer.password);
      await reviewerPage.goto("/admin/registrations");
      await expect(reviewerPage.getByText(sangamName)).toBeVisible();
      await reviewerPage
        .getByRole("listitem")
        .filter({ hasText: sangamName })
        .getByRole("link", { name: "Review" })
        .click();
      await expect(reviewerPage).toHaveURL(/\/admin\/reviews\/?\?application=/);
      await expect(
        reviewerPage.getByText("Tamil Sangam", { exact: true }).first(),
      ).toBeVisible();
      await reviewerPage.getByRole("button", { name: "Verify" }).click();
      await reviewerPage
        .getByRole("button", { name: "Confirm verification" })
        .click();
      await expect(
        reviewerPage.getByText("Verified", { exact: true }).first(),
      ).toBeVisible();

      await signIn(memberPage, member.email, member.password);
      await memberPage.goto("/join/member");
      await memberPage.getByText("Your details").waitFor({ timeout: 15000 });
      await memberPage
        .getByLabel("Full name")
        .fill("Local Browser Sangam Member");
      await memberPage.getByLabel("Mobile number").fill("+1 902 555 0199");
      await memberPage.getByLabel("Country").fill("Canada");
      await memberPage
        .getByLabel(/State \/ Province \/ Region/)
        .fill("Nova Scotia");
      await memberPage.getByLabel("City").fill("Halifax");
      await memberPage.getByRole("button", { name: "Continue" }).click();

      await memberPage.getByRole("button", { name: /^Tamil Sangam/ }).click();
      await memberPage
        .getByLabel("Search", { exact: true })
        .fill("Local Browser Coastal");
      await expect(memberPage.getByText(sangamName)).toBeVisible();
      await memberPage.getByRole("button", { name: "Select" }).click();

      await expect(
        memberPage.getByText("Confirm your affiliation"),
      ).toBeVisible();
      await expect(
        memberPage.getByText("Tamil Sangam", { exact: true }).first(),
      ).toBeVisible();
      await memberPage
        .getByRole("button", { name: "Submit affiliation" })
        .click();
      await expect(
        memberPage.getByRole("heading", { name: "Affiliation submitted" }),
      ).toBeVisible();

      await registrantPage.goto("/workspace/sangam");
      await expect(
        registrantPage.getByRole("heading", { name: sangamName }),
      ).toBeVisible();
      await registrantPage.getByRole("link", { name: "Open People" }).click();
      await expect(registrantPage).toHaveURL(
        /\/workspace\/organisation\/people\/?\?organization=/,
      );
      await expect(
        registrantPage.getByRole("heading", { name: sangamName, exact: true }),
      ).toBeVisible();
      await expect(
        registrantPage.getByText("Local Browser Sangam Member"),
      ).toBeVisible();
      await registrantPage
        .getByRole("button", { name: "Confirm member" })
        .click();
      await expect(registrantPage.getByText("Active")).toBeVisible();

      // --- Member: workspace reflects the active affiliation ---
      await memberPage.goto("/workspace/member");
      await expect(
        memberPage.getByRole("heading", { name: sangamName, exact: true }),
      ).toBeVisible();
      await expect(memberPage.getByText("Active")).toBeVisible();
    } finally {
      await registrantContext.close();
      await reviewerContext.close();
      await memberContext.close();
    }
  });
});
