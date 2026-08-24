import { describe, expect, it } from "vitest";

import {
  mapApplicationRow,
  mapCategoryDetailRow,
  mapOrganizationRow,
  mapReviewHistoryRow,
  type ApplicationReviewHistoryRow,
  type OrganizationApplicationRow,
  type OrganizationRow,
} from "./database-row-mappers";

describe("Supabase enrollment row mappers", () => {
  it("maps database organisation values without leaking database names", () => {
    const row: OrganizationRow = {
      id: "organization-1",
      category: "business",
      name: "Tamil Enterprise Network",
      country: "Singapore",
      region: "Central Region",
      city: "Singapore",
      street_address: "1 Community Way",
      postal_code: "018989",
      official_email: "office@example.org",
      official_phone: "+65 6000 0000",
      website: "https://example.org",
      year_established: 2020,
      description: "A professional network.",
      logo_path: null,
      registration_status: "registered",
      registration_number: "REG-1",
      registration_authority: "Registry",
      registration_country: "Singapore",
      official_email_verified_at: null,
      official_email_verification_sent_at: null,
      created_at: "2026-08-21T00:00:00.000Z",
      updated_at: "2026-08-21T01:00:00.000Z",
    };

    expect(mapOrganizationRow(row)).toMatchObject({
      category: "business",
      streetAddress: "1 Community Way",
      yearEstablished: "2020",
      logoPreview: "",
    });
  });

  it("maps tri-state and list category fields into the discriminated union", () => {
    expect(
      mapCategoryDetailRow("healthcare", {
        organization_id: "organization-1",
        facility_type: "Clinic",
        ownership_type: "Private",
        systems_of_medicine: ["Modern Medicine", "Siddha"],
        main_services: "Primary care",
        licensed: true,
        licence_number: "HL-2048",
        licensing_authority: "Provincial health authority",
        twenty_four_seven: false,
        emergency_services: true,
        number_of_beds: 12,
        created_at: "2026-08-21T00:00:00.000Z",
        updated_at: "2026-08-21T00:00:00.000Z",
      }),
    ).toEqual(
      expect.objectContaining({
        category: "healthcare",
        systemsOfMedicine: ["Modern Medicine", "Siddha"],
        licensed: "yes",
        numberOfBeds: "12",
      }),
    );
  });

  it("maps application and immutable review-history state", () => {
    const applicationRow: OrganizationApplicationRow = {
      id: "application-1",
      organization_id: "organization-1",
      submitted_by: "user-1",
      status: "under_review",
      current_step: 8,
      representative_full_name: "Nila Raj",
      representative_email: "nila@example.org",
      representative_phone: "+1 416 555 0110",
      representative_designation: "Secretary",
      representative_relationship: "secretary",
      authorization_declaration: true,
      accuracy_declaration: true,
      admin_feedback: null,
      submitted_at: "2026-08-21T01:00:00.000Z",
      reviewed_at: "2026-08-21T02:00:00.000Z",
      reviewed_by: "reviewer-1",
      created_at: "2026-08-21T00:00:00.000Z",
      updated_at: "2026-08-21T02:00:00.000Z",
    };
    const historyRow: ApplicationReviewHistoryRow = {
      id: "history-1",
      application_id: "application-1",
      actor_user_id: "reviewer-1",
      previous_status: "submitted",
      new_status: "under_review",
      feedback: null,
      created_at: "2026-08-21T02:00:00.000Z",
    };

    expect(mapApplicationRow(applicationRow, null, "Reviewer")).toMatchObject({
      currentStep: 4,
      reviewedBy: "Reviewer",
      representative: { authorisedDeclaration: true },
    });
    expect(mapReviewHistoryRow(historyRow)).toEqual({
      id: "history-1",
      applicationId: "application-1",
      actorUserId: "reviewer-1",
      previousStatus: "submitted",
      newStatus: "under_review",
      feedback: "",
      createdAt: "2026-08-21T02:00:00.000Z",
    });
  });
});
