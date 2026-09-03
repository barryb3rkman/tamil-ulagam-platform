import { expect, test, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../src/lib/supabase/database.types";

const password = "LocalBrowserSecurity!2048Aa";

async function signIn(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

async function fillProfile(page: Page, fullName: string) {
  await page.goto("/join/member");
  await page.getByText("Your details").waitFor({ timeout: 15000 });
  await page.getByLabel("Full name").fill(fullName);
  await page.getByLabel("Mobile number").fill("+1 416 555 0100");
  await page.getByLabel("Country").fill("Canada");
  await page.getByLabel(/State \/ Province \/ Region/).fill("Ontario");
  await page.getByLabel("City").fill("Toronto");
  await page.getByRole("button", { name: "Continue" }).click();
}

test.describe("local Supabase Member affiliation — security & category-question personas", () => {
  test.skip(
    process.env.RUN_SUPABASE_E2E !== "true",
    "Runs only against the explicit local Supabase environment.",
  );

  let admin: SupabaseClient<Database>;
  let educationOrgId: string;
  let educationOrgName: string;
  let unrelatedOrgId: string;
  let unrelatedOrgName: string;

  test.beforeAll(async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      throw new Error("Local Supabase setup is not configured.");
    }
    admin = createClient<Database>(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    async function createVerifiedOrg(
      name: string,
      category: Database["public"]["Enums"]["organization_category"],
      ownerEmail: string,
      ownerName: string,
    ) {
      const owner = await admin.auth.admin.createUser({
        email: ownerEmail,
        password,
        email_confirm: true,
        user_metadata: { full_name: ownerName },
      });
      if (owner.error)
        throw new Error(`Create ${ownerEmail}: ${owner.error.message}`);

      const org = await admin
        .from("organizations")
        .insert({
          name,
          category,
          country: "Canada",
          region: "Ontario",
          city: "Toronto",
        })
        .select("id")
        .single();
      if (org.error || !org.data) {
        throw new Error(`Create ${name}: ${org.error?.message ?? "no data"}`);
      }
      const application = await admin.from("organization_applications").insert({
        organization_id: org.data.id,
        submitted_by: owner.data.user.id,
        status: "verified",
        submitted_at: new Date().toISOString(),
      });
      if (application.error) {
        throw new Error(`Application ${name}: ${application.error.message}`);
      }
      const grant = await admin.from("organization_managers").insert({
        organization_id: org.data.id,
        user_id: owner.data.user.id,
        role: "owner",
      });
      if (grant.error) throw new Error(`Grant ${name}: ${grant.error.message}`);
      return org.data.id;
    }

    educationOrgName = "Local Browser Security Education Org";
    educationOrgId = await createVerifiedOrg(
      educationOrgName,
      "education",
      "local-security-education-manager@tamil-ulagam.test",
      "Local Education Manager",
    );

    unrelatedOrgName = "Local Browser Security Unrelated Org";
    unrelatedOrgId = await createVerifiedOrg(
      unrelatedOrgName,
      "business",
      "local-security-unrelated-manager@tamil-ulagam.test",
      "Local Unrelated Manager",
    );

    const memberB = await admin.auth.admin.createUser({
      email: "local-security-member-b@tamil-ulagam.test",
      password,
      email_confirm: true,
      user_metadata: { full_name: "Local Security Member B" },
    });
    if (memberB.error)
      throw new Error(`Create member B: ${memberB.error.message}`);

    const memberC = await admin.auth.admin.createUser({
      email: "local-security-member-c@tamil-ulagam.test",
      password,
      email_confirm: true,
      user_metadata: { full_name: "Local Security Member C" },
    });
    if (memberC.error)
      throw new Error(`Create member C: ${memberC.error.message}`);
  });

  test("Persona B — Organisation member: the category-aware connection question is asked and required", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await signIn(page, "local-security-member-b@tamil-ulagam.test");
    await fillProfile(page, "Local Security Member B");

    await expect(
      page.getByText("Where are you already a member?"),
    ).toBeVisible();
    await page.getByRole("button", { name: /^Organisation/ }).click();

    await expect(
      page.getByRole("heading", { name: "Find your Organisation" }),
    ).toBeVisible();
    await page
      .getByLabel("Category", { exact: true })
      .selectOption("education");
    await expect(page.getByText(educationOrgName)).toBeVisible();
    await page.getByRole("button", { name: "Select" }).click();

    await expect(page.getByText("Confirm your affiliation")).toBeVisible();
    await expect(
      page.getByText("Your connection to this organisation"),
    ).toBeVisible();

    // Required — submitting without an answer is blocked.
    await page.getByRole("button", { name: "Submit affiliation" }).click();
    await expect(
      page.getByText("Select the option that best describes you."),
    ).toBeVisible();

    await page.getByRole("radio", { name: "Student" }).check();
    await page.getByLabel("Course / field of study").fill("Tamil Literature");
    await page.getByRole("button", { name: "Submit affiliation" }).click();
    await expect(
      page.getByRole("heading", { name: "Affiliation submitted" }),
    ).toBeVisible();

    const membership = await admin
      .from("organization_memberships")
      .select("connection_type, connection_context")
      .eq("organization_id", educationOrgId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    expect(membership.data).toMatchObject({
      connection_type: "Student",
      connection_context: "Tamil Literature",
    });
  });

  test("Persona C — rejection: 'Not a member' shows a restrained, non-accusatory state in the Member Workspace", async ({
    browser,
  }) => {
    test.setTimeout(60_000);
    const memberContext = await browser.newContext();
    const memberPage = await memberContext.newPage();
    const managerContext = await browser.newContext();
    const managerPage = await managerContext.newPage();

    try {
      await signIn(memberPage, "local-security-member-c@tamil-ulagam.test");
      await fillProfile(memberPage, "Local Security Member C");
      await memberPage.getByRole("button", { name: /^Organisation/ }).click();
      await memberPage
        .getByLabel("Search", { exact: true })
        .fill("Local Browser Security Unrelated");
      await memberPage.getByRole("button", { name: "Select" }).click();
      await expect(
        memberPage.getByText("Confirm your affiliation"),
      ).toBeVisible();
      await memberPage
        .getByRole("radio", { name: "Business owner / Founder" })
        .check();
      await memberPage
        .getByRole("button", { name: "Submit affiliation" })
        .click();
      await expect(
        memberPage.getByRole("heading", { name: "Affiliation submitted" }),
      ).toBeVisible();

      await signIn(
        managerPage,
        "local-security-unrelated-manager@tamil-ulagam.test",
      );
      await managerPage.goto(
        `/workspace/organisation/people?organization=${unrelatedOrgId}`,
      );
      await expect(
        managerPage.getByText("Local Security Member C"),
      ).toBeVisible();
      await managerPage.getByRole("button", { name: "Not a member" }).click();
      await expect(managerPage.getByText("Not confirmed")).toBeVisible();

      await memberPage.goto("/workspace/member");
      await expect(
        memberPage.getByText(
          "This organisation could not confirm your membership.",
        ),
      ).toBeVisible();
      // Restrained, not accusatory — no "rejected"/"denied" language.
      await expect(memberPage.getByText(/denied|accus/i)).toHaveCount(0);
    } finally {
      await memberContext.close();
      await managerContext.close();
    }
  });

  test("Persona D — cross-tenant: an unrelated organisation's manager never sees another organisation's pending affiliations", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await signIn(page, "local-security-unrelated-manager@tamil-ulagam.test");
    await page.goto(
      `/workspace/organisation/people?organization=${unrelatedOrgId}`,
    );
    await expect(
      page.getByRole("heading", { name: unrelatedOrgName, exact: true }),
    ).toBeVisible();
    await expect(page.getByText(educationOrgName)).toHaveCount(0);

    await page.goto(
      `/workspace/organisation/people?organization=${educationOrgId}`,
    );
    await expect(
      page.getByText("You don't manage this organisation"),
    ).toBeVisible();
  });
});
