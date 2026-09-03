import { describe, expect, it } from "vitest";

import { authJourneyPresentation } from "./auth-journey";

describe("authJourneyPresentation", () => {
  it.each([
    ["/join/member", "member"],
    ["/workspace/member", "member"],
    ["/join/sangam", "sangam"],
    ["/workspace/sangam?sangam=one", "sangam"],
    ["/join/organisation", "organisation"],
    ["/register", "organisation"],
    ["/workspace/organisation?organization=one", "organisation"],
  ] as const)("maps %s to the %s journey", (target, expectedJourney) => {
    expect(authJourneyPresentation(target, "signup").journey).toBe(
      expectedJourney,
    );
  });

  it("uses the general account journey when there is no recognised target", () => {
    expect(authJourneyPresentation(null, "login").journey).toBe("general");
    expect(authJourneyPresentation("/contact", "login").journey).toBe(
      "general",
    );
  });
});
