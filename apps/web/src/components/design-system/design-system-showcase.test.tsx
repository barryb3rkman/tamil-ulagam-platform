import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { DesignSystemShowcase } from "./design-system-showcase";

beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  }
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

describe("DesignSystemShowcase", () => {
  it("renders every documented section without throwing, proving no primitive import is broken", () => {
    render(<DesignSystemShowcase />);
    expect(
      screen.getByRole("heading", { name: "Design system", level: 1 }),
    ).toBeInTheDocument();
    for (const section of [
      "Typography",
      "Color",
      "Named gradients",
      "Surfaces",
      "Buttons",
      "Form primitives",
      "Status badges",
      "Stage progress",
      "Alerts",
      "Empty state",
      "Skeleton",
      "Dialog & Sheet",
      "Motion",
    ]) {
      expect(
        screen.getByRole("heading", { name: section, level: 2 }),
      ).toBeInTheDocument();
    }
  });

  it("labels itself as an internal, non-navigation QA surface", () => {
    render(<DesignSystemShowcase />);
    expect(
      screen.getByText(/Internal QA surface — not linked in navigation/i),
    ).toBeInTheDocument();
  });
});
