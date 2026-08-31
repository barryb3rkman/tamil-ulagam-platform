import type { WorkspaceModule } from "@/content/workspace-modules";

/** Maps each module's restrained accent token to the matching design
 * token background class — one place, so the dot in the Programmes
 * panel and the dot in a workspace landing page's module strip always
 * agree. */
export function moduleAccentClassName(
  accent: WorkspaceModule["accent"],
): string {
  switch (accent) {
    case "maroon":
      return "bg-heritage-maroon";
    case "gold":
      return "bg-heritage-gold";
    case "indigo":
      return "bg-indigo-depth";
    case "crimson":
      return "bg-crimson-ember";
    case "teal":
      return "bg-teal-depth";
    case "success":
      return "bg-success";
    case "navy":
      return "bg-global-navy";
  }
}
