import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { JoinJourney } from "@/content/join";

import { JourneyCard } from "./journey-card";

const journey: JoinJourney = {
  id: "organisation",
  eyebrow: "ORGANISATIONS",
  title: "Register an Organisation",
  description: "For businesses and institutions.",
  cta: "Start registration",
  href: "/join/organisation",
};

describe("JourneyCard", () => {
  it("renders the default title, description and CTA, linking to its destination", () => {
    render(<JourneyCard journey={journey} />);

    expect(
      screen.getByRole("heading", { name: "Register an Organisation" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("For businesses and institutions."),
    ).toBeInTheDocument();
    const link = screen.getByRole("link", {
      name: /Register an Organisation/,
    });
    expect(link).toHaveAttribute("href", "/join/organisation");
    expect(screen.getByText("Start registration")).toBeInTheDocument();
  });

  it("swaps to the override's title/CTA/href when one is supplied", () => {
    render(
      <JourneyCard
        journey={journey}
        override={{
          title: "Continue your registration",
          cta: "Resume where you left off",
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Continue your registration" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Resume where you left off")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Register an Organisation" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Continue your registration/ }),
    ).toHaveAttribute("href", "/join/organisation");
  });

  it("uses the override's href when one is supplied (e.g. Open workspace)", () => {
    render(
      <JourneyCard
        journey={journey}
        override={{
          title: "Open workspace",
          cta: "Go to your workspace",
          href: "/workspace/organisation?organization=org-1",
        }}
      />,
    );

    expect(
      screen.getByRole("link", { name: /Open workspace/ }),
    ).toHaveAttribute("href", "/workspace/organisation?organization=org-1");
  });

  it("renders default copy when no override is supplied", () => {
    const plainJourney: JoinJourney = {
      id: "sangam",
      eyebrow: "TAMIL SANGAMS",
      title: "Register a Tamil Sangam",
      description: "Join the network.",
      cta: "Begin",
      href: "/join/sangam",
    };

    render(<JourneyCard journey={plainJourney} />);

    expect(
      screen.getByRole("heading", { name: "Register a Tamil Sangam" }),
    ).toBeInTheDocument();
  });
});
