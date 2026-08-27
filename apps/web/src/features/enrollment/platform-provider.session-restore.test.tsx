import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { EnrollmentPlatformState } from "@tamil-ulagam/shared";

import { ApplicationShell } from "@/components/application/application-shell";

import type { PlatformServices, RuntimeAuthEvent } from "./platform-services";
import { PlatformProvider } from "./platform-provider";

// This exercises the exact class of bug found during hosted verification:
// a fresh page load's very first role/session check can resolve *before*
// the backend has finished restoring a real, already-established session
// (Supabase's browser client persists a session across more than one
// `document.cookie` write; a navigation landing mid-write reads a partial,
// "no session yet" result). The fix must never let that premature result
// become a *permanent* denial — it must keep waiting for the outcome that
// actually reflects the restored session before rendering a final verdict.
//
// `PlatformProvider` selects its backend via `createRuntimeServices()`,
// which is not otherwise injectable, so the three modules it composes are
// mocked here to substitute a fully controllable fake `PlatformServices`.
vi.mock("@/lib/supabase/environment", () => ({
  getPlatformRuntimeEnvironment: () => ({
    backend: "supabase-hosted",
    supabase: { url: "https://example.supabase.co", publishableKey: "test" },
    captcha: { enabled: false },
  }),
}));
vi.mock("@/lib/supabase/client", () => ({
  // Phase G1's platform-provider effect calls
  // .from("organization_managers").select(...).eq(...) directly (see
  // managerOnlyOrganisationIds) — a minimal thenable chain so that
  // effect resolves quietly with no rows, matching this file's own
  // narrow session-restore concern rather than management data.
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

/**
 * A fake PlatformServices whose session/role check resolves however the
 * test schedules it, and whose `onAuthStateChange` listener is exposed so
 * the test can fire a "real session just became available" signal at a
 * controlled moment — reproducing session restoration completing *after*
 * the component has already started its first check.
 */
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
    // snapshot() and canReviewApplications() are called together (via
    // Promise.all) for a single logical refresh — share one underlying
    // check per call so both reflect the same call count.
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

    // Deliberately never invoke the captured `onAuthStateChange` listener
    // — this is the scenario the hosted bug report actually described:
    // the browser client's own "INITIAL_SESSION"/"SIGNED_IN" events had
    // already fired together, clustered right at mount, before the
    // restored session was fully readable (see platform-provider.tsx's
    // comment on the bounded re-check). With no further event ever
    // coming, only re-checking on a short, bounded delay — not simply
    // waiting for *a* later event — can recover from a first check that
    // raced ahead and found nothing.
    const services = createFakeSupabaseServices({
      // The very first check races ahead of session restoration: it
      // resolves quickly, but with nothing found yet — exactly the
      // "unknown, not yet denied" state, not a confirmed denial. The
      // *second* call (this fake's bounded retry) reflects the session
      // once it has actually settled.
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

    // The permanent-denial regression: at no point should "Review access
    // required" become the settled state once restoration completes.
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
      // No user at all, on every check — a real anonymous visitor, not a
      // race. Delayed slightly so the loading state is observable first.
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

    // The retry this fake exercises (currentUserId stays null throughout)
    // still correctly settles on denial for a real anonymous visitor —
    // it is a bounded re-check, not an assumption of eventual access.
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
