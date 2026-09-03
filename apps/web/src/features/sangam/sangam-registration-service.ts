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

const REGISTRATION_DOCUMENT_BUCKET = "sangam-registration-documents";
const SIGNED_URL_TTL_SECONDS = 120;
const ALLOWED_DOCUMENT_TYPES: Readonly<Record<string, string>> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

export interface RegistrationDocumentUploadResult {
  readonly path: string;
  readonly filename: string;
  readonly uploadedAt: string;
}

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

  const [organizationResult, detailsResult, socialLinksResult, reviewerResult] =
    await Promise.all([
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
      client
        .from("organization_social_links")
        .select("url")
        .eq("organization_id", appRow.organization_id)
        .order("position", { ascending: true }),
      appRow.reviewed_by
        ? client
            .from("profiles")
            .select(
              "id, full_name, phone, country, created_at, terms_accepted_at",
            )
            .eq("id", appRow.reviewed_by)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);
  assertNoError(
    organizationResult.error,
    "The Sangam's organisation record could not be loaded.",
  );
  assertNoError(
    detailsResult.error,
    "The Sangam's community details could not be loaded.",
  );
  assertNoError(
    socialLinksResult.error,
    "The Sangam's social links could not be loaded.",
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
  ) as TamilCommunityProfile;
  categoryProfile.socialLinks = (socialLinksResult.data ?? []).map(
    (row) => row.url,
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
  ensureDraft(): Promise<OrganisationApplication>;
  reload(applicationId: string): Promise<OrganisationApplication>;
  findByOrganisation(
    organisationId: string,
  ): Promise<OrganisationApplication | null>;
  updateOrganisation(
    organisationId: string,
    input: Organisation,
  ): Promise<Organisation>;
  updateCategoryProfile(
    organisationId: string,
    profile: TamilCommunityProfile,
  ): Promise<void>;
  updateRepresentative(
    applicationId: string,
    representative: OrganisationRepresentative,
  ): Promise<void>;
  updateCurrentStep(applicationId: string, step: 1 | 2 | 3 | 4): Promise<void>;
  submit(applicationId: string): Promise<OrganisationApplication>;
  uploadRegistrationDocument(
    organisationId: string,
    applicationId: string,
    file: File,
  ): Promise<RegistrationDocumentUploadResult>;
  removeRegistrationDocument(organisationId: string): Promise<void>;
  getRegistrationDocumentSignedUrl(path: string): Promise<string>;
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
      const memberCount = profile.memberCount.trim();
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
            member_count:
              memberCount && /^\d+$/.test(memberCount)
                ? Number(memberCount)
                : null,
            spoc_full_name: profile.spocFullName.trim(),
            spoc_email: profile.spocEmail.trim().toLowerCase(),
            spoc_phone: profile.spocPhone.trim(),
            president_full_name: profile.presidentFullName.trim(),
            president_email: profile.presidentEmail.trim().toLowerCase(),
            president_phone: profile.presidentPhone.trim(),
          },
          { onConflict: "organization_id" },
        );
      assertNoError(
        error,
        "The Sangam's community details could not be saved.",
      );

      const links = profile.socialLinks
        .map((url) => url.trim())
        .filter((url) => url.length > 0);
      const deleteResult = await client
        .from("organization_social_links")
        .delete()
        .eq("organization_id", organisationId);
      assertNoError(
        deleteResult.error,
        "The Sangam's social links could not be saved.",
      );
      if (links.length > 0) {
        const insertResult = await client
          .from("organization_social_links")
          .insert(
            links.map((url, index) => ({
              organization_id: organisationId,
              url,
              position: index,
            })),
          );
        assertNoError(
          insertResult.error,
          "The Sangam's social links could not be saved.",
        );
      }
    },

    async updateRepresentative(applicationId, representative) {
      const { error } = await client
        .from("organization_applications")
        .update(mapRepresentativeToDatabase(representative))
        .eq("id", applicationId);
      assertNoError(error, "The representative's details could not be saved.");
    },

    async uploadRegistrationDocument(organisationId, applicationId, file) {
      const extension = ALLOWED_DOCUMENT_TYPES[file.type];
      if (!extension) {
        throw new PlatformServiceError(
          "Upload a PDF, JPG or PNG file.",
          "validation",
        );
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new PlatformServiceError(
          "The file is too large. The maximum size is 10 MB.",
          "validation",
        );
      }

      const previous = await client
        .from("organization_tamil_community_details")
        .select("registration_document_path")
        .eq("organization_id", organisationId)
        .maybeSingle();

      const generatedName = `${crypto.randomUUID()}.${extension}`;
      const path = `${applicationId}/${generatedName}`;
      const uploadResult = await client.storage
        .from(REGISTRATION_DOCUMENT_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadResult.error) {
        throw new PlatformServiceError(
          "The registration document could not be uploaded. Please try again.",
          "unknown",
        );
      }

      const uploadedAt = new Date().toISOString();
      const { error } = await client
        .from("organization_tamil_community_details")
        .upsert(
          {
            organization_id: organisationId,
            subtype: "Tamil Sangam",
            registration_document_path: path,
            registration_document_filename: file.name.slice(0, 300),
            registration_document_uploaded_at: uploadedAt,
          },
          { onConflict: "organization_id" },
        );
      if (error) {
        await client.storage.from(REGISTRATION_DOCUMENT_BUCKET).remove([path]);
        throw mapSupabaseError(
          error,
          "The registration document could not be saved.",
        );
      }

      const previousPath = previous.data?.registration_document_path;
      if (previousPath && previousPath !== path) {
        await client.storage
          .from(REGISTRATION_DOCUMENT_BUCKET)
          .remove([previousPath]);
      }

      return { path, filename: file.name, uploadedAt };
    },

    async removeRegistrationDocument(organisationId) {
      const existing = await client
        .from("organization_tamil_community_details")
        .select("registration_document_path")
        .eq("organization_id", organisationId)
        .maybeSingle();
      const path = existing.data?.registration_document_path;

      const { error } = await client
        .from("organization_tamil_community_details")
        .upsert(
          {
            organization_id: organisationId,
            subtype: "Tamil Sangam",
            registration_document_path: null,
            registration_document_filename: "",
            registration_document_uploaded_at: null,
          },
          { onConflict: "organization_id" },
        );
      assertNoError(error, "The registration document could not be removed.");

      if (path) {
        await client.storage.from(REGISTRATION_DOCUMENT_BUCKET).remove([path]);
      }
    },

    async getRegistrationDocumentSignedUrl(path) {
      const { data, error } = await client.storage
        .from(REGISTRATION_DOCUMENT_BUCKET)
        .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
      if (error || !data) {
        throw new PlatformServiceError(
          "The registration document could not be opened. Please try again.",
          "unknown",
        );
      }
      return data.signedUrl;
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
