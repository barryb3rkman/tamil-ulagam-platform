import { render, screen } from "@testing-library/react";
import { StageProgress } from "@tamil-ulagam/ui";
import { describe, expect, it } from "vitest";

describe("StageProgress", () => {
  const stages = ["Identity", "Reachability", "Confirmation"];

  it("communicates completed, current, and upcoming stages without relying on color", () => {
    render(<StageProgress stages={stages} currentStage={2} />);
    // The status is real text rather than an aria-label: ARIA prohibits
    // aria-label on a bare span, and a screen reader reads this either way.
    expect(screen.getByText("Identity, completed")).toBeInTheDocument();
    const current = screen.getByText("Reachability, current step");
    expect(current).toBeInTheDocument();
    expect(current.closest("li")).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("Confirmation, upcoming")).toBeInTheDocument();
  });

  it("is a generic primitive — stage labels are entirely caller-supplied", () => {
    render(
      <StageProgress
        stages={["Find an organisation", "Request affiliation"]}
        currentStage={1}
      />,
    );
    expect(
      screen.getByText("Find an organisation, current step"),
    ).toBeInTheDocument();
  });
});
