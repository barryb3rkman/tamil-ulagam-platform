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

interface Actor {
  readonly user: User;
  readonly client: SupabaseClient<Database>;
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

localDescribe("Federation Admin operations security", () => {
  let url = "";
  let anonKey = "";
  let serviceRole: SupabaseClient<Database>;
  let anonymous: SupabaseClient<Database>;
  let member: Actor;
  let manager: Actor;
  let reviewer: Actor;
  let federationAdmin: Actor;
  let enquiryId = "";
  let managerMembershipId = "";

  beforeAll(async () => {
    url = required("SUPABASE_LOCAL_URL");
    anonKey = required("SUPABASE_LOCAL_ANON_KEY");
    serviceRole = createClient<Database>(
      url,
      required("SUPABASE_LOCAL_SERVICE_ROLE_KEY"),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    anonymous = createClient<Database>(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    member = await createActor("member", "Federation Test Member");
    manager = await createActor("manager", "Federation Test Manager");
    reviewer = await createActor("reviewer", "Federation Test Reviewer");
    federationAdmin = await createActor("admin", "Federation Test Admin");

    const roles = await serviceRole.from("user_roles").insert([
      { user_id: reviewer.user.id, role: "reviewer" },
      { user_id: federationAdmin.user.id, role: "admin" },
    ]);
    expect(roles.error).toBeNull();

    const managedOrganisation = await serviceRole
      .from("organizations")
      .insert({
        name: "Federation Manager Security Fixture",
        category: "other",
        country: "Malaysia",
        region: "Kuala Lumpur",
        city: "Kuala Lumpur",
        description:
          "A local fixture proving local entity authority does not grant Federation access.",
        official_email: "f1-manager-org@tamil-ulagam.test",
        official_phone: "+60 3 1234 5678",
        registration_status: "informal",
      })
      .select("id")
      .single();
    expect(managedOrganisation.error).toBeNull();
    const management = await serviceRole.from("organization_managers").insert({
      organization_id: managedOrganisation.data?.id ?? "",
      user_id: manager.user.id,
      role: "owner",
      granted_by: manager.user.id,
    });
    expect(management.error).toBeNull();
    const managedMembership = await serviceRole
      .from("organization_memberships")
      .insert({
        organization_id: managedOrganisation.data?.id ?? "",
        user_id: member.user.id,
        status: "pending",
        membership_type: "general",
        requested_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    expect(managedMembership.error).toBeNull();
    managerMembershipId = managedMembership.data?.id ?? "";
  });

  async function createActor(slug: string, fullName: string): Promise<Actor> {
    const email = `f1-${slug}@tamil-ulagam.test`;
    const created = await serviceRole.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (created.error || !created.data.user)
      throw new Error(created.error?.message ?? `Could not create ${slug}.`);
    const client = createClient<Database>(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const login = await client.auth.signInWithPassword({ email, password });
    if (login.error) throw new Error(login.error.message);
    return { user: created.data.user, client };
  }

  it("reports reviewer and Admin capabilities separately", async () => {
    const reviewerCapabilities = await reviewer.client.rpc(
      "get_federation_capabilities",
    );
    expect(reviewerCapabilities.error).toBeNull();
    expect(reviewerCapabilities.data?.[0]).toEqual({
      can_operate_federation: false,
      can_review_registrations: true,
    });

    const adminCapabilities = await federationAdmin.client.rpc(
      "get_federation_capabilities",
    );
    expect(adminCapabilities.data?.[0]).toEqual({
      can_operate_federation: true,
      can_review_registrations: true,
    });
  });

  it("accepts only validated anonymous enquiry creation and normalizes email", async () => {
    const malformed = await anonymous.rpc("submit_partnership_enquiry", {
      enquiry_name: "M",
      enquiry_email: "not-an-email",
      enquiry_organization_name: "",
      enquiry_country: "C",
      enquiry_area: "community",
      enquiry_message: "short",
    });
    expect(malformed.error).not.toBeNull();

    const valid = await anonymous.rpc("submit_partnership_enquiry", {
      enquiry_name: "  Kavitha Raman  ",
      enquiry_email: "  KAVITHA@EXAMPLE.ORG ",
      enquiry_organization_name: "  Global Tamil Forum  ",
      enquiry_country: "  Canada  ",
      enquiry_area: "community",
      enquiry_message:
        "  We would like to discuss a responsible community partnership.  ",
    });
    expect(valid.error).toBeNull();
    enquiryId = valid.data ?? "";
    expect(enquiryId).not.toBe("");

    const stored = await serviceRole
      .from("partnership_enquiries")
      .select("email, status, created_at")
      .eq("id", enquiryId)
      .single();
    expect(stored.data?.email).toBe("kavitha@example.org");
    expect(stored.data?.status).toBe("new");
    expect(stored.data?.created_at).toBeTruthy();
  });

  it("blocks spoofing, listing and history writes for anonymous users", async () => {
    const spoof = await anonymous.from("partnership_enquiries").insert({
      name: "Spoofed Visitor",
      email: "spoof@example.org",
      country: "Canada",
      partnership_area: "strategic",
      message: "This attempts to set privileged fields through a raw insert.",
      status: "active",
      created_at: "2000-01-01T00:00:00.000Z",
    });
    expect(spoof.error).not.toBeNull();

    const list = await anonymous.from("partnership_enquiries").select("id");
    expect(list.error).not.toBeNull();
    expect(list.data).toBeNull();

    const historySpoof = await anonymous
      .from("partnership_enquiry_history")
      .insert({
        enquiry_id: enquiryId,
        new_status: "active",
        note: "spoof",
      });
    expect(historySpoof.error).not.toBeNull();
  });

  it("blocks members, entity managers and reviewer-only accounts from Admin operations", async () => {
    for (const actor of [member, manager, reviewer]) {
      const partnerships = await actor.client.rpc(
        "list_admin_partnership_enquiries",
      );
      expect(partnerships.error?.code).toBe("42501");
      const memberships = await actor.client.rpc(
        "list_admin_membership_operations",
      );
      expect(memberships.error?.code).toBe("42501");
      const organisations = await actor.client.rpc(
        "list_admin_organization_operations",
      );
      expect(organisations.error?.code).toBe("42501");
    }

    for (const actor of [member, reviewer]) {
      const membershipDecision = await actor.client.rpc(
        "decide_organization_membership",
        {
          target_membership_id: managerMembershipId,
          target_status: "approved",
        },
      );
      expect(membershipDecision.error?.code).toBe("42501");
    }

    const localManagerDecision = await manager.client.rpc(
      "decide_organization_membership",
      {
        target_membership_id: managerMembershipId,
        target_status: "approved",
      },
    );
    expect(localManagerDecision.error).toBeNull();
  });

  it("allows Admin read and controlled transitions with immutable history", async () => {
    const listed = await federationAdmin.client.rpc(
      "list_admin_partnership_enquiries",
    );
    expect(listed.error).toBeNull();
    expect(listed.data?.some((row) => row.id === enquiryId)).toBe(true);

    const invalidTransition = await federationAdmin.client.rpc(
      "transition_partnership_enquiry",
      { target_enquiry_id: enquiryId, target_status: "active" },
    );
    expect(invalidTransition.error).not.toBeNull();

    const transition = await federationAdmin.client.rpc(
      "transition_partnership_enquiry",
      {
        target_enquiry_id: enquiryId,
        target_status: "in_discussion",
        transition_note: "Initial Federation review completed.",
      },
    );
    expect(transition.error).toBeNull();
    expect(transition.data?.status).toBe("in_discussion");

    const history = await federationAdmin.client.rpc(
      "list_admin_partnership_history",
      { target_enquiry_id: enquiryId },
    );
    expect(history.error).toBeNull();
    expect(history.data?.[0]).toMatchObject({
      previous_status: "new",
      new_status: "in_discussion",
      actor_user_id: federationAdmin.user.id,
      actor_name: "Federation Test Admin",
    });
    expect(history.data?.[0]?.created_at).toBeTruthy();
  });
});
