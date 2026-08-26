import { describe, expect, it } from "vitest";

import { isTamilSangamProfile, type TamilCommunityProfile } from "./enrollment";

function sangamProfile(
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
    ...overrides,
  };
}

describe("isTamilSangamProfile", () => {
  it("is true for a tamil_community profile with subtype exactly 'Tamil Sangam'", () => {
    expect(isTamilSangamProfile(sangamProfile())).toBe(true);
  });

  it("is case/whitespace-insensitive", () => {
    expect(
      isTamilSangamProfile(sangamProfile({ subtype: "  tamil sangam  " })),
    ).toBe(true);
  });

  it("is false for a different tamil_community subtype", () => {
    expect(
      isTamilSangamProfile(sangamProfile({ subtype: "Cultural Organisation" })),
    ).toBe(false);
  });

  it("is false for a non-tamil_community category", () => {
    expect(
      isTamilSangamProfile({
        category: "education",
        institutionType: "School",
        governanceType: "",
        tamilProgrammesOffered: "",
        tamilProgrammesDescription: "",
        accreditationAuthority: "",
        accreditationNumber: "",
        studentPopulation: "",
        studyAreas: [],
      }),
    ).toBe(false);
  });

  it("is false for null", () => {
    expect(isTamilSangamProfile(null)).toBe(false);
  });
});
