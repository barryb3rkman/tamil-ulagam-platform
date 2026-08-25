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

  it("gives the hero image a real, descriptive alt and keeps decorative layers out of the accessibility tree", () => {
    render(<JoinHero />);

    const image = screen.getByRole("img");
    expect(image.getAttribute("alt")).toMatch(/Federation Night/);
  });
});
