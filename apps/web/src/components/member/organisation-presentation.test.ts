import type { EligibleOrganisation } from "@tamil-ulagam/shared";
import { describe, expect, it } from "vitest";

import {
  organisationKindLabel,
  organisationLocationLabel,
} from "./organisation-presentation";

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

describe("organisationKindLabel", () => {
  it("labels a Sangam-subtyped organisation as Tamil Sangam", () => {
    expect(
      organisationKindLabel(makeOrganisation({ subtype: "Tamil Sangam" })),
    ).toBe("Tamil Sangam");
  });

  it("labels a plain tamil_community organisation with the category label", () => {
    expect(organisationKindLabel(makeOrganisation())).toBe(
      "Tamil / Community Organisation",
    );
  });

  it("labels other categories with their own category label", () => {
    expect(
      organisationKindLabel(makeOrganisation({ category: "education" })),
    ).toBe("Education");
  });
});

describe("organisationLocationLabel", () => {
  it("joins city/region/country with commas", () => {
    expect(
      organisationLocationLabel(
        makeOrganisation({
          city: "Toronto",
          region: "Ontario",
          country: "Canada",
        }),
      ),
    ).toBe("Toronto, Ontario, Canada");
  });

  it("omits empty parts", () => {
    expect(
      organisationLocationLabel(
        makeOrganisation({ city: "Toronto", region: "", country: "Canada" }),
      ),
    ).toBe("Toronto, Canada");
  });

  it("returns an empty string when nothing is set", () => {
    expect(organisationLocationLabel(makeOrganisation())).toBe("");
  });
});
