import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { JoinJourney } from "@/content/join";

import { JourneyCard } from "./journey-card";

afterEach(() => cleanup());

const journey: JoinJourney = {
  id: "organisation",
  eyebrow: "ORGANISATIONS",
  title: "Register an Organisation",
  description: "For businesses and institutions.",
  cta: "Start registration",
  href: "/join/organisation",
  resumeTitle: "Continue your registration",
  resumeCta: "Resume where you left off",
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

  it("swaps to resume copy when resuming is true and a resume variant exists", () => {
    render(<JourneyCard journey={journey} resuming />);

    expect(
      screen.getByRole("heading", { name: "Continue your registration" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Resume where you left off")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Register an Organisation" }),
    ).not.toBeInTheDocument();
  });

  it("falls back to the default copy when resuming is true but no resume variant is defined", () => {
    const journeyWithoutResume: JoinJourney = {
      id: "sangam",
      eyebrow: "TAMIL SANGAMS",
      title: "Register a Tamil Sangam",
      description: "Join the network.",
      cta: "Begin",
      href: "/join/sangam",
    };

    render(<JourneyCard journey={journeyWithoutResume} resuming />);

    expect(
      screen.getByRole("heading", { name: "Register a Tamil Sangam" }),
    ).toBeInTheDocument();
  });
});
