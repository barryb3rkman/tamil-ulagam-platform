import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { findWorkspaceModule } from "@/content/workspace-modules";

import { ModuleComingSoon } from "./module-coming-soon";

afterEach(cleanup);

const events = findWorkspaceModule("events")!;

describe("ModuleComingSoon", () => {
  it("renders the module's real title and description — no generic 'Coming soon.' card", () => {
    render(
      <ModuleComingSoon
        workspaceModule={events}
        workspaceType="member"
        entityId={null}
        workspaceLabel="your Member Workspace"
      />,
    );
    expect(screen.getByRole("heading", { name: "Events" })).toBeInTheDocument();
    expect(screen.getByText(events.description)).toBeInTheDocument();
    expect(screen.getByText("In development")).toBeInTheDocument();
  });

  it("never fabricates a launch date or progress percentage", () => {
    render(
      <ModuleComingSoon
        workspaceModule={events}
        workspaceType="member"
        entityId={null}
        workspaceLabel="your Member Workspace"
      />,
    );
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/launch(ing)? (on|in)/i)).not.toBeInTheDocument();
  });

  it("links back to the Member workspace with no entity id in the URL", () => {
    render(
      <ModuleComingSoon
        workspaceModule={events}
        workspaceType="member"
        entityId={null}
        workspaceLabel="your Member Workspace"
      />,
    );
    expect(
      screen.getByRole("link", { name: "Back to your Member Workspace" }),
    ).toHaveAttribute("href", "/workspace/member");
  });

  it("links back to the correct Organisation with its entity id preserved", () => {
    render(
      <ModuleComingSoon
        workspaceModule={events}
        workspaceType="organisation"
        entityId="org-1"
        workspaceLabel="your Organisation workspace"
      />,
    );
    expect(
      screen.getByRole("link", { name: "Back to your Organisation workspace" }),
    ).toHaveAttribute("href", "/workspace/organisation?organization=org-1");
  });

  it("links back to the correct Sangam with its entity id preserved", () => {
    render(
      <ModuleComingSoon
        workspaceModule={events}
        workspaceType="sangam"
        entityId="sangam-1"
        workspaceLabel="your Sangam workspace"
      />,
    );
    expect(
      screen.getByRole("link", { name: "Back to your Sangam workspace" }),
    ).toHaveAttribute("href", "/workspace/sangam?sangam=sangam-1");
  });
});
