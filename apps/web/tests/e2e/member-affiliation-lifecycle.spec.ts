import { expect, test, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../src/lib/supabase/database.types";

/**
 * Phase H4 — Member Registration V2 + affiliation verification. Persona
 * A (H4 brief section 42): a verified Tamil Sangam already exists, a
 * member selects it, submits an affiliation claim, the Sangam's own
 * manager confirms them, and the Member Workspace reflects the active
 * affiliation — driven through the actual five-stage UI (profile ->
 * affiliation type -> directory -> confirm -> success), not the old
 * single-directory-select flow. No part of the core lifecycle is mocked.
 */

const member = {
  email: "local-browser-member@tamil-ulagam.test",
  password: "LocalBrowserMember!2048Aa",
} as const;

const manager = {
  email: "local-browser-manager@tamil-ulagam.test",
  password: "LocalBrowserManager!2048Aa",
} as const;

const sangamName = "Local Browser Verified Sangam";

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

test.describe("local Supabase real Member Registration lifecycle", () => {
  test.skip(
    process.env.RUN_SUPABASE_E2E !== "true",
    "Runs only against the explicit local Supabase environment.",
  );

  let admin: SupabaseClient<Database>;
  let sangamId: string;

  test.beforeAll(async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      throw new Error("Local Supabase setup is not configured.");
    }
    admin = createClient<Database>(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: memberError } = await admin.auth.admin.createUser({
      email: member.email,
      password: member.password,
      email_confirm: true,
      user_metadata: { full_name: "Local Browser Member" },
    });
    if (memberError) throw new Error(`Create member: ${memberError.message}`);

    const { data: managerUser, error: managerError } =
      await admin.auth.admin.createUser({
        email: manager.email,
        password: manager.password,
        email_confirm: true,
        user_metadata: { full_name: "Local Browser Manager" },
      });
    if (managerError) {
      throw new Error(`Create manager: ${managerError.message}`);
    }

    const organisation = await admin
      .from("organizations")
      .insert({
        name: sangamName,
        category: "tamil_community",
        country: "Canada",
        region: "Ontario",
        city: "Toronto",
        registration_status: "informal",
      })
      .select("id")
      .single();
    if (organisation.error || !organisation.data) {
      throw new Error(
        `Create organisation: ${organisation.error?.message ?? "no data"}`,
      );
    }
    sangamId = organisation.data.id;

    const details = await admin
      .from("organization_tamil_community_details")
      .insert({ organization_id: sangamId, subtype: "Tamil Sangam" });
    if (details.error) {
      throw new Error(`Create Sangam details: ${details.error.message}`);
    }

    const application = await admin.from("organization_applications").insert({
      organization_id: sangamId,
      submitted_by: managerUser.user.id,
      status: "verified",
      representative_full_name: "Local Browser Manager",
      representative_email: manager.email,
      representative_phone: "+1 416 555 0177",
      authorization_declaration: true,
      accuracy_declaration: true,
      submitted_at: new Date().toISOString(),
    });
    if (application.error) {
      throw new Error(`Create application: ${application.error.message}`);
    }

    const grant = await admin.from("organization_managers").insert({
      organization_id: sangamId,
      user_id: managerUser.user.id,
      role: "owner",
    });
    if (grant.error) {
      throw new Error(`Grant manager: ${grant.error.message}`);
    }
  });

  test("Persona A — Sangam member: submit an affiliation claim, manager confirms, Member Workspace becomes Active", async ({
    browser,
  }) => {
    test.setTimeout(120_000);

    const memberContext = await browser.newContext();
    const memberPage = await memberContext.newPage();
    const managerContext = await browser.newContext();
    const managerPage = await managerContext.newPage();

    try {
      // --- Member: profile -> type -> directory -> confirm -> submit ---
      await signIn(memberPage, member.email, member.password);
      await memberPage.goto("/join/member");
      await memberPage.getByText("Your details").waitFor({ timeout: 15000 });
      // Account email is never re-asked (H4 brief section 4).
      await expect(memberPage.getByLabel(/email/i)).toHaveCount(0);

      await memberPage.getByLabel("Full name").fill("Local Browser Member");
      await memberPage.getByLabel("Mobile number").fill("+1 416 555 0100");
      await memberPage.getByLabel("Country").fill("Canada");
      await memberPage
        .getByLabel(/State \/ Province \/ Region/)
        .fill("Ontario");
      await memberPage.getByLabel("City").fill("Toronto");
      await memberPage.getByRole("button", { name: "Continue" }).click();

      await expect(
        memberPage.getByText("Where are you already a member?"),
      ).toBeVisible();
      await memberPage.getByRole("button", { name: /^Tamil Sangam/ }).click();

      await expect(
        memberPage.getByText("Find your Tamil Sangam"),
      ).toBeVisible();
      await memberPage
        .getByLabel("Search", { exact: true })
        .fill("Local Browser Verified");
      await expect(memberPage.getByText(sangamName)).toBeVisible();
      await memberPage.getByRole("button", { name: "Select" }).click();

      await expect(
        memberPage.getByText("Confirm your affiliation"),
      ).toBeVisible();
      // No category question for a Tamil Sangam (H4 brief section 10).
      await expect(memberPage.getByText("Your involvement")).toHaveCount(0);
      await memberPage
        .getByRole("button", { name: "Submit affiliation" })
        .click();

      await expect(
        memberPage.getByRole("heading", { name: "Affiliation submitted" }),
      ).toBeVisible();
      await expect(memberPage.getByText("Pending confirmation")).toBeVisible();

      await memberPage
        .getByRole("link", { name: "Open Member Workspace" })
        .click();
      await expect(memberPage).toHaveURL(/\/workspace\/member\/?$/);
      await expect(
        memberPage.getByRole("heading", { name: sangamName, exact: true }),
      ).toBeVisible();
      await expect(memberPage.getByText("Pending confirmation")).toBeVisible();

      // --- Manager: sees the pending affiliation confirmation, confirms it ---
      await signIn(managerPage, manager.email, manager.password);
      await managerPage.goto(
        `/workspace/organisation/people?organization=${sangamId}`,
      );
      await expect(
        managerPage.getByRole("heading", { name: sangamName, exact: true }),
      ).toBeVisible();
      await expect(
        managerPage.getByText("Pending affiliation confirmations"),
      ).toBeVisible();
      await expect(managerPage.getByText("Local Browser Member")).toBeVisible();
      await expect(managerPage.getByText(member.email)).toBeVisible();
      await managerPage.getByRole("button", { name: "Confirm member" }).click();
      await expect(managerPage.getByText("Active")).toBeVisible();

      // --- Member: Member Workspace reflects the active affiliation ---
      await memberPage.goto("/workspace/member");
      await expect(
        memberPage.getByRole("heading", { name: sangamName, exact: true }),
      ).toBeVisible();
      await expect(memberPage.getByText("Active")).toBeVisible();
    } finally {
      await memberContext.close();
      await managerContext.close();
    }
  });
});
