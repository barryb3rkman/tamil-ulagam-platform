import Link from "next/link";

import { workspaceModules } from "@/content/workspace-modules";
import type { WorkspaceType } from "@/features/workspace/workspace-options";
import { moduleHref } from "@/features/workspace/module-routes";

import { moduleAccentClassName } from "./module-accent";

/**
 * A restrained, compact row of module-entry chips for a workspace
 * landing page (H6 brief sections 9-12) — deliberately not eleven giant
 * equal-size cards. Real navigation to a real (Coming Soon) route, never
 * decoration; the same `moduleHref`/`workspaceModules` the Programmes
 * panel uses, so the two surfaces never drift out of sync.
 */
export function ModuleAccessStrip({
  type,
  entityId,
}: {
  readonly type: WorkspaceType;
  readonly entityId: string | null;
}) {
  return (
    <section aria-labelledby="module-access-heading" className="mt-8">
      <h2
        id="module-access-heading"
        className="text-global-navy text-lg font-bold"
      >
        Explore Tamil Ulagam
      </h2>
      <p className="text-slate mt-1 text-sm leading-6">
        Programme areas across the federation — most are still in development.
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {workspaceModules.map((workspaceModule) => {
          const href = moduleHref(type, entityId, workspaceModule.id);
          if (!href) return null;
          return (
            <li key={workspaceModule.id}>
              <Link
                href={href}
                className="border-global-navy/12 rounded-button motion-control focus-visible:ring-focus text-charcoal hover:border-global-navy/30 hover:bg-warm-ivory inline-flex min-h-10 items-center gap-2 border bg-white px-3.5 text-sm font-semibold focus-visible:outline-none"
              >
                <span
                  aria-hidden="true"
                  className={`size-2 shrink-0 rounded-full ${moduleAccentClassName(workspaceModule.accent)}`}
                />
                {workspaceModule.shortLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
