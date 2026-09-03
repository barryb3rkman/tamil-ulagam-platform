import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { EnrollmentPlatformState } from "@tamil-ulagam/shared";

import { ApplicationShell } from "@/components/application/application-shell";

import type { PlatformServices, RuntimeAuthEvent } from "./platform-services";
import { PlatformProvider } from "./platform-provider";

vi.mock("@/lib/supabase/environment", () => ({
  getPlatformRuntimeEnvironment: () => ({
    backend: "supabase-hosted",
    supabase: { url: "https://example.supabase.co", publishableKey: "test" },
    captcha: { enabled: false },
  }),
}));
vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve({ data: [] }),
      }),
    }),
  }),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/registrations/review",
  useRouter: () => ({ push: vi.fn() }),
}));

const emptyState: EnrollmentPlatformState = {
  version: 1,
  currentUserId: null,
  users: [],
  organisations: [],
  memberships: [],
  registrations: [],
  reviewHistory: [],
};

const reviewerState: EnrollmentPlatformState = {
  ...emptyState,
  currentUserId: "user-reviewer",
  users: [
    {
      id: "user-reviewer",
      fullName: "Review Officer",
      email: "reviewer@example.org",
      phone: "",
      country: "",
      termsAcceptedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ],
};

function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function createFakeSupabaseServices(options: {
  readonly firstCheck: () => Promise<{
    readonly state: EnrollmentPlatformState;
    readonly reviewer: boolean;
  }>;
  readonly onFired?: (listener: (event: RuntimeAuthEvent) => void) => void;
}): PlatformServices {
  let callCount = 0;
  const check = async () =>
    callCount++ === 0
      ? options.firstCheck()
      : { state: reviewerState, reviewer: true };

  let pendingSnapshot: Promise<{
    state: EnrollmentPlatformState;
    reviewer: boolean;
  }> | null = null;
  const sharedCheck = () => {
    pendingSnapshot ??= check().finally(() => {
      pendingSnapshot = null;
    });
    return pendingSnapshot;
  };

  const unimplemented = () => {
    throw new Error("not used by this test");
  };

  return {
    kind: "supabase",
    auth: {
      signup: unimplemented,
      login: unimplemented,
      requestPasswordReset: unimplemented,
      resolveAuthCallback: unimplemented,
      completePasswordRecovery: unimplemented,
      signOut: unimplemented,
      getCurrentUser: unimplemented,
      updateProfile: unimplemented,
    },
    organisations: {
      getCurrentOrganisation: unimplemented,
      listCurrentOrganisations: unimplemented,
      selectCurrentOrganisation: unimplemented,
      updateCurrentOrganisation: unimplemented,
    },
    registrations: {
      ensureCurrentDraft: unimplemented,
      getCurrentApplication: unimplemented,
      updateCategory: unimplemented,
      updateCategoryProfile: unimplemented,
      updateRepresentative: unimplemented,
      updateCurrentStep: unimplemented,
      submit: unimplemented,
    },
    admin: {
      listApplications: unimplemented,
      getApplication: unimplemented,
      updateStatus: unimplemented,
    },
    snapshot: async () => (await sharedCheck()).state,
    canReviewApplications: async () => (await sharedCheck()).reviewer,
    checkDuplicateSignals: unimplemented,
    requestOrganisationEmailVerification: unimplemented,
    completeOrganisationEmailVerification: unimplemented,
    onAuthStateChange(listener) {
      options.onFired?.(listener);
      return () => undefined;
    },
  };
}

vi.mock("./supabase-services", () => ({
  createSupabasePlatformServices: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("PlatformProvider session restoration race", () => {
  it("renders admin content once the delayed real session resolves, even when no further auth event ever fires", async () => {
    const { createSupabasePlatformServices } =
      await import("./supabase-services");

    const services = createFakeSupabaseServices({
      firstCheck: () => delay({ state: emptyState, reviewer: false }, 5),
    });
    vi.mocked(createSupabasePlatformServices).mockReturnValue(services);

    render(
      <PlatformProvider>
        <ApplicationShell area="admin">
          <p>Admin content</p>
        </ApplicationShell>
      </PlatformProvider>,
    );

    await waitFor(
      () => expect(screen.getByText("Admin content")).toBeInTheDocument(),
      { timeout: 2000 },
    );
    expect(
      screen.queryByText("Review access required"),
    ).not.toBeInTheDocument();
  });

  it("still genuinely denies a real non-admin, non-reviewer account once resolved", async () => {
    const { createSupabasePlatformServices } =
      await import("./supabase-services");

    const memberState: EnrollmentPlatformState = {
      ...emptyState,
      currentUserId: "user-member",
      users: [
        {
          id: "user-member",
          fullName: "Ordinary Member",
          email: "member@example.org",
          phone: "",
          country: "",
          termsAcceptedAt: null,
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    };
    const services: PlatformServices = {
      ...createFakeSupabaseServices({
        firstCheck: () => delay({ state: memberState, reviewer: false }, 5),
      }),
      snapshot: async () => memberState,
      canReviewApplications: async () => false,
    };
    vi.mocked(createSupabasePlatformServices).mockReturnValue(services);

    render(
      <PlatformProvider>
        <ApplicationShell area="admin">
          <p>Admin content</p>
        </ApplicationShell>
      </PlatformProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText("Review access required")).toBeInTheDocument(),
    );
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
  });

  it("shows a loading state (not a denial) while unresolved, then denies a genuinely logged-out visitor", async () => {
    const { createSupabasePlatformServices } =
      await import("./supabase-services");

    const services = createFakeSupabaseServices({
      firstCheck: () => delay({ state: emptyState, reviewer: false }, 20),
    });
    vi.mocked(createSupabasePlatformServices).mockReturnValue(services);

    render(
      <PlatformProvider>
        <ApplicationShell area="admin">
          <p>Admin content</p>
        </ApplicationShell>
      </PlatformProvider>,
    );

    // Before resolution: neither the denial nor the protected content.
    expect(
      screen.queryByText("Review access required"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/loading/i);

    await waitFor(
      () =>
        expect(screen.getByText("Review access required")).toBeInTheDocument(),
      { timeout: 2000 },
    );
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
  });

  it("fails safely (denial, not infinite loading) when the session check errors out", async () => {
    const { createSupabasePlatformServices } =
      await import("./supabase-services");

    const services: PlatformServices = {
      ...createFakeSupabaseServices({
        firstCheck: () => delay({ state: emptyState, reviewer: false }, 1000),
      }),
      snapshot: () => Promise.reject(new Error("session expired")),
      canReviewApplications: () => Promise.reject(new Error("session expired")),
    };
    vi.mocked(createSupabasePlatformServices).mockReturnValue(services);

    render(
      <PlatformProvider>
        <ApplicationShell area="admin">
          <p>Admin content</p>
        </ApplicationShell>
      </PlatformProvider>,
    );

    // Must resolve to a denial rather than hang in the loading state.
    await waitFor(() =>
      expect(screen.getByText("Review access required")).toBeInTheDocument(),
    );
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
  });
});
