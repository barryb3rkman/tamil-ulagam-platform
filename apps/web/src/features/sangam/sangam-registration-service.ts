import type {
  Organisation,
  OrganisationApplication,
  OrganisationRepresentative,
  TamilCommunityProfile,
  UserProfile,
} from "@tamil-ulagam/shared";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import {
  mapOrganisationToDatabase,
  mapRepresentativeToDatabase,
} from "@/lib/supabase/domain-mappers";
import {
  mapApplicationRow,
  mapCategoryDetailRow,
  mapOrganizationRow,
  mapProfileRow,
  type CategoryDetailRow,
  type OrganizationApplicationRow,
  type OrganizationRow,
  type ProfileRow,
} from "@/lib/supabase/database-row-mappers";
import { mapSupabaseError, PlatformServiceError } from "@/lib/supabase/errors";

/**
 * The Tamil Sangam registration journey's own service boundary (Phase
 * D1) — deliberately independent of PlatformProvider/supabase-services.ts,
 * the same way membership-service.ts (Phase A1/C2) is independent of it.
 *
 * Why not extend PlatformProvider's ensureDraft/currentApplication
 * instead? Those resolve a single "current application" from the
 * caller's PRIMARY organisation membership, with no category awareness
 * — correct for "one Organisation registration at a time", wrong for
 * "an account may register an Organisation and a Tamil Sangam
 * independently" (D1 brief section 21). Rather than teaching that
 * primary-membership resolution about categories, this service resolves
 * (and edits) a Sangam application purely by its own id, fetched once
 * via ensureDraft()/reload() and then threaded explicitly through every
 * write — see ensure_sangam_application_draft in the Phase D1 migration
 * for the matching server-side draft resolution.
 *
 * What IS reused, not reimplemented: the domain types, the row mappers
 * (mapOrganizationRow/mapCategoryDetailRow/mapApplicationRow), the
 * organisation/representative-to-database mappers, the existing
 * submit_organization_application and check_duplicate_organization_signals
 * RPCs (the latter called directly via usePlatform().checkDuplicateSignals
 * — already category-agnostic, no reason to wrap it again here), and the
 * same RLS/grants the Organisation journey already relies on for
 * `organizations`/`organization_applications`/
 * `organization_tamil_community_details` (can_manage_organization +
 * organization_application_is_editable) — nothing new was added to those
 * tables' policies for this service to work.
 */

function assertNoError(error: unknown, fallback: string): void {
  if (error) throw mapSupabaseError(error, fallback);
}

async function profileForUserId(
  client: SupabaseClient<Database>,
  userId: string,
  fallbackEmail: string,
): Promise<UserProfile> {
  const { data, error } = await client
    .from("profiles")
    .select("id, full_name, phone, country, created_at, terms_accepted_at")
    .eq("id", userId)
    .maybeSingle();
  assertNoError(error, "The account profile could not be loaded.");
  if (!data) {
    return {
      id: userId,
      fullName: "",
      email: fallbackEmail,
      phone: "",
      country: "",
      termsAcceptedAt: null,
      createdAt: "",
    };
  }
  return mapProfileRow(data as ProfileRow, fallbackEmail);
}

async function loadApplicationById(
  client: SupabaseClient<Database>,
  applicationId: string,
): Promise<OrganisationApplication> {
  const { data: appData, error: appError } = await client
    .from("organization_applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();
  assertNoError(appError, "The Sangam registration could not be loaded.");
  if (!appData) {
    throw new PlatformServiceError(
      "This Sangam registration could not be found.",
      "not_found",
    );
  }
  const appRow = appData as OrganizationApplicationRow;

  const [organizationResult, detailsResult, reviewerResult] = await Promise.all(
    [
      client
        .from("organizations")
        .select("*")
        .eq("id", appRow.organization_id)
        .maybeSingle(),
      client
        .from("organization_tamil_community_details")
        .select("*")
        .eq("organization_id", appRow.organization_id)
        .maybeSingle(),
      appRow.reviewed_by
        ? client
            .from("profiles")
            .select(
              "id, full_name, phone, country, created_at, terms_accepted_at",
            )
            .eq("id", appRow.reviewed_by)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ],
  );
  assertNoError(
    organizationResult.error,
    "The Sangam's organisation record could not be loaded.",
  );
  assertNoError(
    detailsResult.error,
    "The Sangam's community details could not be loaded.",
  );
  assertNoError(
    reviewerResult.error,
    "The reviewer's details could not be loaded.",
  );
  if (!organizationResult.data) {
    throw new PlatformServiceError(
      "This Sangam registration could not be found.",
      "not_found",
    );
  }

  const organisation = mapOrganizationRow(
    organizationResult.data as OrganizationRow,
  );
  const categoryProfile = mapCategoryDetailRow(
    "tamil_community",
    (detailsResult.data as CategoryDetailRow | null) ?? undefined,
  );
  const reviewedByName = reviewerResult.data
    ? ((reviewerResult.data as ProfileRow).full_name ??
      "Tamil Ulagam review team")
    : appRow.reviewed_by
      ? "Tamil Ulagam review team"
      : "";
  const registration = mapApplicationRow(
    appRow,
    categoryProfile,
    reviewedByName,
  );
  const representativeUser = await profileForUserId(
    client,
    appRow.submitted_by,
    appRow.representative_email,
  );

  return { organisation, registration, representativeUser };
}

export interface SangamRegistrationService {
  /** Creates (or idempotently re-reads) the caller's own Tamil Sangam
   * draft — see ensure_sangam_application_draft. Never returns another
   * account's Sangam, and never returns/creates a plain Organisation
   * record even if that's the caller's primary membership. */
  ensureDraft(): Promise<OrganisationApplication>;
  /** Re-reads one Sangam application by id — RLS (organisation manager
   * or reviewer) is the only access control; there is no separate
   * Sangam-specific check to keep in sync with it. */
  reload(applicationId: string): Promise<OrganisationApplication>;
  /** One organisation has exactly one application (organization_id is
   * unique on organization_applications) — used by the Sangam workspace,
   * which already knows which organisation(s) the caller manages (via
   * listMyManagedOrganisations) and needs the full application for one
   * of them. Returns null rather than throwing when none exists. */
  findByOrganisation(
    organisationId: string,
  ): Promise<OrganisationApplication | null>;
  updateOrganisation(
    organisationId: string,
    input: Organisation,
  ): Promise<Organisation>;
  /** subtype is always forced to "Tamil Sangam" here, regardless of what
   * the caller's profile object carries — the Sangam wizard never offers
   * a subtype choice, so this is defence in depth, not a real override
   * of user intent. */
  updateCategoryProfile(
    organisationId: string,
    profile: TamilCommunityProfile,
  ): Promise<void>;
  updateRepresentative(
    applicationId: string,
    representative: OrganisationRepresentative,
  ): Promise<void>;
  updateCurrentStep(applicationId: string, step: 1 | 2 | 3 | 4): Promise<void>;
  /** Reuses submit_organization_application as-is — the same lifecycle,
   * validation and review-history behaviour an Organisation submission
   * gets, including its existing (already lenient) tamil_community
   * completeness check. */
  submit(applicationId: string): Promise<OrganisationApplication>;
}

export function createSangamRegistrationService(
  client: SupabaseClient<Database>,
): SangamRegistrationService {
  return {
    async ensureDraft() {
      const { data, error } = await client.rpc(
        "ensure_sangam_application_draft",
      );
      assertNoError(
        error,
        "Your Tamil Sangam registration could not be started.",
      );
      if (!data) {
        throw new PlatformServiceError(
          "The Sangam registration draft did not return a result.",
          "unknown",
        );
      }
      return loadApplicationById(client, data.id);
    },

    reload: (applicationId) => loadApplicationById(client, applicationId),

    async findByOrganisation(organisationId) {
      const { data, error } = await client
        .from("organization_applications")
        .select("id")
        .eq("organization_id", organisationId)
        .maybeSingle();
      assertNoError(error, "This Sangam's registration could not be loaded.");
      if (!data) return null;
      return loadApplicationById(client, data.id);
    },

    async updateOrganisation(organisationId, input) {
      const { data, error } = await client
        .from("organizations")
        .update(mapOrganisationToDatabase(input))
        .eq("id", organisationId)
        .select("*")
        .single();
      assertNoError(error, "The Sangam's details could not be saved.");
      return mapOrganizationRow(data as OrganizationRow);
    },

    async updateCategoryProfile(organisationId, profile) {
      const { error } = await client
        .from("organization_tamil_community_details")
        .upsert(
          {
            organization_id: organisationId,
            subtype: "Tamil Sangam",
            primary_activities: profile.primaryActivities,
            membership_size: profile.membershipSize.trim(),
            geographic_area_served: profile.geographicAreaServed.trim(),
            chairperson_name: profile.chairpersonName.trim(),
            secretary_name: profile.secretaryName.trim(),
            languages: profile.languages.trim(),
            network_affiliated:
              profile.networkAffiliated === ""
                ? null
                : profile.networkAffiliated === "yes",
            network_name: profile.networkName.trim(),
          },
          { onConflict: "organization_id" },
        );
      assertNoError(
        error,
        "The Sangam's community details could not be saved.",
      );
    },

    async updateRepresentative(applicationId, representative) {
      const { error } = await client
        .from("organization_applications")
        .update(mapRepresentativeToDatabase(representative))
        .eq("id", applicationId);
      assertNoError(error, "The representative's details could not be saved.");
    },

    async updateCurrentStep(applicationId, step) {
      const { error } = await client
        .from("organization_applications")
        .update({ current_step: step })
        .eq("id", applicationId);
      assertNoError(error, "Registration progress could not be saved.");
    },

    async submit(applicationId) {
      const { error } = await client.rpc("submit_organization_application", {
        target_application_id: applicationId,
      });
      assertNoError(
        error,
        "Your Tamil Sangam registration could not be submitted.",
      );
      return loadApplicationById(client, applicationId);
    },
  };
}
