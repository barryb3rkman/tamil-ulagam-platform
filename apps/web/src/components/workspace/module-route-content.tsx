"use client";

import { useSearchParams } from "next/navigation";

import type { WorkspaceModule } from "@/content/workspace-modules";
import type { WorkspaceType } from "@/features/workspace/workspace-options";

import { ModuleProgramme } from "./module-programme";

const workspaceLabel: Record<Exclude<WorkspaceType, "admin">, string> = {
  member: "your Member Workspace",
  organisation: "your Organisation workspace",
  sangam: "your Sangam workspace",
};

const entityParam: Record<Exclude<WorkspaceType, "admin">, string | null> = {
  member: null,
  organisation: "organization",
  sangam: "sangam",
};

export function ModuleRouteContent({
  workspaceModule,
  workspaceType,
}: {
  readonly workspaceModule: WorkspaceModule;
  readonly workspaceType: Exclude<WorkspaceType, "admin">;
}) {
  const searchParams = useSearchParams();
  const paramName = entityParam[workspaceType];
  const entityId = paramName ? searchParams.get(paramName) : null;

  return (
    <ModuleProgramme
      workspaceModule={workspaceModule}
      workspaceType={workspaceType}
      entityId={entityId}
      workspaceLabel={workspaceLabel[workspaceType]}
    />
  );
}
