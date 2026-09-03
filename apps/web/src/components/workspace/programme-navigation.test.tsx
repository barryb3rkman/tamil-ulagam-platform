import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ProgrammeNavigation } from "./programme-navigation";

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

let pathname = "/workspace/organisation";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

afterEach(() => {
  pathname = "/workspace/organisation";
});

function openPanel() {
  fireEvent.click(screen.getByRole("button", { name: /Programmes/ }));
}

describe("ProgrammeNavigation", () => {
  it("renders nothing for an unresolved workspace or Federation Admin", () => {
    const { container: unresolved } = render(
      <ProgrammeNavigation type={null} entityId={null} />,
    );
    expect(unresolved.firstChild).toBeNull();

    const { container: admin } = render(
      <ProgrammeNavigation type="admin" entityId="admin" />,
    );
    expect(admin.firstChild).toBeNull();
  });

  it("opens a panel listing all 11 programme modules for an Organisation workspace", () => {
    render(<ProgrammeNavigation type="organisation" entityId="org-1" />);
    openPanel();
    const nav = screen.getByRole("navigation", {
      name: "Tamil Ulagam programmes",
    });
    expect(nav).toHaveTextContent("Events");
    expect(nav).toHaveTextContent("Education");
    expect(nav).toHaveTextContent("Partnerships");
    expect(screen.getAllByRole("link")).toHaveLength(11);
  });

  it("carries the entity id onto every module link for a Sangam workspace", () => {
    render(<ProgrammeNavigation type="sangam" entityId="sangam-1" />);
    openPanel();
    expect(screen.getByRole("link", { name: "Events" })).toHaveAttribute(
      "href",
      "/workspace/sangam/modules/events?sangam=sangam-1",
    );
  });

  it("marks the Programmes trigger current when already on a module route", () => {
    pathname = "/workspace/organisation/modules/events";
    render(<ProgrammeNavigation type="organisation" entityId="org-1" />);
    expect(screen.getByRole("button", { name: /Programmes/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("does not mark the Programmes trigger current on an operational route", () => {
    pathname = "/workspace/organisation/people";
    render(<ProgrammeNavigation type="organisation" entityId="org-1" />);
    expect(
      screen.getByRole("button", { name: /Programmes/ }),
    ).not.toHaveAttribute("aria-current");
  });
});
