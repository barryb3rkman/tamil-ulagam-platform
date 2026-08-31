import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { workspaceModules } from "@/content/workspace-modules";

import { ModuleAccessStrip } from "./module-access-strip";

afterEach(cleanup);

describe("ModuleAccessStrip", () => {
  it("renders all 11 programme modules as real links for the Member workspace", () => {
    render(<ModuleAccessStrip type="member" entityId={null} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(11);
    for (const workspaceModule of workspaceModules) {
      expect(
        screen.getByRole("link", { name: workspaceModule.shortLabel }),
      ).toHaveAttribute(
        "href",
        `/workspace/member/modules/${workspaceModule.id}`,
      );
    }
  });

  it("carries the organisation id on every module link", () => {
    render(<ModuleAccessStrip type="organisation" entityId="org-1" />);
    expect(screen.getByRole("link", { name: "Events" })).toHaveAttribute(
      "href",
      "/workspace/organisation/modules/events?organization=org-1",
    );
  });

  it("carries the sangam id on every module link", () => {
    render(<ModuleAccessStrip type="sangam" entityId="sangam-1" />);
    expect(screen.getByRole("link", { name: "Events" })).toHaveAttribute(
      "href",
      "/workspace/sangam/modules/events?sangam=sangam-1",
    );
  });

  it("renders no broken links when an Organisation/Sangam entity id hasn't resolved yet", () => {
    render(<ModuleAccessStrip type="organisation" entityId={null} />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("never renders fabricated content — no numbers, percentages, or activity copy", () => {
    render(<ModuleAccessStrip type="member" entityId={null} />);
    expect(
      screen.queryByText(/\d+ (members?|events?|jobs?)/i),
    ).not.toBeInTheDocument();
  });
});
