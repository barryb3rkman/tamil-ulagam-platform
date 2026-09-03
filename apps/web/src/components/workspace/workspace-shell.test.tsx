import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import type { EligibleOrganisation, UserProfile } from "@tamil-ulagam/shared";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { usePlatform } from "@/features/enrollment/platform-provider";
import { useMembershipService } from "@/features/membership/use-membership-service";

import { WorkspaceShell } from "./workspace-shell";

beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal(
      this: HTMLDialogElement,
    ) {
      this.setAttribute("open", "");
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close(
      this: HTMLDialogElement,
    ) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  }
});

let pathname = "/workspace/organisation";
let query = "organization=org-1";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(query),
}));

vi.mock("@/features/enrollment/platform-provider", () => ({
  usePlatform: vi.fn(),
}));

vi.mock("@/features/membership/use-membership-service", () => ({
  useMembershipService: vi.fn(),
}));

const mockedUsePlatform = vi.mocked(usePlatform);
const mockedUseMembershipService = vi.mocked(useMembershipService);

function makeUser(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: "user-1",
    fullName: "Priya Anand",
    email: "priya@example.org",
    phone: "",
    country: "",
    termsAcceptedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function platform(overrides: Record<string, unknown> = {}) {
  mockedUsePlatform.mockReturnValue({
    isHydrated: true,
    currentUser: makeUser(),
    canReviewApplications: false,
    signOut: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof usePlatform>);
}

function membershipService(
  managedOrganisations: readonly EligibleOrganisation[] = [],
) {
  mockedUseMembershipService.mockReturnValue({
    listMyManagedOrganisations: vi.fn().mockResolvedValue(managedOrganisations),
  } as unknown as ReturnType<typeof useMembershipService>);
}

const orgA: EligibleOrganisation = {
  id: "org-1",
  name: "Acme Education Trust",
  category: "education",
  subtype: "",
  city: "Chennai",
  region: "",
  country: "India",
};

const orgB: EligibleOrganisation = {
  id: "org-2",
  name: "Second Sample Trust",
  category: "education",
  subtype: "",
  city: "Coimbatore",
  region: "",
  country: "India",
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  pathname = "/workspace/organisation";
  query = "organization=org-1";
});

describe("WorkspaceShell", () => {
  it("shows a stable skeleton before hydration — no protected content flashes", () => {
    platform({ isHydrated: false, currentUser: null });
    membershipService([]);
    render(
      <WorkspaceShell>
        <p>Protected content</p>
      </WorkspaceShell>,
    );
    expect(screen.queryByText("Protected content")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Switch workspace" }),
    ).not.toBeInTheDocument();
  });

  it("renders a minimal Sign in header for a logged-out visitor, no switcher", async () => {
    platform({ isHydrated: true, currentUser: null });
    membershipService([]);
    render(
      <WorkspaceShell>
        <p>Sign in to continue</p>
      </WorkspaceShell>,
    );
    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Switch workspace" }),
    ).not.toBeInTheDocument();
    expect(await screen.findByText("Sign in to continue")).toBeInTheDocument();
  });

  it("shows workspace identity, switcher and local navigation for an authenticated Organisation manager", async () => {
    platform({ isHydrated: true, currentUser: makeUser() });
    membershipService([orgA, orgB]);
    render(
      <WorkspaceShell>
        <p>Organisation content</p>
      </WorkspaceShell>,
    );
    const identity = screen.getByRole("group", { name: "Current workspace" });
    expect(
      await within(identity).findByText("Acme Education Trust"),
    ).toBeInTheDocument();
    expect(within(identity).getByText("Organisation")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Switch workspace" }),
    ).toHaveLength(2);
    const nav = screen.getByRole("navigation", {
      name: "Workspace navigation",
    });
    expect(nav).toHaveTextContent("Overview");
    expect(nav).toHaveTextContent("People");
    fireEvent.click(screen.getByRole("button", { name: /Programmes/ }));
    const programmes = screen.getByRole("navigation", {
      name: "Tamil Ulagam programmes",
    });
    expect(programmes).toHaveTextContent("Events");
    expect(programmes).toHaveTextContent("Education");
  });

  it("uses the caller-scoped application identity when a separate management service is unavailable", async () => {
    platform({
      myOrganisationApplications: [
        {
          organisation: {
            id: "org-1",
            name: "Acme Education Trust",
            category: "education",
            city: "Chennai",
            region: "Tamil Nadu",
            country: "India",
          },
          registration: { categoryProfile: { category: "education" } },
        },
      ],
    });
    mockedUseMembershipService.mockReturnValue(null);

    render(
      <WorkspaceShell>
        <p>Organisation content</p>
      </WorkspaceShell>,
    );

    const identity = screen.getByRole("group", { name: "Current workspace" });
    expect(within(identity).getByText("Acme Education Trust")).toBeVisible();
    expect(screen.queryByText("Unavailable workspace")).toBeNull();
  });

  it("never fabricates an Administration link for a manager without review capability", async () => {
    platform({
      isHydrated: true,
      currentUser: makeUser(),
      canReviewApplications: false,
    });
    membershipService([orgA]);
    render(
      <WorkspaceShell>
        <p>Organisation content</p>
      </WorkspaceShell>,
    );
    await within(
      screen.getByRole("group", { name: "Current workspace" }),
    ).findByText("Acme Education Trust");
    expect(screen.queryByText("Federation Admin")).not.toBeInTheDocument();
  });
});
