import { mkdir } from "node:fs/promises";
import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../src/lib/supabase/database.types";

const adminAccount = {
  email: "f1-browser-admin@tamil-ulagam.test",
  password: "LocalAdmin!2048Aa",
  fullName: "Federation Operations Admin",
} as const;

const memberAccount = {
  email: "f1-browser-member@tamil-ulagam.test",
  password: "LocalMember!2048Aa",
  fullName: "Kannan Arul",
} as const;

async function expectDialogFocusAndHiddenSkipLink(page: Page, dialog: Locator) {
  expect(
    await dialog.evaluate((element) =>
      element.contains(document.activeElement),
    ),
  ).toBe(true);
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).not.toBeFocused();
  await expect
    .poll(() =>
      skipLink.evaluate(
        (element) => element.getBoundingClientRect().bottom <= 0,
      ),
    )
    .toBe(true);
}

test.describe("Federation Admin Operations V3", () => {
  test.skip(
    process.env.RUN_SUPABASE_E2E !== "true",
    "Runs only against the explicit local Supabase environment.",
  );
  test.describe.configure({ mode: "serial" });

  let serviceRole: SupabaseClient<Database>;
  let applicationId = "";
  let membershipId = "";
  let organisationId = "";

  test.beforeAll(async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey)
      throw new Error("Local Supabase F1 setup is not configured.");
    serviceRole = createClient<Database>(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const adminUser = await createUser(adminAccount);
    const memberUser = await createUser(memberAccount);
    const role = await serviceRole.from("user_roles").insert({
      user_id: adminUser,
      role: "admin",
    });
    if (role.error) throw new Error(role.error.message);

    const sangam = await serviceRole
      .from("organizations")
      .insert({
        name: "F1 London Tamil Sangam",
        category: "tamil_community",
        country: "United Kingdom",
        region: "Greater London",
        city: "London",
        description: "A local fixture for Federation operations verification.",
        official_email: "f1-sangam@tamil-ulagam.test",
        official_phone: "+44 20 7946 0000",
        registration_status: "registered",
      })
      .select("id")
      .single();
    if (sangam.error || !sangam.data) throw new Error(sangam.error?.message);
    organisationId = sangam.data.id;
    const application = await serviceRole
      .from("organization_applications")
      .insert({
        organization_id: sangam.data.id,
        submitted_by: memberUser,
        status: "verified",
        representative_full_name: memberAccount.fullName,
        representative_email: memberAccount.email,
        representative_phone: "+44 7700 900000",
        authorization_declaration: true,
        accuracy_declaration: true,
        submitted_at: new Date().toISOString(),
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminUser,
      });
    if (application.error) throw new Error(application.error.message);
    const details = await serviceRole
      .from("organization_tamil_community_details")
      .insert({
        organization_id: sangam.data.id,
        subtype: "Tamil Sangam",
        geographic_area_served: "Greater London",
        network_affiliated: true,
        network_name: "United Kingdom Tamil network",
      });
    if (details.error) throw new Error(details.error.message);
    const manager = await serviceRole.from("organization_managers").insert({
      organization_id: sangam.data.id,
      user_id: adminUser,
      role: "owner",
      granted_by: adminUser,
    });
    if (manager.error) throw new Error(manager.error.message);
    const membership = await serviceRole
      .from("organization_memberships")
      .insert({
        organization_id: sangam.data.id,
        user_id: memberUser,
        status: "pending",
        membership_type: "general",
        requested_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (membership.error || !membership.data)
      throw new Error(membership.error?.message);
    membershipId = membership.data.id;

    const reviewOrganisation = await serviceRole
      .from("organizations")
      .insert({
        name: "F1 International Tamil Knowledge and Community Development Forum",
        category: "education",
        country: "Singapore",
        region: "Central Region",
        city: "Singapore",
        description:
          "A deliberately long operational fixture used to verify responsive Admin review presentation.",
        official_email: "f1-review@tamil-ulagam.test",
        official_phone: "+65 6123 4567",
        registration_status: "informal",
      })
      .select("id")
      .single();
    if (reviewOrganisation.error || !reviewOrganisation.data)
      throw new Error(reviewOrganisation.error?.message);
    applicationId = globalThis.crypto.randomUUID();
    const reviewApplication = await serviceRole
      .from("organization_applications")
      .insert({
        id: applicationId,
        organization_id: reviewOrganisation.data.id,
        submitted_by: memberUser,
        status: "submitted",
        representative_full_name: memberAccount.fullName,
        representative_email: memberAccount.email,
        representative_phone: "+65 8123 4567",
        authorization_declaration: true,
        accuracy_declaration: true,
        submitted_at: new Date().toISOString(),
      });
    if (reviewApplication.error)
      throw new Error(reviewApplication.error.message);
  });

  async function createUser(account: {
    readonly email: string;
    readonly password: string;
    readonly fullName: string;
  }): Promise<string> {
    const result = await serviceRole.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: { full_name: account.fullName },
    });
    if (result.error || !result.data.user)
      throw new Error(result.error?.message ?? "User creation failed.");
    return result.data.user.id;
  }

  test("submits and progresses an anonymous partnership enquiry through keyboard actions", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.goto("/partners");
    await page.getByLabel("Name").fill("Priya Nadarajah");
    await page.getByLabel("Email").fill("priya@example.org");
    await page
      .getByLabel("Organisation (optional)")
      .fill("Tamil Research Forum");
    await page.getByLabel("Country").fill("Australia");
    await page.getByLabel("Partnership area").selectOption("research");
    await page
      .getByLabel("Message")
      .fill(
        "We would like to discuss a responsible research collaboration with the Federation.",
      );
    await page.getByRole("button", { name: "Send enquiry" }).focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("heading", { name: "Your enquiry was received." }),
    ).toBeVisible();

    await signIn(page);
    await page.goto("/admin/partnerships");
    const row = page
      .getByRole("row")
      .filter({ hasText: "Tamil Research Forum" });
    await expect(row).toBeVisible();
    const inspect = row.getByRole("link", { name: "Inspect" });
    await inspect.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("heading", { name: "Tamil Research Forum" }),
    ).toBeVisible();

    const begin = page.getByRole("button", { name: "Mark in discussion" });
    await begin.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("dialog", { name: "Begin discussion?" }),
    ).toBeVisible();
    await page.getByLabel("Operational note (optional)").focus();
    await page.keyboard.type(
      "Federation team accepted the initial conversation.",
    );
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await page.getByRole("button", { name: "Confirm status change" }).focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByText("In discussion", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByText("Federation team accepted the initial conversation."),
    ).toBeVisible();
  });

  test("approves a pending affiliation without conflating management authority", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto(`/admin/memberships?membership=${membershipId}`);
    await expect(
      page.getByRole("heading", { name: memberAccount.fullName }),
    ).toBeVisible();
    await expect(
      page.getByText(/Membership does not grant management authority/),
    ).toBeVisible();
    const approve = page.getByRole("button", {
      name: "Approve pending request",
    });
    await approve.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("dialog", { name: "Approve membership?" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Approve membership?" }),
    ).toBeHidden();
    await expect(approve).toBeFocused();
    await page.reload();
    const approveAfterReload = page.getByRole("button", {
      name: "Approve pending request",
    });
    await approveAfterReload.focus();
    await page.keyboard.press("Space");
    await expect(
      page.getByRole("dialog", { name: "Approve membership?" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Confirm approval" }).focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByText("Approved", { exact: true }).first(),
    ).toBeVisible();

    const history = await serviceRole
      .from("organization_membership_history")
      .select("new_status, actor_user_id")
      .eq("membership_id", membershipId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    expect(history.data?.new_status).toBe("approved");
    expect(history.data?.actor_user_id).toBeTruthy();
  });

  test("renders the complete Admin route set without axe or overflow failures", async ({
    page,
  }) => {
    await signIn(page);
    const routes = [
      "/admin",
      "/admin/reviews",
      "/admin/organisations",
      "/admin/sangams",
      "/admin/memberships",
      "/admin/partnerships",
    ] as const;
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(
        page.getByRole("navigation", { name: "Admin navigation" }),
      ).toBeVisible();
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(overflow, `${route} has horizontal overflow`).toBe(false);
      const axe = await new AxeBuilder({ page }).analyze();
      expect(axe.violations, `${route} axe violations`).toEqual([]);
    }
    await page.goto("/admin/sangams");
    await expect(
      page
        .getByRole("table", { name: "Tamil Sangams operational directory" })
        .getByText("F1 London Tamil Sangam"),
    ).toBeVisible();
  });

  test("captures the complete responsive Admin operations review", async ({
    page,
  }) => {
    test.setTimeout(300_000);
    await signIn(page);
    const enquiry = await serviceRole
      .from("partnership_enquiries")
      .select("id")
      .eq("email", "priya@example.org")
      .single();
    if (enquiry.error || !enquiry.data) throw new Error(enquiry.error?.message);

    const routes = [
      { name: "overview", href: "/admin" },
      { name: "reviews", href: "/admin/reviews" },
      {
        name: "review-detail",
        href: `/admin/reviews?application=${applicationId}`,
      },
      {
        name: "organisations",
        href: `/admin/organisations?organization=${organisationId}`,
      },
      {
        name: "sangams",
        href: `/admin/sangams?organization=${organisationId}`,
      },
      {
        name: "memberships",
        href: `/admin/memberships?membership=${membershipId}`,
      },
      {
        name: "partnerships",
        href: `/admin/partnerships?enquiry=${enquiry.data.id}`,
      },
    ] as const;
    const viewports = [
      { width: 375, height: 812 },
      { width: 390, height: 844 },
      { width: 430, height: 932 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1280, height: 800 },
      { width: 1440, height: 1000 },
      { width: 1920, height: 1080 },
    ] as const;
    const reviewDirectory = path.resolve(
      process.cwd(),
      "../../artifacts/federation-admin-f1-review",
    );
    await mkdir(reviewDirectory, { recursive: true });

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      for (const route of routes) {
        await page.goto(route.href);
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(page.locator("h1")).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
          `${route.href} should not overflow at ${viewport.width}px`,
        ).toBe(true);
        await page.screenshot({
          path: path.join(
            reviewDirectory,
            `${route.name}-${viewport.width}.png`,
          ),
          fullPage: true,
        });
      }

      if (viewport.width === 390 || viewport.width === 1440) {
        await page.goto(`/admin/reviews?application=${applicationId}`);
        const requestChanges = page.getByRole("button", {
          name: "Request Changes",
        });
        await requestChanges.focus();
        await page.keyboard.press("Enter");
        const requestDialog = page.getByRole("dialog", {
          name: "Request changes",
        });
        await expect(requestDialog).toBeVisible();
        await expectDialogFocusAndHiddenSkipLink(page, requestDialog);
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
          [],
        );
        await page.screenshot({
          path: path.join(
            reviewDirectory,
            `review-dialog-${viewport.width}.png`,
          ),
          fullPage: true,
          style: 'a[href="#main-content"] { visibility: hidden !important; }',
        });
        await page.keyboard.press("Escape");
        await expect(requestChanges).toBeFocused();

        await page.goto(`/admin/memberships?membership=${membershipId}`);
        const revoke = page.getByRole("button", {
          name: "Revoke affiliation",
        });
        await revoke.focus();
        await page.keyboard.press("Space");
        const membershipDialog = page.getByRole("dialog", {
          name: "Revoke membership?",
        });
        await expect(membershipDialog).toBeVisible();
        await expectDialogFocusAndHiddenSkipLink(page, membershipDialog);
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
          [],
        );
        await page.screenshot({
          path: path.join(
            reviewDirectory,
            `membership-dialog-${viewport.width}.png`,
          ),
          fullPage: true,
          style: 'a[href="#main-content"] { visibility: hidden !important; }',
        });
        await page.keyboard.press("Escape");
        await expect(revoke).toBeFocused();

        await page.goto(`/admin/partnerships?enquiry=${enquiry.data.id}`);
        const decline = page.getByRole("button", { name: "Decline enquiry" });
        await decline.focus();
        await page.keyboard.press("Enter");
        const partnershipDialog = page.getByRole("dialog", {
          name: "Decline enquiry?",
        });
        await expect(partnershipDialog).toBeVisible();
        await expectDialogFocusAndHiddenSkipLink(page, partnershipDialog);
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
          [],
        );
        await page.screenshot({
          path: path.join(
            reviewDirectory,
            `partnership-dialog-${viewport.width}.png`,
          ),
          fullPage: true,
          style: 'a[href="#main-content"] { visibility: hidden !important; }',
        });
        await page.keyboard.press("Escape");
        await expect(decline).toBeFocused();

        await page.goto("/admin/organisations");
        await page
          .getByLabel("Search Organisation")
          .fill("No matching Federation record");
        await expect(
          page.getByRole("heading", {
            name: "No organisations match these filters",
          }),
        ).toBeVisible();
        await page.screenshot({
          path: path.join(
            reviewDirectory,
            `directory-empty-${viewport.width}.png`,
          ),
          fullPage: true,
        });
      }
    }
  });
});

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(adminAccount.email);
  await page.getByLabel("Password").fill(adminAccount.password);
  await page.getByRole("button", { name: "Sign In" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/admin\/?$/);
}
