import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import HomePage from "@/app/page";
import { images } from "@/config/images";
import { initiatives } from "@/content/initiatives";

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
      expect(
        screen.getByRole("heading", { name: initiative.title, level: 3 }),
      ).toBeVisible();
      expect(screen.getAllByText("Planned").length).toBeGreaterThan(0);
    }
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
});
