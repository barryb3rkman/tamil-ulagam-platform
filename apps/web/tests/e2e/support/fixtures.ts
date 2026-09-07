import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../../src/lib/supabase/database.types";

/**
 * Clears the rows a gated suite is about to create, so it starts from a
 * known state whether or not the database was just reset.
 *
 * Without this the suites are only runnable through their entry point,
 * which resets the whole database first. Every organisation name in them
 * is a fixed constant, so a second run inserted a second row with the
 * same name and locators that match on it started resolving to two
 * elements. Re-running one spec to check a fix meant resetting
 * everything and waiting for the full suite.
 *
 * Order matters. organization_applications.submitted_by is ON DELETE
 * RESTRICT — deliberately, so production cannot lose who submitted a
 * registration — which means an account cannot be removed while one of
 * its applications survives. Organisations go first and take their
 * applications with them, and any organisation a fixture account
 * submitted for is swept up even when the suite never named it.
 * Everything else is ON DELETE CASCADE.
 */
export async function resetFixtures(
  admin: SupabaseClient<Database>,
  fixtures: {
    readonly organisationNames?: readonly string[];
    readonly userEmails?: readonly string[];
    /** Enquiries are submitted through the public form, so they belong to
     * no fixture account and survive every other deletion here. */
    readonly enquiryEmails?: readonly string[];
  },
): Promise<void> {
  const {
    organisationNames = [],
    userEmails = [],
    enquiryEmails = [],
  } = fixtures;

  if (enquiryEmails.length > 0) {
    const { error } = await admin
      .from("partnership_enquiries")
      .delete()
      .in("email", [...enquiryEmails]);
    if (error) {
      throw new Error(`Reset fixture enquiries: ${error.message}`);
    }
  }

  if (organisationNames.length > 0) {
    const { error } = await admin
      .from("organizations")
      .delete()
      .in("name", [...organisationNames]);
    if (error) {
      throw new Error(`Reset fixture organisations: ${error.message}`);
    }
  }

  if (userEmails.length > 0) {
    const wanted = new Set(userEmails);
    const doomed: string[] = [];
    // listUsers is paged; a long-lived local database accumulates enough
    // accounts to push a fixture past the first page.
    for (let page = 1; page <= 20; page += 1) {
      const { data, error } = await admin.auth.admin.listUsers({
        page,
        perPage: 200,
      });
      if (error) throw new Error(`List users: ${error.message}`);
      if (data.users.length === 0) break;
      for (const user of data.users) {
        if (user.email && wanted.has(user.email)) doomed.push(user.id);
      }
      if (data.users.length < 200) break;
    }

    if (doomed.length > 0) {
      const submitted = await admin
        .from("organization_applications")
        .select("organization_id")
        .in("submitted_by", doomed);
      if (submitted.error) {
        throw new Error(
          `Read fixture applications: ${submitted.error.message}`,
        );
      }
      const owned = [
        ...new Set((submitted.data ?? []).map((row) => row.organization_id)),
      ];
      if (owned.length > 0) {
        const { error } = await admin
          .from("organizations")
          .delete()
          .in("id", owned);
        if (error) {
          throw new Error(`Delete fixture organisations: ${error.message}`);
        }
      }

      for (const id of doomed) {
        const removed = await admin.auth.admin.deleteUser(id);
        if (removed.error) {
          throw new Error(`Delete fixture account: ${removed.error.message}`);
        }
      }
    }
  }
}

/**
 * Creates a fixture account and returns its id, tolerating one that is
 * already there. Pair it with resetFixtures when a suite needs the
 * account to be genuinely new.
 */
export async function ensureFixtureUser(
  admin: SupabaseClient<Database>,
  account: {
    readonly email: string;
    readonly password: string;
    readonly fullName: string;
  },
): Promise<string> {
  const created = await admin.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    user_metadata: { full_name: account.fullName },
  });
  if (!created.error && created.data.user) return created.data.user.id;

  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = data.users.find((user) => user.email === account.email);
  if (!existing) {
    throw new Error(
      `Create ${account.email}: ${created.error?.message ?? "no user returned"}`,
    );
  }
  return existing.id;
}
