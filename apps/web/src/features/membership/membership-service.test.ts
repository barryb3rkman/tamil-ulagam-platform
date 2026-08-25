import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import type { Database } from "@/lib/supabase/database.types";
import { PlatformServiceError } from "@/lib/supabase/errors";

import { createMembershipService } from "./membership-service";

const membershipRow = {
  id: "membership-1",
  organization_id: "organization-1",
  user_id: "user-1",
  status: "pending" as const,
  membership_type: null,
  requested_at: "2026-08-25T00:00:00.000Z",
  invited_at: null,
  invited_by: null,
  decided_at: null,
  decided_by: null,
  expires_at: null,
  created_at: "2026-08-25T00:00:00.000Z",
  updated_at: "2026-08-25T00:00:00.000Z",
};

const profileRow = { id: "user-1", full_name: "Nila Raj" };

function makeClient(options: {
  readonly rpcResult?: { data?: unknown; error?: unknown };
  readonly fromResult?: { data?: unknown; error?: unknown };
  readonly profilesResult?: { data?: unknown; error?: unknown };
}) {
  const rpc = vi
    .fn()
    .mockResolvedValue(
      options.rpcResult ?? { data: membershipRow, error: null },
    );

  const queryBuilder = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
  };
  queryBuilder.select.mockReturnValue(queryBuilder);
  queryBuilder.eq.mockReturnValue(queryBuilder);
  // .order() is the terminal call in every organization_memberships list
  // method below, so it resolves the promise (a real supabase-js query
  // builder is thenable at any point; mocking only the terminal await
  // keeps this simple).
  queryBuilder.order.mockResolvedValue(
    options.fromResult ?? { data: [membershipRow], error: null },
  );

  const profilesBuilder = {
    select: vi.fn(),
    in: vi.fn(),
  };
  profilesBuilder.select.mockReturnValue(profilesBuilder);
  profilesBuilder.in.mockResolvedValue(
    options.profilesResult ?? { data: [profileRow], error: null },
  );

  const from = vi.fn((table: string) =>
    table === "profiles" ? profilesBuilder : queryBuilder,
  );

  const client = { rpc, from } as unknown as SupabaseClient<Database>;
  return { client, rpc, from, queryBuilder, profilesBuilder };
}

describe("createMembershipService", () => {
  it("requestMembership calls the RPC with the organisation id and omits an unset membership type", async () => {
    const { client, rpc } = makeClient({});
    const service = createMembershipService(client);

    const result = await service.requestMembership("organization-1");

    expect(rpc).toHaveBeenCalledWith("request_organization_membership", {
      target_organization_id: "organization-1",
      requested_membership_type: undefined,
    });
    expect(result).toMatchObject({ id: "membership-1", status: "pending" });
  });

  it("requestMembership passes a supplied membership type through", async () => {
    const { client, rpc } = makeClient({});
    const service = createMembershipService(client);

    await service.requestMembership("organization-1", "student");

    expect(rpc).toHaveBeenCalledWith("request_organization_membership", {
      target_organization_id: "organization-1",
      requested_membership_type: "student",
    });
  });

  it("approveMembership and rejectMembership send the correct target_status", async () => {
    const { client, rpc } = makeClient({});
    const service = createMembershipService(client);

    await service.approveMembership("membership-1", "note");
    expect(rpc).toHaveBeenCalledWith("decide_organization_membership", {
      target_membership_id: "membership-1",
      target_status: "approved",
      decision_note: "note",
    });

    await service.rejectMembership("membership-1");
    expect(rpc).toHaveBeenCalledWith("decide_organization_membership", {
      target_membership_id: "membership-1",
      target_status: "rejected",
      decision_note: undefined,
    });
  });

  it("revokeMembership calls the dedicated revoke RPC, not decide", async () => {
    const { client, rpc } = makeClient({});
    const service = createMembershipService(client);

    await service.revokeMembership("membership-1", "left the org");

    expect(rpc).toHaveBeenCalledWith("revoke_organization_membership", {
      target_membership_id: "membership-1",
      decision_note: "left the org",
    });
  });

  it("inviteMember calls the invite RPC with both organisation and target user", async () => {
    const { client, rpc } = makeClient({});
    const service = createMembershipService(client);

    await service.inviteMember("organization-1", "user-2");

    expect(rpc).toHaveBeenCalledWith("invite_organization_member", {
      target_organization_id: "organization-1",
      target_user_id: "user-2",
      invited_membership_type: undefined,
    });
  });

  it("listMyMemberships queries organization_memberships ordered by recency", async () => {
    const { client, from, queryBuilder } = makeClient({});
    const service = createMembershipService(client);

    const result = await service.listMyMemberships();

    expect(from).toHaveBeenCalledWith("organization_memberships");
    expect(queryBuilder.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: "membership-1" });
  });

  it("listOrganisationMembershipRequests filters by organisation id and enriches with the requester's name", async () => {
    const { client, queryBuilder, profilesBuilder } = makeClient({});
    const service = createMembershipService(client);

    const result =
      await service.listOrganisationMembershipRequests("organization-1");

    expect(queryBuilder.eq).toHaveBeenCalledWith(
      "organization_id",
      "organization-1",
    );
    expect(profilesBuilder.in).toHaveBeenCalledWith("id", ["user-1"]);
    expect(result).toEqual([
      expect.objectContaining({
        id: "membership-1",
        memberFullName: "Nila Raj",
      }),
    ]);
  });

  it("listOrganisationMembershipRequests skips the profile lookup entirely when there are no requests", async () => {
    const { client, from } = makeClient({
      fromResult: { data: [], error: null },
    });
    const service = createMembershipService(client);

    const result =
      await service.listOrganisationMembershipRequests("organization-1");

    expect(result).toEqual([]);
    expect(from).not.toHaveBeenCalledWith("profiles");
  });

  it("leaveMembership calls the dedicated leave RPC", async () => {
    const { client, rpc } = makeClient({});
    const service = createMembershipService(client);

    await service.leaveMembership("membership-1", "moving on");

    expect(rpc).toHaveBeenCalledWith("leave_organization_membership", {
      target_membership_id: "membership-1",
      decision_note: "moving on",
    });
  });

  it("wraps an RPC error into a PlatformServiceError rather than throwing the raw Postgrest error", async () => {
    const { client } = makeClient({
      rpcResult: {
        data: null,
        error: { message: "permission denied", code: "42501" },
      },
    });
    const service = createMembershipService(client);

    await expect(
      service.requestMembership("organization-1"),
    ).rejects.toBeInstanceOf(PlatformServiceError);
  });

  it("throws when an RPC reports success but returns no row", async () => {
    const { client } = makeClient({ rpcResult: { data: null, error: null } });
    const service = createMembershipService(client);

    await expect(
      service.requestMembership("organization-1"),
    ).rejects.toBeInstanceOf(PlatformServiceError);
  });
});
