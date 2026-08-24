import { describe, expect, it } from "vitest";

import type { Organisation } from "@tamil-ulagam/shared";

import {
  mapCategoryProfileToDatabase,
  mapOrganisationToDatabase,
} from "./domain-mappers";

const organisation: Organisation = {
  id: "organization-1",
  category: "education",
  name: " Global Tamil Learning Institute ",
  country: " Canada ",
  region: " Ontario ",
  city: " Toronto ",
  streetAddress: " 1 Tamil Way ",
  postalCode: " M1M 1M1 ",
  officialEmail: " INFO@EXAMPLE.ORG ",
  officialPhone: " +1 416 555 0100 ",
  website: " https://example.org ",
  yearEstablished: "2014",
  description: " Education and language programmes. ",
  registrationStatus: "registered",
  registrationNumber: " EDU-123 ",
  registrationAuthority: " Provincial authority ",
  registrationCountry: " Canada ",
  logoPreview: "data:image/png;base64,local-preview",
  officialEmailVerifiedAt: null,
  officialEmailVerificationSentAt: null,
  createdAt: "2026-08-21T00:00:00.000Z",
  updatedAt: "2026-08-21T00:00:00.000Z",
};

describe("Supabase enrollment domain mappers", () => {
  it("normalizes an organisation without persisting its local logo preview", () => {
    expect(mapOrganisationToDatabase(organisation)).toMatchObject({
      category: "education",
      name: "Global Tamil Learning Institute",
      official_email: "info@example.org",
      year_established: 2014,
      registration_status: "registered",
    });
    expect(mapOrganisationToDatabase(organisation)).not.toHaveProperty(
      "logo_path",
    );
  });

  it("maps tri-state education values and preserves multi-select arrays", () => {
    expect(
      mapCategoryProfileToDatabase("organization-1", {
        category: "education",
        institutionType: " Tamil Language Institute ",
        governanceType: " Non-profit ",
        tamilProgrammesOffered: "yes",
        tamilProgrammesDescription: " Tamil courses ",
        accreditationAuthority: "",
        accreditationNumber: "",
        studentPopulation: "101–250",
        studyAreas: ["Tamil Studies", "Research"],
      }),
    ).toEqual({
      table: "organization_education_details",
      values: {
        organization_id: "organization-1",
        institution_type: "Tamil Language Institute",
        governance_type: "Non-profit",
        tamil_programmes_offered: true,
        tamil_programmes_description: "Tamil courses",
        accreditation_authority: "",
        accreditation_number: "",
        student_population: "101–250",
        study_areas: ["Tamil Studies", "Research"],
      },
    });
  });

  it("rejects a non-numeric healthcare bed count", () => {
    expect(() =>
      mapCategoryProfileToDatabase("organization-1", {
        category: "healthcare",
        facilityType: "Clinic",
        ownershipType: "Private",
        systemsOfMedicine: ["Modern Medicine"],
        mainServices: "Primary care",
        licensed: "yes",
        licenceNumber: "LIC-1",
        licensingAuthority: "Health authority",
        twentyFourSeven: false,
        emergencyServices: false,
        numberOfBeds: "not known",
      }),
    ).toThrow("Number of beds must be a whole number");
  });
});
