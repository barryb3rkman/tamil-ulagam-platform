import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../src/lib/supabase/database.types";

const password = "LocalBrowserA11y!2048Aa";
const user = {
  email: "local-browser-a11y-manager@tamil-ulagam.test",
  fullName: "Local A11y Manager",
};
const orgName = "Local Browser A11y Org";
const sangamName = "Local Browser A11y Sangam";

const freshRegistrant = {
  email: "local-browser-a11y-registrant@tamil-ulagam.test",
  fullName: "Local A11y Registrant",
};

const memberFlowPersona = {
  email: "local-browser-a11y-member@tamil-ulagam.test",
  fullName: "Local A11y Member",
};

const pendingAffiliationMember = {
  email: "local-browser-a11y-pending-member@tamil-ulagam.test",
  fullName: "Local A11y Pending Member",
};

async function signInAs(page: Page, credentials: { readonly email: string }) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/login");
  await page.getByLabel("Email").fill(credentials.email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

async function signIn(page: Page) {
  await signInAs(page, user);
}

async function completeMemberProfileStage(
  page: Page,
  persona: { readonly fullName: string },
) {
  await page.goto("/join/member");
  await page
    .getByRole("heading", { name: "Your details" })
    .waitFor({ timeout: 15000 });
  await page.getByLabel("Full name").fill(persona.fullName);
  await page.getByLabel("Mobile number").fill("+1 416 555 0177");
  await page.getByLabel("Country").fill("Canada");
  await page.getByLabel(/State \/ Province \/ Region/).fill("Ontario");
  await page.getByLabel("City").fill("Toronto");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(
    page.getByRole("heading", { name: "Where are you already a member?" }),
  ).toBeVisible();
}

interface AxeViolation {
  readonly id: string;
  readonly impact: string | null | undefined;
  readonly help: string;
  readonly helpUrl: string;
  readonly nodes: readonly {
    readonly html: string;
    readonly target: readonly string[];
    readonly any: readonly { readonly data?: { readonly fgColor?: string } }[];
  }[];
}

async function checkAccessibility(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  const violations = results.violations as AxeViolation[];

  const serious = violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  const other = violations.filter(
    (v) => v.impact !== "serious" && v.impact !== "critical",
  );

  if (other.length > 0) {
    console.log(
      `[axe:${label}] ${other.length} moderate/minor violation(s) — reviewed, not auto-failed:`,
      other.map(
        (v) => `${v.id} (${v.impact}): ${v.help} [${v.nodes.length} node(s)]`,
      ),
    );
  }

  expect(
    serious,
    `[axe:${label}] serious/critical violations:\n${serious
      .map(
        (v) =>
          `  ${v.id} (${v.impact}): ${v.help}\n    ${v.helpUrl}\n    nodes: ${v.nodes
            .map((n) => n.target.join(" "))
            .join(", ")}`,
      )
      .join("\n")}`,
  ).toEqual([]);
}

test.describe("workspace shell accessibility (axe)", () => {
  test.skip(
    process.env.RUN_SUPABASE_E2E !== "true",
    "Runs only against the explicit local Supabase environment.",
  );

  let admin: SupabaseClient<Database>;
  let organisationId: string;
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

    const created = await admin.auth.admin.createUser({
      email: user.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: user.fullName },
    });
    let userId: string;
    if (created.error) {
      const existing = await admin.auth.admin.listUsers();
      const found = existing.data.users.find((u) => u.email === user.email);
      if (!found) throw new Error(`Create user: ${created.error.message}`);
      userId = found.id;
    } else {
      userId = created.data.user.id;
    }

    async function createOrg(name: string, isSangam: boolean): Promise<string> {
      const existing = await admin
        .from("organizations")
        .select("id")
        .eq("name", name)
        .maybeSingle();
      if (existing.data) return existing.data.id;

      const organisation = await admin
        .from("organizations")
        .insert({
          category: "tamil_community",
          name,
          country: "Canada",
          region: "Ontario",
          city: "Toronto",
          official_email: `office-${crypto.randomUUID().slice(0, 8)}@tamil-ulagam.test`,
          official_phone: "+1 416 555 0111",
          description: "A disposable fixture for E1.5 accessibility QA.",
          registration_status: "informal",
        })
        .select("id")
        .single();
      if (organisation.error || !organisation.data) {
        throw new Error(
          `Create organisation ${name}: ${organisation.error?.message}`,
        );
      }
      const organisationId = organisation.data.id;
      if (isSangam) {
        const details = await admin
          .from("organization_tamil_community_details")
          .insert({ organization_id: organisationId, subtype: "Tamil Sangam" });
        if (details.error) {
          throw new Error(`Sangam details ${name}: ${details.error.message}`);
        }
      }
      const application = await admin.from("organization_applications").insert({
        organization_id: organisationId,
        submitted_by: userId,
        status: "verified",
        representative_full_name: "Fixture Representative",
        representative_email: user.email,
        representative_phone: "+1 416 555 0111",
        authorization_declaration: true,
        accuracy_declaration: true,
        submitted_at: new Date().toISOString(),
      });
      if (application.error) {
        throw new Error(`Application ${name}: ${application.error.message}`);
      }
      const grant = await admin.from("organization_managers").insert({
        organization_id: organisationId,
        user_id: userId,
        role: "owner",
      });
      if (grant.error) {
        throw new Error(`Manager grant ${name}: ${grant.error.message}`);
      }
      return organisationId;
    }

    organisationId = await createOrg(orgName, false);
    sangamId = await createOrg(sangamName, true);

    const existingRole = await admin
      .from("user_roles")
      .select("user_id")
      .eq("user_id", userId)
      .eq("role", "reviewer")
      .maybeSingle();
    if (!existingRole.data) {
      const role = await admin
        .from("user_roles")
        .insert({ user_id: userId, role: "reviewer" });
      if (role.error) throw new Error(`Grant reviewer: ${role.error.message}`);
    }

    const createdRegistrant = await admin.auth.admin.createUser({
      email: freshRegistrant.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: freshRegistrant.fullName },
    });
    if (createdRegistrant.error) {
      const existing = await admin.auth.admin.listUsers();
      const found = existing.data.users.find(
        (u) => u.email === freshRegistrant.email,
      );
      if (!found) {
        throw new Error(
          `Create registrant: ${createdRegistrant.error.message}`,
        );
      }
    }

    const createdMemberFlow = await admin.auth.admin.createUser({
      email: memberFlowPersona.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: memberFlowPersona.fullName },
    });
    if (createdMemberFlow.error) {
      const existing = await admin.auth.admin.listUsers();
      const found = existing.data.users.find(
        (u) => u.email === memberFlowPersona.email,
      );
      if (!found) {
        throw new Error(
          `Create member persona: ${createdMemberFlow.error.message}`,
        );
      }
    }

    const createdPendingMember = await admin.auth.admin.createUser({
      email: pendingAffiliationMember.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: pendingAffiliationMember.fullName },
    });
    let pendingMemberId: string;
    if (createdPendingMember.error) {
      const existing = await admin.auth.admin.listUsers();
      const found = existing.data.users.find(
        (u) => u.email === pendingAffiliationMember.email,
      );
      if (!found) {
        throw new Error(
          `Create pending member: ${createdPendingMember.error.message}`,
        );
      }
      pendingMemberId = found.id;
    } else {
      pendingMemberId = createdPendingMember.data.user.id;
    }

    const existingPendingMembership = await admin
      .from("organization_memberships")
      .select("id")
      .eq("organization_id", organisationId)
      .eq("user_id", pendingMemberId)
      .maybeSingle();
    if (!existingPendingMembership.data) {
      const pendingMembership = await admin
        .from("organization_memberships")
        .insert({
          organization_id: organisationId,
          user_id: pendingMemberId,
          status: "pending",
          membership_type: "general",
          member_email: pendingAffiliationMember.email,
          connection_type: "Community member",
          requested_at: new Date().toISOString(),
        });
      if (pendingMembership.error) {
        throw new Error(
          `Create pending membership: ${pendingMembership.error.message}`,
        );
      }
    }
  });

  test("Member workspace", async ({ page }) => {
    await signIn(page);
    await page.goto("/workspace/member");
    await expect(
      page.getByRole("heading", { name: "Your affiliations" }),
    ).toBeVisible();
    await checkAccessibility(page, "Member workspace");
  });

  test("Organisation workspace", async ({ page }) => {
    await signIn(page);
    await page.goto(`/workspace/organisation?organization=${organisationId}`);
    await expect(page.getByRole("heading", { name: orgName })).toBeVisible();
    await checkAccessibility(page, "Organisation workspace");
  });

  test("Tamil Sangam workspace", async ({ page }) => {
    await signIn(page);
    await page.goto(`/workspace/sangam?sangam=${sangamId}`);
    await expect(page.getByRole("heading", { name: sangamName })).toBeVisible();
    await checkAccessibility(page, "Sangam workspace");
  });

  test("Organisation People", async ({ page }) => {
    await signIn(page);
    await page.goto(
      `/workspace/organisation/people?organization=${organisationId}`,
    );
    await expect(
      page.getByRole("heading", { name: orgName, exact: true }),
    ).toBeVisible();
    await checkAccessibility(page, "Organisation People");
  });

  test("Organisation People — pending affiliation confirmation", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto(
      `/workspace/organisation/people?organization=${organisationId}`,
    );
    await expect(
      page.getByText("Pending affiliation confirmations"),
    ).toBeVisible();
    await expect(
      page.getByText(pendingAffiliationMember.fullName),
    ).toBeVisible();
    await checkAccessibility(
      page,
      "Organisation People (pending affiliation confirmation)",
    );
  });

  test("Member registration — your details (profile stage)", async ({
    page,
  }) => {
    await signInAs(page, memberFlowPersona);
    await page.goto("/join/member");
    await expect(
      page.getByRole("heading", { name: "Your details" }),
    ).toBeVisible();
    await checkAccessibility(page, "Member registration (profile stage)");
  });

  test("Member registration — where are you already a member (affiliation type stage)", async ({
    page,
  }) => {
    await signInAs(page, memberFlowPersona);
    await completeMemberProfileStage(page, memberFlowPersona);
    await checkAccessibility(
      page,
      "Member registration (affiliation type stage)",
    );
  });

  test("Member registration — organisation directory (search results)", async ({
    page,
  }) => {
    await signInAs(page, memberFlowPersona);
    await completeMemberProfileStage(page, memberFlowPersona);
    await page.getByRole("button", { name: /^Organisation/ }).click();
    await page.getByLabel("Search", { exact: true }).fill(orgName);
    await expect(page.getByText(orgName)).toBeVisible();
    await checkAccessibility(
      page,
      "Member registration (organisation directory)",
    );
  });

  test("Member registration — confirm affiliation (category question) and success", async ({
    page,
  }) => {
    await signInAs(page, memberFlowPersona);
    await completeMemberProfileStage(page, memberFlowPersona);
    await page.getByRole("button", { name: /^Organisation/ }).click();
    await page.getByLabel("Search", { exact: true }).fill(orgName);
    await expect(page.getByText(orgName)).toBeVisible();
    await page.getByRole("button", { name: "Select" }).click();
    await expect(
      page.getByRole("heading", { name: "Confirm your affiliation" }),
    ).toBeVisible();
    await checkAccessibility(
      page,
      "Member registration (confirm affiliation, category question)",
    );

    await page.getByRole("radio", { name: "Community member" }).check();
    await page.getByRole("button", { name: "Submit affiliation" }).click();
    await expect(
      page.getByRole("heading", { name: "Affiliation submitted" }),
    ).toBeVisible();
    await checkAccessibility(page, "Member registration (success)");
  });

  test("Account", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard/account");
    await expect(
      page.getByRole("heading", { name: "Account settings" }),
    ).toBeVisible();
    await checkAccessibility(page, "Account");
  });

  test("Admin entry", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin");
    await expect(
      page.getByRole("heading", { name: "What needs attention now" }),
    ).toBeVisible();
    await checkAccessibility(page, "Admin entry");
  });

  test("Workspace switcher open", async ({ page }) => {
    await signIn(page);
    await page.goto(`/workspace/organisation?organization=${organisationId}`);
    await page.getByRole("button", { name: "Switch workspace" }).click();
    await expect(
      page.getByRole("heading", { name: "Your workspaces" }),
    ).toBeVisible();
    await checkAccessibility(page, "Workspace switcher open");
  });

  test("Organisation registration at /register (empty stage 1)", async ({
    page,
  }) => {
    await signInAs(page, freshRegistrant);
    await page.goto("/register");
    await expect(
      page.getByRole("heading", { name: "Your Organisation" }),
    ).toBeVisible();
    await checkAccessibility(page, "Organisation registration (/register)");
  });

  test("Organisation registration at /register (validation errors visible)", async ({
    page,
  }) => {
    await signInAs(page, freshRegistrant);
    await page.goto("/register");
    await expect(
      page.getByRole("heading", { name: "Your Organisation" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    await checkAccessibility(
      page,
      "Organisation registration (validation errors)",
    );
  });

  test.afterAll(async () => {
    const { data } = await admin.auth.admin.listUsers();
    for (const email of [
      user.email,
      freshRegistrant.email,
      memberFlowPersona.email,
      pendingAffiliationMember.email,
    ]) {
      const found = data.users.find((u) => u.email === email);
      if (found) await admin.auth.admin.deleteUser(found.id);
    }
  });
});

test.describe("public join surfaces accessibility (axe)", () => {
  test.skip(
    process.env.RUN_SUPABASE_E2E !== "true",
    "Runs only against the explicit local Supabase environment.",
  );

  test("/join", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/join");
    await expect(
      page.getByRole("heading", { name: "Join Tamil Ulagam" }),
    ).toBeVisible();
    await checkAccessibility(page, "/join");
  });

  test("/join/organisation (logged out)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/join/organisation");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Register your organisation",
      }),
    ).toBeVisible();
    await checkAccessibility(page, "/join/organisation (logged out)");
  });

  test("/join/sangam (logged out)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/join/sangam");
    await expect(
      page.getByRole("heading", { level: 1, name: "Register your Sangam" }),
    ).toBeVisible();
    await checkAccessibility(page, "/join/sangam (logged out)");
  });

  test("/join/member (logged out)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/join/member");
    await expect(
      page.getByRole("heading", { level: 1, name: "Connect your membership" }),
    ).toBeVisible();
    await checkAccessibility(page, "/join/member (logged out)");
  });
});

test.describe("management administration accessibility (axe)", () => {
  test.skip(
    process.env.RUN_SUPABASE_E2E !== "true",
    "Runs only against the explicit local Supabase environment.",
  );

  const password = "LocalMgmtA11y!2048Aa";
  const owner = {
    email: "local-mgmt-a11y-owner@tamil-ulagam.test",
    fullName: "Local Mgmt A11y Owner",
  };
  const invitee = {
    email: "local-mgmt-a11y-invitee@tamil-ulagam.test",
    fullName: "Local Mgmt A11y Invitee",
  };
  const coManager = {
    email: "local-mgmt-a11y-comanager@tamil-ulagam.test",
    fullName: "Local Mgmt A11y Co-Manager",
  };
  let admin: SupabaseClient<Database>;
  let orgId = "";
  let orgName = "";
  let invitationId = "";
  let coManagerId = "";

  async function signInMgmt(page: Page, email: string) {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL((url) => !url.pathname.startsWith("/login"));
  }

  test.beforeAll(async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey)
      throw new Error("Local Supabase not configured.");
    admin = createClient<Database>(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    async function ensureUser(fixture: { email: string; fullName: string }) {
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
        if (!found)
          throw new Error(`Create ${fixture.email}: ${created.error.message}`);
        return found.id;
      }
      return created.data.user.id;
    }

    const ownerId = await ensureUser(owner);
    await ensureUser(invitee);

    orgName = "Local Mgmt A11y Org";
    const existingOrg = await admin
      .from("organizations")
      .select("id")
      .eq("name", orgName)
      .maybeSingle();
    if (existingOrg.data) {
      orgId = existingOrg.data.id;
    } else {
      const org = await admin
        .from("organizations")
        .insert({
          category: "tamil_community",
          name: orgName,
          country: "Canada",
          region: "Ontario",
          city: "Toronto",
          official_email: `office-${crypto.randomUUID().slice(0, 8)}@tamil-ulagam.test`,
          official_phone: "+1 416 555 0111",
          description: "Management accessibility QA fixture.",
          registration_status: "informal",
        })
        .select("id")
        .single();
      if (org.error || !org.data)
        throw new Error(`Create org: ${org.error?.message}`);
      orgId = org.data.id;
      const application = await admin.from("organization_applications").insert({
        organization_id: orgId,
        submitted_by: ownerId,
        status: "verified",
        representative_full_name: "Local Mgmt A11y Rep",
        representative_email: owner.email,
        representative_phone: "+1 416 555 0111",
        authorization_declaration: true,
        accuracy_declaration: true,
        submitted_at: new Date().toISOString(),
      });
      if (application.error)
        throw new Error(`Application: ${application.error.message}`);
      const grant = await admin.from("organization_managers").insert({
        organization_id: orgId,
        user_id: ownerId,
        role: "owner",
        granted_by: ownerId,
      });
      if (grant.error) throw new Error(`Manager grant: ${grant.error.message}`);
    }

    const existingInvitation = await admin
      .from("organization_manager_invitations")
      .select("id")
      .eq("organization_id", orgId)
      .eq("email", invitee.email)
      .eq("status", "pending")
      .maybeSingle();
    if (existingInvitation.data) {
      invitationId = existingInvitation.data.id;
    } else {
      const invitation = await admin
        .from("organization_manager_invitations")
        .insert({
          organization_id: orgId,
          email: invitee.email,
          role: "admin",
          invited_by: ownerId,
        })
        .select("id")
        .single();
      if (invitation.error || !invitation.data)
        throw new Error(`Invitation: ${invitation.error?.message}`);
      invitationId = invitation.data.id;
    }

    coManagerId = await ensureUser(coManager);
    const existingGrant = await admin
      .from("organization_managers")
      .select("id")
      .eq("organization_id", orgId)
      .eq("user_id", coManagerId)
      .maybeSingle();
    if (!existingGrant.data) {
      const grant = await admin.from("organization_managers").insert({
        organization_id: orgId,
        user_id: coManagerId,
        role: "admin",
        granted_by: ownerId,
      });
      if (grant.error)
        throw new Error(`Co-manager grant: ${grant.error.message}`);
    }
  });

  test("Managers tab — active managers and pending invitations", async ({
    page,
  }) => {
    await signInMgmt(page, owner.email);
    await page.goto(`/workspace/organisation/people?organization=${orgId}`);
    await expect(page.getByRole("heading", { name: orgName })).toBeVisible();
    await page.getByRole("tab", { name: "Managers" }).click();
    await expect(page.getByText(invitee.email).first()).toBeVisible();
    await checkAccessibility(
      page,
      "Managers tab (active + pending invitations)",
    );
  });

  test("Invite manager dialog", async ({ page }) => {
    await signInMgmt(page, owner.email);
    await page.goto(`/workspace/organisation/people?organization=${orgId}`);
    await page.getByRole("tab", { name: "Managers" }).click();
    await page.getByRole("button", { name: "Invite manager" }).click();
    await expect(
      page.getByRole("heading", { name: "Invite a manager" }),
    ).toBeVisible();
    await checkAccessibility(page, "Invite manager dialog");
  });

  test("Management history", async ({ page }) => {
    await signInMgmt(page, owner.email);
    await page.goto(`/workspace/organisation/people?organization=${orgId}`);
    await page.getByRole("tab", { name: "Managers" }).click();
    await page.getByRole("button", { name: /View management history/ }).click();
    await checkAccessibility(page, "Management history");
  });

  test("Recipient's management invitation screen", async ({ page }) => {
    await signInMgmt(page, invitee.email);
    await page.goto("/workspace/invitations");
    await expect(page.getByText(orgName)).toBeVisible();
    await checkAccessibility(page, "Management invitation recipient screen");
  });

  test("Role-change confirmation dialog", async ({ page }) => {
    await signInMgmt(page, owner.email);
    await page.goto(`/workspace/organisation/people?organization=${orgId}`);
    await page.getByRole("tab", { name: "Managers" }).click();
    await page
      .getByRole("button", { name: "Make Representative" })
      .first()
      .click();
    await expect(
      page.getByRole("heading", { name: "Change role to Representative?" }),
    ).toBeVisible();
    await checkAccessibility(page, "Role-change confirmation dialog");
  });

  test("Remove-manager confirmation dialog", async ({ page }) => {
    await signInMgmt(page, owner.email);
    await page.goto(`/workspace/organisation/people?organization=${orgId}`);
    await page.getByRole("tab", { name: "Managers" }).click();
    await page.getByRole("button", { name: "Remove" }).first().click();
    await expect(
      page.getByRole("heading", { name: "Remove this manager?" }),
    ).toBeVisible();
    await checkAccessibility(page, "Remove-manager confirmation dialog");
  });

  test("Transfer ownership dialog", async ({ page }) => {
    await signInMgmt(page, owner.email);
    await page.goto(`/workspace/organisation/people?organization=${orgId}`);
    await page.getByRole("tab", { name: "Managers" }).click();
    await page
      .getByRole("button", { name: "Transfer ownership" })
      .first()
      .click();
    await expect(
      page.getByRole("heading", { name: "Transfer ownership" }),
    ).toBeVisible();
    await checkAccessibility(page, "Transfer ownership dialog");
  });

  test.afterAll(async () => {
    await admin
      .from("organization_manager_invitations")
      .delete()
      .eq("id", invitationId);
    await admin
      .from("organization_managers")
      .delete()
      .eq("organization_id", orgId)
      .eq("user_id", coManagerId);
    const { data } = await admin.auth.admin.listUsers();
    for (const fixture of [owner, invitee, coManager]) {
      const found = data.users.find((u) => u.email === fixture.email);
      if (found) await admin.auth.admin.deleteUser(found.id);
    }
  });
});
