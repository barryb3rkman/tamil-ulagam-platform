import type { WorkspaceType } from "./workspace-options";

/**
 * Builds a programme-module route for the workspace currently active,
 * nested under that workspace's own URL space (mirroring the existing
 * People sub-route pattern under `/workspace/organisation/people`) so
 * `resolveActiveWorkspace`'s pathname-prefix matching keeps resolving
 * the correct workspace identity while a module route is open, and the
 * selected organisation/Sangam id travels with the link exactly as it
 * already does for People.
 *
 * Returns `null` for `type: "admin"` and `type: null` — Federation Admin
 * is explicitly out of scope for this phase, and there is no sensible
 * module route without a resolved workspace to nest it under.
 */
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
