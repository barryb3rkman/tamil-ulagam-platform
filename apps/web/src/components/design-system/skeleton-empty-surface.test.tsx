import { cleanup, render, screen } from "@testing-library/react";
import { Button, EmptyState, Skeleton, Surface } from "@tamil-ulagam/ui";
import { afterEach, describe, expect, it } from "vitest";

afterEach(() => cleanup());

describe("Skeleton", () => {
  it("is hidden from assistive technology — the loading region it sits inside owns the accessible status", () => {
    render(
      <div role="status" aria-label="Loading">
        <Skeleton shape="text" />
      </div>,
    );
    const region = screen.getByRole("status", { name: "Loading" });
    const skeleton = region.firstElementChild;
    expect(skeleton).toHaveAttribute("aria-hidden", "true");
  });
});

describe("EmptyState", () => {
  it("always names what will appear and, when given one, offers the populating action", () => {
    render(
      <EmptyState
        title="No membership requests yet"
        description="When someone requests to join, it will appear here."
        action={<Button>Invite a member</Button>}
      />,
    );
    expect(screen.getByText("No membership requests yet")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Invite a member" }),
    ).toBeInTheDocument();
  });
});

describe("Surface", () => {
  it("exposes its level for styling hooks and testing", () => {
    render(<Surface level="elevated">Decision rail</Surface>);
    expect(screen.getByText("Decision rail")).toHaveAttribute(
      "data-surface",
      "elevated",
    );
  });

  it("defaults to the card level", () => {
    render(<Surface>Default surface</Surface>);
    expect(screen.getByText("Default surface")).toHaveAttribute(
      "data-surface",
      "card",
    );
  });

  it("only applies the glass treatment when layered over a deep surface", () => {
    const { rerender } = render(
      <Surface level="deep" glass>
        Glass over deep
      </Surface>,
    );
    expect(screen.getByText("Glass over deep").className).toContain(
      "surface-glass",
    );
    rerender(
      <Surface level="card" glass>
        Glass over card (should not apply)
      </Surface>,
    );
    expect(
      screen.getByText("Glass over card (should not apply)").className,
    ).not.toContain("surface-glass");
  });
});
