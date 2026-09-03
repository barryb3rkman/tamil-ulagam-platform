import type {
  EnrollmentPlatformState,
  OrganisationRegistration,
} from "@tamil-ulagam/shared";
import { describe, expect, it } from "vitest";

import {
  selectApplications,
  selectAvailableOrganisations,
  selectCurrentApplication,
  selectMyOrganisationApplications,
} from "./platform-selectors";

function state(
  overrides: Partial<EnrollmentPlatformState> = {},
): EnrollmentPlatformState {
  return {
    version: 1,
    currentUserId: "user-1",
    users: [
      {
        id: "user-1",
        fullName: "Nila Raj",
        email: "nila@example.org",
        phone: "",
        country: "",
        termsAcceptedAt: null,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "user-2",
        fullName: "Arun Kumar",
        email: "arun@example.org",
        phone: "",
        country: "",
        termsAcceptedAt: null,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
    organisations: [
      organisation("org-1", "Chennai Education Trust"),
      organisation("org-2", "Toronto Tamil Sangam"),
      organisation("org-3", "Someone Else Trust"),
    ],
    memberships: [],
    registrations: [],
    ...overrides,
  };
}

function organisation(id: string, name: string) {
  return {
    id,
    name,
    category: "education",
    subtype: "",
    city: "",
    region: "",
    country: "",
    officialEmail: `${id}@example.org`,
    registrationNumber: "",
  } as unknown as EnrollmentPlatformState["organisations"][number];
}

function membership(
  organisationId: string,
  isPrimary = false,
  userId = "user-1",
) {
  return {
    id: `membership-${organisationId}-${userId}`,
    userId,
    organisationId,
    role: "owner",
    isPrimary,
    createdAt: "2026-01-01T00:00:00.000Z",
  } as EnrollmentPlatformState["memberships"][number];
}

function registration(
  id: string,
  organisationId: string,
  applicantUserId: string,
  categoryProfile: unknown = null,
): OrganisationRegistration {
  return {
    id,
    organisationId,
    applicantUserId,
    status: "draft",
    currentStep: 1,
    categoryProfile,
    representative: {
      fullName: "Nila Raj",
      role: "",
      email: "",
      phone: "",
    },
    adminFeedback: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  } as unknown as OrganisationRegistration;
}

describe("selectApplications", () => {
  it("keeps everything for a reviewer on the mock backend", () => {
    const result = selectApplications(
      state({
        registrations: [registration("reg-1", "org-1", "user-1")],
        memberships: [membership("org-1", true)],
      }),
      "mock",
      true,
    );
    expect(result.map((item) => item.registration.id)).toEqual(["reg-1"]);
  });

  it("hides a reviewer's own registration on the real backend", () => {
    const result = selectApplications(
      state({
        registrations: [
          registration("reg-own", "org-1", "user-1"),
          registration("reg-other", "org-3", "user-2"),
        ],
      }),
      "supabase",
      true,
    );
    expect(result.map((item) => item.registration.id)).toEqual(["reg-other"]);
  });

  it("hides a registration belonging to an organisation the reviewer is part of", () => {
    const result = selectApplications(
      state({
        registrations: [registration("reg-linked", "org-1", "user-2")],
        memberships: [membership("org-1")],
      }),
      "supabase",
      true,
    );
    expect(result).toEqual([]);
  });

  it("leaves the queue alone for someone who cannot review", () => {
    const result = selectApplications(
      state({ registrations: [registration("reg-own", "org-1", "user-1")] }),
      "supabase",
      false,
    );
    expect(result.map((item) => item.registration.id)).toEqual(["reg-own"]);
  });
});

describe("selectMyOrganisationApplications", () => {
  it("includes an organisation you manage without being a member of it", () => {
    const result = selectMyOrganisationApplications(
      state({ registrations: [registration("reg-1", "org-1", "user-2")] }),
      new Set(["org-1"]),
    );
    expect(result.map((item) => item.registration.id)).toEqual(["reg-1"]);
  });

  it("excludes an organisation you neither applied for, joined nor manage", () => {
    const result = selectMyOrganisationApplications(
      state({ registrations: [registration("reg-1", "org-3", "user-2")] }),
      new Set(),
    );
    expect(result).toEqual([]);
  });
});

describe("selectAvailableOrganisations", () => {
  it("returns only the organisations the signed-in user belongs to", () => {
    const result = selectAvailableOrganisations(
      state({ memberships: [membership("org-2")] }),
    );
    expect(result.map((item) => item.id)).toEqual(["org-2"]);
  });

  it("returns nothing when nobody is signed in", () => {
    expect(
      selectAvailableOrganisations(state({ currentUserId: null })),
    ).toEqual([]);
  });
});

describe("selectCurrentApplication", () => {
  const sangamProfile = {
    category: "tamil_community",
    subtype: "Tamil Sangam",
  };

  it("prefers the primary membership when there are several", () => {
    const result = selectCurrentApplication(
      state({
        memberships: [membership("org-3"), membership("org-1", true)],
        registrations: [
          registration("reg-3", "org-3", "user-1"),
          registration("reg-1", "org-1", "user-1"),
        ],
      }),
    );
    expect(result?.registration.id).toBe("reg-1");
  });

  it("never picks a Tamil Sangam, which has its own workspace", () => {
    const result = selectCurrentApplication(
      state({
        memberships: [membership("org-2", true)],
        registrations: [
          registration("reg-2", "org-2", "user-1", sangamProfile),
        ],
      }),
    );
    expect(result).toBeNull();
  });

  it("falls through a Sangam to the organisation behind it", () => {
    const result = selectCurrentApplication(
      state({
        memberships: [membership("org-2", true), membership("org-1")],
        registrations: [
          registration("reg-2", "org-2", "user-1", sangamProfile),
          registration("reg-1", "org-1", "user-1"),
        ],
      }),
    );
    expect(result?.registration.id).toBe("reg-1");
  });
});
