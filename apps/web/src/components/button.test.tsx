import { Button } from "@tamil-ulagam/ui";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Button", () => {
  it("forwards accessible button attributes", () => {
    render(
      <Button aria-label="Continue to roadmap" disabled>
        Continue
      </Button>,
    );

    expect(
      screen.getByRole("button", { name: "Continue to roadmap" }),
    ).toBeDisabled();
  });
});
