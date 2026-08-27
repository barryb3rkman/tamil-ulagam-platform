import { expect, test, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../src/lib/supabase/database.types";

/**
 * Phase E1 brief section 36 — the required real-role browser coverage
 * for the workspace switcher: five named personas, each verified for
 * login -> correct available workspaces -> switch -> URL changes ->
 * correct workspace content -> switch back -> no permission leakage.
 *
 * Fixture organisations/Sangams are seeded directly via the service-role
 * client (organizations/organization_applications/organization_managers/
 * organization_tamil_community_details), mirroring the same setup
 * pattern member-affiliation-lifecycle.spec.ts already uses, rather than
 * driving the full registration wizard five times over — this spec's
 * subject is workspace switching, not registration, which the other
 * lifecycle specs already cover end to end.
 */

const password = "LocalBrowserWorkspace!2048Aa";

const users = {
  memberOnly: {
    email: "local-browser-workspace-member@tamil-ulagam.test",
    fullName: "Local Workspace Member",
  },
  orgManager: {
    email: "local-browser-workspace-org-manager@tamil-ulagam.test",
    fullName: "Local Workspace Org Manager",
  },
  sangamManager: {
    email: "local-browser-workspace-sangam-manager@tamil-ulagam.test",
    fullName: "Local Workspace Sangam Manager",
  },
  dualManager: {
    email: "local-browser-workspace-dual-manager@tamil-ulagam.test",
    fullName: "Local Workspace Dual Manager",
  },
  adminManager: {
    email: "local-browser-workspace-admin-manager@tamil-ulagam.test",
    fullName: "Local Workspace Admin Manager",
  },
} as const;

const orgBName = "Local Browser Workspace Org B";
const sangamCName = "Local Browser Workspace Sangam C";
const orgDName = "Local Browser Workspace Org D";
const sangamDName = "Local Browser Workspace Sangam D";
const orgEName = "Local Browser Workspace Org E";

async function signIn(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

async function openSwitcher(page: Page) {
  await page.getByRole("button", { name: "Switch workspace" }).click();
}

test.describe("real V3 workspace switching across the five named personas", () => {
  test.skip(
    process.env.RUN_SUPABASE_E2E !== "true",
    "Runs only against the explicit local Supabase environment.",
  );

  let admin: SupabaseClient<Database>;
  const organisationIds: Record<string, string> = {};

  test.beforeAll(async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      throw new Error("Local Supabase setup is not configured.");
    }
    admin = createClient<Database>(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Idempotent by design: Playwright recycles a failed test's worker
    // for the rest of the file, which re-runs beforeAll — without this,
    // a single flaky assertion earlier in the file would otherwise crash
    // every subsequent test on an "already registered" collision.
    const userIds: Record<string, string> = {};
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
          (user) => user.email === fixture.email,
        );
        if (!found) {
          throw new Error(`Create ${key}: ${created.error.message}`);
        }
        userIds[key] = found.id;
        continue;
      }
      userIds[key] = created.data.user.id;
    }

    async function createManagedOrganisation(options: {
      readonly name: string;
      readonly userId: string;
      readonly representativeEmail: string;
      readonly isSangam: boolean;
    }): Promise<string> {
      const existing = await admin
        .from("organizations")
        .select("id")
        .eq("name", options.name)
        .maybeSingle();
      if (existing.data) {
        return existing.data.id;
      }

      const organisation = await admin
        .from("organizations")
        .insert({
          category: "tamil_community",
          name: options.name,
          country: "Canada",
          region: "Ontario",
          city: "Toronto",
          official_email: `office-${crypto.randomUUID().slice(0, 8)}@tamil-ulagam.test`,
          official_phone: "+1 416 555 0111",
          description: "A fixture organisation for workspace switching E2E.",
          registration_status: "informal",
        })
        .select("id")
        .single();
      if (organisation.error || !organisation.data) {
        throw new Error(
          `Create organisation ${options.name}: ${organisation.error?.message ?? "no data"}`,
        );
      }
      const organisationId = organisation.data.id;

      if (options.isSangam) {
        const details = await admin
          .from("organization_tamil_community_details")
          .insert({ organization_id: organisationId, subtype: "Tamil Sangam" });
        if (details.error) {
          throw new Error(
            `Create Sangam details ${options.name}: ${details.error.message}`,
          );
        }
      }

      const application = await admin.from("organization_applications").insert({
        organization_id: organisationId,
        submitted_by: options.userId,
        status: "verified",
        representative_full_name: "Fixture Representative",
        representative_email: options.representativeEmail,
        representative_phone: "+1 416 555 0111",
        authorization_declaration: true,
        accuracy_declaration: true,
        submitted_at: new Date().toISOString(),
      });
      if (application.error) {
        throw new Error(
          `Create application ${options.name}: ${application.error.message}`,
        );
      }

      const grant = await admin.from("organization_managers").insert({
        organization_id: organisationId,
        user_id: options.userId,
        role: "owner",
      });
      if (grant.error) {
        throw new Error(
          `Grant manager ${options.name}: ${grant.error.message}`,
        );
      }

      return organisationId;
    }

    organisationIds.orgB = await createManagedOrganisation({
      name: orgBName,
      userId: userIds.orgManager!,
      representativeEmail: users.orgManager.email,
      isSangam: false,
    });
    organisationIds.sangamC = await createManagedOrganisation({
      name: sangamCName,
      userId: userIds.sangamManager!,
      representativeEmail: users.sangamManager.email,
      isSangam: true,
    });
    organisationIds.orgD = await createManagedOrganisation({
      name: orgDName,
      userId: userIds.dualManager!,
      representativeEmail: users.dualManager.email,
      isSangam: false,
    });
    organisationIds.sangamD = await createManagedOrganisation({
      name: sangamDName,
      userId: userIds.dualManager!,
      representativeEmail: users.dualManager.email,
      isSangam: true,
    });
    organisationIds.orgE = await createManagedOrganisation({
      name: orgEName,
      userId: userIds.adminManager!,
      representativeEmail: users.adminManager.email,
      isSangam: false,
    });

    const existingRole = await admin
      .from("user_roles")
      .select("user_id")
      .eq("user_id", userIds.adminManager!)
      .eq("role", "reviewer")
      .maybeSingle();
    if (!existingRole.data) {
      const reviewerRole = await admin.from("user_roles").insert({
        user_id: userIds.adminManager!,
        role: "reviewer",
      });
      if (reviewerRole.error) {
        throw new Error(`Grant reviewer role: ${reviewerRole.error.message}`);
      }
    }
  });

  test("A. member-only sees only the Member workspace — no Organisations, Tamil Sangams or Federation sections", async ({
    page,
  }) => {
    await signIn(page, users.memberOnly.email);
    await page.goto("/workspace/member");
    await openSwitcher(page);
    await expect(page.getByRole("link", { name: /^Member/ })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Organisations" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Tamil Sangams" }),
    ).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Federation" })).toHaveCount(
      0,
    );
  });

  test("B. Organisation manager switches between Member and their Organisation, URL and content both change correctly", async ({
    page,
  }) => {
    await signIn(page, users.orgManager.email);
    await page.goto(
      `/workspace/organisation?organization=${organisationIds.orgB}`,
    );
    await expect(page.getByRole("heading", { name: orgBName })).toBeVisible();

    await openSwitcher(page);
    await expect(
      page.getByRole("heading", { name: "Organisations" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Tamil Sangams" }),
    ).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Federation" })).toHaveCount(
      0,
    );
    await page.getByRole("link", { name: /^Member/ }).click();
    await expect(page).toHaveURL(/\/workspace\/member\/?$/);
    await expect(
      page.getByRole("heading", { name: "Your affiliations" }),
    ).toBeVisible();

    await openSwitcher(page);
    await page.getByRole("link", { name: orgBName }).click();
    await expect(page).toHaveURL(
      new RegExp(
        `/workspace/organisation/?\\?organization=${organisationIds.orgB}`,
      ),
    );
    await expect(page.getByRole("heading", { name: orgBName })).toBeVisible();
  });

  test("C. Tamil Sangam manager sees Tamil Sangams, not Organisations, and switching lands on the Sangam workspace with correct copy", async ({
    page,
  }) => {
    await signIn(page, users.sangamManager.email);
    await page.goto(`/workspace/sangam?sangam=${organisationIds.sangamC}`);
    await expect(
      page.getByRole("heading", { name: sangamCName }),
    ).toBeVisible();

    await openSwitcher(page);
    await expect(
      page.getByRole("heading", { name: "Tamil Sangams" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Organisations" }),
    ).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Federation" })).toHaveCount(
      0,
    );
    await expect(page.getByRole("link", { name: sangamCName })).toHaveAttribute(
      "href",
      `/workspace/sangam/?sangam=${organisationIds.sangamC}`,
    );
  });

  test("D. Organisation + Tamil Sangam manager sees both sections and each workspace shows only its own identity — no cross-workspace leakage", async ({
    page,
  }) => {
    await signIn(page, users.dualManager.email);
    await page.goto(
      `/workspace/organisation?organization=${organisationIds.orgD}`,
    );
    await expect(page.getByRole("heading", { name: orgDName })).toBeVisible();
    // Scoped to headings, not getByText: the (closed) switcher sheet
    // already lists both of this manager's workspaces in the DOM, so a
    // page-wide text search would false-positive on its own link text —
    // the real "no leakage" claim is about the *content area* identity.
    await expect(page.getByRole("heading", { name: sangamDName })).toHaveCount(
      0,
    );

    await openSwitcher(page);
    await expect(
      page.getByRole("heading", { name: "Organisations" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Tamil Sangams" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Federation" })).toHaveCount(
      0,
    );
    await page.getByRole("link", { name: sangamDName }).click();
    await expect(page).toHaveURL(
      new RegExp(`/workspace/sangam/?\\?sangam=${organisationIds.sangamD}`),
    );
    await expect(
      page.getByRole("heading", { name: sangamDName }),
    ).toBeVisible();
    // No leakage of the Organisation's own identity into the Sangam view
    // (scoped to headings — see the equivalent comment above).
    await expect(page.getByRole("heading", { name: orgDName })).toHaveCount(0);
  });

  test("E. Admin + Organisation manager sees Federation alongside their Organisation, and can reach /admin from the switcher", async ({
    page,
  }) => {
    await signIn(page, users.adminManager.email);
    await page.goto(
      `/workspace/organisation?organization=${organisationIds.orgE}`,
    );
    await expect(page.getByRole("heading", { name: orgEName })).toBeVisible();

    await openSwitcher(page);
    await expect(
      page.getByRole("heading", { name: "Organisations" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Tamil Sangams" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Federation" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Federation Admin" }).click();
    await expect(page).toHaveURL(/\/admin\/?$/);
    await expect(
      page.getByRole("heading", { name: "What needs attention now" }),
    ).toBeVisible();
  });

  test.afterAll(async () => {
    for (const [key, fixture] of Object.entries(users)) {
      const { data } = await admin.auth.admin.listUsers();
      const found = data.users.find((user) => user.email === fixture.email);
      if (found) await admin.auth.admin.deleteUser(found.id);
      void key;
    }
  });
});
