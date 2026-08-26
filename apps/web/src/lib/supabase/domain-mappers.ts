import type {
  Organisation,
  OrganisationCategoryProfile,
  OrganisationRepresentative,
} from "@tamil-ulagam/shared";

import type { TablesInsert } from "./database.types";

type CategoryProfileMutation =
  | {
      readonly table: "organization_tamil_community_details";
      readonly values: TablesInsert<"organization_tamil_community_details">;
    }
  | {
      readonly table: "organization_education_details";
      readonly values: TablesInsert<"organization_education_details">;
    }
  | {
      readonly table: "organization_healthcare_details";
      readonly values: TablesInsert<"organization_healthcare_details">;
    }
  | {
      readonly table: "organization_business_details";
      readonly values: TablesInsert<"organization_business_details">;
    }
  | {
      readonly table: "organization_nonprofit_details";
      readonly values: TablesInsert<"organization_nonprofit_details">;
    }
  | {
      readonly table: "organization_other_details";
      readonly values: TablesInsert<"organization_other_details">;
    };

function optionalInteger(value: string, fieldName: string): number | null {
  const normalized = value.trim();
  if (!normalized) return null;

  if (!/^\d+$/.test(normalized)) {
    throw new Error(`${fieldName} must be a whole number.`);
  }

  return Number(normalized);
}

function optionalBoolean(value: "yes" | "no" | ""): boolean | null {
  if (!value) return null;
  return value === "yes";
}

export function mapOrganisationToDatabase(organisation: Organisation) {
  return {
    category: organisation.category || null,
    name: organisation.name.trim(),
    country: organisation.country.trim(),
    region: organisation.region.trim(),
    city: organisation.city.trim(),
    street_address: organisation.streetAddress.trim(),
    postal_code: organisation.postalCode.trim(),
    official_email: organisation.officialEmail.trim().toLowerCase(),
    official_phone: organisation.officialPhone.trim(),
    website: organisation.website.trim(),
    year_established: optionalInteger(
      organisation.yearEstablished,
      "Year established",
    ),
    description: organisation.description.trim(),
    registration_status: organisation.registrationStatus || null,
    registration_number: organisation.registrationNumber.trim(),
    registration_authority: organisation.registrationAuthority.trim(),
    registration_country: organisation.registrationCountry.trim(),
  };
}

export function mapRepresentativeToDatabase(
  representative: OrganisationRepresentative,
) {
  return {
    representative_full_name: representative.fullName.trim(),
    representative_email: representative.email.trim().toLowerCase(),
    representative_phone: representative.phone.trim(),
    representative_designation: representative.designation.trim(),
    representative_relationship: representative.relationship || null,
    authorization_declaration: representative.authorisedDeclaration,
    accuracy_declaration: representative.accuracyDeclaration,
  };
}

export function mapCategoryProfileToDatabase(
  organizationId: string,
  profile: OrganisationCategoryProfile,
): CategoryProfileMutation {
  switch (profile.category) {
    case "tamil_community":
      return {
        table: "organization_tamil_community_details" as const,
        values: {
          organization_id: organizationId,
          subtype: profile.subtype.trim(),
          primary_activities: profile.primaryActivities,
          membership_size: profile.membershipSize.trim(),
          geographic_area_served: profile.geographicAreaServed.trim(),
          chairperson_name: profile.chairpersonName.trim(),
          secretary_name: profile.secretaryName.trim(),
          languages: profile.languages.trim(),
          network_affiliated: optionalBoolean(profile.networkAffiliated),
          network_name: profile.networkName.trim(),
        },
      };
    case "education":
      return {
        table: "organization_education_details" as const,
        values: {
          organization_id: organizationId,
          institution_type: profile.institutionType.trim(),
          governance_type: profile.governanceType.trim(),
          tamil_programmes_offered: optionalBoolean(
            profile.tamilProgrammesOffered,
          ),
          tamil_programmes_description:
            profile.tamilProgrammesDescription.trim(),
          accreditation_authority: profile.accreditationAuthority.trim(),
          accreditation_number: profile.accreditationNumber.trim(),
          student_population: profile.studentPopulation.trim(),
          study_areas: profile.studyAreas,
        },
      };
    case "healthcare":
      return {
        table: "organization_healthcare_details" as const,
        values: {
          organization_id: organizationId,
          facility_type: profile.facilityType.trim(),
          ownership_type: profile.ownershipType.trim(),
          systems_of_medicine: profile.systemsOfMedicine,
          main_services: profile.mainServices.trim(),
          licensed: optionalBoolean(profile.licensed),
          licence_number: profile.licenceNumber.trim(),
          licensing_authority: profile.licensingAuthority.trim(),
          twenty_four_seven: profile.twentyFourSeven,
          emergency_services: profile.emergencyServices,
          number_of_beds: optionalInteger(
            profile.numberOfBeds,
            "Number of beds",
          ),
        },
      };
    case "business":
      return {
        table: "organization_business_details" as const,
        values: {
          organization_id: organizationId,
          business_type: profile.businessType.trim(),
          industry: profile.industry.trim(),
          products_services: profile.productsServices.trim(),
          employee_size: profile.employeeSize.trim(),
          operating_countries: profile.operatingCountries.trim(),
        },
      };
    case "nonprofit":
      return {
        table: "organization_nonprofit_details" as const,
        values: {
          organization_id: organizationId,
          subtype: profile.subtype.trim(),
          primary_areas: profile.primaryAreas,
          beneficiary_regions: profile.beneficiaryRegions.trim(),
          organization_size: profile.organisationSize.trim(),
        },
      };
    case "other":
      return {
        table: "organization_other_details" as const,
        values: {
          organization_id: organizationId,
          organization_type: profile.organisationType.trim(),
          primary_purpose: profile.primaryPurpose.trim(),
        },
      };
  }
}
