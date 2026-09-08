import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { eventsContent } from "@/content/events";
import { moduleCapabilities } from "@/content/workspace-module-content";
import { findWorkspaceModule } from "@/content/workspace-modules";

import { ModuleProgramme } from "./module-programme";

const events = findWorkspaceModule("events")!;
const healthcare = findWorkspaceModule("healthcare")!;

describe("ModuleProgramme", () => {
  it("names the programme in Tamil and English, with its own description", () => {
    render(
      <ModuleProgramme
        workspaceModule={healthcare}
        workspaceType="member"
        entityId={null}
        workspaceLabel="your Member Workspace"
      />,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: healthcare.label }),
    ).toBeInTheDocument();
    expect(screen.getByText("மருத்துவம்")).toBeInTheDocument();
    expect(screen.getByText(healthcare.description)).toBeInTheDocument();
  });

  it("shows what the programme actually covers, not a placeholder", () => {
    render(
      <ModuleProgramme
        workspaceModule={healthcare}
        workspaceType="member"
        entityId={null}
        workspaceLabel="your Member Workspace"
      />,
    );
    const capabilities = moduleCapabilities("healthcare");
    expect(capabilities.length).toBeGreaterThan(0);
    for (const capability of capabilities) {
      expect(
        screen.getByRole("heading", { level: 3, name: capability.title }),
      ).toBeInTheDocument();
    }
  });

  it("shows the federation calendar on the events programme", () => {
    render(
      <ModuleProgramme
        workspaceModule={events}
        workspaceType="member"
        entityId={null}
        workspaceLabel="your Member Workspace"
      />,
    );
    const calendar = screen.getByRole("region", {
      name: "The federation year",
    });
    for (const event of eventsContent.signature) {
      expect(within(calendar).getByText(event.title)).toBeInTheDocument();
      expect(within(calendar).getByText(event.tamilTitle)).toBeInTheDocument();
    }
  });

  it("never fabricates a launch date or a progress percentage", () => {
    const { container } = render(
      <ModuleProgramme
        workspaceModule={events}
        workspaceType="member"
        entityId={null}
        workspaceLabel="your Member Workspace"
      />,
    );
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/launch(ing)? (on|in)/i)).not.toBeInTheDocument();
    // The workspace does not date itself either.
    expect(container.textContent).not.toMatch(/\b(?:19|20)\d{2}\b/);
  });

  it("links back to the Member workspace with no entity id in the URL", () => {
    render(
      <ModuleProgramme
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

  it("keeps the entity id on every link out of an Organisation workspace", () => {
    render(
      <ModuleProgramme
        workspaceModule={events}
        workspaceType="organisation"
        entityId="org-1"
        workspaceLabel="your Organisation workspace"
      />,
    );
    expect(
      screen.getByRole("link", { name: "Back to your Organisation workspace" }),
    ).toHaveAttribute("href", "/workspace/organisation?organization=org-1");
    // Losing it on a sibling link would drop the member into a workspace
    // chooser rather than the organisation they were standing in.
    expect(screen.getByRole("link", { name: "Culture" })).toHaveAttribute(
      "href",
      "/workspace/organisation/modules/cultural-programmes?organization=org-1",
    );
  });

  it("keeps the entity id on every link out of a Sangam workspace", () => {
    render(
      <ModuleProgramme
        workspaceModule={events}
        workspaceType="sangam"
        entityId="sangam-1"
        workspaceLabel="your Sangam workspace"
      />,
    );
    expect(
      screen.getByRole("link", { name: "Back to your Sangam workspace" }),
    ).toHaveAttribute("href", "/workspace/sangam?sangam=sangam-1");
    expect(screen.getByRole("link", { name: "Culture" })).toHaveAttribute(
      "href",
      "/workspace/sangam/modules/cultural-programmes?sangam=sangam-1",
    );
  });
});
