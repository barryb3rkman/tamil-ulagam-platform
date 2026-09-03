import { render, screen } from "@testing-library/react";
import { ImageWithFallback } from "@tamil-ulagam/ui";
import { describe, expect, it } from "vitest";

import { joinImages } from "./join-images";

describe("joinImages", () => {
  it("declares all three pilot assets as available now that the files exist", () => {
    for (const asset of Object.values(joinImages)) {
      expect(asset.available).toBe(true);
    }
  });

  it("renders the real image via ImageWithFallback when available", () => {
    render(<ImageWithFallback asset={joinImages.joinHubHero} />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "alt",
      joinImages.joinHubHero.alt,
    );
  });

  it("still falls back to the honest placeholder if an asset is ever marked unavailable again — proving the mechanism these pilots were built to exercise is intact", () => {
    render(
      <ImageWithFallback
        asset={{ ...joinImages.sangamJourneyHero, available: false }}
      />,
    );
    expect(
      screen.getByRole("img", { name: joinImages.sangamJourneyHero.alt }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Image preparation in progress"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /^$/ })).not.toBeInTheDocument();
  });
});
