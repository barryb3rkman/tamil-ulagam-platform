import { describe, expect, it } from "vitest";

import { mapSupabaseError } from "./errors";

describe("Supabase enrollment error mapping", () => {
  it("uses controlled messages for authentication and authorization failures", () => {
    expect(
      mapSupabaseError({ message: "Invalid login credentials" }),
    ).toMatchObject({
      kind: "authentication",
      message: "Those credentials were not recognised.",
    });
    expect(mapSupabaseError({ code: "42501" })).toMatchObject({
      kind: "unauthorized",
      message: "You do not have permission to complete this action.",
    });
  });

  it("does not expose account existence or raw constraint details", () => {
    expect(
      mapSupabaseError({ message: "User already registered" }).message,
    ).not.toContain("already exists");
    expect(
      mapSupabaseError({
        code: "23514",
        message: "new row violates check constraint organizations_year",
      }).message,
    ).toBe("Review the registration information and try again.");
  });

  it("preserves intentional database validation guidance", () => {
    expect(
      mapSupabaseError({
        code: "23514",
        message:
          "Complete every required organization field before submission.",
      }).message,
    ).toBe("Complete every required organization field before submission.");
  });

  it("maps hosted Auth rate, confirmation, recovery and temporary failures", () => {
    expect(mapSupabaseError({ status: 429 }).kind).toBe("rate_limit");
    expect(mapSupabaseError({ code: "email_not_confirmed" }).message).toContain(
      "Confirm your email",
    );
    expect(mapSupabaseError({ code: "otp_expired" }).message).toContain(
      "invalid or has expired",
    );
    expect(mapSupabaseError({ code: "weak_password" }).kind).toBe("validation");
    expect(mapSupabaseError({ status: 503 }).message).toContain(
      "temporarily unavailable",
    );
  });
});
