import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { joinJourneys } from "@/content/join";

import { JourneySelector } from "./journey-selector";

afterEach(() => cleanup());

describe("JourneySelector", () => {
  it("renders all four journeys as a list of links", () => {
    render(<JourneySelector journeys={joinJourneys} />);

    const list = screen.getByRole("list");
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(4);

    for (const journey of joinJourneys) {
      expect(list.querySelector(`a[href="${journey.href}"]`)).not.toBeNull();
    }
  });

  it("only swaps the matching journey to its resume copy", () => {
    render(
      <JourneySelector
        journeys={joinJourneys}
        resumingJourneyId="organisation"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Continue your registration" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Register a Tamil Sangam" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Register an Organisation" }),
    ).not.toBeInTheDocument();
  });
});
