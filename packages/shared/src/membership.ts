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
  /**
   * Phase H4 — the applicant's own email, captured server-side at
   * request/invite time (never a live auth.users join a manager could
   * read arbitrarily) — the same pattern
   * organization_applications.representative_email already established
   * for the Organisation journey.
   */
  readonly memberEmail: string;
  /** The selected category-aware "your connection/involvement" answer
   * (H4 brief sections 9-17) — the human-readable option label itself
   * (e.g. "Student", "Business owner / Founder"), not a coded enum, the
   * same free-text-for-low-cardinality convention already used
   * elsewhere (e.g. organization_tamil_community_details.subtype). "" if
   * the selected organisation's category has no tailored question. */
  readonly connectionType: string;
  /** Optional elaboration on connectionType (course/field of study,
   * profession/speciality, company). "" if not asked or not answered. */
  readonly connectionContext: string;
  /** A second, rarer optional elaboration — currently only used for a
   * Business organisation's "Industry" (connectionContext there holds
   * "Company / Organisation"). "" otherwise. */
  readonly connectionContextExtra: string;
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
 * `list_membership_eligible_organizations` in the Phase A1/C2
 * migrations. `subtype` (Phase C2) is the same free-text classification
 * field the registration flow already records for tamil_community
 * organisations (e.g. "Tamil Sangam") — added here, additively, so a
 * Member Registration directory can tell a Tamil Sangam apart from other
 * tamil_community organisations without guessing from the name.
 */
export interface EligibleOrganisation {
  readonly id: string;
  readonly name: string;
  readonly category: OrganisationCategory | "";
  readonly subtype: string;
  readonly city: string;
  readonly region: string;
  readonly country: string;
}

/**
 * True only for a tamil_community organisation whose recorded subtype is
 * exactly (case/whitespace-insensitively) "Tamil Sangam" — the same
 * convention value the registration flow already uses. Never derived
 * from the organisation's name.
 */
export function isTamilSangam(organisation: EligibleOrganisation): boolean {
  return (
    organisation.category === "tamil_community" &&
    organisation.subtype.trim().toLowerCase() === "tamil sangam"
  );
}

/**
 * A pending/decided membership row enriched with the minimal requester
 * identity a manager is permitted to see (per the profiles RLS policy
 * added in Phase A1) — assembled by the service layer from two
 * RLS-protected reads, never queried ad hoc by a UI component.
 */
export interface MembershipRequestSummary extends Membership {
  readonly memberFullName: string;
  /** The applicant's own phone, from their profile — visible to a
   * manager under the same profiles RLS policy that already permits
   * reading memberFullName for a member of their own organisation. */
  readonly memberPhone: string;
  readonly memberCity: string;
  readonly memberRegion: string;
  readonly memberCountry: string;
}

/**
 * Phase H4 — the small common Member profile (full name, mobile,
 * country/region/city) collected once on /join/member's own Step 1,
 * pre-filled from whatever the account already has. Deliberately a
 * narrow type of its own rather than an extension of the broader
 * `UserProfile` (enrollment.ts) — that type is threaded through
 * PlatformProvider/supabase-services.ts/mock-data.ts and every
 * Organisation/Sangam representative flow; growing it here would widen
 * this phase's blast radius for no real benefit, since the Member
 * flow's own service reads/writes the same `profiles` table columns
 * directly.
 */
export interface MemberProfile {
  fullName: string;
  phone: string;
  country: string;
  region: string;
  city: string;
}

export interface CategoryConnectionOption {
  readonly value: string;
  readonly label: string;
}

/**
 * H4 brief sections 9-17 — the minimal, category-aware "your connection
 * to this organisation" question set. Keyed by the six canonical
 * OrganisationCategory values, with tamil_community further split by
 * isTamilSangam (a Sangam asks nothing extra at all — section 10).
 * `contextLabel`/`contextPlaceholder` describe the one optional free-text
 * elaboration a category may offer (course/field, profession/speciality,
 * company); `extraLabel` is the second, rarer one (Business's
 * "Industry" only). A category absent from this map (or resolving to
 * `null`) asks no tailored question at all (section 17 — "do NOT invent
 * one").
 */
export interface CategoryConnectionQuestion {
  readonly prompt: string;
  readonly options: readonly CategoryConnectionOption[];
  readonly contextLabel?: string;
  readonly contextPlaceholder?: string;
  /** Only asked when the selected option is in this set — e.g. Healthcare's
   * "Profession / speciality" only appears for "Healthcare professional". */
  readonly contextOnlyForOptions?: readonly string[];
  readonly extraLabel?: string;
  readonly extraPlaceholder?: string;
}
