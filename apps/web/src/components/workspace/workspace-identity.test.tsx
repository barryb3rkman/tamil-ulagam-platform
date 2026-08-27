import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { WorkspaceOption } from "@/features/workspace/workspace-options";

import { WorkspaceIdentity } from "./workspace-identity";

afterEach(cleanup);

const organisationOption: WorkspaceOption = {
  type: "organisation",
  id: "org-1",
  label: "Acme Education Trust",
  subtitle: "Chennai, India",
  href: "/workspace/organisation?organization=org-1",
  current: true,
};

describe("WorkspaceIdentity", () => {
  it("shows a placeholder, not real content, while loading", () => {
    render(
      <WorkspaceIdentity
        loading
        current={null}
        fallbackType={null}
        fallbackId={null}
      />,
    );
    expect(screen.queryByText("Acme Education Trust")).not.toBeInTheDocument();
  });

  it("shows the resolved workspace's type and name", () => {
    render(
      <WorkspaceIdentity
        loading={false}
        current={organisationOption}
        fallbackType="organisation"
        fallbackId="org-1"
      />,
    );
    expect(screen.getByText("Organisation")).toBeInTheDocument();
    expect(screen.getByText("Acme Education Trust")).toBeInTheDocument();
  });

  it("reads as a neutral prompt, not an error, on the multi-workspace picker (no id requested yet)", () => {
    render(
      <WorkspaceIdentity
        loading={false}
        current={null}
        fallbackType="organisation"
        fallbackId={null}
      />,
    );
    expect(screen.getByText("Organisation")).toBeInTheDocument();
    expect(screen.getByText("Choose one")).toBeInTheDocument();
    expect(screen.queryByText(/unavailable/i)).not.toBeInTheDocument();
  });

  it("reads as unavailable when a specific id was requested but isn't one of the caller's own workspaces", () => {
    render(
      <WorkspaceIdentity
        loading={false}
        current={null}
        fallbackType="organisation"
        fallbackId="org-not-managed"
      />,
    );
    expect(screen.getByText("Unavailable workspace")).toBeInTheDocument();
  });

  it("falls back to a generic label when the URL implies no workspace type at all", () => {
    render(
      <WorkspaceIdentity
        loading={false}
        current={null}
        fallbackType={null}
        fallbackId={null}
      />,
    );
    expect(screen.getAllByText("Workspace")).toHaveLength(2);
  });
});
