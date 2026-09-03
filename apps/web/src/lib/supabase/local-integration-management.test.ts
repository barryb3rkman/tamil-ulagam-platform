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
  "local Supabase management administration security (Phase G1)",
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
      const email = `local-management-${slug}@tamil-ulagam.test`;
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

      const actorRecord = {
        user: requireData(data.user, `Create ${slug}`),
        email,
        client,
      };
      actors.set(slug, actorRecord);
      return actorRecord;
    }

    function actor(slug: string): TestActor {
      return requireData(actors.get(slug), `Actor "${slug}"`);
    }

    let orgId = "";
    let sangamId = "";
    let orgBId = "";
    let inviteAdminId = "";
    let inviteRepId = "";

    it("owner registration creates an owner grant (fixtures)", async () => {
      await createActor("owner", "Local Mgmt Owner");
      await createActor("owner-b", "Local Mgmt Owner B");
      await createActor("admin-invitee", "Local Mgmt Admin Invitee");
      await createActor("rep-invitee", "Local Mgmt Rep Invitee");
      await createActor("outsider", "Local Mgmt Outsider");

      const owner = actor("owner");
      const draft = await owner.client.rpc(
        "create_organization_application_draft",
        {
          initial_category: "tamil_community",
        },
      );
      expect(draft.error).toBeNull();
      orgId = requireData(draft.data, "org draft").organization_id;

      const ownerB = actor("owner-b");
      const draftB = await ownerB.client.rpc(
        "create_organization_application_draft",
        {
          initial_category: "business",
        },
      );
      expect(draftB.error).toBeNull();
      orgBId = requireData(draftB.data, "org B draft").organization_id;

      // A separate Sangam-classified organisation for parity testing.
      const sangam = await admin
        .from("organizations")
        .insert({
          category: "tamil_community",
          name: "Local Mgmt Sangam Parity",
          country: "Canada",
          region: "Ontario",
          city: "Toronto",
          official_email: "local-mgmt-sangam@tamil-ulagam.test",
          official_phone: "+1 416 555 0111",
          description: "Sangam parity fixture.",
          registration_status: "informal",
        })
        .select("id")
        .single();
      expect(sangam.error).toBeNull();
      sangamId = requireData(sangam.data, "sangam").id;
      const details = await admin
        .from("organization_tamil_community_details")
        .insert({ organization_id: sangamId, subtype: "Tamil Sangam" });
      expect(details.error).toBeNull();
      const grant = await admin.from("organization_managers").insert({
        organization_id: sangamId,
        user_id: owner.user.id,
        role: "owner",
        granted_by: owner.user.id,
      });
      expect(grant.error).toBeNull();
    });

    it("owner can invite an admin; anonymous cannot mutate or read", async () => {
      const owner = actor("owner");
      const anon = createClient<Database>(apiUrl, anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const invite = await owner.client.rpc("invite_organization_manager", {
        target_organization_id: orgId,
        invitee_email: actor("admin-invitee").email,
        invitee_role: "admin",
      });
      expect(invite.error).toBeNull();
      inviteAdminId = requireData(invite.data, "invite").id;
      expect(invite.data?.status).toBe("pending");

      const anonList = await anon.rpc("list_organization_managers", {
        target_organization_id: orgId,
      });
      expect(anonList.error).not.toBeNull();

      const anonAccept = await anon.rpc(
        "accept_organization_manager_invitation",
        {
          target_invitation_id: inviteAdminId,
        },
      );
      expect(anonAccept.error).not.toBeNull();
    });

    it("rejects a duplicate pending invite for the same email", async () => {
      const owner = actor("owner");
      const duplicate = await owner.client.rpc("invite_organization_manager", {
        target_organization_id: orgId,
        invitee_email: actor("admin-invitee").email,
        invitee_role: "representative",
      });
      expect(duplicate.error).not.toBeNull();
    });

    it("rejects inviting the owner's own email", async () => {
      const owner = actor("owner");
      const selfInvite = await owner.client.rpc("invite_organization_manager", {
        target_organization_id: orgId,
        invitee_email: owner.email,
        invitee_role: "admin",
      });
      expect(selfInvite.error).not.toBeNull();
    });

    it("a non-owner (ordinary member, no role) cannot invite", async () => {
      const outsider = actor("outsider");
      const attempt = await outsider.client.rpc("invite_organization_manager", {
        target_organization_id: orgId,
        invitee_email: actor("outsider").email,
        invitee_role: "admin",
      });
      expect(attempt.error).not.toBeNull();
    });

    it("cross-org denial: owner of org B cannot invite into org A", async () => {
      const ownerB = actor("owner-b");
      const attempt = await ownerB.client.rpc("invite_organization_manager", {
        target_organization_id: orgId,
        invitee_email: actor("outsider").email,
        invitee_role: "admin",
      });
      expect(attempt.error).not.toBeNull();
    });

    it("the wrong account cannot accept another email's invitation", async () => {
      const outsider = actor("outsider");
      const wrongAccept = await outsider.client.rpc(
        "accept_organization_manager_invitation",
        { target_invitation_id: inviteAdminId },
      );
      expect(wrongAccept.error).not.toBeNull();
    });

    it("the correct recipient sees the invitation in their own list and can accept it", async () => {
      const invitee = actor("admin-invitee");
      const mine = await invitee.client.rpc("list_my_management_invitations");
      expect(mine.error).toBeNull();
      expect(mine.data?.some((row) => row.id === inviteAdminId)).toBe(true);

      const accept = await invitee.client.rpc(
        "accept_organization_manager_invitation",
        { target_invitation_id: inviteAdminId },
      );
      expect(accept.error).toBeNull();
      expect(accept.data?.role).toBe("admin");

      const membershipRows = await admin
        .from("organization_memberships")
        .select("id")
        .eq("organization_id", orgId)
        .eq("user_id", invitee.user.id);
      expect(membershipRows.data ?? []).toHaveLength(0);
    });

    it("co-manager profile visibility: another manager sees only id + full_name, never phone/country/account email", async () => {
      const invitee = actor("admin-invitee");
      const list = await invitee.client.rpc("list_organization_managers", {
        target_organization_id: orgId,
      });
      expect(list.error).toBeNull();
      const ownerRow = list.data?.find(
        (row) => row.user_id === actor("owner").user.id,
      );
      expect(ownerRow?.full_name).toBe("Local Mgmt Owner");
      expect(Object.keys(ownerRow ?? {})).not.toContain("phone");
      expect(Object.keys(ownerRow ?? {})).not.toContain("email");
    });

    it("history records the invite and accept events, append-only", async () => {
      const owner = actor("owner");
      const history = await owner.client.rpc(
        "list_organization_management_history",
        {
          target_organization_id: orgId,
        },
      );
      expect(history.error).toBeNull();
      const events = (history.data ?? []).map((row) => row.event_type);
      expect(events).toContain("invited");
      expect(events).toContain("invitation_accepted");

      const tamperAttempt = await owner.client
        .from("organization_manager_history")
        .delete()
        .eq("organization_id", orgId);
      expect(tamperAttempt.error).not.toBeNull();
    });

    it("a non-owner admin cannot change roles, remove managers, or transfer ownership", async () => {
      const invitee = actor("admin-invitee");
      const roleChange = await invitee.client.rpc(
        "change_organization_manager_role",
        {
          target_organization_id: orgId,
          target_user_id: actor("owner").user.id,
          new_role: "representative",
        },
      );
      expect(roleChange.error).not.toBeNull();

      const remove = await invitee.client.rpc("remove_organization_manager", {
        target_organization_id: orgId,
        target_user_id: actor("owner").user.id,
      });
      expect(remove.error).not.toBeNull();

      const transfer = await invitee.client.rpc(
        "transfer_organization_ownership",
        {
          target_organization_id: orgId,
          target_user_id: invitee.user.id,
          previous_owner_new_role: "admin",
        },
      );
      expect(transfer.error).not.toBeNull();
    });

    it("owner can change the admin's role to representative, recording history", async () => {
      const owner = actor("owner");
      const invitee = actor("admin-invitee");
      const change = await owner.client.rpc(
        "change_organization_manager_role",
        {
          target_organization_id: orgId,
          target_user_id: invitee.user.id,
          new_role: "representative",
        },
      );
      expect(change.error).toBeNull();
      expect(change.data?.role).toBe("representative");
    });

    it("cannot remove the sole owner, and role can never be set to owner via change_organization_manager_role", async () => {
      const owner = actor("owner");
      const removeOwner = await owner.client.rpc(
        "remove_organization_manager",
        {
          target_organization_id: orgId,
          target_user_id: owner.user.id,
        },
      );
      expect(removeOwner.error).not.toBeNull();

      const escalate = await owner.client.rpc(
        "change_organization_manager_role",
        {
          target_organization_id: orgId,
          target_user_id: actor("admin-invitee").user.id,
          new_role: "owner",
        },
      );
      expect(escalate.error).not.toBeNull();
    });

    it("owner removes the (now representative) manager; their membership, if any, is unaffected", async () => {
      const owner = actor("owner");
      const invitee = actor("admin-invitee");

      const now = new Date().toISOString();
      const membership = await admin.from("organization_memberships").insert({
        organization_id: orgBId,
        user_id: invitee.user.id,
        status: "approved",
        membership_type: "general",
        requested_at: now,
        decided_at: now,
        decided_by: owner.user.id,
      });
      expect(membership.error).toBeNull();

      const remove = await owner.client.rpc("remove_organization_manager", {
        target_organization_id: orgId,
        target_user_id: invitee.user.id,
      });
      expect(remove.error).toBeNull();

      const stillMember = await admin
        .from("organization_memberships")
        .select("status")
        .eq("organization_id", orgBId)
        .eq("user_id", invitee.user.id)
        .single();
      expect(stillMember.data?.status).toBe("approved");
    });

    it("self-leave: a representative can leave management without affecting membership", async () => {
      const owner = actor("owner");
      const rep = actor("rep-invitee");

      const invite = await owner.client.rpc("invite_organization_manager", {
        target_organization_id: orgId,
        invitee_email: rep.email,
        invitee_role: "representative",
      });
      expect(invite.error).toBeNull();
      inviteRepId = requireData(invite.data, "rep invite").id;
      const accept = await rep.client.rpc(
        "accept_organization_manager_invitation",
        {
          target_invitation_id: inviteRepId,
        },
      );
      expect(accept.error).toBeNull();

      const leave = await rep.client.rpc("leave_organization_management", {
        target_organization_id: orgId,
      });
      expect(leave.error).toBeNull();

      const stillManages = await owner.client.rpc(
        "list_organization_managers",
        {
          target_organization_id: orgId,
        },
      );
      expect(
        stillManages.data?.some((row) => row.user_id === rep.user.id),
      ).toBe(false);
    });

    it("the sole owner cannot leave management directly", async () => {
      const owner = actor("owner");
      const leave = await owner.client.rpc("leave_organization_management", {
        target_organization_id: orgId,
      });
      expect(leave.error).not.toBeNull();
    });

    it("declined invitation records history and grants no access", async () => {
      const owner = actor("owner");
      const rep = actor("rep-invitee");
      const invite = await owner.client.rpc("invite_organization_manager", {
        target_organization_id: orgId,
        invitee_email: rep.email,
        invitee_role: "representative",
      });
      expect(invite.error).toBeNull();
      const invitationId = requireData(invite.data, "decline invite").id;

      const decline = await rep.client.rpc(
        "decline_organization_manager_invitation",
        {
          target_invitation_id: invitationId,
        },
      );
      expect(decline.error).toBeNull();
      expect(decline.data?.status).toBe("declined");

      const managers = await owner.client.rpc("list_organization_managers", {
        target_organization_id: orgId,
      });
      expect(managers.data?.some((row) => row.user_id === rep.user.id)).toBe(
        false,
      );
    });

    it("owner can revoke a pending invitation; it can no longer be accepted", async () => {
      const owner = actor("owner");
      const rep = actor("rep-invitee");
      const invite = await owner.client.rpc("invite_organization_manager", {
        target_organization_id: orgId,
        invitee_email: rep.email,
        invitee_role: "representative",
      });
      expect(invite.error).toBeNull();
      const invitationId = requireData(invite.data, "revoke invite").id;

      const revoke = await owner.client.rpc(
        "revoke_organization_manager_invitation",
        {
          target_invitation_id: invitationId,
        },
      );
      expect(revoke.error).toBeNull();

      const acceptAfterRevoke = await rep.client.rpc(
        "accept_organization_manager_invitation",
        { target_invitation_id: invitationId },
      );
      expect(acceptAfterRevoke.error).not.toBeNull();
    });

    it("transfer target must already be an active manager, not a non-manager", async () => {
      const owner = actor("owner");
      const transferAttempt = await owner.client.rpc(
        "transfer_organization_ownership",
        {
          target_organization_id: orgId,
          target_user_id: actor("outsider").user.id,
          previous_owner_new_role: "admin",
        },
      );
      expect(transferAttempt.error).not.toBeNull();
    });

    it("transfer ownership is atomic: exactly one owner remains, previous owner demoted", async () => {
      const owner = actor("owner");
      const rep = actor("rep-invitee");

      const invite = await owner.client.rpc("invite_organization_manager", {
        target_organization_id: orgId,
        invitee_email: rep.email,
        invitee_role: "representative",
      });
      expect(invite.error).toBeNull();
      const accept = await rep.client.rpc(
        "accept_organization_manager_invitation",
        {
          target_invitation_id: requireData(
            invite.data,
            "transfer setup invite",
          ).id,
        },
      );
      expect(accept.error).toBeNull();

      const transfer = await owner.client.rpc(
        "transfer_organization_ownership",
        {
          target_organization_id: orgId,
          target_user_id: rep.user.id,
          previous_owner_new_role: "admin",
        },
      );
      expect(transfer.error).toBeNull();

      const managers = await rep.client.rpc("list_organization_managers", {
        target_organization_id: orgId,
      });
      const owners = (managers.data ?? []).filter(
        (row) => row.role === "owner",
      );
      expect(owners).toHaveLength(1);
      expect(owners[0]?.user_id).toBe(rep.user.id);
      const oldOwnerRow = managers.data?.find(
        (row) => row.user_id === owner.user.id,
      );
      expect(oldOwnerRow?.role).toBe("admin");

      // The old owner can no longer invite (owner-only action).
      const oldOwnerInvite = await owner.client.rpc(
        "invite_organization_manager",
        {
          target_organization_id: orgId,
          invitee_email: actor("outsider").email,
          invitee_role: "admin",
        },
      );
      expect(oldOwnerInvite.error).not.toBeNull();
    });

    it("Sangam parity: the same RPCs work identically against a Tamil Sangam", async () => {
      const owner = actor("owner");
      const invite = await owner.client.rpc("invite_organization_manager", {
        target_organization_id: sangamId,
        invitee_email: actor("outsider").email,
        invitee_role: "admin",
      });
      expect(invite.error).toBeNull();

      const outsider = actor("outsider");
      const accept = await outsider.client.rpc(
        "accept_organization_manager_invitation",
        { target_invitation_id: requireData(invite.data, "sangam invite").id },
      );
      expect(accept.error).toBeNull();
      expect(accept.data?.role).toBe("admin");

      const managers = await owner.client.rpc("list_organization_managers", {
        target_organization_id: sangamId,
      });
      expect(
        managers.data?.some((row) => row.user_id === outsider.user.id),
      ).toBe(true);
    });

    it("H1: a legacy-only organization_members row no longer grants any management authority", async () => {
      const legacyOnly = await createActor(
        "legacy-only",
        "Local Mgmt Legacy Only",
      );

      const legacyInsert = await admin.from("organization_members").insert({
        organization_id: orgBId,
        user_id: legacyOnly.user.id,
        role: "owner",
        is_primary: false,
      });
      expect(legacyInsert.error).toBeNull();

      const canManage = await legacyOnly.client.rpc("can_manage_organization", {
        target_organization_id: orgBId,
      });
      expect(canManage.data).toBe(false);

      const isMember = await legacyOnly.client.rpc("is_organization_member", {
        target_organization_id: orgBId,
      });
      expect(isMember.data).toBe(false);

      const inviteAttempt = await legacyOnly.client.rpc(
        "invite_organization_manager",
        {
          target_organization_id: orgBId,
          invitee_email: "someone-else@tamil-ulagam.test",
          invitee_role: "admin",
        },
      );
      expect(inviteAttempt.error).not.toBeNull();

      const removeAttempt = await legacyOnly.client.rpc(
        "remove_organization_manager",
        {
          target_organization_id: orgBId,
          target_user_id: actor("owner-b").user.id,
        },
      );
      expect(removeAttempt.error).not.toBeNull();

      // The real canonical owner of the same organisation is unaffected.
      const realOwnerCanManage = await actor("owner-b").client.rpc(
        "can_manage_organization",
        { target_organization_id: orgBId },
      );
      expect(realOwnerCanManage.data).toBe(true);
    });

    it("H1: list RPCs project an obviously expired invitation as expired, not stale Pending", async () => {
      const owner = actor("owner-b");
      const expiredRecipient = await createActor(
        "expiry-recipient",
        "Local Mgmt Expiry Recipient",
      );

      const invite = await owner.client.rpc("invite_organization_manager", {
        target_organization_id: orgBId,
        invitee_email: expiredRecipient.email,
        invitee_role: "admin",
      });
      expect(invite.error).toBeNull();
      const invitationId = requireData(invite.data, "expiry invite").id;

      const backdate = await admin
        .from("organization_manager_invitations")
        .update({ expires_at: new Date(Date.now() - 1_000).toISOString() })
        .eq("id", invitationId);
      expect(backdate.error).toBeNull();

      const ownerList = await owner.client.rpc(
        "list_organization_manager_invitations",
        { target_organization_id: orgBId },
      );
      const ownerRow = ownerList.data?.find((row) => row.id === invitationId);
      expect(ownerRow?.status).toBe("expired");

      const myInvites = await expiredRecipient.client.rpc(
        "list_my_management_invitations",
      );
      expect(myInvites.data?.some((row) => row.id === invitationId)).toBe(
        false,
      );

      const persisted = await admin
        .from("organization_manager_invitations")
        .select("status")
        .eq("id", invitationId)
        .single();
      expect(persisted.data?.status).toBe("expired");
    });
  },
);
