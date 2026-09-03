import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { joinHeroContent } from "@/content/join";

import { JoinHero } from "./join-hero";

afterEach(() => cleanup());

describe("JoinHero", () => {
  it("renders the headline and supporting copy", () => {
    render(<JoinHero />);

    expect(
      screen.getByRole("heading", { level: 1, name: joinHeroContent.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(joinHeroContent.description)).toBeInTheDocument();
  });

  it("keeps every decorative layer out of the accessibility tree", () => {
    const { container } = render(<JoinHero />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    for (const decorative of container.querySelectorAll("svg, canvas")) {
      expect(decorative).toHaveAttribute("aria-hidden", "true");
    }
  });
});
