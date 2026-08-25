import { cleanup, render, screen } from "@testing-library/react";
import { StageProgress } from "@tamil-ulagam/ui";
import { afterEach, describe, expect, it } from "vitest";

afterEach(() => cleanup());

describe("StageProgress", () => {
  const stages = ["Identity", "Reachability", "Confirmation"];

  it("communicates completed, current, and upcoming stages without relying on color", () => {
    render(<StageProgress stages={stages} currentStage={2} />);
    expect(screen.getByLabelText("Identity, completed")).toBeInTheDocument();
    const current = screen.getByLabelText("Reachability, current step");
    expect(current).toBeInTheDocument();
    expect(current.closest("li")).toHaveAttribute("aria-current", "step");
    expect(screen.getByLabelText("Confirmation, upcoming")).toBeInTheDocument();
  });

  it("is a generic primitive — stage labels are entirely caller-supplied", () => {
    render(
      <StageProgress
        stages={["Find an organisation", "Request affiliation"]}
        currentStage={1}
      />,
    );
    expect(
      screen.getByLabelText("Find an organisation, current step"),
    ).toBeInTheDocument();
  });
});
