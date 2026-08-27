import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../src/lib/supabase/database.types";

/**
 * Phase E1.5 brief sections 13-16 (workspace shell coverage) + Phase E1.6
 * brief sections 7-8 (removing the color-contrast exclusion once the
 * underlying tokens were fixed, and expanding route coverage to the
 * public /join surfaces, /register, and a validation-error registration
 * stage) — automated accessibility coverage using @axe-core/playwright
 * (added as a dev-only dependency in E1.5; not previously present —
 * axe-core itself only existed transitively via eslint-plugin-jsx-a11y,
 * a lint-time-only dependency unusable here).
 *
 * One authenticated persona (Organisation + Tamil Sangam manager, also a
 * reviewer) reaches every representative authenticated state — Member,
 * Organisation, Sangam, People, Account, Admin, the switcher's open
 * state — without needing five separate fixture sets. A second, fresh
 * persona (no application of their own) covers /register, including its
 * empty-form and validation-error-visible states. The public /join
 * surfaces are scanned unauthenticated, as any visitor would see them.
 *
 * Policy (brief section 14): serious/critical violations fail the test;
 * moderate violations are logged for review, not auto-failed; minor
 * violations are logged only. No rule is disabled globally.
 *
 * E1.6 update: this spec previously excluded serious color-contrast
 * violations that matched two exact, known pre-existing foreground
 * colours (#657381/#247a59 — the old --tu-color-slate/--tu-color-success
 * values). Phase E1.6 darkened both tokens specifically to clear AA
 * against every real background they're used on (see globals.css for
 * the exact values and contrast ratios). That exclusion has been removed
 * entirely, per brief section 7 — this suite now runs with no
 * color-based filtering of any kind.
 */

const password = "LocalBrowserA11y!2048Aa";
const user = {
  email: "local-browser-a11y-manager@tamil-ulagam.test",
  fullName: "Local A11y Manager",
};
const orgName = "Local Browser A11y Org";
const sangamName = "Local Browser A11y Sangam";

// A second, deliberately clean persona — no application, no manager
// grant, no review role — so /register's own bootstrap draft (and its
// stage-1 validation-error state) can be scanned without the first
// persona's already-verified organisation getting in the way.
const freshRegistrant = {
  email: "local-browser-a11y-registrant@tamil-ulagam.test",
  fullName: "Local A11y Registrant",
};

async function signInAs(page: Page, credentials: { readonly email: string }) {
  // Without this, axe can scan mid-reveal-transition (content still at
  // its data-motion-reveal starting opacity) and flag a false
  // "insufficient contrast" — the animation itself, not the settled UI.
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

/** Runs axe against the current page, fails on any serious/critical
 * violation, and logs moderate/minor ones for review — the tiered
 * policy the brief specifies rather than a blanket zero-violations
 * gate. No violation is filtered by colour, rule, or page. */
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

  test("Account", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard/account");
    await expect(
      page.getByRole("heading", { name: "Account details" }),
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
    // Stage 1 has no category selected and every text field empty —
    // submitting surfaces the app's own role="alert" validation copy
    // (the <form noValidate> disables the browser's native validation
    // bubbles specifically so this state is reachable and scannable).
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    await checkAccessibility(
      page,
      "Organisation registration (validation errors)",
    );
  });

  test.afterAll(async () => {
    const { data } = await admin.auth.admin.listUsers();
    for (const email of [user.email, freshRegistrant.email]) {
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

  // Unauthenticated — these are the pages any first-time visitor sees,
  // no fixture setup needed.

  test("/join", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/join");
    await expect(
      page.getByRole("heading", { name: "Choose your path" }),
    ).toBeVisible();
    await checkAccessibility(page, "/join");
  });

  test("/join/organisation (logged out)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/join/organisation");
    await expect(page.locator("#organisation-journey-title")).toBeVisible();
    await checkAccessibility(page, "/join/organisation (logged out)");
  });

  test("/join/sangam (logged out)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/join/sangam");
    await expect(page.locator("#sangam-journey-title")).toBeVisible();
    await checkAccessibility(page, "/join/sangam (logged out)");
  });

  test("/join/member (logged out)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/join/member");
    await expect(page.locator("#member-logged-out-title")).toBeVisible();
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

    // A second, already-active co-manager (fixture-inserted directly,
    // not through accept_organization_manager_invitation — this describe
    // block is scanning UI accessibility, not re-proving the RPC
    // security matrix local-integration-management.test.ts already
    // covers) so the role-change/remove/transfer dialogs have a real
    // target to open against.
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
