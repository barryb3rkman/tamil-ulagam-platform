import { describe, expect, it } from "vitest";

import { isTamilSangam, type EligibleOrganisation } from "./membership";

function makeOrganisation(
  overrides: Partial<EligibleOrganisation> = {},
): EligibleOrganisation {
  return {
    id: "organisation-1",
    name: "Example",
    category: "tamil_community",
    subtype: "",
    city: "",
    region: "",
    country: "",
    ...overrides,
  };
}

describe("isTamilSangam", () => {
  it("is true for a tamil_community organisation subtyped exactly 'Tamil Sangam'", () => {
    expect(isTamilSangam(makeOrganisation({ subtype: "Tamil Sangam" }))).toBe(
      true,
    );
  });

  it("is case/whitespace-insensitive on the subtype value", () => {
    expect(
      isTamilSangam(makeOrganisation({ subtype: "  tamil sangam  " })),
    ).toBe(true);
  });

  it("is false for a tamil_community organisation with no subtype recorded", () => {
    expect(isTamilSangam(makeOrganisation({ subtype: "" }))).toBe(false);
  });

  it("is false for a tamil_community organisation with a different subtype", () => {
    expect(
      isTamilSangam(makeOrganisation({ subtype: "Cultural Association" })),
    ).toBe(false);
  });

  it("is false for any non-tamil_community category, even if the subtype text matches", () => {
    expect(
      isTamilSangam(
        makeOrganisation({ category: "business", subtype: "Tamil Sangam" }),
      ),
    ).toBe(false);
  });

  it("is never derived from the organisation's name", () => {
    expect(
      isTamilSangam(
        makeOrganisation({
          name: "Downtown Tamil Sangam Society",
          subtype: "",
        }),
      ),
    ).toBe(false);
  });
});
