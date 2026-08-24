import type {
  ApplicationReviewEvent,
  Organisation,
  OrganisationCategory,
  OrganisationCategoryProfile,
  OrganisationMembership,
  OrganisationRegistration,
  UserProfile,
} from "@tamil-ulagam/shared";

import { createEmptyCategoryProfile } from "@/features/enrollment/mock-data";
import type { Tables } from "@/lib/supabase/database.types";

export type ProfileRow = Tables<"profiles">;
export type OrganizationRow = Tables<"organizations">;
export type OrganizationMemberRow = Tables<"organization_members">;
export type OrganizationApplicationRow = Tables<"organization_applications">;
export type ApplicationReviewHistoryRow = Tables<"application_review_history">;
export type CategoryDetailRow =
  | Tables<"organization_tamil_community_details">
  | Tables<"organization_education_details">
  | Tables<"organization_healthcare_details">
  | Tables<"organization_business_details">
  | Tables<"organization_nonprofit_details">
  | Tables<"organization_other_details">;

function valueAt(row: CategoryDetailRow, key: string): unknown {
  return (row as unknown as Readonly<Record<string, unknown>>)[key];
}

function text(row: CategoryDetailRow, key: string): string {
  const value = valueAt(row, key);
  return typeof value === "string" ? value : "";
}

function textList(row: CategoryDetailRow, key: string): string[] {
  const value = valueAt(row, key);
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function optionalBoolean(
  row: CategoryDetailRow,
  key: string,
): "yes" | "no" | "" {
  const value = valueAt(row, key);
  return typeof value === "boolean" ? (value ? "yes" : "no") : "";
}

export function mapProfileRow(row: ProfileRow, email: string): UserProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    email,
    phone: row.phone,
    country: row.country,
    termsAcceptedAt: row.terms_accepted_at,
    createdAt: row.created_at,
  };
}

export function mapOrganizationRow(row: OrganizationRow): Organisation {
  return {
    id: row.id,
    category: row.category ?? "",
    name: row.name,
    country: row.country,
    region: row.region,
    city: row.city,
    streetAddress: row.street_address,
    postalCode: row.postal_code,
    officialEmail: row.official_email,
    officialPhone: row.official_phone,
    website: row.website,
    yearEstablished: row.year_established?.toString() ?? "",
    description: row.description,
    registrationStatus: row.registration_status ?? "",
    registrationNumber: row.registration_number,
    registrationAuthority: row.registration_authority,
    registrationCountry: row.registration_country,
    logoPreview: row.logo_path ?? "",
    officialEmailVerifiedAt: row.official_email_verified_at,
    officialEmailVerificationSentAt: row.official_email_verification_sent_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapOrganizationMemberRow(
  row: OrganizationMemberRow,
): OrganisationMembership {
  return {
    id: row.id,
    userId: row.user_id,
    organisationId: row.organization_id,
    role: row.role,
    isPrimary: row.is_primary,
    createdAt: row.created_at,
  };
}

export function mapCategoryDetailRow(
  category: OrganisationCategory,
  row?: CategoryDetailRow,
): OrganisationCategoryProfile {
  if (!row) return createEmptyCategoryProfile(category);

  switch (category) {
    case "tamil_community":
      return {
        category,
        subtype: text(row, "subtype"),
        primaryActivities: textList(row, "primary_activities"),
        membershipSize: text(row, "membership_size"),
        geographicAreaServed: text(row, "geographic_area_served"),
        chairpersonName: text(row, "chairperson_name"),
        secretaryName: text(row, "secretary_name"),
        languages: text(row, "languages"),
      };
    case "education":
      return {
        category,
        institutionType: text(row, "institution_type"),
        governanceType: text(row, "governance_type"),
        tamilProgrammesOffered: optionalBoolean(
          row,
          "tamil_programmes_offered",
        ),
        tamilProgrammesDescription: text(row, "tamil_programmes_description"),
        accreditationAuthority: text(row, "accreditation_authority"),
        accreditationNumber: text(row, "accreditation_number"),
        studentPopulation: text(row, "student_population"),
        studyAreas: textList(row, "study_areas"),
      };
    case "healthcare":
      return {
        category,
        facilityType: text(row, "facility_type"),
        ownershipType: text(row, "ownership_type"),
        systemsOfMedicine: textList(row, "systems_of_medicine"),
        mainServices: text(row, "main_services"),
        licensed: optionalBoolean(row, "licensed"),
        licenceNumber: text(row, "licence_number"),
        licensingAuthority: text(row, "licensing_authority"),
        twentyFourSeven: valueAt(row, "twenty_four_seven") === true,
        emergencyServices: valueAt(row, "emergency_services") === true,
        numberOfBeds:
          typeof valueAt(row, "number_of_beds") === "number"
            ? String(valueAt(row, "number_of_beds"))
            : "",
      };
    case "business":
      return {
        category,
        businessType: text(row, "business_type"),
        industry: text(row, "industry"),
        productsServices: text(row, "products_services"),
        employeeSize: text(row, "employee_size"),
        operatingCountries: text(row, "operating_countries"),
      };
    case "nonprofit":
      return {
        category,
        subtype: text(row, "subtype"),
        primaryAreas: textList(row, "primary_areas"),
        beneficiaryRegions: text(row, "beneficiary_regions"),
        organisationSize: text(row, "organization_size"),
      };
    case "other":
      return {
        category,
        organisationType: text(row, "organization_type"),
        primaryPurpose: text(row, "primary_purpose"),
      };
  }
}

export function mapApplicationRow(
  row: OrganizationApplicationRow,
  categoryProfile: OrganisationCategoryProfile | null,
  reviewedBy = "",
): OrganisationRegistration {
  const currentStep = Math.min(4, Math.max(1, row.current_step));
  return {
    id: row.id,
    organisationId: row.organization_id,
    applicantUserId: row.submitted_by,
    status: row.status,
    currentStep: currentStep as 1 | 2 | 3 | 4,
    categoryProfile,
    representative: {
      fullName: row.representative_full_name,
      email: row.representative_email,
      phone: row.representative_phone,
      designation: row.representative_designation,
      relationship: row.representative_relationship ?? "",
      authorisedDeclaration: row.authorization_declaration,
      accuracyDeclaration: row.accuracy_declaration,
    },
    adminFeedback: row.admin_feedback ?? "",
    submittedAt: row.submitted_at ?? "",
    reviewedAt: row.reviewed_at ?? "",
    reviewedBy,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapReviewHistoryRow(
  row: ApplicationReviewHistoryRow,
): ApplicationReviewEvent {
  return {
    id: row.id,
    applicationId: row.application_id,
    actorUserId: row.actor_user_id ?? "",
    previousStatus: row.previous_status ?? "",
    newStatus: row.new_status,
    feedback: row.feedback ?? "",
    createdAt: row.created_at,
  };
}
