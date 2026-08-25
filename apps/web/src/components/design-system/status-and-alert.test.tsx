import { cleanup, render, screen } from "@testing-library/react";
import { Alert, StatusBadge } from "@tamil-ulagam/ui";
import { afterEach, describe, expect, it } from "vitest";

afterEach(() => cleanup());

describe("StatusBadge", () => {
  it("never communicates status by color alone — a dot or icon is always present", () => {
    const { container } = render(
      <StatusBadge tone="success" label="Verified" />,
    );
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it("accepts a custom icon in place of the default dot", () => {
    render(
      <StatusBadge
        tone="success"
        label="Verified"
        icon={<span data-testid="custom-icon" aria-hidden="true" />}
      />,
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });
});

describe("Alert", () => {
  it("defaults to role=status (non-interrupting) and supports role=alert for urgent tones", () => {
    render(<Alert tone="info">Best-effort signal.</Alert>);
    expect(screen.getByRole("status")).toHaveTextContent("Best-effort signal.");
  });

  it("renders an optional title distinct from the body", () => {
    render(
      <Alert tone="info" title="Possible duplicate">
        Official email matches another organisation.
      </Alert>,
    );
    expect(screen.getByText("Possible duplicate")).toBeInTheDocument();
    expect(
      screen.getByText("Official email matches another organisation."),
    ).toBeInTheDocument();
  });

  it("supports role=alert for errors needing immediate attention", () => {
    render(
      <Alert tone="error" role="alert">
        The request could not be completed.
      </Alert>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "The request could not be completed.",
    );
  });
});
