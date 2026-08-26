import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import type { WorkspaceOption } from "@/features/workspace/workspace-options";

import { WorkspaceSwitcher } from "./workspace-switcher";

// jsdom does not implement the native <dialog> element's imperative API
// (showModal/close) — polyfilled the same way Dialog's own test does,
// since Sheet is built on the identical native <dialog> foundation.
// Real focus-trap/Escape/backdrop behaviour is the browser's
// responsibility and is not re-tested here.
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

afterEach(cleanup);

const memberOption: WorkspaceOption = {
  type: "member",
  id: "member",
  label: "Member",
  subtitle: "Personal membership workspace",
  href: "/workspace/member",
  current: false,
};

const organisationOption: WorkspaceOption = {
  type: "organisation",
  id: "org-1",
  label: "Acme Education Trust",
  subtitle: "Chennai, India",
  href: "/workspace/organisation?organization=org-1",
  current: true,
};

const sangamOption: WorkspaceOption = {
  type: "sangam",
  id: "sangam-1",
  label: "Chennai Tamil Sangam",
  subtitle: "Chennai, India",
  href: "/workspace/sangam?sangam=sangam-1",
  current: false,
};

const adminOption: WorkspaceOption = {
  type: "admin",
  id: "admin",
  label: "Federation Admin",
  subtitle: "Review and verify registrations",
  href: "/admin",
  current: false,
};

function openSwitcher() {
  fireEvent.click(screen.getByRole("button", { name: "Switch workspace" }));
}

describe("WorkspaceSwitcher", () => {
  it("has an accessible trigger, closed by default", () => {
    render(<WorkspaceSwitcher options={[memberOption]} loading={false} />);
    const trigger = screen.getByRole("button", { name: "Switch workspace" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(document.querySelector("dialog")).not.toHaveAttribute("open");
  });

  it("opens on click and announces the current workspace", () => {
    render(
      <WorkspaceSwitcher
        options={[memberOption, organisationOption]}
        loading={false}
      />,
    );
    openSwitcher();
    expect(document.querySelector("dialog")).toHaveAttribute("open");
    expect(
      screen.getByText(
        (_, node) =>
          node?.textContent ===
          "You are currently managing Acme Education Trust.",
      ),
    ).toBeInTheDocument();
    const currentLink = screen.getByRole("link", {
      name: /Acme Education Trust/,
    });
    expect(currentLink).toHaveAttribute("aria-current", "page");
  });

  it("groups options into Member / Organisations / Tamil Sangams / Federation sections", () => {
    render(
      <WorkspaceSwitcher
        options={[memberOption, organisationOption, sangamOption, adminOption]}
        loading={false}
      />,
    );
    openSwitcher();
    expect(
      screen.getByRole("heading", { name: "Organisations" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Tamil Sangams" }),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: "Federation" })).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Chennai Tamil Sangam/ }),
    ).toHaveAttribute("href", "/workspace/sangam?sangam=sangam-1");
    expect(
      screen.getByRole("link", { name: /Federation Admin/ }),
    ).toHaveAttribute("href", "/admin");
  });

  it("does not render an empty Organisations, Tamil Sangams or Federation section for a member-only user", () => {
    render(<WorkspaceSwitcher options={[memberOption]} loading={false} />);
    openSwitcher();
    expect(
      screen.queryByRole("heading", { name: "Organisations" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Tamil Sangams" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Federation" }),
    ).not.toBeInTheDocument();
  });

  it("closes when the close control is activated", () => {
    render(<WorkspaceSwitcher options={[memberOption]} loading={false} />);
    openSwitcher();
    expect(document.querySelector("dialog")).toHaveAttribute("open");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(document.querySelector("dialog")).not.toHaveAttribute("open");
  });

  it("closes when a workspace option is activated", () => {
    render(
      <WorkspaceSwitcher
        options={[memberOption, organisationOption]}
        loading={false}
      />,
    );
    openSwitcher();
    fireEvent.click(screen.getByRole("link", { name: /^Member/ }));
    expect(document.querySelector("dialog")).not.toHaveAttribute("open");
  });

  it("disables the trigger while loading", () => {
    render(<WorkspaceSwitcher options={[]} loading />);
    expect(
      screen.getByRole("button", { name: "Switch workspace" }),
    ).toBeDisabled();
  });
});
