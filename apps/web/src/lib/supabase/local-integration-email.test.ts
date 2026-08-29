// @vitest-environment node

import {
  createClient,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";

import type { Database } from "./database.types";

// Same skip/run convention as every other local-integration-*.test.ts
// file, run by the same `pnpm test:supabase` script. Phase H5 — the
// organisation-email verification RPCs (issue_organization_email_
// verification_token / verify_organization_email) predate H5 but had no
// integration coverage at all until now; the email-change invalidation
// trigger and the email_deliveries idempotency constraint are new in H5.
// Edge Function HTTP behaviour itself is out of scope here — these RPCs
// are the actual security boundary the Edge Functions merely front (see
// docs/operations/resend-email.md for the full test-layer rationale).
const localDescribe =
  process.env.RUN_SUPABASE_INTEGRATION === "true"
    ? describe.sequential
    : describe.skip;

const password = "LocalTest!2048Aa";

interface TestActor {
  readonly user: User;
  readonly email: string;
  readonly client: SupabaseClient<Database>;
}

function requireEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value)
    throw new Error(`${name} is required for local integration tests.`);
  return value;
}

function requireData<T>(value: T | null | undefined, context: string): T {
  if (value === null || value === undefined)
    throw new Error(`${context} returned no data.`);
  return value;
}

localDescribe("local Supabase Resend email infrastructure (Phase H5)", () => {
  let apiUrl = "";
  let anonKey = "";
  let admin: SupabaseClient<Database>;
  const actors = new Map<string, TestActor>();

  beforeAll(() => {
    apiUrl = requireEnvironment("SUPABASE_LOCAL_URL");
    anonKey = requireEnvironment("SUPABASE_LOCAL_ANON_KEY");
    admin = createClient<Database>(
      apiUrl,
      requireEnvironment("SUPABASE_LOCAL_SERVICE_ROLE_KEY"),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  });

  async function createActor(
    slug: string,
    fullName: string,
  ): Promise<TestActor> {
    const email = `local-email-${slug}@tamil-ulagam.test`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error) throw new Error(`Create ${slug}: ${error.message}`);

    const client = createClient<Database>(apiUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const signIn = await client.auth.signInWithPassword({ email, password });
    if (signIn.error)
      throw new Error(`Sign in ${slug}: ${signIn.error.message}`);

    const actor = {
      user: requireData(data.user, `Create ${slug}`),
      email,
      client,
    };
    actors.set(slug, actor);
    return actor;
  }

  function actor(slug: string): TestActor {
    return requireData(actors.get(slug), `Actor "${slug}"`);
  }

  async function createVerifiedOrg(name: string, ownerSlug: string) {
    const org = await admin
      .from("organizations")
      .insert({
        name,
        category: "business",
        country: "Canada",
        region: "Ontario",
        city: "Toronto",
        official_email: `official-${crypto.randomUUID().slice(0, 8)}@example.test`,
      })
      .select("id")
      .single();
    if (org.error || !org.data) throw new Error(`org: ${org.error?.message}`);
    const app = await admin.from("organization_applications").insert({
      organization_id: org.data.id,
      submitted_by: actor(ownerSlug).user.id,
      status: "verified",
      submitted_at: new Date().toISOString(),
    });
    if (app.error) throw new Error(`app: ${app.error.message}`);
    const grant = await admin.from("organization_managers").insert({
      organization_id: org.data.id,
      user_id: actor(ownerSlug).user.id,
      role: "owner",
    });
    if (grant.error) throw new Error(`grant: ${grant.error.message}`);
    return org.data.id;
  }

  // verify_organization_email is granted to anon/authenticated only, by
  // design (the person clicking an emailed link may have no session at
  // all) — never to service_role. Every call in this file goes through a
  // plain, session-less client, matching how the app itself calls it,
  // rather than the admin/service-role client used for direct table
  // setup elsewhere in these tests.
  function verifyOrganizationEmail(organizationId: string, rawToken: string) {
    const anonClient = createClient<Database>(apiUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    return anonClient.rpc("verify_organization_email", {
      target_organization_id: organizationId,
      raw_token: rawToken,
    });
  }

  it("changing official_email resets verified_at/sent_at and invalidates any outstanding unconsumed token", async () => {
    await createActor("owner-a", "Email Owner A");
    const orgId = await createVerifiedOrg("H5 Email Change Org", "owner-a");

    const rawToken = await admin.rpc(
      "issue_organization_email_verification_token",
      {
        target_organization_id: orgId,
      },
    );
    expect(rawToken.error).toBeNull();
    const token = requireData(rawToken.data, "issued token");

    const afterIssue = await admin
      .from("organizations")
      .select("official_email_verification_sent_at")
      .eq("id", orgId)
      .single();
    expect(afterIssue.data?.official_email_verification_sent_at).not.toBeNull();

    const verify = await verifyOrganizationEmail(orgId, token);
    expect(verify.error).toBeNull();
    expect(verify.data).toBe(true);

    const afterVerify = await admin
      .from("organizations")
      .select("official_email_verified_at")
      .eq("id", orgId)
      .single();
    expect(afterVerify.data?.official_email_verified_at).not.toBeNull();

    // Issue a SECOND, still-unconsumed token before changing the email —
    // proves the trigger invalidates outstanding tokens, not just the
    // already-consumed one above.
    const secondToken = await admin.rpc(
      "issue_organization_email_verification_token",
      { target_organization_id: orgId },
    );
    expect(secondToken.error).toBeNull();
    const stillUnconsumed = requireData(secondToken.data, "second token");

    const changeEmail = await admin
      .from("organizations")
      .update({ official_email: "changed@example.test" })
      .eq("id", orgId);
    expect(changeEmail.error).toBeNull();

    const afterChange = await admin
      .from("organizations")
      .select("official_email_verified_at, official_email_verification_sent_at")
      .eq("id", orgId)
      .single();
    expect(afterChange.data?.official_email_verified_at).toBeNull();
    expect(afterChange.data?.official_email_verification_sent_at).toBeNull();

    const replayAfterChange = await verifyOrganizationEmail(
      orgId,
      stillUnconsumed,
    );
    expect(replayAfterChange.error).toBeNull();
    expect(replayAfterChange.data).toBe(false);
  });

  it("a consumed token cannot be replayed", async () => {
    await createActor("owner-b", "Email Owner B");
    const orgId = await createVerifiedOrg("H5 Replay Org", "owner-b");

    const issued = await admin.rpc(
      "issue_organization_email_verification_token",
      {
        target_organization_id: orgId,
      },
    );
    const token = requireData(issued.data, "issued token");

    const first = await verifyOrganizationEmail(orgId, token);
    expect(first.data).toBe(true);

    const replay = await verifyOrganizationEmail(orgId, token);
    expect(replay.error).toBeNull();
    expect(replay.data).toBe(false);
  });

  it("an expired token fails with a clean false, not an error", async () => {
    await createActor("owner-c", "Email Owner C");
    const orgId = await createVerifiedOrg("H5 Expired Org", "owner-c");

    const issued = await admin.rpc(
      "issue_organization_email_verification_token",
      {
        target_organization_id: orgId,
      },
    );
    const token = requireData(issued.data, "issued token");

    const expire = await admin
      .from("organization_email_verifications")
      .update({ expires_at: new Date(Date.now() - 1000).toISOString() })
      .eq("organization_id", orgId);
    expect(expire.error).toBeNull();

    const attempt = await verifyOrganizationEmail(orgId, token);
    expect(attempt.error).toBeNull();
    expect(attempt.data).toBe(false);
  });

  it("verify_organization_email is callable by an anonymous (no-session) client — the emailed link may be opened without an active session", async () => {
    await createActor("owner-d", "Email Owner D");
    const orgId = await createVerifiedOrg("H5 Anon Verify Org", "owner-d");
    const issued = await admin.rpc(
      "issue_organization_email_verification_token",
      {
        target_organization_id: orgId,
      },
    );
    const token = requireData(issued.data, "issued token");

    const anonClient = createClient<Database>(apiUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const result = await anonClient.rpc("verify_organization_email", {
      target_organization_id: orgId,
      raw_token: token,
    });
    expect(result.error).toBeNull();
    expect(result.data).toBe(true);
  });

  it("a normal authenticated user cannot call issue_organization_email_verification_token directly — it is service_role-only", async () => {
    await createActor("owner-e", "Email Owner E");
    const orgId = await createVerifiedOrg("H5 Privileged Issue Org", "owner-e");

    const attempt = await actor("owner-e").client.rpc(
      "issue_organization_email_verification_token",
      { target_organization_id: orgId },
    );
    expect(attempt.error).not.toBeNull();
  });

  it("email_deliveries enforces one row per idempotency_key — a duplicate insert is rejected, not silently duplicated", async () => {
    const key = `test-idempotency-${crypto.randomUUID()}`;
    const first = await admin.from("email_deliveries").insert({
      event_type: "test_event",
      recipient_email: "someone@example.test",
      status: "pending",
      idempotency_key: key,
    });
    expect(first.error).toBeNull();

    const duplicate = await admin.from("email_deliveries").insert({
      event_type: "test_event",
      recipient_email: "someone@example.test",
      status: "pending",
      idempotency_key: key,
    });
    expect(duplicate.error).not.toBeNull();
    expect(duplicate.error?.code).toBe("23505");

    const rows = await admin
      .from("email_deliveries")
      .select("id", { count: "exact" })
      .eq("idempotency_key", key);
    expect(rows.count).toBe(1);
  });

  it("email_deliveries is completely unreachable from anon and authenticated clients — no policy grants either direction", async () => {
    await createActor("owner-f", "Email Owner F");
    const anonClient = createClient<Database>(apiUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const anonSelect = await anonClient.from("email_deliveries").select("id");
    expect(anonSelect.error).not.toBeNull();

    const userSelect = await actor("owner-f")
      .client.from("email_deliveries")
      .select("id");
    expect(userSelect.error).not.toBeNull();
  });
});
