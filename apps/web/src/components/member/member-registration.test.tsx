import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { EligibleOrganisation, Membership } from "@tamil-ulagam/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePlatform } from "@/features/enrollment/platform-provider";
import { useMembershipService } from "@/features/membership/use-membership-service";

import { MemberRegistration } from "./member-registration";

vi.mock("@/features/enrollment/platform-provider", () => ({
  usePlatform: vi.fn(),
}));

vi.mock("@/features/membership/use-membership-service", () => ({
  useMembershipService: vi.fn(),
}));

const mockedUsePlatform = vi.mocked(usePlatform);
const mockedUseMembershipService = vi.mocked(useMembershipService);

function platform(overrides: Record<string, unknown>) {
  mockedUsePlatform.mockReturnValue({
    isHydrated: true,
    currentUser: null,
    ...overrides,
  } as unknown as ReturnType<typeof usePlatform>);
}

const emptyProfile = {
  fullName: "",
  phone: "",
  country: "",
  region: "",
  city: "",
};
const filledProfile = {
  fullName: "Nila Raj",
  phone: "+1 416 555 0100",
  country: "Canada",
  region: "Ontario",
  city: "Toronto",
};

const sangam: EligibleOrganisation = {
  id: "sangam-1",
  name: "Toronto Tamil Sangam",
  category: "tamil_community",
  subtype: "Tamil Sangam",
  city: "Toronto",
  region: "Ontario",
  country: "Canada",
};
const educationOrg: EligibleOrganisation = {
  id: "org-1",
  name: "Toronto Tamil School",
  category: "education",
  subtype: "",
  city: "Toronto",
  region: "Ontario",
  country: "Canada",
};

function membership(overrides: Partial<Membership> = {}): Membership {
  return {
    id: "membership-1",
    organisationId: sangam.id,
    userId: "user-1",
    status: "pending",
    membershipType: "",
    requestedAt: new Date().toISOString(),
    invitedAt: null,
    invitedBy: null,
    decidedAt: null,
    decidedBy: null,
    expiresAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    memberEmail: "",
    connectionType: "",
    connectionContext: "",
    connectionContextExtra: "",
    ...overrides,
  };
}

function service(overrides: Record<string, unknown> = {}) {
  const base = {
    getMyProfile: vi.fn().mockResolvedValue(filledProfile),
    updateMyProfile: vi.fn().mockResolvedValue(filledProfile),
    listEligibleOrganisations: vi
      .fn()
      .mockResolvedValue([sangam, educationOrg]),
    listMyMemberships: vi.fn().mockResolvedValue([]),
    requestMembership: vi.fn().mockResolvedValue(membership()),
    ...overrides,
  };
  mockedUseMembershipService.mockReturnValue(
    base as unknown as ReturnType<typeof useMembershipService>,
  );
  return base;
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("MemberRegistration auth-aware states", () => {
  it("shows the real logged-out journey once hydrated with no user", () => {
    platform({ isHydrated: true, currentUser: null });
    mockedUseMembershipService.mockReturnValue(null);

    render(<MemberRegistration />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Connect your membership",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Create account" }),
    ).toBeInTheDocument();
  });

  it("shows an unavailable message when Supabase isn't configured", () => {
    platform({
      isHydrated: true,
      currentUser: { id: "user-1", fullName: "Nila" },
    });
    mockedUseMembershipService.mockReturnValue(null);

    render(<MemberRegistration />);

    expect(
      screen.getByText(/not configured for this deployment/i),
    ).toBeInTheDocument();
  });

  it("shows a retry action when the directory fails to load", async () => {
    platform({
      isHydrated: true,
      currentUser: { id: "user-1", fullName: "Nila" },
    });
    service({
      listEligibleOrganisations: vi
        .fn()
        .mockRejectedValue(new Error("Network down")),
    });

    render(<MemberRegistration />);

    await waitFor(() =>
      expect(screen.getByText("Network down")).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
  });
});

describe("MemberRegistration — the full affiliation-claim flow", () => {
  it("Step 1 pre-fills the profile from the account, and blocks Continue until required fields are valid", async () => {
    platform({
      isHydrated: true,
      currentUser: { id: "user-1", fullName: "Nila" },
    });
    service({ getMyProfile: vi.fn().mockResolvedValue(emptyProfile) });

    render(<MemberRegistration />);

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Your details" }),
      ).toBeInTheDocument(),
    );
    // No account email re-asked (H4 brief section 4).
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await waitFor(() =>
      expect(screen.getByText("Enter your full name.")).toBeInTheDocument(),
    );
  });

  it("goes profile -> type -> directory -> confirm -> success for a Tamil Sangam affiliation", async () => {
    platform({
      isHydrated: true,
      currentUser: { id: "user-1", fullName: "Nila" },
    });
    const svc = service();

    render(<MemberRegistration />);

    // Step 1 — already filled, just continue.
    await waitFor(() =>
      expect(screen.getByDisplayValue("Nila Raj")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    // Step 2 — "Where are you already a member?"
    await waitFor(() =>
      expect(
        screen.getByText("Where are you already a member?"),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByText(/what would you like to join/i),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Tamil Sangam/ }));

    // Step 3 — directory, Sangam-scoped only.
    await waitFor(() =>
      expect(screen.getByText("Find your Tamil Sangam")).toBeInTheDocument(),
    );
    expect(screen.getByText("Toronto Tamil Sangam")).toBeInTheDocument();
    expect(screen.queryByText("Toronto Tamil School")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Select" }));

    // Step 4 — confirm. No category question for a Sangam.
    await waitFor(() =>
      expect(screen.getByText("Confirm your affiliation")).toBeInTheDocument(),
    );
    expect(screen.queryByText("Your involvement")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Submit affiliation" }));

    await waitFor(() =>
      expect(svc.requestMembership).toHaveBeenCalledWith(sangam.id, undefined, {
        connectionType: "",
        connectionContext: "",
        connectionContextExtra: "",
      }),
    );

    // Step 5 — success, with the "add another affiliation" path.
    await waitFor(() =>
      expect(screen.getByText("Affiliation submitted")).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("link", { name: "Open Member Workspace" }),
    ).toHaveAttribute("href", "/workspace/member");
    expect(
      screen.getByRole("button", { name: "Add another affiliation" }),
    ).toBeInTheDocument();
  });

  it("asks the category-aware connection question for an Education organisation, and requires it before submitting", async () => {
    platform({
      isHydrated: true,
      currentUser: { id: "user-1", fullName: "Nila" },
    });
    const svc = service();

    render(<MemberRegistration />);

    await waitFor(() =>
      expect(screen.getByDisplayValue("Nila Raj")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await waitFor(() => screen.getByText("Where are you already a member?"));
    fireEvent.click(screen.getByRole("button", { name: /^Organisation/ }));

    await waitFor(() => screen.getByText("Find your Organisation"));
    fireEvent.click(screen.getByRole("button", { name: "Select" }));

    await waitFor(() => screen.getByText("Confirm your affiliation"));
    expect(
      screen.getByText("Your connection to this organisation"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Submit affiliation" }));
    await waitFor(() =>
      expect(
        screen.getByText("Select the option that best describes you."),
      ).toBeInTheDocument(),
    );
    expect(svc.requestMembership).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("radio", { name: "Student" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit affiliation" }));
    await waitFor(() =>
      expect(svc.requestMembership).toHaveBeenCalledWith(
        educationOrg.id,
        undefined,
        {
          connectionType: "Student",
          connectionContext: "",
          connectionContextExtra: "",
        },
      ),
    );
  });
});
