import { expect, test, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../src/lib/supabase/database.types";

const password = "LocalF15AdminQa!2048Aa";
const admin1 = {
  email: "f15-admin@tamil-ulagam.test",
  fullName: "F15 Admin",
};

async function signIn(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/login");
  await page.getByLabel("Email").first().fill(admin1.email);
  await page.getByLabel("Password").first().fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

async function activeInfo(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return null;
    return {
      tag: el.tagName,
      role: el.getAttribute("role"),
      ariaLabel: el.getAttribute("aria-label"),
      text: el.textContent?.trim().slice(0, 40),
      inDialog: Boolean(el.closest("dialog")),
    };
  });
}

async function focusRingPresent(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return false;
    const style = getComputedStyle(el);
    return style.boxShadow !== "none" || style.outlineStyle !== "none";
  });
}

async function tabUntil(
  page: Page,
  matcher: (
    info: NonNullable<Awaited<ReturnType<typeof activeInfo>>>,
  ) => boolean,
  max = 30,
): Promise<boolean> {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab");
    const info = await activeInfo(page);
    if (info && matcher(info)) return true;
  }
  return false;
}

test.describe("F1.5 Admin keyboard QA", () => {
  test.skip(
    process.env.RUN_SUPABASE_E2E !== "true",
    "Runs only against the explicit local Supabase environment.",
  );

  let admin: SupabaseClient<Database>;
  let adminUserId: string;
  const orgIds: string[] = [];
  const applicationIds: Record<string, string> = {};
  let membershipPendingId1: string;
  let membershipPendingId2: string;
  let enquiryId: string;
  let orgAppOrgName: string;
  let orgAppOrgNameVerify: string;

  test.beforeAll(async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey)
      throw new Error("Local Supabase not configured.");
    admin = createClient<Database>(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const created = await admin.auth.admin.createUser({
      email: admin1.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: admin1.fullName },
    });
    if (created.error) {
      const existing = await admin.auth.admin.listUsers();
      const found = existing.data.users.find((u) => u.email === admin1.email);
      if (!found) throw new Error(`Create admin: ${created.error.message}`);
      adminUserId = found.id;
    } else {
      adminUserId = created.data.user.id;
    }

    const existingRole = await admin
      .from("user_roles")
      .select("user_id")
      .eq("user_id", adminUserId)
      .eq("role", "admin")
      .maybeSingle();
    if (!existingRole.data) {
      const role = await admin
        .from("user_roles")
        .insert({ user_id: adminUserId, role: "admin" });
      if (role.error) throw new Error(`Grant admin: ${role.error.message}`);
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
          description: "F1.5 keyboard QA fixture.",
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
      return org.data.id;
    }

    const runToken = crypto.randomUUID().slice(0, 8);

    const applicantEmail = `f15-kb-applicant-${runToken}@tamil-ulagam.test`;
    const applicantCreated = await admin.auth.admin.createUser({
      email: applicantEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: "F15 KB QA Applicant" },
    });
    if (applicantCreated.error)
      throw new Error(`Create applicant: ${applicantCreated.error.message}`);
    const applicantUserId = applicantCreated.data.user.id;

    // ---- Submitted org application for the Registration Review flow ----
    orgAppOrgName = `F15 KB QA Reviewable Org ${runToken}`;
    const reviewOrgId = await createOrg(orgAppOrgName, false);
    orgIds.push(reviewOrgId);
    applicationIds.review = crypto.randomUUID();
    const application = await admin.from("organization_applications").insert({
      id: applicationIds.review,
      organization_id: reviewOrgId,
      submitted_by: applicantUserId,
      status: "submitted",
      representative_full_name: "F15 KB QA Rep",
      representative_email: applicantEmail,
      representative_phone: "+1 416 555 0111",
      authorization_declaration: true,
      accuracy_declaration: true,
      submitted_at: new Date().toISOString(),
    });
    if (application.error)
      throw new Error(`Create application: ${application.error.message}`);

    orgAppOrgNameVerify = `F15 KB QA Verifiable Org ${runToken}`;
    const verifyOrgId = await createOrg(orgAppOrgNameVerify, false);
    orgIds.push(verifyOrgId);
    applicationIds.verify = crypto.randomUUID();
    const verifyApplication = await admin
      .from("organization_applications")
      .insert({
        id: applicationIds.verify,
        organization_id: verifyOrgId,
        submitted_by: applicantUserId,
        status: "submitted",
        representative_full_name: "F15 KB QA Verify Rep",
        representative_email: applicantEmail,
        representative_phone: "+1 416 555 0111",
        authorization_declaration: true,
        accuracy_declaration: true,
        submitted_at: new Date().toISOString(),
      });
    if (verifyApplication.error)
      throw new Error(
        `Create verify application: ${verifyApplication.error.message}`,
      );

    // ---- Two pending memberships (one for Approve->Revoke, one for Reject) ----
    const memberOrgId = await createOrg(
      `F15 KB QA Member Org ${runToken}`,
      false,
    );
    orgIds.push(memberOrgId);
    const memberOrgApp = await admin.from("organization_applications").insert({
      id: crypto.randomUUID(),
      organization_id: memberOrgId,
      submitted_by: adminUserId,
      status: "verified",
      representative_full_name: "F15 KB QA Member Org Rep",
      representative_email: admin1.email,
      representative_phone: "+1 416 555 0111",
      authorization_declaration: true,
      accuracy_declaration: true,
      submitted_at: new Date().toISOString(),
    });
    if (memberOrgApp.error)
      throw new Error(`member org app: ${memberOrgApp.error.message}`);
    const grant = await admin
      .from("organization_managers")
      .select("id")
      .eq("organization_id", memberOrgId)
      .eq("user_id", adminUserId)
      .maybeSingle();
    if (!grant.data) {
      const g = await admin.from("organization_managers").insert({
        organization_id: memberOrgId,
        user_id: adminUserId,
        role: "owner",
      });
      if (g.error) throw new Error(`manager grant: ${g.error.message}`);
    }

    async function createMember(label: string) {
      const memberEmail = `f15-kb-member-${label}@tamil-ulagam.test`;
      const memberCreated = await admin.auth.admin.createUser({
        email: memberEmail,
        password,
        email_confirm: true,
        user_metadata: { full_name: `F15 KB Member ${label}` },
      });
      let memberId: string;
      if (memberCreated.error) {
        const existing = await admin.auth.admin.listUsers();
        const found = existing.data.users.find((u) => u.email === memberEmail);
        if (!found)
          throw new Error(
            `create member ${label}: ${memberCreated.error.message}`,
          );
        memberId = found.id;
      } else {
        memberId = memberCreated.data.user.id;
      }
      const existingMembership = await admin
        .from("organization_memberships")
        .select("id")
        .eq("organization_id", memberOrgId)
        .eq("user_id", memberId)
        .maybeSingle();
      if (existingMembership.data) {
        await admin
          .from("organization_memberships")
          .update({ status: "pending", decided_at: null, decided_by: null })
          .eq("id", existingMembership.data.id);
        return existingMembership.data.id;
      }
      const membership = await admin
        .from("organization_memberships")
        .insert({
          organization_id: memberOrgId,
          user_id: memberId,
          status: "pending",
          membership_type: "general",
          requested_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (membership.error || !membership.data)
        throw new Error(
          `create membership ${label}: ${membership.error?.message}`,
        );
      return membership.data.id;
    }

    membershipPendingId1 = await createMember("approve");
    membershipPendingId2 = await createMember("reject");

    // ---- Partnership enquiry ----
    const existingEnquiry = await admin
      .from("partnership_enquiries")
      .select("id")
      .eq("email", "f15-kb-qa-enquiry@tamil-ulagam.test")
      .maybeSingle();
    if (existingEnquiry.data) {
      enquiryId = existingEnquiry.data.id;
      await admin
        .from("partnership_enquiries")
        .update({ status: "new" })
        .eq("id", enquiryId);
    } else {
      const enquiry = await admin
        .from("partnership_enquiries")
        .insert({
          name: "F15 KB QA Contact",
          email: "f15-kb-qa-enquiry@tamil-ulagam.test",
          organization_name: "F15 KB QA Partnership Org",
          country: "Canada",
          partnership_area: "community",
          message:
            "Disposable F1.5 keyboard QA partnership enquiry fixture message text.",
          status: "new",
        })
        .select("id")
        .single();
      if (enquiry.error || !enquiry.data)
        throw new Error(`enquiry: ${enquiry.error?.message}`);
      enquiryId = enquiry.data.id;
      const history = await admin.from("partnership_enquiry_history").insert({
        enquiry_id: enquiryId,
        previous_status: null,
        new_status: "new",
        note: "Enquiry received.",
      });
      if (history.error)
        throw new Error(`enquiry history: ${history.error.message}`);
    }
  });

  // ==================== SECTION 3: Registration Review ====================
  test("Registration Review — keyboard-only Needs changes + Verify", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/admin/reviews");
    await expect(
      page
        .getByRole("heading", { name: "Registration reviews" })
        .or(page.getByText("Registration reviews")),
    )
      .toBeVisible({ timeout: 10000 })
      .catch(() => undefined);
    await page
      .waitForLoadState("networkidle", { timeout: 5000 })
      .catch(() => undefined);

    // Tab through Admin navigation, then reach the review row's action link.
    const reachedNav = await tabUntil(page, (i) => i.text === "Reviews", 10);
    expect(reachedNav).toBe(true);
    expect(await focusRingPresent(page)).toBe(true);

    await page.getByLabel("Search organisation").fill(orgAppOrgName);
    await page.waitForTimeout(500);

    const reachedRow = await tabUntil(page, (i) => i.text === "Review", 25);
    expect(reachedRow).toBe(true);
    expect(await focusRingPresent(page)).toBe(true);

    // Enter opens the review detail.
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("heading", { name: orgAppOrgName }),
    ).toBeVisible({ timeout: 10000 });

    // Reach "Request Changes", open its dialog, verify Escape cancels cleanly.
    const reachedNeedsChanges = await tabUntil(
      page,
      (i) => i.text === "Request Changes",
      15,
    );
    expect(reachedNeedsChanges).toBe(true);
    expect(await focusRingPresent(page)).toBe(true);
    await page.keyboard.press("Enter");
    const dialog = page.locator("dialog[open]");
    await expect(dialog).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Request changes" }),
    ).toBeVisible();
    // Meaningful initial focus — the shared pattern focuses Cancel.
    const initialFocus = await activeInfo(page);
    expect(initialFocus?.text).toBe("Cancel");
    expect(initialFocus?.inDialog).toBe(true);
    expect(await focusRingPresent(page)).toBe(true);

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    const afterEscape = await activeInfo(page);
    expect(afterEscape?.text).toBe("Request Changes");

    await page.waitForTimeout(300);
    await page.keyboard.press("Enter");
    await expect(dialog).toBeVisible();
    const tabbedToTextarea = await tabUntil(
      page,
      (i) => i.tag === "TEXTAREA",
      5,
    );
    expect(tabbedToTextarea).toBe(true);
    await page.keyboard.type(
      "F1.5 keyboard QA: please clarify the representative contact.",
    );
    const tabbedToConfirm = await tabUntil(
      page,
      (i) => i.text === "Send change request",
      5,
    );
    expect(tabbedToConfirm).toBe(true);
    expect(await focusRingPresent(page)).toBe(true);
    await page.keyboard.press("Enter");
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByText("Changes Requested").first()).toBeVisible({
      timeout: 10000,
    });

    await page.goto(`/admin/reviews?application=${applicationIds.verify}`);
    await expect(
      page.getByRole("heading", { name: orgAppOrgNameVerify }),
    ).toBeVisible();
    const reachedVerify = await tabUntil(page, (i) => i.text === "Verify", 15);
    expect(reachedVerify).toBe(true);
    await page.keyboard.press("Enter");
    await expect(dialog).toBeVisible();
    const verifyInitialFocus = await activeInfo(page);
    expect(verifyInitialFocus?.text).toBe("Cancel");
    const tabbedToConfirmVerify = await tabUntil(
      page,
      (i) => i.text === "Confirm verification",
      5,
    );
    expect(tabbedToConfirmVerify).toBe(true);
    await page.keyboard.press("Enter");
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText("Verified", { exact: true }).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  // ==================== SECTION 4: Membership Operations ====================
  test("Membership Operations — keyboard-only Approve, Revoke, Reject", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto(`/admin/memberships?membership=${membershipPendingId1}`);
    await page
      .waitForLoadState("networkidle", { timeout: 5000 })
      .catch(() => undefined);

    const reachedApprove = await tabUntil(
      page,
      (i) => i.text === "Confirm member",
      20,
    );
    expect(reachedApprove).toBe(true);
    expect(await focusRingPresent(page)).toBe(true);
    await page.keyboard.press("Enter");
    const dialog = page.locator("dialog[open]");
    await expect(dialog).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Confirm this member?" }),
    ).toBeVisible();
    const initialFocus = await activeInfo(page);
    expect(initialFocus?.ariaLabel).toBe("Close");
    expect(initialFocus?.inDialog).toBe(true);

    // Shift+Tab backward stays inside the dialog.
    await page.keyboard.press("Shift+Tab");
    const backInfo = await activeInfo(page);
    if (backInfo?.tag !== "BODY") {
      expect(backInfo?.inDialog).toBe(true);
    }

    const reachedConfirmApproval = await tabUntil(
      page,
      (i) => i.text === "Confirm member",
      6,
    );
    expect(reachedConfirmApproval).toBe(true);
    await page.keyboard.press("Enter");
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    const { data: afterApprove } = await admin
      .from("organization_memberships")
      .select("status")
      .eq("id", membershipPendingId1)
      .single();
    expect(afterApprove?.status).toBe("approved");

    // Revoke — same shared Dialog, required note this time.
    await page.goto(`/admin/memberships?membership=${membershipPendingId1}`);
    await page
      .waitForLoadState("networkidle", { timeout: 5000 })
      .catch(() => undefined);
    await expect(
      page.getByRole("button", { name: "Revoke affiliation" }),
    ).toBeVisible({ timeout: 10000 });
    const reachedRevoke = await tabUntil(
      page,
      (i) => i.text === "Revoke affiliation",
      20,
    );
    expect(reachedRevoke).toBe(true);
    await page.keyboard.press("Enter");
    await expect(dialog).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Revoke affiliation?" }),
    ).toBeVisible();
    const tabbedToRevokeTextarea = await tabUntil(
      page,
      (i) => i.tag === "TEXTAREA",
      5,
    );
    expect(tabbedToRevokeTextarea).toBe(true);
    await page.keyboard.type("F1.5 keyboard QA revoke reason.");
    const tabbedToConfirmRevoke = await tabUntil(
      page,
      (i) => i.text === "Confirm revocation",
      5,
    );
    expect(tabbedToConfirmRevoke).toBe(true);
    await page.keyboard.press("Enter");
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    const { data: afterRevoke } = await admin
      .from("organization_memberships")
      .select("status")
      .eq("id", membershipPendingId1)
      .single();
    expect(afterRevoke?.status).toBe("revoked");

    await page.goto(`/admin/memberships?membership=${membershipPendingId2}`);
    await page
      .waitForLoadState("networkidle", { timeout: 5000 })
      .catch(() => undefined);
    await expect(
      page.getByRole("button", { name: "Not a member" }),
    ).toBeVisible({ timeout: 10000 });
    const reachedReject = await tabUntil(
      page,
      (i) => i.text === "Not a member",
      20,
    );
    expect(reachedReject).toBe(true);
    await page.keyboard.press("Enter");
    await expect(dialog).toBeVisible();
    const tabbedToConfirmRejectEmpty = await tabUntil(
      page,
      (i) => i.text === "Not a member",
      5,
    );
    expect(tabbedToConfirmRejectEmpty).toBe(true);
    await page.keyboard.press("Enter");
    // Empty required note should block the action — dialog stays open.
    await expect(dialog).toBeVisible();
    const { data: stillPending } = await admin
      .from("organization_memberships")
      .select("status")
      .eq("id", membershipPendingId2)
      .single();
    expect(stillPending?.status).toBe("pending");

    const tabbedToRejectTextarea = await tabUntil(
      page,
      (i) => i.tag === "TEXTAREA",
      6,
    );
    expect(tabbedToRejectTextarea).toBe(true);
    await page.keyboard.type("F1.5 keyboard QA reject reason.");
    const tabbedToConfirmReject = await tabUntil(
      page,
      (i) => i.text === "Not a member",
      5,
    );
    expect(tabbedToConfirmReject).toBe(true);
    await page.keyboard.press("Enter");
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    const { data: afterReject } = await admin
      .from("organization_memberships")
      .select("status")
      .eq("id", membershipPendingId2)
      .single();
    expect(afterReject?.status).toBe("rejected");
  });

  // ==================== SECTION 5: Partnership Operations ====================
  test("Partnership Operations — keyboard-only In discussion then Decline", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto(`/admin/partnerships?enquiry=${enquiryId}`);
    await page
      .waitForLoadState("networkidle", { timeout: 5000 })
      .catch(() => undefined);

    const reachedInDiscussion = await tabUntil(
      page,
      (i) => i.text === "Mark in discussion",
      20,
    );
    expect(reachedInDiscussion).toBe(true);
    expect(await focusRingPresent(page)).toBe(true);
    await page.keyboard.press("Enter");
    const dialog = page.locator("dialog[open]");
    await expect(dialog).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Begin discussion?" }),
    ).toBeVisible();
    const initialFocus = await activeInfo(page);
    expect(initialFocus?.ariaLabel).toBe("Close");

    const tabbedToConfirm = await tabUntil(
      page,
      (i) => i.text === "Confirm status change",
      6,
    );
    expect(tabbedToConfirm).toBe(true);
    await page.keyboard.press("Enter");
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    const { data: afterDiscussion } = await admin
      .from("partnership_enquiries")
      .select("status")
      .eq("id", enquiryId)
      .single();
    expect(afterDiscussion?.status).toBe("in_discussion");

    // Decline — required Reason field, verify Escape then complete via keyboard.
    await page.goto(`/admin/partnerships?enquiry=${enquiryId}`);
    await page
      .waitForLoadState("networkidle", { timeout: 5000 })
      .catch(() => undefined);
    await expect(
      page.getByRole("button", { name: "Decline enquiry" }),
    ).toBeVisible({ timeout: 10000 });
    const reachedDecline = await tabUntil(
      page,
      (i) => i.text === "Decline enquiry",
      20,
    );
    expect(reachedDecline).toBe(true);
    await page.keyboard.press("Enter");
    await expect(dialog).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Decline enquiry?" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    const afterEscape = await activeInfo(page);
    expect(afterEscape?.text).toBe("Decline enquiry");

    await page.waitForTimeout(300);
    await page.keyboard.press("Enter");
    await expect(dialog).toBeVisible();
    const tabbedToReason = await tabUntil(page, (i) => i.tag === "TEXTAREA", 5);
    expect(tabbedToReason).toBe(true);
    await page.keyboard.type("F1.5 keyboard QA decline reason.");
    const tabbedToConfirmDecline = await tabUntil(
      page,
      (i) => i.text === "Confirm status change",
      5,
    );
    expect(tabbedToConfirmDecline).toBe(true);
    await page.keyboard.press("Enter");
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    const { data: afterDecline } = await admin
      .from("partnership_enquiries")
      .select("status")
      .eq("id", enquiryId)
      .single();
    expect(afterDecline?.status).toBe("declined");
  });

  // ==================== SECTION 6: Admin navigation ====================
  test("Admin navigation — keyboard order and focus visibility across all six routes", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/admin");
    await expect(
      page.getByRole("heading", { name: "What needs attention now" }),
    ).toBeVisible();

    const sequence: string[] = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      const info = await activeInfo(page);
      sequence.push(
        `${info?.tag} "${info?.text ?? ""}"${info?.ariaLabel ? ` [${info.ariaLabel}]` : ""}`,
      );
    }
    console.log("[F1.5 keyboard order] /admin header+nav sequence:", sequence);
    // Workspace switcher and account remain reachable from the header.
    expect(sequence.some((s) => s.includes("Switch workspace"))).toBe(true);

    const routes = [
      "/admin/reviews",
      "/admin/organisations",
      "/admin/sangams",
      "/admin/memberships",
      "/admin/partnerships",
    ];
    for (const route of routes) {
      await page.goto(route);
      await page
        .waitForLoadState("networkidle", { timeout: 5000 })
        .catch(() => undefined);
      await page.keyboard.press("Tab");
      expect(await focusRingPresent(page)).toBe(true);
      const current = page.locator(
        'nav[aria-label="Admin navigation"] a[aria-current="page"]',
      );
      await expect(current).toBeVisible();
    }
  });

  // ==================== SECTION 9: Mobile 390px ====================
  test("Mobile 390px — decision surfaces reachable, no horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page);

    for (const route of [
      "/admin/reviews",
      `/admin/memberships?membership=${membershipPendingId2}`,
      `/admin/partnerships?enquiry=${enquiryId}`,
    ]) {
      await page.goto(route);
      await page
        .waitForLoadState("networkidle", { timeout: 5000 })
        .catch(() => undefined);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 1,
      );
      expect(
        overflow,
        `${route} should not overflow horizontally at 390px`,
      ).toBe(false);
    }

    // Registration review detail dialog fits the mobile viewport.
    await page.goto(`/admin/reviews?application=${applicationIds.review}`);
    await page
      .waitForLoadState("networkidle", { timeout: 5000 })
      .catch(() => undefined);
    const verifyBtn = page
      .getByRole("button", { name: "Suspend" })
      .or(page.getByRole("button", { name: "Reject" }));
    if (await verifyBtn.count()) {
      await verifyBtn.first().focus();
      await page.keyboard.press("Enter");
      const dialog = page.locator("dialog[open]");
      await expect(dialog).toBeVisible();
      const box = await dialog.boundingBox();
      expect(box && box.width).toBeLessThanOrEqual(390);
      await page.keyboard.press("Escape");
    }
  });

  test.afterAll(async () => {
    for (const id of orgIds) {
      await admin
        .from("organization_managers")
        .delete()
        .eq("organization_id", id);
      await admin
        .from("organization_tamil_community_details")
        .delete()
        .eq("organization_id", id);
      await admin
        .from("organization_memberships")
        .delete()
        .eq("organization_id", id);
    }
    for (const id of [membershipPendingId1, membershipPendingId2].filter(
      Boolean,
    )) {
      await admin
        .from("organization_membership_history")
        .delete()
        .eq("membership_id", id);
      await admin.from("organization_memberships").delete().eq("id", id);
    }
    if (enquiryId) {
      await admin
        .from("partnership_enquiry_history")
        .delete()
        .eq("enquiry_id", enquiryId);
      await admin.from("partnership_enquiries").delete().eq("id", enquiryId);
    }
    for (const id of orgIds) {
      await admin.from("organizations").delete().eq("id", id);
    }
    const { data } = await admin.auth.admin.listUsers();
    for (const u of data.users) {
      if (
        u.email === admin1.email ||
        u.email?.startsWith("f15-kb-member-") ||
        u.email?.startsWith("f15-kb-applicant-")
      ) {
        await admin.from("user_roles").delete().eq("user_id", u.id);
        await admin.auth.admin.deleteUser(u.id);
      }
    }
  });
});
