// @vitest-environment node

import {
  createClient,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";

import type { Database } from "./database.types";

// Same skip/run convention as local-integration.test.ts /
// local-integration-membership.test.ts, run by the same `pnpm
// test:supabase` script. Kept in its own file (Phase D1: Tamil Sangam
// registration) rather than appended to either existing suite, matching
// the precedent both of those set for keeping each phase's domain
// independently runnable/reviewable.
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

localDescribe(
  "local Supabase Tamil Sangam registration security (Phase D1)",
  () => {
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
      const email = `local-sangam-${slug}@tamil-ulagam.test`;
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

    let sangamOrgId = "";
    let sangamApplicationId = "";

    it("ensure_sangam_application_draft creates a draft with subtype 'Tamil Sangam' set from the start", async () => {
      await createActor("founder", "Sangam Founder");
      const draft = await actor("founder").client.rpc(
        "ensure_sangam_application_draft",
      );
      expect(draft.error).toBeNull();
      const application = requireData(draft.data, "sangam draft");
      sangamOrgId = application.organization_id;
      sangamApplicationId = application.id;
      expect(application.status).toBe("draft");

      const details = await admin
        .from("organization_tamil_community_details")
        .select("subtype")
        .eq("organization_id", sangamOrgId)
        .single();
      expect(details.error).toBeNull();
      expect(details.data?.subtype).toBe("Tamil Sangam");

      const managerRow = await admin
        .from("organization_managers")
        .select("role")
        .eq("organization_id", sangamOrgId)
        .eq("user_id", actor("founder").user.id)
        .single();
      expect(managerRow.error).toBeNull();
      expect(managerRow.data?.role).toBe("owner");
    });

    it("is idempotent: a second call returns the same draft rather than creating another organisation", async () => {
      const second = await actor("founder").client.rpc(
        "ensure_sangam_application_draft",
      );
      expect(second.error).toBeNull();
      expect(requireData(second.data, "second draft").id).toBe(
        sangamApplicationId,
      );

      const orgCount = await admin
        .from("organizations")
        .select("id", { count: "exact", head: true })
        .eq("id", sangamOrgId);
      expect(orgCount.count).toBe(1);
    });

    it("an account that already manages a plain Organisation can independently register a Tamil Sangam, and the Organisation record is untouched", async () => {
      await createActor("dual", "Dual Registrant");
      const orgDraft = await actor("dual").client.rpc(
        "create_organization_application_draft",
        { initial_category: "business" },
      );
      expect(orgDraft.error).toBeNull();
      const orgId = requireData(orgDraft.data, "org draft").organization_id;

      const sangamDraft = await actor("dual").client.rpc(
        "ensure_sangam_application_draft",
      );
      expect(sangamDraft.error).toBeNull();
      const dualSangamOrgId = requireData(
        sangamDraft.data,
        "dual sangam draft",
      ).organization_id;

      expect(dualSangamOrgId).not.toBe(orgId);

      const orgStillDraft = await admin
        .from("organizations")
        .select("category")
        .eq("id", orgId)
        .single();
      expect(orgStillDraft.data?.category).toBe("business");

      const managerRows = await admin
        .from("organization_managers")
        .select("organization_id")
        .eq("user_id", actor("dual").user.id);
      expect(managerRows.data).toHaveLength(2);
    });

    it("a normal user cannot edit another account's Sangam", async () => {
      await createActor("intruder", "Intruder");
      const attempt = await actor("intruder")
        .client.from("organizations")
        .update({ name: "Hijacked Sangam" })
        .eq("id", sangamOrgId)
        .select("id");
      expect(attempt.error).toBeNull();
      // RLS silently returns zero affected rows rather than an error — the
      // organisation's own name must remain unchanged.
      expect(attempt.data).toHaveLength(0);
      const unchanged = await admin
        .from("organizations")
        .select("name")
        .eq("id", sangamOrgId)
        .single();
      expect(unchanged.data?.name).not.toBe("Hijacked Sangam");
    });

    it("cannot forge application status, verification, or self-grant review permission via a raw table update", async () => {
      // organization_applications.status is deliberately excluded from the
      // authenticated column-update grant — this must fail outright as a
      // permission error, not silently no-op.
      const forgedStatus = await actor("founder")
        .client.from("organization_applications")
        .update({ status: "verified" } as never)
        .eq("id", sangamApplicationId);
      expect(forgedStatus.error).not.toBeNull();

      // organizations.official_email_verified_at is likewise excluded from
      // the grant.
      const forgedVerification = await actor("founder")
        .client.from("organizations")
        .update({
          official_email_verified_at: new Date().toISOString(),
        } as never)
        .eq("id", sangamOrgId);
      expect(forgedVerification.error).not.toBeNull();

      // The founder is not a reviewer/admin — reviewing their own
      // submission must be rejected by review_organization_application
      // regardless of the application's current status.
      const selfReview = await actor("founder").client.rpc(
        "review_organization_application",
        {
          target_application_id: sangamApplicationId,
          target_status: "verified",
        },
      );
      expect(selfReview.error).not.toBeNull();

      const selfGrantRole = await actor("founder")
        .client.from("user_roles")
        .insert({ user_id: actor("founder").user.id, role: "admin" });
      expect(selfGrantRole.error).not.toBeNull();
    });

    it("duplicate signals for a Sangam name stay privacy-safe for an ordinary applicant", async () => {
      const named = await admin
        .from("organizations")
        .update({ name: "Riverside Tamil Sangam" })
        .eq("id", sangamOrgId);
      expect(named.error).toBeNull();

      await createActor("checker", "Duplicate Checker");
      const signals = await actor("checker").client.rpc(
        "check_duplicate_organization_signals",
        { candidate_name: "Riverside Tamil Sangam" },
      );
      expect(signals.error).toBeNull();
      const result = signals.data as unknown as {
        nameMatch: boolean;
        matches: readonly { id: string; name: string }[];
      };
      expect(result.nameMatch).toBe(true);
      // An ordinary (non-reviewer) applicant never receives the matched
      // organisation's identity — only reviewers do (Lean V2, unchanged).
      expect(result.matches).toHaveLength(0);
    });

    it("network affiliation fields save and round-trip through the normal update grant", async () => {
      const upsert = await actor("founder")
        .client.from("organization_tamil_community_details")
        .update({
          network_affiliated: true,
          network_name: "World Tamil Federation",
        })
        .eq("organization_id", sangamOrgId);
      expect(upsert.error).toBeNull();

      const read = await admin
        .from("organization_tamil_community_details")
        .select("network_affiliated, network_name")
        .eq("organization_id", sangamOrgId)
        .single();
      expect(read.data).toMatchObject({
        network_affiliated: true,
        network_name: "World Tamil Federation",
      });
    });

    it("a verified Sangam becomes membership-eligible and follows the same request/approve lifecycle as an Organisation", async () => {
      const verifiedSangam = await admin
        .from("organizations")
        .insert({ name: "Coastal Tamil Sangam", category: "tamil_community" })
        .select("id")
        .single();
      expect(verifiedSangam.error).toBeNull();
      const verifiedSangamId = requireData(
        verifiedSangam.data,
        "verified sangam",
      ).id;

      await admin.from("organization_tamil_community_details").insert({
        organization_id: verifiedSangamId,
        subtype: "Tamil Sangam",
      });
      await admin.from("organization_applications").insert({
        organization_id: verifiedSangamId,
        submitted_by: actor("founder").user.id,
        status: "verified",
        representative_full_name: "Coastal Rep",
        representative_email: "coastal-rep@tamil-ulagam.test",
        representative_phone: "+1 416 555 0198",
        authorization_declaration: true,
        accuracy_declaration: true,
        submitted_at: new Date().toISOString(),
      });
      await admin.from("organization_managers").insert({
        organization_id: verifiedSangamId,
        user_id: actor("founder").user.id,
        role: "owner",
      });

      await createActor("member1", "Prospective Member");
      const eligible = await actor("member1").client.rpc(
        "list_membership_eligible_organizations",
      );
      expect(eligible.error).toBeNull();
      expect(eligible.data?.some((row) => row.id === verifiedSangamId)).toBe(
        true,
      );

      const request = await actor("member1").client.rpc(
        "request_organization_membership",
        { target_organization_id: verifiedSangamId },
      );
      expect(request.error).toBeNull();
      const membershipId = requireData(request.data, "membership request").id;

      const approve = await actor("founder").client.rpc(
        "decide_organization_membership",
        { target_membership_id: membershipId, target_status: "approved" },
      );
      expect(approve.error).toBeNull();
      expect(requireData(approve.data, "approval").status).toBe("approved");
    });
  },
);
