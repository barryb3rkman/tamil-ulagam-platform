import { expect, test, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../src/lib/supabase/database.types";

const password = "LocalAuthHeader!2048Aa";

const users = {
  orgManager: {
    email: "local-auth-header-org-manager@tamil-ulagam.test",
    fullName: "Local Header Org Manager",
  },
  admin: {
    email: "local-auth-header-admin@tamil-ulagam.test",
    fullName: "Local Header Admin",
  },
} as const;

const desktopViewport = { width: 1440, height: 1000 };

async function signIn(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

test.describe("public SiteHeader auth-awareness", () => {
  test.skip(
    process.env.RUN_SUPABASE_E2E !== "true",
    "Runs only against the explicit local Supabase environment.",
  );

  let admin: SupabaseClient<Database>;
  const userIds: Record<string, string> = {};

  test.beforeAll(async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      throw new Error("Local Supabase setup is not configured.");
    }
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
          (user) => user.email === fixture.email,
        );
        if (!found) throw new Error(`Create ${key}: ${created.error.message}`);
        userIds[key] = found.id;
        continue;
      }
      userIds[key] = created.data.user.id;
    }

    const grant = await admin.from("user_roles").insert({
      user_id: userIds.admin!,
      role: "admin",
    });
    if (grant.error && !grant.error.message.includes("duplicate")) {
      throw new Error(`Grant admin role: ${grant.error.message}`);
    }
  });

  test("a logged-out visitor sees Login and Join Tamil Ulagam", async ({
    page,
  }) => {
    await page.setViewportSize(desktopViewport);
    await page.goto("/");
    const header = page.getByRole("banner");
    await expect(header.getByRole("link", { name: "Log in" })).toBeVisible();
    await expect(
      header.getByRole("link", { name: "Join Tamil Ulagam" }),
    ).toBeVisible();
    await expect(
      header.getByRole("link", { name: "Open workspace" }),
    ).toHaveCount(0);
  });

  test("a signed-in visitor never sees Login on a public page — sees Open workspace and Account instead, with no flash", async ({
    page,
  }) => {
    await page.setViewportSize(desktopViewport);
    await signIn(page, users.orgManager.email);

    await page.goto("/partners");
    const header = page.getByRole("banner");
    await expect(
      header.getByRole("link", { name: "Open workspace" }),
    ).toBeVisible();
    await expect(header.getByRole("link", { name: "Log in" })).toHaveCount(0);
    await expect(header.getByText(users.orgManager.fullName)).toBeVisible();

    await page.reload();
    await expect(
      header.getByRole("link", { name: "Open workspace" }),
    ).toBeVisible();
    await expect(header.getByRole("link", { name: "Log in" })).toHaveCount(0);
  });

  test("Open workspace and Account both lead somewhere real, and sign out returns to the logged-out header", async ({
    page,
  }) => {
    await page.setViewportSize(desktopViewport);
    await signIn(page, users.orgManager.email);
    await page.goto("/");
    const header = page.getByRole("banner");

    await header.getByRole("link", { name: users.orgManager.fullName }).click();
    await expect(page).toHaveURL(/\/dashboard\/account\/?$/);

    await page.goto("/");
    await header.getByRole("link", { name: "Open workspace" }).click();
    await expect(page).toHaveURL(/\/workspace\/member\/?$/);

    await page.getByRole("button", { name: "Sign out" }).click();
    await page.waitForURL(/\/login\/?$/);
    await page.goto("/");
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Log in" }),
    ).toBeVisible();
  });

  test("Federation Admin has no direct link in the public header, even for an admin — Admin access lives in the authenticated switcher only", async ({
    page,
  }) => {
    await page.setViewportSize(desktopViewport);
    await signIn(page, users.admin.email);
    await page.goto("/");
    const header = page.getByRole("banner");

    await expect(
      header.getByRole("link", { name: /Federation Admin/i }),
    ).toHaveCount(0);
    await expect(
      header.getByRole("link", { name: "Open workspace" }),
    ).toBeVisible();

    // Admin access is real once inside the authenticated shell.
    await header.getByRole("link", { name: "Open workspace" }).click();
    await page.getByRole("button", { name: "Switch workspace" }).click();
    await expect(
      page.getByRole("link", { name: /Federation Admin/i }),
    ).toBeVisible();
  });
});
