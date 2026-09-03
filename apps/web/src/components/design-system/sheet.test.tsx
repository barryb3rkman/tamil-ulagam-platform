import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Sheet } from "@tamil-ulagam/ui";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal(
      this: HTMLDialogElement,
    ) {
      this.setAttribute("open", "");
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close(
      this: HTMLDialogElement,
    ) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  }
});

afterEach(() => cleanup());

describe("Sheet", () => {
  it("shows the title and content when open, defaulting to a bottom sheet", () => {
    render(
      <Sheet open onClose={() => undefined} title="Switch workspace">
        <p>Choose where to go.</p>
      </Sheet>,
    );
    expect(
      screen.getByRole("heading", { name: "Switch workspace" }),
    ).toBeInTheDocument();
    expect(document.querySelector("dialog")).toHaveAttribute(
      "data-side",
      "bottom",
    );
  });

  it("supports a right-anchored drawer via the side prop", () => {
    render(
      <Sheet
        open
        onClose={() => undefined}
        title="Switch workspace"
        side="right"
      >
        <p>Choose where to go.</p>
      </Sheet>,
    );
    expect(document.querySelector("dialog")).toHaveAttribute(
      "data-side",
      "right",
    );
  });

  it("calls onClose when the close button is activated", () => {
    const onClose = vi.fn();
    render(
      <Sheet open onClose={onClose} title="Switch workspace">
        <p>Choose where to go.</p>
      </Sheet>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render its dialog as open when open=false", () => {
    render(
      <Sheet open={false} onClose={() => undefined} title="Switch workspace">
        <p>Choose where to go.</p>
      </Sheet>,
    );
    expect(document.querySelector("dialog")).not.toHaveAttribute("open");
  });
});
