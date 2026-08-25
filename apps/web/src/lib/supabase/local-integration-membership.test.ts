// @vitest-environment node

import {
  createClient,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";

import type { Database } from "./database.types";

// Same skip/run convention as local-integration.test.ts, run by the same
// `pnpm test:supabase` script (see supabase/tests/run-local-integration.sh).
// Kept in a separate file rather than appended to the existing 780-line
// suite so the two domains (organisation enrollment vs. Phase A1
// membership/management) can evolve independently, matching the
// join-images.ts precedent from Phase C1.
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
  "local Supabase membership vs management security (Phase A1)",
  () => {
    let apiUrl = "";
    let anonKey = "";
    let admin: SupabaseClient<Database>;
    let anon: SupabaseClient<Database>;
    const actors = new Map<string, TestActor>();

    beforeAll(() => {
      apiUrl = requireEnvironment("SUPABASE_LOCAL_URL");
      anonKey = requireEnvironment("SUPABASE_LOCAL_ANON_KEY");
      admin = createClient<Database>(
        apiUrl,
        requireEnvironment("SUPABASE_LOCAL_SERVICE_ROLE_KEY"),
        { auth: { autoRefreshToken: false, persistSession: false } },
      );
      anon = createClient<Database>(apiUrl, anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    });

    async function createActor(
      slug: string,
      fullName: string,
      metadata: Readonly<Record<string, unknown>> = {},
    ): Promise<TestActor> {
      const email = `local-membership-${slug}@tamil-ulagam.test`;
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, ...metadata },
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

    // ---------------------------------------------------------------------
    // Fixtures: org1 (draft, unverified — created through the real RPC so
    // the dual-write into organization_managers is exercised for real)
    // and org2 (verified — created directly as service_role so eligibility
    // tests don't depend on re-driving the whole submission workflow,
    // which local-integration.test.ts already covers end to end).
    // ---------------------------------------------------------------------

    let org1Id = "";
    let org2Id = "";

    it("backfills and dual-writes: a new owner appears in both the legacy and canonical management tables", async () => {
      await createActor("owner1", "Local Owner One");
      const owner1 = actor("owner1");

      const draft = await owner1.client.rpc(
        "create_organization_application_draft",
        { initial_category: "business" },
      );
      expect(draft.error).toBeNull();
      org1Id = requireData(draft.data, "org1 draft").organization_id;

      const legacyRow = await owner1.client
        .from("organization_members")
        .select("role, is_primary")
        .eq("organization_id", org1Id)
        .eq("user_id", owner1.user.id)
        .single();
      expect(legacyRow.error).toBeNull();
      expect(legacyRow.data).toMatchObject({ role: "owner", is_primary: true });

      const managerRow = await owner1.client
        .from("organization_managers")
        .select("role, granted_by")
        .eq("organization_id", org1Id)
        .eq("user_id", owner1.user.id)
        .single();
      expect(managerRow.error).toBeNull();
      expect(managerRow.data).toMatchObject({
        role: "owner",
        granted_by: owner1.user.id,
      });
    });

    it("sets up a verified organisation directly (service role) for eligibility tests", async () => {
      const organization = await admin
        .from("organizations")
        .insert({
          name: "Local Verified Sangam",
          category: "tamil_community",
          country: "Canada",
          region: "Ontario",
          city: "Toronto",
          official_email: "verified-org@tamil-ulagam.test",
          official_phone: "+1 416 555 0199",
          description: "A pre-verified organisation for membership tests.",
          registration_status: "informal",
        })
        .select("id")
        .single();
      expect(organization.error).toBeNull();
      org2Id = requireData(organization.data, "org2").id;

      const application = await admin.from("organization_applications").insert({
        organization_id: org2Id,
        submitted_by: (await createActor("org2submitter", "Org2 Submitter"))
          .user.id,
        status: "verified",
        representative_full_name: "Org2 Rep",
        representative_email: "rep@tamil-ulagam.test",
        representative_phone: "+1 416 555 0198",
        authorization_declaration: true,
        accuracy_declaration: true,
        submitted_at: new Date().toISOString(),
      });
      expect(application.error).toBeNull();

      const managerGrant = await admin.from("organization_managers").insert({
        organization_id: org2Id,
        user_id: (await createActor("manager2", "Org2 Manager")).user.id,
        role: "admin",
      });
      expect(managerGrant.error).toBeNull();
    });

    it("anonymous: cannot read memberships/managers and cannot request membership", async () => {
      // Neither table is granted to `anon` at all (matching the existing
      // organization_members precedent) — a stronger guarantee than RLS
      // filtering: the read is refused outright, not silently emptied.
      const memberships = await anon
        .from("organization_memberships")
        .select("*");
      expect(memberships.error).not.toBeNull();
      expect(memberships.error?.code).toBe("42501");

      const managers = await anon.from("organization_managers").select("*");
      expect(managers.error).not.toBeNull();
      expect(managers.error?.code).toBe("42501");

      // Not even granted execute on this function for `anon` — refused at
      // the permission level, before the function body's own
      // "Authentication is required" check would ever run.
      const request = await anon.rpc("request_organization_membership", {
        target_organization_id: org2Id,
      });
      expect(request.error).not.toBeNull();
      expect(request.error?.code).toBe("42501");
    });

    it("exposes only verified organisations as eligible, via a safe narrow projection", async () => {
      await createActor("member1", "Local Member One");
      const member1 = actor("member1");

      const eligibleOrg2 = await member1.client.rpc(
        "is_organization_membership_eligible",
        { target_organization_id: org2Id },
      );
      expect(eligibleOrg2.data).toBe(true);

      const eligibleOrg1 = await member1.client.rpc(
        "is_organization_membership_eligible",
        { target_organization_id: org1Id },
      );
      expect(eligibleOrg1.data).toBe(false);

      const list = await member1.client.rpc(
        "list_membership_eligible_organizations",
      );
      expect(list.error).toBeNull();
      const ids = (list.data ?? []).map((row) => row.id);
      expect(ids).toContain(org2Id);
      expect(ids).not.toContain(org1Id);
      // Safe projection only — no contact/registration/manager fields.
      expect(list.data?.[0]).not.toHaveProperty("official_email");
      expect(list.data?.[0]).not.toHaveProperty("registration_number");
    });

    let member1MembershipId = "";

    it("lets an ordinary user request membership to an eligible organisation, idempotently", async () => {
      const member1 = actor("member1");

      const first = await member1.client.rpc(
        "request_organization_membership",
        {
          target_organization_id: org2Id,
        },
      );
      expect(first.error).toBeNull();
      const row = requireData(first.data, "first request");
      expect(row.status).toBe("pending");
      expect(row.requested_at).not.toBeNull();
      expect(row.invited_at).toBeNull();
      member1MembershipId = row.id;

      const second = await member1.client.rpc(
        "request_organization_membership",
        {
          target_organization_id: org2Id,
        },
      );
      expect(second.error).toBeNull();
      expect(second.data?.id).toBe(member1MembershipId);
    });

    it("rejects a membership request to a non-verified organisation", async () => {
      const member1 = actor("member1");

      const request = await member1.client.rpc(
        "request_organization_membership",
        { target_organization_id: org1Id },
      );
      expect(request.error).not.toBeNull();
      expect(request.error?.message).toContain(
        "not open for membership requests",
      );
    });

    it("hides another user's membership row and blocks direct privileged writes", async () => {
      await createActor("member2", "Local Member Two");
      const member2 = actor("member2");
      const member1 = actor("member1");

      const hiddenRead = await member2.client
        .from("organization_memberships")
        .select("id")
        .eq("id", member1MembershipId);
      expect(hiddenRead.error).toBeNull();
      expect(hiddenRead.data).toEqual([]);

      const forbiddenInsert = await member2.client
        .from("organization_memberships")
        .insert({
          organization_id: org2Id,
          user_id: member2.user.id,
          status: "approved",
          requested_at: new Date().toISOString(),
        });
      expect(forbiddenInsert.error).not.toBeNull();

      const selfApprove = await member1.client
        .from("organization_memberships")
        .update({ status: "approved" })
        .eq("id", member1MembershipId);
      expect(selfApprove.error).not.toBeNull();

      const decideOwn = await member1.client.rpc(
        "decide_organization_membership",
        {
          target_membership_id: member1MembershipId,
          target_status: "approved",
        },
      );
      expect(decideOwn.error).not.toBeNull();
    });

    it("lets the organisation's manager see and approve the pending request", async () => {
      const manager2 = actor("manager2");

      const queue = await manager2.client
        .from("organization_memberships")
        .select("id, status")
        .eq("organization_id", org2Id);
      expect(queue.error).toBeNull();
      expect(queue.data?.map((row) => row.id)).toContain(member1MembershipId);

      const decision = await manager2.client.rpc(
        "decide_organization_membership",
        {
          target_membership_id: member1MembershipId,
          target_status: "approved",
          decision_note: "Welcome aboard.",
        },
      );
      expect(decision.error).toBeNull();
      expect(decision.data).toMatchObject({ status: "approved" });
      expect(decision.data?.decided_by).toBe(manager2.user.id);

      const history = await manager2.client
        .from("organization_membership_history")
        .select("new_status, actor_user_id")
        .eq("membership_id", member1MembershipId)
        .order("created_at", { ascending: true });
      expect(history.error).toBeNull();
      expect(history.data?.map((event) => event.new_status)).toEqual([
        "pending",
        "approved",
      ]);
    });

    it("returns the existing approved row instead of a duplicate on re-request", async () => {
      const member1 = actor("member1");

      const again = await member1.client.rpc(
        "request_organization_membership",
        {
          target_organization_id: org2Id,
        },
      );
      expect(again.error).toBeNull();
      expect(again.data?.id).toBe(member1MembershipId);
      expect(again.data?.status).toBe("approved");
    });

    it("blocks a manager of a different organisation from deciding this one's requests", async () => {
      await createActor("outsiderManager", "Outsider Manager");
      const outsiderOrg = await admin
        .from("organizations")
        .insert({ name: "Unrelated organisation", category: "other" })
        .select("id")
        .single();
      expect(outsiderOrg.error).toBeNull();
      const outsiderGrant = await admin.from("organization_managers").insert({
        organization_id: requireData(outsiderOrg.data, "outsider org").id,
        user_id: actor("outsiderManager").user.id,
        role: "owner",
      });
      expect(outsiderGrant.error).toBeNull();

      const forbiddenRevoke = await actor("outsiderManager").client.rpc(
        "revoke_organization_membership",
        { target_membership_id: member1MembershipId },
      );
      expect(forbiddenRevoke.error).not.toBeNull();
    });

    it("also blocks a manager of a different organisation from approving/rejecting this one's pending requests", async () => {
      // A dedicated actor, not member2 — this test deliberately leaves a
      // pending request in place (both forbidden decisions must not
      // change it), and member2 already has its own scripted story
      // later in this file (invite/reject, then the uniqueness-
      // constraint test) that a stray leftover pending row would break.
      await createActor("crossOrgTestMember", "Cross Org Test Member");
      const crossOrgTestMember = actor("crossOrgTestMember");
      const manager2 = actor("manager2");
      const outsiderManager = actor("outsiderManager");

      const freshRequest = await crossOrgTestMember.client.rpc(
        "request_organization_membership",
        { target_organization_id: org2Id },
      );
      expect(freshRequest.error).toBeNull();
      const pendingId = requireData(freshRequest.data, "fresh pending").id;
      expect(freshRequest.data?.status).toBe("pending");

      const forbiddenApprove = await outsiderManager.client.rpc(
        "decide_organization_membership",
        { target_membership_id: pendingId, target_status: "approved" },
      );
      expect(forbiddenApprove.error).not.toBeNull();

      const forbiddenReject = await outsiderManager.client.rpc(
        "decide_organization_membership",
        { target_membership_id: pendingId, target_status: "rejected" },
      );
      expect(forbiddenReject.error).not.toBeNull();

      // Still pending — neither forbidden call actually changed it.
      const stillPending = await manager2.client
        .from("organization_memberships")
        .select("status")
        .eq("id", pendingId)
        .single();
      expect(stillPending.data?.status).toBe("pending");
    });

    it("lets the organisation's manager revoke an approved membership, and allows re-request afterward", async () => {
      const manager2 = actor("manager2");
      const member1 = actor("member1");

      const revoked = await manager2.client.rpc(
        "revoke_organization_membership",
        {
          target_membership_id: member1MembershipId,
          decision_note: "No longer active.",
        },
      );
      expect(revoked.error).toBeNull();
      expect(revoked.data).toMatchObject({ status: "revoked" });

      const rerequest = await member1.client.rpc(
        "request_organization_membership",
        { target_organization_id: org2Id },
      );
      expect(rerequest.error).toBeNull();
      expect(rerequest.data?.id).not.toBe(member1MembershipId);
      expect(rerequest.data?.status).toBe("pending");
    });

    it("supports the invite direction: manager invites, member cannot self-approve, manager can reject", async () => {
      const manager2 = actor("manager2");
      const member2 = actor("member2");

      const invite = await manager2.client.rpc("invite_organization_member", {
        target_organization_id: org2Id,
        target_user_id: member2.user.id,
      });
      expect(invite.error).toBeNull();
      expect(invite.data).toMatchObject({ status: "pending" });
      expect(invite.data?.invited_at).not.toBeNull();
      expect(invite.data?.requested_at).toBeNull();
      expect(invite.data?.invited_by).toBe(manager2.user.id);
      const invitedId = requireData(invite.data, "invite").id;

      const selfApprove = await member2.client.rpc(
        "decide_organization_membership",
        { target_membership_id: invitedId, target_status: "approved" },
      );
      expect(selfApprove.error).not.toBeNull();

      const rejected = await manager2.client.rpc(
        "decide_organization_membership",
        { target_membership_id: invitedId, target_status: "rejected" },
      );
      expect(rejected.error).toBeNull();
      expect(rejected.data).toMatchObject({ status: "rejected" });
    });

    it("gives a platform admin an escalation path, and a plain reviewer read-only access", async () => {
      await createActor("platformAdmin", "Local Platform Admin", {
        role: "admin",
      });
      await createActor("reviewerOnly", "Local Reviewer Only", {
        role: "reviewer",
      });
      const grantAdmin = await admin.from("user_roles").insert({
        user_id: actor("platformAdmin").user.id,
        role: "admin",
      });
      expect(grantAdmin.error).toBeNull();
      const grantReviewer = await admin.from("user_roles").insert({
        user_id: actor("reviewerOnly").user.id,
        role: "reviewer",
      });
      expect(grantReviewer.error).toBeNull();

      const member1 = actor("member1");
      const freshRequest = await member1.client.rpc(
        "request_organization_membership",
        { target_organization_id: org2Id },
      );
      expect(freshRequest.error).toBeNull();
      const freshId = requireData(freshRequest.data, "fresh request").id;

      // Plain reviewer: read access, no decide access.
      const reviewerRead = await actor("reviewerOnly")
        .client.from("organization_memberships")
        .select("id")
        .eq("id", freshId);
      expect(reviewerRead.error).toBeNull();
      expect(reviewerRead.data?.map((row) => row.id)).toEqual([freshId]);

      const reviewerDecide = await actor("reviewerOnly").client.rpc(
        "decide_organization_membership",
        { target_membership_id: freshId, target_status: "approved" },
      );
      expect(reviewerDecide.error).not.toBeNull();

      // Platform admin: escalation override, not a manager of org2.
      const adminDecide = await actor("platformAdmin").client.rpc(
        "decide_organization_membership",
        { target_membership_id: freshId, target_status: "approved" },
      );
      expect(adminDecide.error).toBeNull();
      expect(adminDecide.data).toMatchObject({ status: "approved" });
    });

    it("lets a manager view the profile of someone with a membership relationship, but not an unrelated outsider", async () => {
      const manager2 = actor("manager2");
      const outsiderManager = actor("outsiderManager");
      const member1 = actor("member1");

      const managerView = await manager2.client
        .from("profiles")
        .select("id")
        .eq("id", member1.user.id);
      expect(managerView.error).toBeNull();
      expect(managerView.data?.map((row) => row.id)).toEqual([member1.user.id]);

      const outsiderView = await outsiderManager.client
        .from("profiles")
        .select("id")
        .eq("id", member1.user.id);
      expect(outsiderView.error).toBeNull();
      expect(outsiderView.data).toEqual([]);
    });

    it("enforces the active-membership uniqueness constraint at the database layer", async () => {
      const duplicate = await admin.from("organization_memberships").insert({
        organization_id: org2Id,
        user_id: actor("member2").user.id,
        status: "pending",
        requested_at: new Date().toISOString(),
      });
      // member2's invite was rejected above (not active), so this first
      // duplicate insert should succeed...
      expect(duplicate.error).toBeNull();

      const secondDuplicate = await admin
        .from("organization_memberships")
        .insert({
          organization_id: org2Id,
          user_id: actor("member2").user.id,
          status: "pending",
          requested_at: new Date().toISOString(),
        });
      // ...but a second concurrent *active* row for the same user+org must
      // violate the partial unique index, independent of any RPC logic.
      expect(secondDuplicate.error).not.toBeNull();
    });

    it("protects the last owner of an organisation from removal or demotion", async () => {
      const owner1 = actor("owner1");

      const deleteLastOwner = await admin
        .from("organization_managers")
        .delete()
        .eq("organization_id", org1Id)
        .eq("user_id", owner1.user.id);
      expect(deleteLastOwner.error).not.toBeNull();
      expect(deleteLastOwner.error?.message).toContain(
        "must always retain at least one owner",
      );

      const demoteLastOwner = await admin
        .from("organization_managers")
        .update({ role: "admin" })
        .eq("organization_id", org1Id)
        .eq("user_id", owner1.user.id);
      expect(demoteLastOwner.error).not.toBeNull();
    });

    it("still allows deleting the organisation itself, even though that cascades away its only owner", async () => {
      const disposableOrg = await admin
        .from("organizations")
        .insert({ name: "Disposable single-owner organisation" })
        .select("id")
        .single();
      expect(disposableOrg.error).toBeNull();
      const disposableId = requireData(disposableOrg.data, "disposable org").id;

      const soleOwnerGrant = await admin.from("organization_managers").insert({
        organization_id: disposableId,
        user_id: actor("member2").user.id,
        role: "owner",
      });
      expect(soleOwnerGrant.error).toBeNull();

      // Deleting the whole organisation cascades to delete that sole
      // owner's manager row too — the owner-safety trigger must not
      // block this, since there is no organisation left to protect.
      const deleteOrganization = await admin
        .from("organizations")
        .delete()
        .eq("id", disposableId);
      expect(deleteOrganization.error).toBeNull();

      const remainingManagerRow = await admin
        .from("organization_managers")
        .select("id")
        .eq("organization_id", disposableId);
      expect(remainingManagerRow.error).toBeNull();
      expect(remainingManagerRow.data).toEqual([]);
    });

    it("Phase C2: lets a member leave their own approved membership, and blocks leaving another user's", async () => {
      await createActor("member3", "Local Member Three");
      const member3 = actor("member3");
      const manager2 = actor("manager2");
      const outsiderManager = actor("outsiderManager");

      const request = await member3.client.rpc(
        "request_organization_membership",
        { target_organization_id: org2Id },
      );
      expect(request.error).toBeNull();
      const member3MembershipId = requireData(
        request.data,
        "member3 request",
      ).id;

      const approve = await manager2.client.rpc(
        "decide_organization_membership",
        {
          target_membership_id: member3MembershipId,
          target_status: "approved",
        },
      );
      expect(approve.error).toBeNull();

      // Another user (not even a manager — just not the owner of this
      // membership) cannot leave it on someone else's behalf.
      const outsiderLeave = await outsiderManager.client.rpc(
        "leave_organization_membership",
        { target_membership_id: member3MembershipId },
      );
      expect(outsiderLeave.error).not.toBeNull();

      // Nor can the organisation's own manager use "leave" as a backdoor
      // revoke — the RPC only ever matches rows owned by the caller.
      const managerLeaveAttempt = await manager2.client.rpc(
        "leave_organization_membership",
        { target_membership_id: member3MembershipId },
      );
      expect(managerLeaveAttempt.error).not.toBeNull();

      const selfLeave = await member3.client.rpc(
        "leave_organization_membership",
        {
          target_membership_id: member3MembershipId,
          decision_note: "Moving on.",
        },
      );
      expect(selfLeave.error).toBeNull();
      expect(selfLeave.data).toMatchObject({ status: "revoked" });
      expect(selfLeave.data?.decided_by).toBe(member3.user.id);

      // Leaving again (already revoked) is rejected, not silently
      // treated as a no-op success.
      const secondLeave = await member3.client.rpc(
        "leave_organization_membership",
        { target_membership_id: member3MembershipId },
      );
      expect(secondLeave.error).not.toBeNull();

      const history = await member3.client
        .from("organization_membership_history")
        .select("new_status, actor_user_id, note")
        .eq("membership_id", member3MembershipId)
        .order("created_at", { ascending: true });
      expect(history.error).toBeNull();
      expect(history.data?.at(-1)).toMatchObject({
        new_status: "revoked",
        actor_user_id: member3.user.id,
        note: "Moving on.",
      });
    });

    it("Phase C2: cannot leave a pending (not yet approved) membership", async () => {
      const member2 = actor("member2");

      const request = await member2.client.rpc(
        "request_organization_membership",
        { target_organization_id: org2Id },
      );
      expect(request.error).toBeNull();
      const pendingId = requireData(request.data, "member2 pending request").id;
      expect(request.data?.status).toBe("pending");

      const leaveAttempt = await member2.client.rpc(
        "leave_organization_membership",
        { target_membership_id: pendingId },
      );
      expect(leaveAttempt.error).not.toBeNull();
      expect(leaveAttempt.error?.message).toContain(
        "Only an approved membership can be left",
      );
    });

    it("Phase C2: exposes a Tamil Sangam's subtype in the eligible-organisation projection, without guessing from the name", async () => {
      const sangamOrg = await admin
        .from("organizations")
        .insert({
          name: "Riverside Cultural Association",
          category: "tamil_community",
        })
        .select("id")
        .single();
      expect(sangamOrg.error).toBeNull();
      const sangamId = requireData(sangamOrg.data, "sangam org").id;

      const sangamApplication = await admin
        .from("organization_applications")
        .insert({
          organization_id: sangamId,
          submitted_by: actor("member1").user.id,
          status: "verified",
          representative_full_name: "Sangam Rep",
          representative_email: "sangam-rep@tamil-ulagam.test",
          representative_phone: "+1 416 555 0197",
          authorization_declaration: true,
          accuracy_declaration: true,
          submitted_at: new Date().toISOString(),
        });
      expect(sangamApplication.error).toBeNull();

      const sangamDetails = await admin
        .from("organization_tamil_community_details")
        .insert({ organization_id: sangamId, subtype: "Tamil Sangam" });
      expect(sangamDetails.error).toBeNull();

      const list = await actor("member1").client.rpc(
        "list_membership_eligible_organizations",
      );
      expect(list.error).toBeNull();
      const sangamRow = list.data?.find((row) => row.id === sangamId);
      expect(sangamRow).toMatchObject({
        category: "tamil_community",
        subtype: "Tamil Sangam",
      });

      // org2 is also tamil_community, but has no recorded subtype — it
      // must not be misidentified as a Sangam by name-guessing.
      const org2Row = list.data?.find((row) => row.id === org2Id);
      expect(org2Row?.subtype).toBeNull();
    });

    it("leaves the legacy organization_members table untouched by every new code path exercised above", async () => {
      const legacyRows = await admin
        .from("organization_members")
        .select("id, role, is_primary")
        .eq("organization_id", org1Id);
      expect(legacyRows.error).toBeNull();
      expect(legacyRows.data).toHaveLength(1);
      expect(legacyRows.data?.[0]).toMatchObject({
        role: "owner",
        is_primary: true,
      });
    });
  },
);
