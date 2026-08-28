import { cleanup, render, screen } from "@testing-library/react";
import type { OrganisationApplication } from "@tamil-ulagam/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePlatform } from "@/features/enrollment/platform-provider";
import { useSangamRegistrationService } from "@/features/sangam/use-sangam-registration-service";

import { SangamReview } from "./sangam-review";

vi.mock("@/features/enrollment/platform-provider", () => ({
  usePlatform: vi.fn(),
}));

vi.mock("@/features/sangam/use-sangam-registration-service", () => ({
  useSangamRegistrationService: vi.fn(),
}));

const mockedUsePlatform = vi.mocked(usePlatform);
const mockedUseSangamRegistrationService = vi.mocked(
  useSangamRegistrationService,
);

/**
 * Phase H3 brief section 22: "The H2 visual QA caught a real stale-data
 * defect in Review. Do not repeat that class of bug." — these tests
 * assert the Review screen renders directly from the application object
 * it is passed (the caller's live, current wizard state), rather than
 * silently falling back to some other stale source.
 */
function application(
  overrides: Partial<OrganisationApplication["registration"]> = {},
): OrganisationApplication {
  return {
    organisation: {
      id: "sangam-1",
      category: "tamil_community",
      name: "Toronto Tamil Sangam",
      country: "Canada",
      region: "Ontario",
      city: "Toronto",
      streetAddress: "",
      postalCode: "",
      officialEmail: "",
      officialPhone: "",
      website: "https://torontotamilsangam.example",
      yearEstablished: "1998",
      description: "",
      registrationStatus: "registered",
      registrationNumber: "REG-4471",
      registrationAuthority: "",
      registrationCountry: "",
      logoPreview: "",
      officialEmailVerifiedAt: null,
      officialEmailVerificationSentAt: null,
      createdAt: "2026-08-26T00:00:00.000Z",
      updatedAt: "2026-08-26T00:00:00.000Z",
    },
    registration: {
      id: "application-1",
      organisationId: "sangam-1",
      applicantUserId: "user-1",
      status: "draft",
      currentStep: 4,
      categoryProfile: {
        category: "tamil_community",
        subtype: "Tamil Sangam",
        primaryActivities: [],
        membershipSize: "",
        geographicAreaServed: "",
        chairpersonName: "",
        secretaryName: "",
        languages: "",
        networkAffiliated: "yes",
        networkName: "World Tamil Federation",
        memberCount: "240",
        spocFullName: "Kavitha Selvam",
        spocEmail: "kavitha@example.com",
        spocPhone: "+1 416 555 0100",
        presidentFullName: "Arun Kumar",
        presidentEmail: "arun@example.com",
        presidentPhone: "+1 416 555 0111",
        registrationDocumentPath: "application-1/generated-name.pdf",
        registrationDocumentFilename: "certificate.pdf",
        registrationDocumentUploadedAt: "2026-08-26T00:00:00.000Z",
        socialLinks: ["https://instagram.com/torontotamilsangam"],
      },
      representative: {
        fullName: "Kavitha Selvam",
        email: "kavitha@example.com",
        phone: "+1 416 555 0100",
        designation: "",
        relationship: "authorised_representative",
        authorisedDeclaration: true,
        accuracyDeclaration: true,
      },
      adminFeedback: "",
      submittedAt: "",
      reviewedAt: "",
      reviewedBy: "",
      createdAt: "2026-08-26T00:00:00.000Z",
      updatedAt: "2026-08-26T00:00:00.000Z",
      ...overrides,
    },
    representativeUser: {
      id: "user-1",
      fullName: "Kavitha Selvam",
      email: "kavitha@example.com",
      phone: "",
      country: "",
      termsAcceptedAt: null,
      createdAt: "2026-08-26T00:00:00.000Z",
    },
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function setup() {
  mockedUsePlatform.mockReturnValue({
    checkDuplicateSignals: vi.fn().mockResolvedValue({
      nameMatch: false,
      emailMatch: false,
      registrationNumberMatch: false,
      matches: [],
    }),
  } as unknown as ReturnType<typeof usePlatform>);
  mockedUseSangamRegistrationService.mockReturnValue(
    {} as unknown as ReturnType<typeof useSangamRegistrationService>,
  );
}

describe("SangamReview", () => {
  it("renders SPOC, President, member count and year directly from the application it is passed", () => {
    setup();
    render(
      <SangamReview
        application={application()}
        onEdit={vi.fn()}
        onSubmitted={vi.fn()}
      />,
    );

    expect(screen.getByText("240")).toBeInTheDocument();
    expect(screen.getByText("1998")).toBeInTheDocument();
    expect(screen.getAllByText("Kavitha Selvam").length).toBeGreaterThan(0);
    expect(screen.getByText("kavitha@example.com")).toBeInTheDocument();
    expect(screen.getByText("+1 416 555 0100")).toBeInTheDocument();
    expect(screen.getByText("Arun Kumar")).toBeInTheDocument();
    expect(screen.getByText("arun@example.com")).toBeInTheDocument();
    expect(screen.getByText("+1 416 555 0111")).toBeInTheDocument();
  });

  it("shows the registration certificate row (by filename) only when formally registered, with a real document attached", () => {
    setup();
    render(
      <SangamReview
        application={application()}
        onEdit={vi.fn()}
        onSubmitted={vi.fn()}
      />,
    );

    expect(screen.getByText("certificate.pdf")).toBeInTheDocument();
    expect(screen.getByText("REG-4471")).toBeInTheDocument();
  });

  it("does not show registration number/document rows for an unregistered Sangam", () => {
    setup();
    const draft = application();
    render(
      <SangamReview
        application={{
          ...draft,
          organisation: {
            ...draft.organisation,
            registrationStatus: "informal",
            registrationNumber: "",
          },
        }}
        onEdit={vi.fn()}
        onSubmitted={vi.fn()}
      />,
    );

    expect(screen.getByText("Not formally registered")).toBeInTheDocument();
    expect(screen.queryByText("certificate.pdf")).not.toBeInTheDocument();
  });

  it("shows Declaration as Confirmed only when both declaration flags are true", () => {
    setup();
    const draft = application();
    const { rerender } = render(
      <SangamReview
        application={draft}
        onEdit={vi.fn()}
        onSubmitted={vi.fn()}
      />,
    );
    expect(screen.getByText("Confirmed")).toBeInTheDocument();

    rerender(
      <SangamReview
        application={{
          ...draft,
          registration: {
            ...draft.registration,
            representative: {
              ...draft.registration.representative,
              authorisedDeclaration: false,
            },
          },
        }}
        onEdit={vi.fn()}
        onSubmitted={vi.fn()}
      />,
    );
    expect(screen.getByText("Not confirmed")).toBeInTheDocument();
  });

  it("shows the network affiliation answer, including the network name when affiliated", () => {
    setup();
    render(
      <SangamReview
        application={application()}
        onEdit={vi.fn()}
        onSubmitted={vi.fn()}
      />,
    );
    expect(
      screen.getByText("Yes — World Tamil Federation"),
    ).toBeInTheDocument();
  });

  it("shows social media links as real links", () => {
    setup();
    render(
      <SangamReview
        application={application()}
        onEdit={vi.fn()}
        onSubmitted={vi.fn()}
      />,
    );
    const link = screen.getByRole("link", {
      name: "https://instagram.com/torontotamilsangam",
    });
    expect(link).toHaveAttribute(
      "href",
      "https://instagram.com/torontotamilsangam",
    );
  });
});
