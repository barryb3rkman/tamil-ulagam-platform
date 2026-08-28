import type { Organisation, TamilCommunityProfile } from "@tamil-ulagam/shared";
import { describe, expect, it } from "vitest";

import {
  isValidUrl,
  normalizeUrl,
  validatePresident,
  validateSangamIdentity,
  validateSangamRegistrationDetails,
  validateSocialLinks,
  validateSpoc,
  validateWebsite,
} from "./sangam-validation";

function organisation(overrides: Partial<Organisation> = {}): Organisation {
  return {
    id: "sangam-1",
    category: "tamil_community",
    name: "Toronto Tamil Sangam",
    country: "Canada",
    region: "Ontario",
    city: "Toronto",
    streetAddress: "",
    postalCode: "",
    officialEmail: "",
    officialPhone: "",
    website: "",
    yearEstablished: "1998",
    description: "",
    registrationStatus: "informal",
    registrationNumber: "",
    registrationAuthority: "",
    registrationCountry: "",
    logoPreview: "",
    officialEmailVerifiedAt: null,
    officialEmailVerificationSentAt: null,
    createdAt: "2026-08-26T00:00:00.000Z",
    updatedAt: "2026-08-26T00:00:00.000Z",
    ...overrides,
  };
}

function profile(
  overrides: Partial<TamilCommunityProfile> = {},
): TamilCommunityProfile {
  return {
    category: "tamil_community",
    subtype: "Tamil Sangam",
    primaryActivities: [],
    membershipSize: "",
    geographicAreaServed: "",
    chairpersonName: "",
    secretaryName: "",
    languages: "",
    networkAffiliated: "",
    networkName: "",
    memberCount: "240",
    spocFullName: "Kavitha Selvam",
    spocEmail: "kavitha@example.com",
    spocPhone: "+1 416 555 0100",
    presidentFullName: "Arun Kumar",
    presidentEmail: "arun@example.com",
    presidentPhone: "+1 416 555 0111",
    registrationDocumentPath: "",
    registrationDocumentFilename: "",
    registrationDocumentUploadedAt: "",
    socialLinks: [],
    ...overrides,
  };
}

describe("validateSangamIdentity", () => {
  it("is valid for complete identity/location/year/member-count data", () => {
    expect(validateSangamIdentity(organisation(), profile())).toEqual({});
  });

  it("requires the approximate member count, as a positive whole number", () => {
    expect(
      validateSangamIdentity(organisation(), profile({ memberCount: "" })),
    ).toHaveProperty("memberCount");
    expect(
      validateSangamIdentity(organisation(), profile({ memberCount: "0" })),
    ).toHaveProperty("memberCount");
    expect(
      validateSangamIdentity(organisation(), profile({ memberCount: "-5" })),
    ).toHaveProperty("memberCount");
    expect(
      validateSangamIdentity(organisation(), profile({ memberCount: "12.5" })),
    ).toHaveProperty("memberCount");
  });

  it("requires a four-digit year of commencement that is not in the future", () => {
    const nextYear = String(new Date().getFullYear() + 1);
    expect(
      validateSangamIdentity(organisation({ yearEstablished: "" }), profile()),
    ).toHaveProperty("yearEstablished");
    expect(
      validateSangamIdentity(
        organisation({ yearEstablished: nextYear }),
        profile(),
      ),
    ).toHaveProperty("yearEstablished");
    expect(
      validateSangamIdentity(
        organisation({ yearEstablished: "1750" }),
        profile(),
      ),
    ).toHaveProperty("yearEstablished");
  });
});

describe("validateSangamRegistrationDetails", () => {
  it("requires nothing extra when not formally registered", () => {
    expect(
      validateSangamRegistrationDetails(
        organisation({ registrationStatus: "informal" }),
        false,
      ),
    ).toEqual({});
  });

  it("requires a registration number and a document when formally registered", () => {
    const errors = validateSangamRegistrationDetails(
      organisation({
        registrationStatus: "registered",
        registrationNumber: "",
      }),
      false,
    );
    expect(errors).toHaveProperty("registrationNumber");
    expect(errors).toHaveProperty("registrationDocument");
  });

  it("is valid once registered with both a number and an uploaded document", () => {
    expect(
      validateSangamRegistrationDetails(
        organisation({
          registrationStatus: "registered",
          registrationNumber: "REG-1",
        }),
        true,
      ),
    ).toEqual({});
  });
});

describe("validateSpoc / validatePresident", () => {
  it("require full name, a valid email, and a phone number for each", () => {
    expect(validateSpoc(profile())).toEqual({});
    expect(validatePresident(profile())).toEqual({});

    const emptySpoc = validateSpoc(
      profile({ spocFullName: "", spocEmail: "", spocPhone: "" }),
    );
    expect(emptySpoc).toHaveProperty("spocFullName");
    expect(emptySpoc).toHaveProperty("spocEmail");
    expect(emptySpoc).toHaveProperty("spocPhone");

    expect(
      validatePresident(profile({ presidentEmail: "not-an-email" })),
    ).toHaveProperty("presidentEmail");
  });
});

describe("normalizeUrl / isValidUrl", () => {
  it("accepts a bare domain and normalizes it to https", () => {
    expect(normalizeUrl("sangam.example.com")).toBe(
      "https://sangam.example.com/",
    );
    expect(isValidUrl("sangam.example.com")).toBe(true);
  });

  it("accepts an explicit http(s) URL as-is", () => {
    expect(isValidUrl("https://sangam.example.com")).toBe(true);
  });

  it("rejects a non-http(s) scheme and garbage input", () => {
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
    expect(isValidUrl("not a url at all")).toBe(false);
  });

  it("treats an empty value as valid (optional field)", () => {
    expect(isValidUrl("")).toBe(true);
  });
});

describe("validateWebsite / validateSocialLinks", () => {
  it("is valid when the website is empty (optional)", () => {
    expect(validateWebsite(organisation({ website: "" }))).toEqual({});
  });

  it("rejects an invalid website", () => {
    expect(
      validateWebsite(organisation({ website: "not a url" })),
    ).toHaveProperty("website");
  });

  it("does not require every social link to be filled — zero links is valid", () => {
    expect(validateSocialLinks([])).toBe("");
  });

  it("flags an invalid social link without requiring all of them to be valid", () => {
    expect(
      validateSocialLinks(["https://instagram.com/sangam", "not a url"]),
    ).not.toBe("");
    expect(validateSocialLinks(["https://instagram.com/sangam"])).toBe("");
  });
});
