import { cleanup, render, screen, fireEvent } from "@testing-library/react";
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

  it("renders every enquiry path", () => {
    render(<ContactPage />);

    for (const category of contactContent.categories.items) {
      expect(
        screen.getByRole("heading", { name: category.title }),
      ).toBeVisible();
      expect(
        screen.getAllByRole("link", { name: category.linkLabel })[0],
      ).toHaveAttribute("href", category.href);
    }
  });

  it("keeps enquiry guidance direct and preserves public routes", () => {
    render(<ContactPage />);

    expect(
      screen.queryByText(/not currently open|future enquiry|in development/i),
    ).not.toBeInTheDocument();
  });

  it("never tells visitors that a registration route which actually works is closed", () => {
    const closedClaims = contactContent.responseExpectations.items.filter(
      (item) => /not currently open|not open|closed/i.test(item),
    );
    for (const claim of closedClaims) {
      expect(claim).not.toMatch(/membership/i);
      expect(claim).not.toMatch(/organisation/i);
      expect(claim).not.toMatch(/sangam/i);
    }
  });

  it("preserves public routes", () => {
    render(<ContactPage />);

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
      screen.getByRole("link", { name: "Join Tamil Ulagam" }),
    ).toHaveAttribute("href", "/join");
    expect(
      screen.getAllByRole("link", { name: "Explore Initiatives" })[0],
    ).toHaveAttribute("href", "/initiatives");
    for (const faq of contactContent.faqs) {
      expect(screen.getByText(faq.title)).toBeVisible();
      fireEvent.click(screen.getByRole("button", { name: faq.title }));
      expect(screen.getByText(faq.description)).toBeVisible();
    }
  });
});
