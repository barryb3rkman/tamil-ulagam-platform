import { expect, test, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../src/lib/supabase/database.types";

/**
 * The real, end-to-end Member Registration + affiliation approval
 * lifecycle (Phase C2), driven through the actual UI against a real
 * local Supabase instance — request → manager sees it → approves →
 * member sees Approved → member leaves → Workspace reflects the ended
 * affiliation. No part of the core lifecycle is mocked; every session
 * used below is a genuine signed-in browser session, not a service-role
 * shortcut.
 *
 * Member and manager each get their own isolated browser context (own
 * cookies/session) rather than sharing one page and signing in/out in
 * sequence — this is the robust, recommended Playwright pattern for a
 * multi-actor flow and avoids the test depending on any particular
 * "sign out" UI affordance.
 */

const member = {
  email: "local-browser-member@tamil-ulagam.test",
  password: "LocalBrowserMember!2048Aa",
} as const;

const manager = {
  email: "local-browser-manager@tamil-ulagam.test",
  password: "LocalBrowserManager!2048Aa",
} as const;

const organisationName = "Local Browser Verified Sangam";

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  // Wait for the post-login redirect rather than the button's transient
  // "Signed in" label — that label and the redirect can race, so
  // asserting on it directly is flaky. The exact destination depends on
  // account state (the manager fixture below is also an application
  // submitter, so it lands on /dashboard, which routes it on to the
  // Organisation Workspace; a plain member with no application lands on
  // /dashboard too, routed on to the Member workspace) — only that it
  // actually left /login matters here.
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

test.describe("local Supabase real Member Registration lifecycle", () => {
  test.skip(
    process.env.RUN_SUPABASE_E2E !== "true",
    "Runs only against the explicit local Supabase environment.",
  );

  let admin: SupabaseClient<Database>;
  let organisationId: string;

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
        name: organisationName,
        category: "tamil_community",
        country: "Canada",
        region: "Ontario",
        city: "Toronto",
        official_email: "browser-org@tamil-ulagam.test",
        official_phone: "+1 416 555 0177",
        description: "A verified organisation for the C2 browser test.",
        registration_status: "informal",
      })
      .select("id")
      .single();
    if (organisation.error || !organisation.data) {
      throw new Error(
        `Create organisation: ${organisation.error?.message ?? "no data"}`,
      );
    }
    organisationId = organisation.data.id;

    const application = await admin.from("organization_applications").insert({
      organization_id: organisationId,
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
      organization_id: organisationId,
      user_id: managerUser.user.id,
      role: "owner",
    });
    if (grant.error) {
      throw new Error(`Grant manager: ${grant.error.message}`);
    }
  });

  test("request -> manager approves -> member sees Approved -> member leaves", async ({
    browser,
  }) => {
    test.setTimeout(120_000);

    const memberContext = await browser.newContext();
    const memberPage = await memberContext.newPage();
    const managerContext = await browser.newContext();
    const managerPage = await managerContext.newPage();

    try {
      // --- Member: search, select, confirm, request ---
      await signIn(memberPage, member.email, member.password);
      await memberPage.goto("/join/member");
      await memberPage
        .getByLabel(/Search organisations and Tamil Sangams/)
        .fill("Local Browser Verified");
      await expect(memberPage.getByText(organisationName)).toBeVisible();
      await memberPage
        .getByRole("button", { name: "Choose organisation" })
        .first()
        .click();
      await expect(
        memberPage.getByText(`You’re requesting to join ${organisationName}.`),
      ).toBeVisible();
      await memberPage
        .getByRole("button", { name: "Request membership" })
        .click();
      await expect(memberPage.getByText("Request sent")).toBeVisible();
      await expect(memberPage.getByText("Pending review")).toBeVisible();

      await memberPage
        .getByRole("link", { name: "Go to Member Workspace" })
        .click();
      await expect(memberPage).toHaveURL(/\/workspace\/member\/?$/);
      // exact: true — an approved affiliation's still-closed "Leave
      // organisation" confirmation dialog also carries the
      // organisation's name (in "Leave <name>?"), so a substring match
      // here would be ambiguous even though the dialog isn't open yet.
      await expect(
        memberPage.getByRole("heading", {
          name: organisationName,
          exact: true,
        }),
      ).toBeVisible();
      await expect(memberPage.getByText("Pending review")).toBeVisible();

      // --- Manager: sees the request, approves it ---
      await signIn(managerPage, manager.email, manager.password);
      await managerPage.goto(
        `/workspace/organisation/people?organization=${organisationId}`,
      );
      await expect(
        managerPage.getByRole("heading", {
          name: organisationName,
          exact: true,
        }),
      ).toBeVisible();
      await expect(managerPage.getByText("Local Browser Member")).toBeVisible();
      await managerPage.getByRole("button", { name: "Approve" }).click();
      await expect(managerPage.getByText("Approved")).toBeVisible();

      // --- Member: sees the approved affiliation, then leaves ---
      await memberPage.goto("/workspace/member");
      await expect(
        memberPage.getByRole("heading", {
          name: organisationName,
          exact: true,
        }),
      ).toBeVisible();
      await expect(memberPage.getByText("Approved")).toBeVisible();

      await memberPage
        .getByRole("button", { name: "Leave organisation" })
        .click();
      await memberPage.getByRole("button", { name: "Confirm leave" }).click();
      await expect(
        memberPage.getByText("Ended", { exact: true }),
      ).toBeVisible();
    } finally {
      await memberContext.close();
      await managerContext.close();
    }
  });
});
