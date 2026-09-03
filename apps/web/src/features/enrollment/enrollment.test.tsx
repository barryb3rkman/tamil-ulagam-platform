import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DashboardOverview } from "@/components/application/dashboard-overview";
import { RegistrationStatusBadge } from "@/components/application/registration-status-badge";
import { registrationStatusPresentation } from "@/content/enrollment";

const routerReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplace, push: vi.fn() }),
}));

import {
  createEmptyCategoryProfile,
  createSeedState,
  demoCredentials,
} from "./mock-data";
import { PlatformProvider } from "./platform-provider";
import {
  BrowserMockStateRepository,
  mockStorageKey,
  type StorageAdapter,
} from "./repository";
import { createMockPlatformServices } from "./mock-services";
import {
  validateCategoryProfile,
  validateCaptchaToken,
  validateOrganisation,
  validatePasswordRecovery,
  validateRepresentative,
  validateSignup,
} from "./validation";

class MemoryStorage implements StorageAdapter {
  private readonly values = new Map<string, string>();
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
}

afterEach(() => window.localStorage.clear());

describe("enrollment validation", () => {
  it("validates signup email, password requirements and confirmation", () => {
    expect(
      validateSignup({
        fullName: "A",
        email: "not-email",
        password: "short",
        confirmPassword: "different",
        termsAccepted: false,
      }),
    ).toEqual(
      expect.objectContaining({
        fullName: expect.any(String),
        email: expect.any(String),
        password: expect.any(String),
        confirmPassword: expect.any(String),
        termsAccepted: expect.any(String),
      }),
    );
    expect(
      validateSignup({
        fullName: "Arun Kumar",
        email: "arun@example.org",
        password: "TamilMvp1!",
        confirmPassword: "TamilMvp1!",
        termsAccepted: true,
      }),
    ).toEqual({});
  });

  it("validates recovery confirmation and optional CAPTCHA", () => {
    expect(
      validatePasswordRecovery({
        password: "TamilMvp1!",
        confirmPassword: "different",
      }),
    ).toEqual(
      expect.objectContaining({ confirmPassword: "Passwords do not match." }),
    );
    expect(
      validatePasswordRecovery({
        password: "TamilMvp1!",
        confirmPassword: "TamilMvp1!",
      }),
    ).toEqual({});
    expect(validateCaptchaToken(false, "")).toBe("");
    expect(validateCaptchaToken(true, "")).toContain("security check");
    expect(validateCaptchaToken(true, "captcha-token")).toBe("");
  });

  it("keeps lean V2 intake fields optional beyond the core classifying question", () => {
    const organisation = createSeedState().organisations[0];
    expect(organisation).toBeDefined();
    expect(
      validateOrganisation({ ...organisation!, registrationNumber: "" })
        .registrationNumber,
    ).toBeUndefined();

    const education = {
      ...createEmptyCategoryProfile("education"),
      institutionType: "School",
    };
    expect(validateCategoryProfile(education)).toEqual({});

    const healthcare = {
      ...createEmptyCategoryProfile("healthcare"),
      facilityType: "Clinic",
    };
    expect(validateCategoryProfile(healthcare)).toEqual({});

    // Business is the one category that keeps two classifying questions.
    expect(
      validateCategoryProfile(createEmptyCategoryProfile("business")),
    ).toEqual(
      expect.objectContaining({
        businessType: expect.any(String),
        industry: expect.any(String),
      }),
    );
  });

  it("requires the combined authority declaration", () => {
    const representative = createSeedState().registrations[0]?.representative;
    expect(representative).toBeDefined();
    expect(
      validateRepresentative({
        ...representative!,
        authorisedDeclaration: false,
        accuracyDeclaration: false,
      }),
    ).toEqual(expect.objectContaining({ declaration: expect.any(String) }));
    expect(
      validateRepresentative({
        ...representative!,
        authorisedDeclaration: true,
        accuracyDeclaration: false,
      }).declaration,
    ).toBeTruthy();
    expect(
      validateRepresentative({
        ...representative!,
        authorisedDeclaration: true,
        accuracyDeclaration: true,
      }).declaration,
    ).toBeUndefined();
  });
});

describe("mock service boundary", () => {
  it("supports the demo login and rejects invalid credentials", async () => {
    const services = createMockPlatformServices(
      new BrowserMockStateRepository(new MemoryStorage()),
    );
    expect(
      await services.auth.login({
        email: demoCredentials.email,
        password: "wrong",
      }),
    ).toEqual(expect.objectContaining({ ok: false }));
    expect(await services.auth.login(demoCredentials)).toEqual(
      expect.objectContaining({ ok: true }),
    );
  });

  it("restores the demo user when persisted mock data predates the seeded account", async () => {
    const storage = new MemoryStorage();
    const repository = new BrowserMockStateRepository(storage);
    const state = createSeedState();
    state.users.splice(
      state.users.findIndex((user) => user.id === "user-demo"),
      1,
    );
    repository.save(state);

    const services = createMockPlatformServices(repository);
    expect(await services.auth.login(demoCredentials)).toEqual(
      expect.objectContaining({
        ok: true,
        user: expect.objectContaining({ id: "user-demo" }),
      }),
    );
    expect(
      repository.load().users.some((user) => user.id === "user-demo"),
    ).toBe(true);
  });

  it("selects one deterministic primary organisation for a multi-organisation user", async () => {
    const repository = new BrowserMockStateRepository(new MemoryStorage());
    const state = createSeedState();
    state.currentUserId = "user-demo";
    const secondOrganisation = state.organisations.find(
      (organisation) => organisation.id === "organisation-learning",
    );
    expect(secondOrganisation).toBeDefined();
    state.memberships.push({
      id: "membership-demo-learning",
      userId: "user-demo",
      organisationId: secondOrganisation!.id,
      role: "representative",
      isPrimary: false,
      createdAt: "2026-08-20T00:00:00.000Z",
    });
    repository.save(state);
    const services = createMockPlatformServices(repository);

    await services.organisations.selectCurrentOrganisation(
      secondOrganisation!.id,
    );

    expect(
      repository
        .load()
        .memberships.filter(
          (membership) =>
            membership.userId === "user-demo" && membership.isPrimary,
        ),
    ).toEqual([
      expect.objectContaining({ organisationId: secondOrganisation!.id }),
    ]);
  });

  it("persists a category selection, draft submission and explicit admin transitions", async () => {
    const storage = new MemoryStorage();
    const repository = new BrowserMockStateRepository(storage);
    const seed = createSeedState();
    seed.users.push({
      id: "user-current",
      fullName: "Nila Raj",
      email: "nila@example.org",
      phone: "",
      country: "",
      termsAcceptedAt: "2026-08-20T00:00:00.000Z",
      createdAt: "2026-08-20T00:00:00.000Z",
    });
    seed.currentUserId = "user-current";
    repository.save(seed);
    const services = createMockPlatformServices(
      repository,
      () => "2026-08-20T10:00:00.000Z",
    );
    await services.registrations.ensureCurrentDraft();
    await services.registrations.updateCategory("business");
    expect(
      new BrowserMockStateRepository(storage)
        .load()
        .registrations.find((item) => item.id === "registration-current")
        ?.categoryProfile?.category,
    ).toBe("business");
    expect((await services.registrations.submit()).registration.status).toBe(
      "submitted",
    );
    expect(
      (
        await services.admin.updateStatus(
          "registration-current",
          "needs_changes",
          "Confirm the official email.",
        )
      ).registration.adminFeedback,
    ).toBe("Confirm the official email.");
    expect(
      (await services.admin.updateStatus("registration-current", "verified"))
        .registration.status,
    ).toBe("verified");
    expect(
      (
        await services.admin.updateStatus(
          "registration-current",
          "suspended",
          "Access is paused pending a governance review.",
        )
      ).registration.status,
    ).toBe("suspended");
    expect(
      (
        await services.admin.updateStatus(
          "registration-current",
          "rejected",
          "Unable to verify authority.",
        )
      ).registration.status,
    ).toBe("rejected");
  });
});

describe("status and dashboard presentation", () => {
  it("maps every stable status through the shared status badge", () => {
    for (const status of Object.keys(
      registrationStatusPresentation,
    ) as (keyof typeof registrationStatusPresentation)[]) {
      const { unmount } = render(<RegistrationStatusBadge status={status} />);
      expect(
        screen.getByText(registrationStatusPresentation[status].label),
      ).toBeInTheDocument();
      unmount();
    }
  });

  it("routes a user with exactly one managed organisation straight to its Organisation Workspace", async () => {
    const state = createSeedState();
    state.currentUserId = "user-demo";
    window.localStorage.setItem(mockStorageKey, JSON.stringify(state));
    render(
      <PlatformProvider>
        <DashboardOverview />
      </PlatformProvider>,
    );
    await waitFor(() =>
      expect(routerReplace).toHaveBeenCalledWith(
        "/workspace/organisation?organization=organisation-toronto",
      ),
    );
  });

  it("still routes to the Organisation Workspace when the application needs changes — the workspace itself owns status/feedback presentation now", async () => {
    const state = createSeedState();
    state.currentUserId = "user-demo";
    const registration = state.registrations.find(
      (item) => item.id === "registration-toronto",
    );
    expect(registration).toBeDefined();
    registration!.status = "needs_changes";
    registration!.adminFeedback = "Confirm the official email address.";
    window.localStorage.setItem(mockStorageKey, JSON.stringify(state));
    render(
      <PlatformProvider>
        <DashboardOverview />
      </PlatformProvider>,
    );
    await waitFor(() =>
      expect(routerReplace).toHaveBeenCalledWith(
        "/workspace/organisation?organization=organisation-toronto",
      ),
    );
  });
});
