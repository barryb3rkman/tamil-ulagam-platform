import { describe, expect, it } from "vitest";

import { validatePartnershipEnquiry } from "./partnership-validation";

const validInput = {
  name: "Meena Selvaraj",
  email: "meena@example.org",
  organisationName: "Tamil Education Network",
  country: "Singapore",
  area: "education" as const,
  message:
    "We would like to discuss a responsible Tamil education collaboration.",
};

describe("validatePartnershipEnquiry", () => {
  it("accepts a concise valid enquiry", () => {
    expect(validatePartnershipEnquiry(validInput)).toEqual({});
  });

  it("validates every public trust-boundary field", () => {
    expect(
      validatePartnershipEnquiry({
        ...validInput,
        name: "",
        email: "invalid",
        country: "",
        message: "Too short",
      }),
    ).toMatchObject({
      name: expect.any(String),
      email: expect.any(String),
      country: expect.any(String),
      message: expect.any(String),
    });
  });

  it("enforces the backend-aligned maximum lengths", () => {
    expect(
      validatePartnershipEnquiry({
        ...validInput,
        organisationName: "x".repeat(241),
        message: "x".repeat(3001),
      }),
    ).toMatchObject({
      organisationName: expect.any(String),
      message: expect.any(String),
    });
  });
});
