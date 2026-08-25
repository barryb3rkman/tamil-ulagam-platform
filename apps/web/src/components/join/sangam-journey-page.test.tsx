import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SangamJourneyPage } from "./sangam-journey-page";

afterEach(() => cleanup());

describe("SangamJourneyPage", () => {
  it("states plainly that Sangam registration is not yet open, without a fake form", () => {
    render(<SangamJourneyPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Register a Tamil Sangam",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("In development")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "How Sangam registration will work",
      }),
    ).toBeInTheDocument();
    expect(document.querySelectorAll("input, textarea, select")).toHaveLength(
      0,
    );
  });

  it("previews the real future model as an ordered explanation, not a submission flow", () => {
    render(<SangamJourneyPage />);

    expect(
      screen.getByText(/Register your Sangam's profile/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Verification and review/)).toBeInTheDocument();
    expect(screen.getByText(/Join the Sangam network/)).toBeInTheDocument();
  });

  it("links back to /join and out to the real /contact route, not an invented endpoint", () => {
    render(<SangamJourneyPage />);

    expect(
      screen.getByRole("link", { name: "Tell us about your Sangam" }),
    ).toHaveAttribute("href", "/contact");
    expect(
      screen.getByRole("link", { name: /Back to Join Tamil Ulagam/ }),
    ).toHaveAttribute("href", "/join");
  });
});
