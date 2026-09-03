import { render, screen } from "@testing-library/react";
import type { OrganisationApplication } from "@tamil-ulagam/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePlatform } from "@/features/enrollment/platform-provider";

import { OrganisationWorkspace } from "./organisation-workspace";

let searchParamValue = "";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/organisation",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => ({
    get: (key: string) =>
      key === "organization" ? searchParamValue || null : null,
  }),
}));

vi.mock("@/features/enrollment/platform-provider", () => ({
  usePlatform: vi.fn(),
}));

const mockedUsePlatform = vi.mocked(usePlatform);

function makeApplication(
  overrides: Partial<{
    id: string;
    name: string;
    status: OrganisationApplication["registration"]["status"];
    category: "business" | "tamil_community";
  }> = {},
): OrganisationApplication {
  const id = overrides.id ?? "org-1";
  const category = overrides.category ?? "business";
  return {
    organisation: {
      id,
      category,
      name: overrides.name ?? "Nila Global Services",
      country: "Canada",
      region: "Ontario",
      city: "Toronto",
      streetAddress: "",
      postalCode: "",
      officialEmail: "office@nilaglobal.example",
      officialPhone: "+1 416 555 0100",
      website: "",
      yearEstablished: "",
      description: "",
      registrationStatus: "informal",
      registrationNumber: "",
      registrationAuthority: "",
      registrationCountry: "",
      logoPreview: "",
      officialEmailVerifiedAt: null,
      officialEmailVerificationSentAt: null,
      createdAt: "2026-08-26T00:00:00.000Z",
      updatedAt: "2026-08-26T00:00:00.000Z",
    },
    registration: {
      id: `application-${id}`,
      organisationId: id,
      applicantUserId: "user-1",
      status: overrides.status ?? "verified",
      currentStep: 4,
      categoryProfile:
        category === "business"
          ? {
              category: "business",
              businessType: "Private Company",
              industry: "Technology",
              productsServices: "",
              employeeSize: "",
              operatingCountries: "",
            }
          : {
              category: "tamil_community",
              subtype: "Tamil Sangam",
              primaryActivities: [],
              membershipSize: "",
              geographicAreaServed: "",
              chairpersonName: "",
              secretaryName: "",
              languages: "",
              networkAffiliated: "",
              networkName: "",
              memberCount: "",
              spocFullName: "",
              spocEmail: "",
              spocPhone: "",
              presidentFullName: "",
              presidentEmail: "",
              presidentPhone: "",
              registrationDocumentPath: "",
              registrationDocumentFilename: "",
              registrationDocumentUploadedAt: "",
              socialLinks: [],
            },
      representative: {
        fullName: "Nila",
        email: "nila@example.com",
        phone: "",
        designation: "",
        relationship: "president",
        authorisedDeclaration: true,
        accuracyDeclaration: true,
      },
      adminFeedback: "",
      submittedAt: "2026-08-25T00:00:00.000Z",
      reviewedAt: "2026-08-25T12:00:00.000Z",
      reviewedBy: "Tamil Ulagam review team",
      createdAt: "2026-08-25T00:00:00.000Z",
      updatedAt: "2026-08-25T12:00:00.000Z",
    },
    representativeUser: {
      id: "user-1",
      fullName: "Nila",
      email: "nila@example.com",
      phone: "",
      country: "",
      termsAcceptedAt: null,
      createdAt: "2026-08-25T00:00:00.000Z",
    },
  };
}

function platform(overrides: Record<string, unknown>) {
  mockedUsePlatform.mockReturnValue({
    isHydrated: true,
    currentUser: null,
    platformError: "",
    myOrganisationApplications: [],
    ...overrides,
  } as unknown as ReturnType<typeof usePlatform>);
}

afterEach(() => {
  vi.clearAllMocks();
  searchParamValue = "";
});

describe("OrganisationWorkspace", () => {
  it("shows a sign-in prompt for a logged-out visitor", () => {
    platform({ isHydrated: true, currentUser: null });

    render(<OrganisationWorkspace />);

    expect(
      screen.getByRole("heading", {
        name: /Sign in to view your Organisation Workspace/i,
      }),
    ).toBeInTheDocument();
  });

  it("shows a purposeful empty state when the signed-in user manages no organisation", () => {
    platform({
      isHydrated: true,
      currentUser: { id: "user-1", fullName: "Nila" },
      myOrganisationApplications: [],
    });

    render(<OrganisationWorkspace />);

    expect(
      screen.getByText("You don't manage an organisation yet"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Register an organisation" }),
    ).toHaveAttribute("href", "/join/organisation");
  });

  it("excludes Tamil Sangams from the Organisation workspace's own organisation list", async () => {
    searchParamValue = "org-1";
    const sangam = makeApplication({
      id: "sangam-1",
      name: "Riverside Tamil Sangam",
      category: "tamil_community",
    });
    const organisation = makeApplication({ id: "org-1" });
    platform({
      isHydrated: true,
      currentUser: { id: "user-1", fullName: "Nila" },
      myOrganisationApplications: [sangam, organisation],
    });

    render(<OrganisationWorkspace />);

    expect(
      await screen.findByRole("heading", { name: "Nila Global Services" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(sangam.organisation.name),
    ).not.toBeInTheDocument();
  });

  it("shows identity, status and verification signals for the requested organisation", async () => {
    searchParamValue = "org-1";
    const organisation = makeApplication({ id: "org-1", status: "verified" });
    platform({
      isHydrated: true,
      currentUser: { id: "user-1", fullName: "Nila" },
      myOrganisationApplications: [organisation],
    });

    render(<OrganisationWorkspace />);

    expect(
      await screen.findByRole("heading", { name: "Nila Global Services" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Federation status" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.getByText("Organisation email")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open people management" }),
    ).toHaveAttribute(
      "href",
      "/workspace/organisation/people?organization=org-1",
    );
  });

  it("shows review feedback from the persisted record when present", async () => {
    searchParamValue = "org-1";
    const organisation = makeApplication({
      id: "org-1",
      status: "needs_changes",
    });
    organisation.registration.adminFeedback =
      "Confirm the official email address.";
    platform({
      isHydrated: true,
      currentUser: { id: "user-1", fullName: "Nila" },
      myOrganisationApplications: [organisation],
    });

    render(<OrganisationWorkspace />);

    expect(await screen.findByText("Changes Requested")).toBeInTheDocument();
    expect(
      screen.getByText("Confirm the official email address."),
    ).toBeInTheDocument();
  });

  it("shows a picker when the account manages more than one organisation", async () => {
    const first = makeApplication({
      id: "org-1",
      name: "Nila Global Services",
    });
    const second = makeApplication({
      id: "org-2",
      name: "Second Organisation",
    });
    platform({
      isHydrated: true,
      currentUser: { id: "user-1", fullName: "Nila" },
      myOrganisationApplications: [first, second],
    });

    render(<OrganisationWorkspace />);

    expect(
      await screen.findByText("Choose an organisation"),
    ).toBeInTheDocument();
    expect(screen.getByText("Nila Global Services")).toBeInTheDocument();
    expect(screen.getByText("Second Organisation")).toBeInTheDocument();
  });
});
