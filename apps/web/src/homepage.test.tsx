import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import HomePage from "@/app/page";
import { homepageEditorialImageKeys, images } from "@/config/images";
import { homepageContent } from "@/content/homepage";
import { initiatives } from "@/content/initiatives";
import { roadmapPhases } from "@/content/roadmap";

afterEach(() => cleanup());

describe("public homepage composition", () => {
  it("renders one primary heading and the hero routes", () => {
    render(<HomePage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "One Community. One Identity. One Global Future.",
    );
    expect(
      screen.getByRole("link", { name: "Explore Our Vision" }),
    ).toHaveAttribute("href", "/about");
    expect(
      screen.getByRole("link", { name: "Discover Initiatives" }),
    ).toHaveAttribute("href", "/initiatives");
  });

  it("renders all pillars and initiative statuses from typed content", () => {
    render(<HomePage />);

    for (const title of ["Connect", "Empower", "Preserve"]) {
      expect(
        screen.getAllByRole("heading", { name: title, level: 3 }),
      ).toHaveLength(1);
    }
    for (const initiative of initiatives) {
      const isMobileFeatured =
        homepageContent.initiatives.presentation.mobileFeatured.some(
          (slug) => slug === initiative.slug,
        );
      expect(
        screen.getAllByRole("heading", { name: initiative.title, level: 3 }),
      ).toHaveLength(isMobileFeatured ? 2 : 1);
      expect(screen.getAllByText("Planned").length).toBeGreaterThan(0);
    }
    expect(
      screen
        .getByTestId("initiative-desktop-grid")
        .querySelectorAll('[data-testid="initiative-card"]'),
    ).toHaveLength(8);
    expect(
      screen
        .getByTestId("initiative-mobile-grid")
        .querySelectorAll('[data-testid="initiative-card"]'),
    ).toHaveLength(4);
    expect(
      screen.getByRole("link", { name: /Explore All Initiatives/ }),
    ).toHaveAttribute("href", "/initiatives");
    for (const phase of roadmapPhases) {
      expect(
        screen.getAllByRole("heading", { name: phase.title, level: 3 }),
      ).toHaveLength(1);
    }
    expect(
      homepageContent.initiatives.presentation.mobileFeatured,
    ).toHaveLength(4);
    expect(
      screen.getByText(
        "Concept preview only — Tamil ID is not currently active.",
      ),
    ).toBeVisible();
  });

  it("keeps the hero desktop and mobile assets configured", () => {
    expect(images.homeHero.available).toBe(true);
    expect(images.homeHero.path).toContain("home-hero-desktop.png");
    expect(images.homeHero.mobilePath).toContain("home-hero-mobile.png");
  });

  it("renders every major editorial image from the shared registry", () => {
    render(<HomePage />);

    for (const key of homepageEditorialImageKeys) {
      expect(screen.getByRole("img", { name: images[key].alt })).toBeVisible();
    }
  });
});
