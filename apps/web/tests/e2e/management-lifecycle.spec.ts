import { expect, test, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../src/lib/supabase/database.types";

const password = "LocalManagementLifecycle!2048Aa";

async function signIn(page: Page, email: string) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/login");
  await page.getByLabel("Email").first().fill(email);
  await page.getByLabel("Password").first().fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

test.describe("Management administration lifecycle", () => {
  test.skip(
    process.env.RUN_SUPABASE_E2E !== "true",
    "Runs only against the explicit local Supabase environment.",
  );

  let admin: SupabaseClient<Database>;
  const userIds: Record<string, string> = {};
  const orgName = "G1 Lifecycle Org";
  const sangamName = "G1 Lifecycle Sangam";
  let orgId = "";
  let sangamId = "";

  const users = {
    owner: {
      email: "g1-lifecycle-owner@tamil-ulagam.test",
      fullName: "G1 Lifecycle Owner",
    },
    recipientA: {
      email: "g1-lifecycle-recipient-a@tamil-ulagam.test",
      fullName: "G1 Lifecycle Recipient A",
    },
    recipientB: {
      email: "g1-lifecycle-recipient-b@tamil-ulagam.test",
      fullName: "G1 Lifecycle Recipient B",
    },
  } as const;

  test.beforeAll(async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey)
      throw new Error("Local Supabase not configured.");
    admin = createClient<Database>(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    for (const [key, fixture] of Object.entries(users)) {
      const created = await admin.auth.admin.createUser({
        email: fixture.email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fixture.fullName },
      });
      if (created.error) {
        const existing = await admin.auth.admin.listUsers();
        const found = existing.data.users.find(
          (u) => u.email === fixture.email,
        );
        if (!found) throw new Error(`Create ${key}: ${created.error.message}`);
        userIds[key] = found.id;
        continue;
      }
      userIds[key] = created.data.user.id;
    }

    async function createOrg(name: string, isSangam: boolean): Promise<string> {
      const existing = await admin
        .from("organizations")
        .select("id")
        .eq("name", name)
        .maybeSingle();
      if (existing.data) return existing.data.id;
      const org = await admin
        .from("organizations")
        .insert({
          category: "tamil_community",
          name,
          country: "Canada",
          region: "Ontario",
          city: "Toronto",
          official_email: `office-${crypto.randomUUID().slice(0, 8)}@tamil-ulagam.test`,
          official_phone: "+1 416 555 0111",
          description: "G1 lifecycle fixture.",
          registration_status: "informal",
        })
        .select("id")
        .single();
      if (org.error || !org.data)
        throw new Error(`Create org ${name}: ${org.error?.message}`);
      if (isSangam) {
        const details = await admin
          .from("organization_tamil_community_details")
          .insert({ organization_id: org.data.id, subtype: "Tamil Sangam" });
        if (details.error)
          throw new Error(`Sangam details: ${details.error.message}`);
      }
      const application = await admin.from("organization_applications").insert({
        organization_id: org.data.id,
        submitted_by: userIds.owner!,
        status: "verified",
        representative_full_name: "G1 Lifecycle Rep",
        representative_email: users.owner.email,
        representative_phone: "+1 416 555 0111",
        authorization_declaration: true,
        accuracy_declaration: true,
        submitted_at: new Date().toISOString(),
      });
      if (application.error)
        throw new Error(`Application: ${application.error.message}`);
      const grant = await admin
        .from("organization_managers")
        .select("id")
        .eq("organization_id", org.data.id)
        .eq("user_id", userIds.owner!)
        .maybeSingle();
      if (!grant.data) {
        const insert = await admin.from("organization_managers").insert({
          organization_id: org.data.id,
          user_id: userIds.owner!,
          role: "owner",
          granted_by: userIds.owner!,
        });
        if (insert.error)
          throw new Error(`Manager grant: ${insert.error.message}`);
      }
      return org.data.id;
    }

    orgId = await createOrg(orgName, false);
    sangamId = await createOrg(sangamName, true);
  });

  // ==================== FLOW A: Invite + Accept ====================
  test("Flow A: owner invites, recipient accepts, appears in Managers and WorkspaceSwitcher, not as a Member", async ({
    browser,
  }) => {
    const ownerContext = await browser.newContext();
    const ownerPage = await ownerContext.newPage();
    await signIn(ownerPage, users.owner.email);
    await ownerPage.goto(
      `/workspace/organisation/people?organization=${orgId}`,
    );
    await expect(
      ownerPage.getByRole("heading", { name: orgName }),
    ).toBeVisible();
    await ownerPage.getByRole("tab", { name: "Managers" }).click();
    await expect(
      ownerPage.getByRole("heading", { name: "Invite a manager" }),
    ).not.toBeVisible();

    await ownerPage.getByRole("button", { name: "Invite manager" }).click();
    await expect(
      ownerPage.getByRole("heading", { name: "Invite a manager" }),
    ).toBeVisible();
    await ownerPage.getByLabel("Email").first().fill(users.recipientA.email);
    await ownerPage.getByLabel("Role").selectOption("admin");
    await ownerPage.getByRole("button", { name: "Send invitation" }).click();
    await expect(
      ownerPage.getByRole("heading", { name: "Invite a manager" }),
    ).not.toBeVisible();
    await expect(
      ownerPage.getByText(users.recipientA.email).first(),
    ).toBeVisible();

    const recipientContext = await browser.newContext();
    const recipientPage = await recipientContext.newPage();
    await signIn(recipientPage, users.recipientA.email);
    await recipientPage.goto("/workspace/member");
    await expect(
      recipientPage.getByText("Management invitation"),
    ).toBeVisible();
    await recipientPage
      .getByRole("link", { name: /Review invitation/ })
      .click();
    await recipientPage.waitForURL(/\/workspace\/invitations/);
    await expect(recipientPage.getByText(orgName)).toBeVisible();
    await recipientPage.getByRole("button", { name: "Accept" }).click();
    await expect(
      recipientPage.getByText("No pending invitations"),
    ).toBeVisible();

    // Now appears in the WorkspaceSwitcher.
    await recipientPage
      .getByRole("button", { name: "Switch workspace" })
      .click();
    await expect(
      recipientPage.getByRole("heading", { name: "Your workspaces" }),
    ).toBeVisible();
    await expect(
      recipientPage.getByRole("link", { name: orgName }),
    ).toBeVisible();
    await recipientPage.keyboard.press("Escape");

    // Opens the Organisation Workspace correctly.
    await recipientPage.goto(`/workspace/organisation?organization=${orgId}`);
    await expect(
      recipientPage.getByRole("heading", { name: orgName }),
    ).toBeVisible();

    // Appears in the Managers list.
    await recipientPage.goto(
      `/workspace/organisation/people?organization=${orgId}`,
    );
    await recipientPage.getByRole("tab", { name: "Managers" }).click();
    await expect(
      recipientPage.getByText(users.recipientA.fullName).first(),
    ).toBeVisible();

    const { data: membershipRows } = await admin
      .from("organization_memberships")
      .select("id")
      .eq("organization_id", orgId)
      .eq("user_id", userIds.recipientA!);
    expect(membershipRows ?? []).toHaveLength(0);

    await ownerContext.close();
    await recipientContext.close();
  });

  // ==================== FLOW B: Role change ====================
  test("Flow B: owner changes recipient's role; history records it", async ({
    page,
  }) => {
    await signIn(page, users.owner.email);
    await page.goto(`/workspace/organisation/people?organization=${orgId}`);
    await page.getByRole("tab", { name: "Managers" }).click();
    await expect(
      page.getByText(users.recipientA.fullName).first(),
    ).toBeVisible();

    await page.getByRole("button", { name: "Make Representative" }).click();
    await expect(
      page.getByRole("heading", { name: "Change role to Representative?" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Confirm role change" }).click();
    await expect(
      page.getByRole("heading", { name: "Change role to Representative?" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Make Admin" }),
    ).toBeVisible();

    await page.getByRole("button", { name: /View management history/ }).click();
    await expect(page.getByText("Role changed")).toBeVisible();
  });

  // ==================== FLOW C: Remove ====================
  test("Flow C: owner removes the manager; their workspace access disappears", async ({
    browser,
  }) => {
    const ownerContext = await browser.newContext();
    const ownerPage = await ownerContext.newPage();
    await signIn(ownerPage, users.owner.email);
    await ownerPage.goto(
      `/workspace/organisation/people?organization=${orgId}`,
    );
    await ownerPage.getByRole("tab", { name: "Managers" }).click();
    await ownerPage.getByRole("button", { name: "Remove" }).click();
    await expect(
      ownerPage.getByRole("heading", { name: "Remove this manager?" }),
    ).toBeVisible();
    await ownerPage.getByRole("button", { name: "Remove manager" }).click();
    await expect(
      ownerPage.getByText(users.recipientA.fullName).first(),
    ).not.toBeVisible();

    const recipientContext = await browser.newContext();
    const recipientPage = await recipientContext.newPage();
    await signIn(recipientPage, users.recipientA.email);
    await recipientPage
      .getByRole("button", { name: "Switch workspace" })
      .click();
    await expect(
      recipientPage.getByRole("heading", { name: "Your workspaces" }),
    ).toBeVisible();
    await expect(recipientPage.getByText(orgName)).not.toBeVisible();

    await ownerContext.close();
    await recipientContext.close();
  });

  // ==================== FLOW D: Self-leave ====================
  test("Flow D: a representative leaves management themselves; workspace disappears", async ({
    page,
  }) => {
    await signIn(page, users.owner.email);
    await page.goto(`/workspace/organisation/people?organization=${orgId}`);
    await page.getByRole("tab", { name: "Managers" }).click();
    await page.getByRole("button", { name: "Invite manager" }).click();
    await page.getByLabel("Email").first().fill(users.recipientB.email);
    await page.getByLabel("Role").selectOption("representative");
    await page.getByRole("button", { name: "Send invitation" }).click();
    await expect(page.getByText(users.recipientB.email).first()).toBeVisible();

    const { data: invitation } = await admin
      .from("organization_manager_invitations")
      .select("id")
      .eq("organization_id", orgId)
      .eq("email", users.recipientB.email)
      .eq("status", "pending")
      .single();

    const repClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    await repClient.auth.signInWithPassword({
      email: users.recipientB.email,
      password,
    });
    const accept = await repClient.rpc(
      "accept_organization_manager_invitation",
      {
        target_invitation_id: invitation!.id,
      },
    );
    expect(accept.error).toBeNull();

    const repPage = page;
    await repPage.goto("/login");
    await signIn(repPage, users.recipientB.email);
    await repPage.goto(`/workspace/organisation/people?organization=${orgId}`);
    await repPage.getByRole("tab", { name: "Managers" }).click();
    await repPage.getByRole("button", { name: "Leave management" }).click();
    await expect(
      repPage.getByRole("heading", { name: "Leave management?" }),
    ).toBeVisible();
    await repPage
      .getByRole("button", { name: "Leave management" })
      .last()
      .click();

    await repPage.reload();
    await repPage.getByRole("button", { name: "Switch workspace" }).click();
    await expect(
      repPage.getByRole("heading", { name: "Your workspaces" }),
    ).toBeVisible();
    await expect(repPage.getByText(orgName)).not.toBeVisible();
  });

  // ==================== FLOW E: Ownership transfer ====================
  test("Flow E: owner transfers ownership; exactly one owner remains", async ({
    page,
  }) => {
    await signIn(page, users.owner.email);
    await page.goto(`/workspace/organisation/people?organization=${orgId}`);
    await page.getByRole("tab", { name: "Managers" }).click();
    await page.getByRole("button", { name: "Invite manager" }).click();
    await page.getByLabel("Email").first().fill(users.recipientA.email);
    await page.getByLabel("Role").selectOption("admin");
    await page.getByRole("button", { name: "Send invitation" }).click();
    await expect(page.getByText(users.recipientA.email).first()).toBeVisible();

    const { data: invitation } = await admin
      .from("organization_manager_invitations")
      .select("id")
      .eq("organization_id", orgId)
      .eq("email", users.recipientA.email)
      .eq("status", "pending")
      .single();
    const acceptClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    await acceptClient.auth.signInWithPassword({
      email: users.recipientA.email,
      password,
    });
    await acceptClient.rpc("accept_organization_manager_invitation", {
      target_invitation_id: invitation!.id,
    });

    await page.goto(`/workspace/organisation/people?organization=${orgId}`);
    await page.getByRole("tab", { name: "Managers" }).click();
    await page.getByRole("button", { name: "Transfer ownership" }).click();
    await expect(
      page.getByRole("heading", { name: "Transfer ownership" }),
    ).toBeVisible();
    await page.getByLabel(users.recipientA.fullName).check();
    await page.getByLabel(/Become an Admin/).check();
    await page
      .getByLabel(/I understand this immediately transfers ownership/)
      .check();
    await page
      .getByRole("button", { name: "Transfer ownership" })
      .last()
      .click();
    await expect(
      page.getByRole("heading", { name: "Transfer ownership" }),
    ).not.toBeVisible();

    const { data: managers } = await admin
      .from("organization_managers")
      .select("user_id, role")
      .eq("organization_id", orgId);
    const owners = (managers ?? []).filter((row) => row.role === "owner");
    expect(owners).toHaveLength(1);
    expect(owners[0]?.user_id).toBe(userIds.recipientA);
  });

  // ==================== FLOW F: Sangam parity ====================
  test("Flow F: the identical invite/accept lifecycle works for a Tamil Sangam", async ({
    browser,
  }) => {
    const ownerContext = await browser.newContext();
    const ownerPage = await ownerContext.newPage();
    await signIn(ownerPage, users.owner.email);
    await ownerPage.goto(
      `/workspace/organisation/people?organization=${sangamId}`,
    );
    await expect(
      ownerPage.getByRole("heading", { name: sangamName }),
    ).toBeVisible();
    await ownerPage.getByRole("tab", { name: "Managers" }).click();
    await expect(ownerPage.getByText("Sangam managers")).toBeVisible();

    await ownerPage.getByRole("button", { name: "Invite manager" }).click();
    await ownerPage.getByLabel("Email").first().fill(users.recipientB.email);
    await ownerPage.getByLabel("Role").selectOption("admin");
    await ownerPage.getByRole("button", { name: "Send invitation" }).click();
    await expect(
      ownerPage.getByText(users.recipientB.email).first(),
    ).toBeVisible();

    const recipientContext = await browser.newContext();
    const recipientPage = await recipientContext.newPage();
    await signIn(recipientPage, users.recipientB.email);
    await recipientPage.goto("/workspace/invitations");
    await expect(recipientPage.getByText(sangamName)).toBeVisible();
    await recipientPage.getByRole("button", { name: "Accept" }).click();
    await expect(
      recipientPage.getByText("No pending invitations"),
    ).toBeVisible();

    await recipientPage.goto(`/workspace/sangam?sangam=${sangamId}`);
    await expect(
      recipientPage.getByRole("heading", { name: sangamName }),
    ).toBeVisible();

    await ownerContext.close();
    await recipientContext.close();
  });

  test.afterAll(async () => {
    for (const id of [orgId, sangamId]) {
      await admin
        .from("organization_managers")
        .delete()
        .eq("organization_id", id);
      await admin
        .from("organization_manager_invitations")
        .delete()
        .eq("organization_id", id);
      await admin
        .from("organization_memberships")
        .delete()
        .eq("organization_id", id);
      await admin
        .from("organization_tamil_community_details")
        .delete()
        .eq("organization_id", id);
    }
    const { data } = await admin.auth.admin.listUsers();
    for (const fixture of Object.values(users)) {
      const found = data.users.find((u) => u.email === fixture.email);
      if (found) await admin.auth.admin.deleteUser(found.id);
    }
  });
});
