import { expect, test, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../src/lib/supabase/database.types";

/**
 * Phase H3 (Tamil Sangam registration V2) — the real registration
 * document upload, its "formally registered = Yes" conditional
 * requirement, and the storage RLS security matrix (brief sections
 * 9-15, 34-35, 39, 43): applicant A cannot access applicant B's
 * document, an unrelated authenticated user cannot access it, an
 * anonymous caller cannot access it, and a reviewer can. Storage access
 * is asserted directly against the Supabase Storage API per persona
 * (not just through the UI) — the only way to actually prove the RLS
 * policy, not merely that the UI happens not to offer a button for it.
 */

const BUCKET = "sangam-registration-documents";

const applicantA = {
  fullName: "Registered Sangam Applicant A",
  email: "local-sangam-doc-applicant-a@tamil-ulagam.test",
  password: "LocalSangamDocA!2048Aa",
} as const;

const applicantB = {
  fullName: "Registered Sangam Applicant B",
  email: "local-sangam-doc-applicant-b@tamil-ulagam.test",
  password: "LocalSangamDocB!2048Aa",
} as const;

const unrelatedUser = {
  fullName: "Unrelated Authenticated User",
  email: "local-sangam-doc-unrelated@tamil-ulagam.test",
  password: "LocalSangamDocUnrelated!2048Aa",
} as const;

const reviewer = {
  fullName: "Local Sangam Doc Review Officer",
  email: "local-sangam-doc-reviewer@tamil-ulagam.test",
  password: "LocalSangamDocReviewer!2048Aa",
} as const;

const sangamName = "Local Browser Registered Coastal Sangam";

async function signUp(
  page: Page,
  actor: { fullName: string; email: string; password: string },
) {
  await page.goto("/signup");
  await page.getByLabel("Full name").fill(actor.fullName);
  await page.getByLabel("Email address").fill(actor.email);
  await page.locator('input[type="password"]').first().fill(actor.password);
  await page.getByLabel("Confirm password").fill(actor.password);
  await page.getByRole("checkbox", { name: /Terms of Use/ }).check();
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(
    page.getByRole("heading", { name: "Account created" }),
  ).toBeVisible();
}

test.describe("local Supabase Sangam registration document upload & security", () => {
  test.skip(
    process.env.RUN_SUPABASE_E2E !== "true",
    "Runs only against the explicit local Supabase environment.",
  );

  let admin: SupabaseClient<Database>;
  let apiUrl = "";
  let anonKey = "";

  test.beforeAll(async () => {
    apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
    const serviceRoleKey = process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY;
    if (!apiUrl || !anonKey || !serviceRoleKey) {
      throw new Error("Local Supabase setup is not configured.");
    }
    admin = createClient(apiUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    for (const actor of [unrelatedUser, reviewer]) {
      const created = await admin.auth.admin.createUser({
        email: actor.email,
        password: actor.password,
        email_confirm: true,
        user_metadata: { full_name: actor.fullName },
      });
      if (created.error)
        throw new Error(`Create ${actor.email}: ${created.error.message}`);
    }
    const reviewerUser = await admin.auth.admin.listUsers();
    const reviewerRecord = reviewerUser.data.users.find(
      (u) => u.email === reviewer.email,
    );
    if (!reviewerRecord)
      throw new Error("Reviewer user not found after creation.");
    const role = await admin
      .from("user_roles")
      .insert({ user_id: reviewerRecord.id, role: "reviewer" });
    if (role.error)
      throw new Error(`Grant reviewer role: ${role.error.message}`);
  });

  test("registered = Yes requires a document, uploads/replaces/removes it correctly, persists across reload, and enforces the storage security matrix", async ({
    browser,
  }) => {
    test.setTimeout(180_000);

    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();

    try {
      await signUp(pageA, applicantA);
      await signUp(pageB, applicantB);

      // --- Applicant A: register a Sangam, choose "Yes" (registered) ---
      await pageA.goto("/join/sangam");
      await pageA.getByLabel(/Sangam name/).fill(sangamName);
      await pageA.getByLabel(/Year of commencement/).fill("2010");
      await pageA.getByLabel(/Approximate number of members/).fill("75");
      await pageA.getByLabel(/Country/).fill("Canada");
      await pageA.getByLabel(/State \/ Province \/ Region/).fill("Nova Scotia");
      await pageA.getByLabel(/City/).fill("Halifax");
      await pageA.getByRole("button", { name: "Continue" }).click();

      await expect(
        pageA.getByText("Is this Tamil Sangam formally registered?"),
      ).toBeVisible();
      await pageA.getByRole("radio", { name: "Yes" }).first().check();
      await expect(pageA.getByLabel(/Registration number/)).toBeVisible();

      // Continue without a document — must be blocked by validation.
      await pageA.getByLabel(/Registration number/).fill("NS-REG-88213");
      await pageA.getByRole("button", { name: "Continue" }).click();
      await expect(
        pageA.getByText("Upload the registration document."),
      ).toBeVisible();

      // Upload a real file through the real upload component.
      await pageA.locator('input[type="file"]').setInputFiles({
        name: "registration-certificate.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.4 test registration certificate"),
      });
      await expect(pageA.getByText("registration-certificate.pdf")).toBeVisible(
        { timeout: 15000 },
      );

      // Reload before continuing — document metadata must survive a hard
      // reload the same way every other field does (brief section 25).
      // The registration number itself is autosaved on a debounce, so
      // wait past that interval before reloading, the same convention
      // sangam-registration-lifecycle.spec.ts already established.
      await pageA.waitForTimeout(1300);
      await pageA.reload();
      await expect(pageA.getByLabel(/Registration number/)).toHaveValue(
        "NS-REG-88213",
      );
      await expect(
        pageA.getByText("registration-certificate.pdf"),
      ).toBeVisible();

      // Replace the document with a different file.
      await pageA.getByRole("button", { name: "Replace" }).click();
      await pageA.locator('input[type="file"]').setInputFiles({
        name: "replacement-certificate.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.4 replacement certificate"),
      });
      await expect(pageA.getByText("replacement-certificate.pdf")).toBeVisible({
        timeout: 15000,
      });
      await expect(pageA.getByText("registration-certificate.pdf")).toHaveCount(
        0,
      );

      await pageA.getByRole("button", { name: "Continue" }).click();

      // --- Stage 3 + submit ---
      await expect(
        pageA.getByText("Single Point of Contact (SPOC)"),
      ).toBeVisible();
      const [spocName, presidentName] = await pageA
        .getByLabel(/^Full name/)
        .all();
      const [spocEmail, presidentEmail] = await pageA
        .getByLabel(/^Email/)
        .all();
      const [spocPhone, presidentPhone] = await pageA
        .getByLabel(/^Phone/)
        .all();
      await spocName!.fill(applicantA.fullName);
      await spocEmail!.fill(applicantA.email);
      await spocPhone!.fill("+1 902 555 0166");
      await presidentName!.fill("Registered Sangam President");
      await presidentEmail!.fill("president@registered-sangam.example");
      await presidentPhone!.fill("+1 902 555 0177");
      await pageA
        .getByLabel(
          "I confirm that I am authorised to represent this Tamil Sangam and that the information provided is accurate.",
        )
        .check();
      await pageA.getByRole("button", { name: "Review & submit" }).click();

      await expect(
        pageA.getByRole("heading", {
          name: "Review your Sangam's registration",
        }),
      ).toBeVisible();
      await expect(
        pageA.getByText("replacement-certificate.pdf"),
      ).toBeVisible();

      // Resolve the actual storage path for the security assertions below.
      const orgLookup = await admin
        .from("organizations")
        .select("id")
        .eq("name", sangamName)
        .single();
      if (orgLookup.error) throw new Error(orgLookup.error.message);
      const details = await admin
        .from("organization_tamil_community_details")
        .select("registration_document_path")
        .eq("organization_id", orgLookup.data.id)
        .single();
      if (details.error) throw new Error(details.error.message);
      const documentPath = details.data.registration_document_path;
      expect(documentPath).toBeTruthy();
      // Deterministic ownership-scoped path (brief section 11): folder is
      // the application id, never the user-supplied filename.
      expect(documentPath).toMatch(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.pdf$/);

      await pageA.getByRole("button", { name: "Submit registration" }).click();
      await pageA.getByRole("button", { name: "Confirm submission" }).click();
      await expect(
        pageA.getByRole("heading", { name: "Registration submitted" }),
      ).toBeVisible();

      // ==================== SECURITY MATRIX ====================
      // Applicant B (an unrelated Sangam manager) cannot download A's
      // document.
      const clientB = createClient<Database>(apiUrl, anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const signInB = await clientB.auth.signInWithPassword({
        email: applicantB.email,
        password: applicantB.password,
      });
      if (signInB.error) throw new Error(signInB.error.message);
      const downloadB = await clientB.storage
        .from(BUCKET)
        .download(documentPath!);
      expect(downloadB.error).toBeTruthy();

      // An unrelated authenticated user (no Sangam management relationship
      // at all) cannot download it either.
      const clientUnrelated = createClient<Database>(apiUrl, anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const signInUnrelated = await clientUnrelated.auth.signInWithPassword({
        email: unrelatedUser.email,
        password: unrelatedUser.password,
      });
      if (signInUnrelated.error) throw new Error(signInUnrelated.error.message);
      const downloadUnrelated = await clientUnrelated.storage
        .from(BUCKET)
        .download(documentPath!);
      expect(downloadUnrelated.error).toBeTruthy();

      // An anonymous (unauthenticated) caller cannot download it.
      const clientAnon = createClient<Database>(apiUrl, anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const downloadAnon = await clientAnon.storage
        .from(BUCKET)
        .download(documentPath!);
      expect(downloadAnon.error).toBeTruthy();

      // The reviewer CAN download it — needed for review.
      const clientReviewer = createClient<Database>(apiUrl, anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const signInReviewer = await clientReviewer.auth.signInWithPassword({
        email: reviewer.email,
        password: reviewer.password,
      });
      if (signInReviewer.error) throw new Error(signInReviewer.error.message);
      const downloadReviewer = await clientReviewer.storage
        .from(BUCKET)
        .download(documentPath!);
      expect(downloadReviewer.error).toBeFalsy();
      expect(downloadReviewer.data).toBeTruthy();

      // Now that the application is submitted (locked), applicant A can
      // no longer replace/remove the document — the same lifecycle rule
      // every other editable field already follows.
      const clientA = createClient<Database>(apiUrl, anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const signInA = await clientA.auth.signInWithPassword({
        email: applicantA.email,
        password: applicantA.password,
      });
      if (signInA.error) throw new Error(signInA.error.message);
      const blockedRemove = await clientA.storage
        .from(BUCKET)
        .remove([documentPath!]);
      // RLS denies the delete outright — Supabase Storage's remove()
      // resolves without an error even when zero rows matched, so the
      // real assertion is that the object is still there afterward.
      void blockedRemove;
      const stillThere = await clientReviewer.storage
        .from(BUCKET)
        .download(documentPath!);
      expect(stillThere.error).toBeFalsy();
    } finally {
      await contextA.close();
      await contextB.close();
    }
  });

  test("registered = No never requires a registration document", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const applicant = {
      fullName: "Informal Sangam Applicant",
      email: "local-sangam-doc-informal@tamil-ulagam.test",
      password: "LocalSangamDocInformal!2048Aa",
    } as const;
    await signUp(page, applicant);

    await page.goto("/join/sangam");
    await page.getByLabel(/Sangam name/).fill("Local Browser Informal Sangam");
    await page.getByLabel(/Year of commencement/).fill("2012");
    await page.getByLabel(/Approximate number of members/).fill("40");
    await page.getByLabel(/Country/).fill("Canada");
    await page.getByLabel(/State \/ Province \/ Region/).fill("Ontario");
    await page.getByLabel(/City/).fill("Ottawa");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(
      page.getByText("Is this Tamil Sangam formally registered?"),
    ).toBeVisible();
    await page.getByRole("radio", { name: "No" }).first().check();
    expect(await page.getByLabel(/Registration number/).count()).toBe(0);
    expect(await page.getByText(/Upload registration document/).count()).toBe(
      0,
    );
    // Continue must succeed with no document at all.
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(
      page.getByText("Single Point of Contact (SPOC)"),
    ).toBeVisible();
  });
});
