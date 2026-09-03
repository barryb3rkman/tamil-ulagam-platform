// @vitest-environment node

import {
  createClient,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";

import type { Database } from "./database.types";

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
      const memberships = await anon
        .from("organization_memberships")
        .select("*");
      expect(memberships.error).not.toBeNull();
      expect(memberships.error?.code).toBe("42501");

      const managers = await anon.from("organization_managers").select("*");
      expect(managers.error).not.toBeNull();
      expect(managers.error?.code).toBe("42501");

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
      expect(duplicate.error).toBeNull();

      const secondDuplicate = await admin
        .from("organization_memberships")
        .insert({
          organization_id: org2Id,
          user_id: actor("member2").user.id,
          status: "pending",
          requested_at: new Date().toISOString(),
        });
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

      const outsiderLeave = await outsiderManager.client.rpc(
        "leave_organization_membership",
        { target_membership_id: member3MembershipId },
      );
      expect(outsiderLeave.error).not.toBeNull();

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

      const org2Row = list.data?.find((row) => row.id === org2Id);
      expect(org2Row?.subtype).toBeNull();
    });

    it("H4: request_organization_membership records the caller's own email and the category-aware connection fields", async () => {
      const org3 = await admin
        .from("organizations")
        .insert({ name: "H4 Connection Fields Org", category: "education" })
        .select("id")
        .single();
      expect(org3.error).toBeNull();
      const org3Id = requireData(org3.data, "org3").id;
      const org3Application = await admin
        .from("organization_applications")
        .insert({
          organization_id: org3Id,
          submitted_by: (await createActor("h4org3owner", "H4 Org3 Owner")).user
            .id,
          status: "verified",
          submitted_at: new Date().toISOString(),
        });
      expect(org3Application.error).toBeNull();
      await admin.from("organization_managers").insert({
        organization_id: org3Id,
        user_id: actor("h4org3owner").user.id,
        role: "owner",
        granted_by: actor("h4org3owner").user.id,
      });

      await createActor("h4member1", "H4 Member One");
      const h4member1 = actor("h4member1");

      const request = await h4member1.client.rpc(
        "request_organization_membership",
        {
          target_organization_id: org3Id,
          applicant_connection_type: "Student",
          applicant_connection_context: "Computer Science",
        },
      );
      expect(request.error).toBeNull();
      const membershipId = requireData(request.data, "connection request").id;

      const row = await admin
        .from("organization_memberships")
        .select(
          "member_email, connection_type, connection_context, connection_context_extra",
        )
        .eq("id", membershipId)
        .single();
      expect(row.error).toBeNull();
      expect(row.data).toMatchObject({
        member_email: h4member1.email,
        connection_type: "Student",
        connection_context: "Computer Science",
        connection_context_extra: "",
      });
    });

    it("H4: an approved affiliation grants no management rights — organization_managers stays untouched, and the member cannot act as a manager", async () => {
      const org4 = await admin
        .from("organizations")
        .insert({ name: "H4 Management Separation Org", category: "business" })
        .select("id")
        .single();
      expect(org4.error).toBeNull();
      const org4Id = requireData(org4.data, "org4").id;
      await createActor("h4org4owner", "H4 Org4 Owner");
      const org4Application = await admin
        .from("organization_applications")
        .insert({
          organization_id: org4Id,
          submitted_by: actor("h4org4owner").user.id,
          status: "verified",
          submitted_at: new Date().toISOString(),
        });
      expect(org4Application.error).toBeNull();
      await admin.from("organization_managers").insert({
        organization_id: org4Id,
        user_id: actor("h4org4owner").user.id,
        role: "owner",
        granted_by: actor("h4org4owner").user.id,
      });

      await createActor("h4member2", "H4 Member Two");
      const h4member2 = actor("h4member2");
      const h4org4owner = actor("h4org4owner");

      const request = await h4member2.client.rpc(
        "request_organization_membership",
        { target_organization_id: org4Id },
      );
      expect(request.error).toBeNull();
      const membershipId = requireData(request.data, "h4member2 request").id;

      const approved = await h4org4owner.client.rpc(
        "decide_organization_membership",
        { target_membership_id: membershipId, target_status: "approved" },
      );
      expect(approved.error).toBeNull();
      expect(approved.data).toMatchObject({ status: "approved" });

      // No row in organization_managers for the now-active member.
      const managerRow = await admin
        .from("organization_managers")
        .select("id")
        .eq("organization_id", org4Id)
        .eq("user_id", h4member2.user.id);
      expect(managerRow.error).toBeNull();
      expect(managerRow.data).toHaveLength(0);

      // can_manage_organization-gated actions still reject the member.
      await createActor("h4member3", "H4 Member Three");
      const anotherRequest = await actor("h4member3").client.rpc(
        "request_organization_membership",
        { target_organization_id: org4Id },
      );
      expect(anotherRequest.error).toBeNull();
      const anotherMembershipId = requireData(
        anotherRequest.data,
        "h4member3 request",
      ).id;

      const memberTriesToDecide = await h4member2.client.rpc(
        "decide_organization_membership",
        {
          target_membership_id: anotherMembershipId,
          target_status: "approved",
        },
      );
      expect(memberTriesToDecide.error).not.toBeNull();

      const memberTriesToInvite = await h4member2.client.rpc(
        "invite_organization_member",
        {
          target_organization_id: org4Id,
          target_user_id: actor("h4member3").user.id,
        },
      );
      expect(memberTriesToInvite.error).not.toBeNull();
    });

    it("H4: a Member can hold two independently-confirmed affiliations at once, each decided by its own organisation's own manager", async () => {
      const orgA = await admin
        .from("organizations")
        .insert({ name: "H4 Multi-Affiliation Org A", category: "nonprofit" })
        .select("id")
        .single();
      const orgB = await admin
        .from("organizations")
        .insert({ name: "H4 Multi-Affiliation Org B", category: "healthcare" })
        .select("id")
        .single();
      expect(orgA.error).toBeNull();
      expect(orgB.error).toBeNull();
      const orgAId = requireData(orgA.data, "orgA").id;
      const orgBId = requireData(orgB.data, "orgB").id;

      await createActor("h4ownerA", "H4 Owner A");
      await createActor("h4ownerB", "H4 Owner B");
      const abApplications = await admin
        .from("organization_applications")
        .insert([
          {
            organization_id: orgAId,
            submitted_by: actor("h4ownerA").user.id,
            status: "verified",
            submitted_at: new Date().toISOString(),
          },
          {
            organization_id: orgBId,
            submitted_by: actor("h4ownerB").user.id,
            status: "verified",
            submitted_at: new Date().toISOString(),
          },
        ]);
      expect(abApplications.error).toBeNull();
      await admin.from("organization_managers").insert([
        {
          organization_id: orgAId,
          user_id: actor("h4ownerA").user.id,
          role: "owner",
          granted_by: actor("h4ownerA").user.id,
        },
        {
          organization_id: orgBId,
          user_id: actor("h4ownerB").user.id,
          role: "owner",
          granted_by: actor("h4ownerB").user.id,
        },
      ]);

      await createActor("h4multiMember", "H4 Multi Member");
      const h4multiMember = actor("h4multiMember");

      const requestA = await h4multiMember.client.rpc(
        "request_organization_membership",
        { target_organization_id: orgAId },
      );
      const requestB = await h4multiMember.client.rpc(
        "request_organization_membership",
        { target_organization_id: orgBId },
      );
      expect(requestA.error).toBeNull();
      expect(requestB.error).toBeNull();

      const decideA = await actor("h4ownerA").client.rpc(
        "decide_organization_membership",
        {
          target_membership_id: requireData(requestA.data, "requestA").id,
          target_status: "approved",
        },
      );
      const decideB = await actor("h4ownerB").client.rpc(
        "decide_organization_membership",
        {
          target_membership_id: requireData(requestB.data, "requestB").id,
          target_status: "approved",
        },
      );
      expect(decideA.error).toBeNull();
      expect(decideB.error).toBeNull();

      const activeMemberships = await admin
        .from("organization_memberships")
        .select("organization_id, status")
        .eq("user_id", h4multiMember.user.id)
        .eq("status", "approved");
      expect(activeMemberships.error).toBeNull();
      expect(activeMemberships.data).toHaveLength(2);
      expect(
        activeMemberships.data?.map((row) => row.organization_id).sort(),
      ).toEqual([orgAId, orgBId].sort());
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
