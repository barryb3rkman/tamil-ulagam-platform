import { describe, expect, it } from "vitest";

import {
  parseCaptchaConfiguration,
  parseSupabasePublicEnvironment,
  selectPlatformRuntimeEnvironment,
} from "./environment";

describe("Supabase public environment", () => {
  it("normalizes a valid browser configuration", () => {
    expect(
      parseSupabasePublicEnvironment({
        url: " https://example.supabase.co/ ",
        publishableKey: " publishable-key ",
      }),
    ).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "publishable-key",
    });
  });

  it("rejects incomplete configuration without including credential values", () => {
    expect(() =>
      parseSupabasePublicEnvironment({
        url: "https://example.supabase.co",
      }),
    ).toThrow("Supabase browser configuration is incomplete");
  });

  it("rejects non-web URLs", () => {
    expect(() =>
      parseSupabasePublicEnvironment({
        url: "file:///tmp/supabase",
        publishableKey: "publishable-key",
      }),
    ).toThrow("must use HTTP or HTTPS");
  });

  it("selects explicitly permitted mock development without Supabase", () => {
    expect(
      selectPlatformRuntimeEnvironment({
        enrollmentBackend: "mock",
        nodeEnvironment: "development",
      }),
    ).toEqual({ backend: "mock", captcha: { enabled: false } });
  });

  it("distinguishes local and hosted Supabase environments", () => {
    expect(
      selectPlatformRuntimeEnvironment({
        enrollmentBackend: "supabase",
        nodeEnvironment: "development",
        url: "http://127.0.0.1:54321",
        publishableKey: "local-key",
      }).backend,
    ).toBe("supabase-local");
    expect(
      selectPlatformRuntimeEnvironment({
        enrollmentBackend: "supabase",
        nodeEnvironment: "production",
        url: "https://project.supabase.co",
        publishableKey: "hosted-key",
      }).backend,
    ).toBe("supabase-hosted");
  });

  it("fails closed when production configuration is missing or mock is requested", () => {
    expect(
      selectPlatformRuntimeEnvironment({ nodeEnvironment: "production" })
        .backend,
    ).toBe("unavailable");
    expect(
      selectPlatformRuntimeEnvironment({
        enrollmentBackend: "mock",
        nodeEnvironment: "production",
      }).backend,
    ).toBe("unavailable");
  });

  it("keeps CAPTCHA optional and rejects partial configuration", () => {
    expect(parseCaptchaConfiguration({})).toEqual({ enabled: false });
    expect(
      parseCaptchaConfiguration({
        provider: "turnstile",
        siteKey: "public-site-key",
      }),
    ).toEqual({
      enabled: true,
      provider: "turnstile",
      siteKey: "public-site-key",
    });
    expect(() => parseCaptchaConfiguration({ provider: "turnstile" })).toThrow(
      "CAPTCHA configuration is incomplete",
    );
  });
});
