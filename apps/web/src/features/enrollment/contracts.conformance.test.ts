import { describe, expect, it } from "vitest";

import { createSupabasePlatformServices } from "./supabase-services";
import { createMockPlatformServices } from "./mock-services";
import { BrowserMockStateRepository } from "./repository";
import type { PlatformServices } from "./contracts";

/**
 * The mock and the Supabase implementation used to be described by two
 * separate sets of interfaces — one synchronous, one asynchronous — kept
 * in step by hand through an adapter. They now share one contract.
 *
 * TypeScript is the real guarantee here: both factories are annotated
 * with PlatformServices, so a missing or mistyped method fails the
 * build. This suite is the runtime backstop for what the compiler
 * cannot see — a method present on the type but undefined on the object,
 * a group that quietly grew on one side only, an unsubscribe that is not
 * actually callable.
 *
 * It does not talk to a database. Behaviour against real Postgres is
 * covered by the local-integration suites.
 */

const SERVICE_METHODS = {
  auth: [
    "signup",
    "login",
    "requestPasswordReset",
    "resolveAuthCallback",
    "completePasswordRecovery",
    "signOut",
    "getCurrentUser",
    "updateProfile",
  ],
  organisations: [
    "getCurrentOrganisation",
    "listCurrentOrganisations",
    "selectCurrentOrganisation",
    "updateCurrentOrganisation",
  ],
  registrations: [
    "ensureCurrentDraft",
    "getCurrentApplication",
    "updateCategory",
    "updateCategoryProfile",
    "updateRepresentative",
    "updateCurrentStep",
    "submit",
  ],
  admin: ["listApplications", "getApplication", "updateStatus"],
} as const;

const TOP_LEVEL_METHODS = [
  "snapshot",
  "canReviewApplications",
  "checkDuplicateSignals",
  "requestOrganisationEmailVerification",
  "completeOrganisationEmailVerification",
  "onAuthStateChange",
] as const;

function mockServices(): PlatformServices {
  // A null storage adapter makes the repository non-persisting, which
  // is all this shape check needs.
  return createMockPlatformServices(new BrowserMockStateRepository(null));
}

function supabaseServices(): PlatformServices {
  // Only the shape is inspected, so the client is a stub. It still needs
  // auth.onAuthStateChange, which the factory subscribes to on creation.
  const stub = {
    auth: {
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => undefined } },
      }),
    },
  };
  return createSupabasePlatformServices(
    stub as unknown as Parameters<typeof createSupabasePlatformServices>[0],
  );
}

const implementations: readonly [string, () => PlatformServices][] = [
  ["mock", mockServices],
  ["supabase", supabaseServices],
];

describe.each(implementations)("%s platform services", (_name, create) => {
  const services = create();

  it("reports which backend it is", () => {
    expect(["mock", "supabase"]).toContain(services.kind);
  });

  it.each(Object.entries(SERVICE_METHODS))(
    "implements every %s method",
    (group, methods) => {
      const target = services[group as keyof typeof SERVICE_METHODS];
      for (const method of methods) {
        expect(
          typeof (target as unknown as Record<string, unknown>)[method],
          `${group}.${method}`,
        ).toBe("function");
      }
    },
  );

  it("implements every top-level operation", () => {
    for (const method of TOP_LEVEL_METHODS) {
      expect(typeof services[method], method).toBe("function");
    }
  });

  it("returns an unsubscribe function from onAuthStateChange", () => {
    const unsubscribe = services.onAuthStateChange(() => undefined);
    expect(typeof unsubscribe).toBe("function");
    unsubscribe();
  });
});

describe("the two implementations agree", () => {
  it("expose identical method names in every group", () => {
    const mock = mockServices();
    const supabase = supabaseServices();

    for (const group of Object.keys(SERVICE_METHODS)) {
      const key = group as keyof typeof SERVICE_METHODS;
      expect(Object.keys(mock[key]).sort(), group).toEqual(
        Object.keys(supabase[key]).sort(),
      );
    }
  });
});
