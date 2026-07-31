import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import ContactPage from "@/app/contact/page";
import { contactContent } from "@/content/contact";

afterEach(() => cleanup());

describe("public Contact page", () => {
  it("renders one contact heading and keeps the page free of operational contact controls", () => {
    const { container } = render(<ContactPage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      contactContent.hero.title,
    );
    expect(screen.getByText(contactContent.hero.status)).toBeVisible();
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector("input, textarea, select")).toBeNull();
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
    expect(container.querySelector('a[href^="tel:"]')).toBeNull();
    expect(container.querySelector("address")).toBeNull();
    expect(
      container.querySelector('script[type="application/ld+json"]'),
    ).toBeNull();
    expect(
      screen.queryByText(/within 24 hours|call us now|visit our office/i),
    ).not.toBeInTheDocument();
  });

  it("renders every enquiry path and information boundary", () => {
    render(<ContactPage />);

    for (const category of contactContent.categories.items) {
      expect(
        screen.getByRole("heading", { name: category.title }),
      ).toBeVisible();
      expect(
        screen.getAllByRole("link", { name: category.linkLabel })[0],
      ).toHaveAttribute("href", category.href);
    }
    for (const item of contactContent.informationToInclude.items) {
      expect(screen.getByText(item)).toBeVisible();
    }
    for (const item of contactContent.informationNotToSend.items) {
      expect(screen.getByText(item)).toBeVisible();
    }
    expect(
      screen.getByText(contactContent.informationNotToSend.statement),
    ).toBeVisible();
  });

  it("renders routing, privacy, response, emergency and institutional guidance", () => {
    render(<ContactPage />);

    for (const item of contactContent.routing.principles) {
      expect(screen.getByText(item)).toBeVisible();
    }
    for (const item of contactContent.privacy.principles) {
      expect(screen.getByText(item)).toBeVisible();
    }
    for (const item of contactContent.responseExpectations.items) {
      expect(screen.getByText(item)).toBeVisible();
    }
    expect(
      screen.getByText(contactContent.responseExpectations.statement),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: contactContent.urgentMatters.title }),
    ).toBeVisible();
    expect(
      screen.getByText(contactContent.urgentMatters.statement),
    ).toBeVisible();
    for (const item of contactContent.institutionalEnquiries.boundaries) {
      expect(screen.getByText(item)).toBeVisible();
    }
  });

  it("keeps applications closed, labels the workflow proposed and preserves public routes", () => {
    render(<ContactPage />);

    expect(
      screen.getByText("No. Membership applications are not currently open."),
    ).toBeVisible();
    expect(
      screen.getByText("No. Chapter applications are not currently open."),
    ).toBeVisible();
    expect(
      screen.getByText(
        "No. Event organiser onboarding and event submission are not currently open.",
      ),
    ).toBeVisible();
    expect(
      screen.getByText(
        "No. Article submission and contributor onboarding are not currently open.",
      ),
    ).toBeVisible();
    expect(
      screen.getByText(
        "No. A discussion does not establish an approved partnership.",
      ),
    ).toBeVisible();
    expect(screen.getByText(contactContent.workflow.label)).toBeVisible();
    for (const step of contactContent.workflow.steps) {
      expect(screen.getByRole("heading", { name: step.title })).toBeVisible();
    }
    for (const link of screen.getAllByRole("link", {
      name: "Explore Tamil Ulagam",
    })) {
      expect(link).toHaveAttribute("href", "/about");
    }
    for (const link of screen.getAllByRole("link", {
      name: "Explore Partnerships",
    })) {
      expect(link).toHaveAttribute("href", "/partners");
    }
    expect(
      screen.getByRole("link", { name: "View the Roadmap" }),
    ).toHaveAttribute("href", "/roadmap");
    expect(
      screen.getAllByRole("link", { name: "Explore Initiatives" })[0],
    ).toHaveAttribute("href", "/initiatives");
    for (const faq of contactContent.faqs) {
      expect(screen.getByText(faq.title)).toBeVisible();
      expect(screen.getByText(faq.description)).toBeVisible();
    }
  });
});
