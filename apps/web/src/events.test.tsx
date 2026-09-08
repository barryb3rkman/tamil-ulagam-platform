import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import EventsPage from "@/app/events/page";
import { eventsEditorialImageKeys, images } from "@/config/images";
import { eventsContent } from "@/content/events";

describe("public Events page", () => {
  it("renders one heading and every approved calendar image", () => {
    render(<EventsPage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      eventsContent.hero.title,
    );
    for (const key of eventsEditorialImageKeys) {
      expect(screen.getByRole("img", { name: images[key].alt })).toBeVisible();
    }
  });

  it("names all six federation events in both languages", () => {
    render(<EventsPage />);

    for (const event of eventsContent.signature) {
      expect(
        screen.getByRole("heading", { level: 3, name: event.title }),
      ).toBeVisible();
      // The Tamil name is the thing that makes this a Tamil calendar rather
      // than a list of dates, so it is asserted, not assumed.
      expect(screen.getAllByText(event.tamilTitle)[0]).toBeVisible();
      expect(screen.getAllByText(event.month)[0]).toBeVisible();
    }
  });

  it("runs the Tamil calendar alongside the federation year", () => {
    render(<EventsPage />);

    for (const month of eventsContent.months) {
      expect(screen.getAllByText(month.tamil).length).toBeGreaterThan(0);
      expect(screen.getAllByText(month.english).length).toBeGreaterThan(0);
    }
  });

  it("states no dates it cannot keep, and no year", () => {
    const { container } = render(<EventsPage />);

    // Months are a promise a chapter can keep; a date is not, and the public
    // site does not date itself.
    expect(container.textContent).not.toMatch(/\b(?:19|20)\d{2}\b/);
    expect(
      screen.queryByText(/register now|buy tickets|book your seat/i),
    ).not.toBeInTheDocument();
  });
});
