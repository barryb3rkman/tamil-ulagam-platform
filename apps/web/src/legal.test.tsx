import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import PrivacyPage from "@/app/privacy/page";
import TermsPage from "@/app/terms/page";
import { privacyPolicy, termsOfUse } from "@/content/legal";

afterEach(() => cleanup());

function expectDraftDocumentBasics(
  container: HTMLElement,
  title: string,
): void {
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(title);
  expect(screen.getByText("Draft for Legal Review")).toBeVisible();
  expect(screen.getAllByText("Not yet approved")).toHaveLength(2);
  expect(screen.getAllByText("Pending confirmation")).toHaveLength(2);
  expect(screen.getByText("Not yet the final governing policy")).toBeVisible();
  expect(container.querySelector("form")).toBeNull();
  expect(container.querySelector("input, textarea, select")).toBeNull();
  expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
  expect(container.querySelector('a[href^="tel:"]')).toBeNull();
  expect(container.querySelector("address")).toBeNull();
  expect(container.querySelector('[role="dialog"]')).toBeNull();
  expect(
    container.querySelector('script[type="application/ld+json"]'),
  ).toBeNull();
}

describe("draft public legal pages", () => {
  it("renders the Privacy Policy as an explicitly unresolved draft", () => {
    const { container } = render(<PrivacyPage />);

    expectDraftDocumentBasics(container, privacyPolicy.title);
    expect(
      screen.getByText(
        "The hosting and operational configuration must be reviewed before launch to confirm what technical information may be processed. This draft does not make an unverified claim that technical logs or similar operational records are absent.",
      ),
    ).toBeVisible();
    expect(
      screen.getByText(
        "No final legal basis is assigned by this draft. The lawful grounds available will depend on the responsible organisation, jurisdiction, service design, information category and relationship with the individual.",
      ),
    ).toBeVisible();
    expect(
      screen.getByText(/No final retention period is approved\./),
    ).toBeVisible();
  });

  it("renders every typed Privacy section and launch decision", () => {
    render(<PrivacyPage />);
    const documentNavigation = screen.getByRole("navigation", {
      name: `${privacyPolicy.title} table of contents`,
    });

    for (const section of privacyPolicy.sections) {
      expect(
        screen.getByRole("heading", { level: 2, name: section.title }),
      ).toBeVisible();
      expect(
        within(documentNavigation).getByRole("link", {
          name: new RegExp(section.title),
        }),
      ).toHaveAttribute("href", `#${section.id}`);
    }
    for (const item of privacyPolicy.reviewChecklist.items) {
      expect(screen.getByText(item)).toBeVisible();
    }
    expect(screen.getByText("Account information")).toBeVisible();
    expect(
      screen.getByText("No production membership account creation"),
    ).toBeVisible();
    expect(
      screen.getByText(
        "The demonstration stores mock records in the visitor’s browser. It does not create a production account or transmit an organisation application to Tamil Ulagam.",
      ),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Review the current Contact guidance" }),
    ).toHaveAttribute("href", "/contact");
    expect(
      screen.getByRole("link", { name: "Read the draft Terms of Use" }),
    ).toHaveAttribute("href", "/terms");
  });

  it("renders every typed Terms section and keeps planned services unavailable", () => {
    render(<TermsPage />);
    const documentNavigation = screen.getByRole("navigation", {
      name: `${termsOfUse.title} table of contents`,
    });

    for (const section of termsOfUse.sections) {
      expect(
        screen.getByRole("heading", { level: 2, name: section.title }),
      ).toBeVisible();
      expect(
        within(documentNavigation).getByRole("link", {
          name: new RegExp(section.title),
        }),
      ).toHaveAttribute("href", `#${section.id}`);
    }
    for (const item of termsOfUse.reviewChecklist.items) {
      expect(screen.getByText(item)).toBeVisible();
    }
    expect(
      screen.getByRole("heading", {
        name: "Planned services are not currently available",
      }),
    ).toBeVisible();
    expect(screen.getByText("Government-issued identification")).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: "Qualified legal drafting required",
      }),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Governing law, courts, arbitration, complaint handling and dispute-resolution procedures are not yet approved. No country, state, city, court or arbitral venue is selected by this draft.",
      ),
    ).toBeVisible();
  });

  it("preserves the required internal legal and service links", () => {
    const { container } = render(<TermsPage />);
    const expectedLinks = [
      ["Review the Tamil ID concept", "/tamil-id"],
      ["Review the partnership foundation", "/partners"],
      ["Review the chapter model", "/chapters"],
      ["Review the events model", "/events"],
      ["Review the editorial model", "/news"],
      ["Read the draft Privacy Policy", "/privacy"],
    ] as const;

    for (const [label, href] of expectedLinks) {
      for (const link of screen.getAllByRole("link", { name: label })) {
        expect(link).toHaveAttribute("href", href);
      }
    }

    const documentNavigation = screen.getByRole("navigation", {
      name: `${termsOfUse.title} table of contents`,
    });
    expect(within(documentNavigation).getAllByRole("link")).toHaveLength(
      termsOfUse.sections.length,
    );
    expect(container.textContent).not.toMatch(
      /fully compliant|certified|registered with|data protection officer appointed/i,
    );
  });

  it("does not invent contact, provider, timing or jurisdiction details", () => {
    for (const Page of [PrivacyPage, TermsPage]) {
      const { container, unmount } = render(<Page />);
      const text = container.textContent ?? "";

      expect(text).not.toMatch(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i);
      expect(text).not.toMatch(/retained for \d+ (day|month|year)s?/i);
      expect(text).not.toMatch(
        /google analytics|stripe|paypal|\baws\b|azure|supabase|vercel/i,
      );
      expect(text).not.toMatch(
        /governed by the laws of|exclusive jurisdiction of/i,
      );
      expect(text).not.toMatch(/effective (from|on) \d/i);
      unmount();
    }
  });
});
