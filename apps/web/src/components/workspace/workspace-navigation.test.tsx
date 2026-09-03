import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WorkspaceNavigation } from "./workspace-navigation";

let pathname = "/workspace/organisation";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

afterEach(() => {
  pathname = "/workspace/organisation";
});

describe("WorkspaceNavigation", () => {
  it("renders no nav for an unresolved workspace", () => {
    const { container } = render(
      <WorkspaceNavigation type={null} entityId={null} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders a single Overview tab for Member — no fabricated Affiliations/Account routes", () => {
    render(<WorkspaceNavigation type="member" entityId="member" />);
    const nav = screen.getByRole("navigation", {
      name: "Workspace navigation",
    });
    expect(nav).toHaveTextContent("Overview");
    expect(screen.queryByText("Affiliations")).not.toBeInTheDocument();
    expect(screen.queryByText("Account")).not.toBeInTheDocument();
  });

  it("renders Overview and People for Organisation, carrying the entity id", () => {
    render(<WorkspaceNavigation type="organisation" entityId="org-1" />);
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "href",
      "/workspace/organisation?organization=org-1",
    );
    expect(screen.getByRole("link", { name: "People" })).toHaveAttribute(
      "href",
      "/workspace/organisation/people?organization=org-1",
    );
  });

  it("renders Overview and People for Sangam, People reusing the shared route", () => {
    render(<WorkspaceNavigation type="sangam" entityId="sangam-1" />);
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "href",
      "/workspace/sangam?sangam=sangam-1",
    );
    expect(screen.getByRole("link", { name: "People" })).toHaveAttribute(
      "href",
      "/workspace/organisation/people?organization=sangam-1",
    );
  });

  it("marks the People tab current on the People sub-route without also marking Overview current", () => {
    pathname = "/workspace/organisation/people";
    render(<WorkspaceNavigation type="organisation" entityId="org-1" />);
    expect(screen.getByRole("link", { name: "People" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
