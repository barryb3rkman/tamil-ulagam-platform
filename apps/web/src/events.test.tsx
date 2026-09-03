import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import EventsPage from "@/app/events/page";
import { eventsEditorialImageKeys, images } from "@/config/images";
import { eventsContent } from "@/content/events";

afterEach(() => cleanup());

describe("public Events page", () => {
  it("renders one global-events heading and the approved registry image", () => {
    render(<EventsPage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      eventsContent.hero.title,
    );
    expect(screen.getByText(eventsContent.hero.caption)).toBeVisible();
    for (const key of eventsEditorialImageKeys) {
      expect(screen.getByRole("img", { name: images[key].alt })).toBeVisible();
    }
  });

  it("keeps the page honest about attendee access", () => {
    render(<EventsPage />);

    expect(screen.getByText(eventsContent.definition.statement)).toBeVisible();
    expect(
      screen.queryByText(/upcoming events|register now|buy tickets/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/planned|proposed|no live event calendar/i),
    ).not.toBeInTheDocument();
  });

  it("renders the six global celebrations", () => {
    render(<EventsPage />);

    for (const category of eventsContent.categories.items) {
      expect(
        screen.getAllByRole("heading", { name: category.title })[0],
      ).toBeVisible();
    }
  });

  it("renders key routes and honest FAQs", () => {
    render(<EventsPage />);

    for (const link of screen.getAllByRole("link", {
      name: "Explore Global Events",
    })) {
      expect(link).toHaveAttribute("href", "/initiatives/global-events");
    }
    expect(
      screen.getAllByRole("link", { name: "Contact Tamil Ulagam" })[0],
    ).toHaveAttribute("href", "/contact");
    for (const faq of eventsContent.faqs) {
      expect(screen.getAllByText(faq.title)[0]).toBeVisible();
      fireEvent.click(screen.getByRole("button", { name: faq.title }));
      expect(screen.getAllByText(faq.description)[0]).toBeVisible();
    }
  });
});
