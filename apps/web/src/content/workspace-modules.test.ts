import { describe, expect, it } from "vitest";

import { findWorkspaceModule, workspaceModules } from "./workspace-modules";

const CANONICAL_IDS = [
  "events",
  "opportunities",
  "services",
  "community-programmes",
  "cultural-programmes",
  "education",
  "business",
  "healthcare",
  "research",
  "heritage-arts",
  "partnerships",
] as const;

describe("workspaceModules", () => {
  it("defines exactly the 11 canonical Tamil Ulagam programme modules", () => {
    expect(workspaceModules).toHaveLength(11);
    expect(workspaceModules.map((module) => module.id)).toEqual(CANONICAL_IDS);
  });

  it("gives every module a non-empty label, shortLabel, and description — never blank placeholder text", () => {
    for (const workspaceModule of workspaceModules) {
      expect(workspaceModule.label.trim().length).toBeGreaterThan(0);
      expect(workspaceModule.shortLabel.trim().length).toBeGreaterThan(0);
      expect(workspaceModule.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("has unique ids — no two module routes could ever collide", () => {
    const ids = workspaceModules.map((module) => module.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("findWorkspaceModule", () => {
  it("finds a known module by id", () => {
    expect(findWorkspaceModule("events")?.label).toBe("Events");
  });

  it("returns null for an unrecognised id — the caller must notFound(), never render undefined content", () => {
    expect(findWorkspaceModule("not-a-real-module")).toBeNull();
  });
});
