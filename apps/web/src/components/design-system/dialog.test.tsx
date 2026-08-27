import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Dialog } from "@tamil-ulagam/ui";
import { useState } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

// jsdom does not implement the native <dialog> element's imperative API
// (showModal/close) — polyfill just enough of it here so Dialog's own
// open/close-sync logic can be exercised. Real focus-trap/backdrop
// behaviour is the browser's responsibility, not this component's; it
// is intentionally not re-tested here.
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

function ControlledDialog() {
  const [open, setOpen] = useState(true);
  return (
    <Dialog open={open} onClose={() => setOpen(false)} title="Confirm action">
      <p>Are you sure?</p>
    </Dialog>
  );
}

afterEach(() => cleanup());

describe("Dialog", () => {
  it("shows the title and content when open", () => {
    render(<ControlledDialog />);
    expect(
      screen.getByRole("heading", { name: "Confirm action" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  });

  it("calls onClose when the close button is activated", () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} title="Confirm action">
        <p>Are you sure?</p>
      </Dialog>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("labels the dialog by its title for assistive technology", () => {
    render(
      <Dialog open onClose={() => undefined} title="Confirm action">
        <p>Are you sure?</p>
      </Dialog>,
    );
    const dialog = document.querySelector("dialog");
    expect(dialog).toHaveAttribute(
      "aria-labelledby",
      screen.getByRole("heading", { name: "Confirm action" }).id,
    );
  });
});
