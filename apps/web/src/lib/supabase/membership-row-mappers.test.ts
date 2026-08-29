import { describe, expect, it } from "vitest";

import {
  mapEligibleOrganisationRow,
  mapManagementGrantRow,
  mapMembershipHistoryRow,
  mapMembershipRow,
  type EligibleOrganisationRow,
  type OrganizationManagerRow,
  type OrganizationMembershipHistoryRow,
  type OrganizationMembershipRow,
} from "./membership-row-mappers";

describe("Supabase membership/management row mappers", () => {
  it("maps a management grant row without leaking database names", () => {
    const row: OrganizationManagerRow = {
      id: "manager-1",
      organization_id: "organization-1",
      user_id: "user-1",
      role: "owner",
      granted_at: "2026-08-25T00:00:00.000Z",
      granted_by: "user-1",
    };

    expect(mapManagementGrantRow(row)).toEqual({
      id: "manager-1",
      organisationId: "organization-1",
      userId: "user-1",
      role: "owner",
      grantedAt: "2026-08-25T00:00:00.000Z",
      grantedBy: "user-1",
    });
  });

  it("maps a requested membership row, treating a null membership_type as general/unset", () => {
    const row: OrganizationMembershipRow = {
      id: "membership-1",
      organization_id: "organization-1",
      user_id: "user-2",
      status: "pending",
      membership_type: null,
      requested_at: "2026-08-25T01:00:00.000Z",
      invited_at: null,
      invited_by: null,
      decided_at: null,
      decided_by: null,
      expires_at: null,
      created_at: "2026-08-25T01:00:00.000Z",
      updated_at: "2026-08-25T01:00:00.000Z",
      member_email: "",
      connection_type: "",
      connection_context: "",
      connection_context_extra: "",
    };

    expect(mapMembershipRow(row)).toMatchObject({
      status: "pending",
      membershipType: "",
      requestedAt: "2026-08-25T01:00:00.000Z",
      invitedAt: null,
    });
  });

  it("maps an invited-and-decided membership row", () => {
    const row: OrganizationMembershipRow = {
      id: "membership-2",
      organization_id: "organization-1",
      user_id: "user-3",
      status: "approved",
      membership_type: "student",
      requested_at: null,
      invited_at: "2026-08-25T02:00:00.000Z",
      invited_by: "manager-1",
      decided_at: "2026-08-25T03:00:00.000Z",
      decided_by: "manager-1",
      expires_at: null,
      created_at: "2026-08-25T02:00:00.000Z",
      updated_at: "2026-08-25T03:00:00.000Z",
      member_email: "student@example.com",
      connection_type: "Student",
      connection_context: "Computer Science",
      connection_context_extra: "",
    };

    expect(mapMembershipRow(row)).toEqual({
      id: "membership-2",
      organisationId: "organization-1",
      userId: "user-3",
      status: "approved",
      membershipType: "student",
      requestedAt: null,
      invitedAt: "2026-08-25T02:00:00.000Z",
      invitedBy: "manager-1",
      decidedAt: "2026-08-25T03:00:00.000Z",
      decidedBy: "manager-1",
      expiresAt: null,
      createdAt: "2026-08-25T02:00:00.000Z",
      updatedAt: "2026-08-25T03:00:00.000Z",
      memberEmail: "student@example.com",
      connectionType: "Student",
      connectionContext: "Computer Science",
      connectionContextExtra: "",
    });
  });

  it("maps a membership history event", () => {
    const row: OrganizationMembershipHistoryRow = {
      id: "history-1",
      membership_id: "membership-1",
      actor_user_id: "manager-1",
      previous_status: "pending",
      new_status: "approved",
      note: "Welcome.",
      created_at: "2026-08-25T03:00:00.000Z",
    };

    expect(mapMembershipHistoryRow(row)).toEqual({
      id: "history-1",
      membershipId: "membership-1",
      actorUserId: "manager-1",
      previousStatus: "pending",
      newStatus: "approved",
      note: "Welcome.",
      createdAt: "2026-08-25T03:00:00.000Z",
    });
  });

  it("maps the eligible-organisation safe projection, including subtype", () => {
    expect(
      mapEligibleOrganisationRow({
        id: "organization-1",
        name: "Toronto Tamil Sangam",
        category: "tamil_community",
        subtype: "Tamil Sangam",
        city: "Toronto",
        region: "Ontario",
        country: "Canada",
      }),
    ).toEqual({
      id: "organization-1",
      name: "Toronto Tamil Sangam",
      category: "tamil_community",
      subtype: "Tamil Sangam",
      city: "Toronto",
      region: "Ontario",
      country: "Canada",
    });
  });

  it("treats a null subtype (a non-tamil_community organisation) as an empty string", () => {
    // The generated Supabase type optimistically declares `subtype` as a
    // non-nullable string, but a LEFT JOIN against
    // organization_tamil_community_details genuinely returns SQL NULL
    // for any non-tamil_community organisation — the cast below reflects
    // that real runtime shape, which is exactly what the mapper's `?? ""`
    // is defending against.
    const row = {
      id: "organization-2",
      name: "Example Business",
      category: "business",
      subtype: null,
      city: "Chennai",
      region: "Tamil Nadu",
      country: "India",
    } as unknown as EligibleOrganisationRow;

    expect(mapEligibleOrganisationRow(row)).toMatchObject({ subtype: "" });
  });
});
