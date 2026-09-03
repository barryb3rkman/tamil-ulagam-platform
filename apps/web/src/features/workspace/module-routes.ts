import type { WorkspaceType } from "./workspace-options";

export function moduleHref(
  type: WorkspaceType | null,
  entityId: string | null,
  moduleId: string,
): string | null {
  if (type === "member") {
    return `/workspace/member/modules/${moduleId}`;
  }
  if (type === "organisation" && entityId) {
    return `/workspace/organisation/modules/${moduleId}?organization=${entityId}`;
  }
  if (type === "sangam" && entityId) {
    return `/workspace/sangam/modules/${moduleId}?sangam=${entityId}`;
  }
  return null;
}
