import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MemberJourneyPage } from "./member-journey-page";

afterEach(() => cleanup());

describe("MemberJourneyPage", () => {
  it("states plainly that membership is not yet open, without a fake form", () => {
    render(<MemberJourneyPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Join as a Member" }),
    ).toBeInTheDocument();
    expect(screen.getByText("In development")).toBeInTheDocument();
    expect(document.querySelectorAll("input, textarea, select")).toHaveLength(
      0,
    );
  });

  it("explains the future model, distinguishing membership from management permission", () => {
    render(<MemberJourneyPage />);

    expect(screen.getByText("Search and select")).toBeInTheDocument();
    expect(screen.getByText("Organisation approves")).toBeInTheDocument();
    expect(
      screen.getByText(/not as someone managing the organisation's account/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /distinct from anyone with administrative access to the organisation's account/,
      ),
    ).toBeInTheDocument();
  });

  it("links back to /join", () => {
    render(<MemberJourneyPage />);

    expect(
      screen.getByRole("link", { name: /Back to Join Tamil Ulagam/ }),
    ).toHaveAttribute("href", "/join");
  });
});
