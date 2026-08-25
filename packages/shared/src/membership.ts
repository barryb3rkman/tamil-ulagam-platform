import type { OrganisationCategory } from "./enrollment";

/**
 * MEMBERSHIP vs MANAGEMENT (Product V3, Phase A1).
 *
 * These are deliberately two separate concepts, backed by two separate
 * database tables (organization_memberships / organization_managers):
 *   - Membership/affiliation: "I belong to this Organisation or Sangam."
 *   - Management grant: "I am allowed to administer this Organisation
 *     or Sangam." (owner/admin/representative — the concept the legacy
 *     `OrganisationMembership` type in enrollment.ts actually represents,
 *     despite its name; see ManagementGrant below for the V3 name.)
 * A user may hold either, neither, or both for the same organisation —
 * they are orthogonal, never assumed to imply one another.
 */

export type MembershipStatus = "pending" | "approved" | "rejected" | "revoked";

/**
 * NULL/"" at the domain layer and NULL in the database are both treated
 * as "general" — the schema intentionally does not force every
 * organisation to expose a membership-type choice yet (see the Phase A1
 * completion report, item 6/7, for the full reasoning).
 */
export type MembershipType =
  "general" | "student" | "lifetime" | "honorary" | "";

export type OrganizationManagerRole = "owner" | "admin" | "representative";

export interface Membership {
  readonly id: string;
  readonly organisationId: string;
  readonly userId: string;
  readonly status: MembershipStatus;
  readonly membershipType: MembershipType;
  /** Exactly one of requestedAt/invitedAt is ever set — the two describe
   * how this specific membership row came to exist, and never change
   * after creation. */
  readonly requestedAt: string | null;
  readonly invitedAt: string | null;
  readonly invitedBy: string | null;
  readonly decidedAt: string | null;
  readonly decidedBy: string | null;
  readonly expiresAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface MembershipHistoryEvent {
  readonly id: string;
  readonly membershipId: string;
  readonly actorUserId: string;
  readonly previousStatus: MembershipStatus | "";
  readonly newStatus: MembershipStatus;
  readonly note: string;
  readonly createdAt: string;
}

/** A management/administrative grant — distinct from Membership above. */
export interface ManagementGrant {
  readonly id: string;
  readonly organisationId: string;
  readonly userId: string;
  readonly role: OrganizationManagerRole;
  readonly grantedAt: string;
  readonly grantedBy: string | null;
}

/**
 * The narrow, safe-projection shape returned by a membership-eligibility
 * search — deliberately not the full Organisation type: no contact
 * details, registration internals, or manager identities. See
 * `list_membership_eligible_organizations` in the Phase A1 migration.
 */
export interface EligibleOrganisation {
  readonly id: string;
  readonly name: string;
  readonly category: OrganisationCategory | "";
  readonly city: string;
  readonly region: string;
  readonly country: string;
}
