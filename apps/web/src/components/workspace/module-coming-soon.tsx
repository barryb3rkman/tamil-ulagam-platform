import { Container } from "@tamil-ulagam/ui";
import Link from "next/link";

import type { WorkspaceModule } from "@/content/workspace-modules";
import type { WorkspaceType } from "@/features/workspace/workspace-options";

import { moduleAccentClassName } from "./module-accent";

/**
 * The shared placeholder every one of the 11 programme-module routes
 * renders (H6 brief section 14) — one deliberate, concise state, never
 * a bare "Coming soon." card and never fabricated functionality. No
 * invented launch date, no fake progress. The same component is reused
 * by all three workspace-nested module routes; only the module and the
 * "back to workspace" link differ.
 */
export function ModuleComingSoon({
  workspaceModule,
  workspaceType,
  entityId,
  workspaceLabel,
}: {
  readonly workspaceModule: WorkspaceModule;
  readonly workspaceType: WorkspaceType;
  readonly entityId: string | null;
  /** e.g. the organisation/Sangam name, or "your Member Workspace" —
   * used only in the back-link copy. */
  readonly workspaceLabel: string;
}) {
  const backHref =
    workspaceType === "organisation" && entityId
      ? `/workspace/organisation?organization=${entityId}`
      : workspaceType === "sangam" && entityId
        ? `/workspace/sangam?sangam=${entityId}`
        : "/workspace/member";

  return (
    <Container className="py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-xl">
        <span
          aria-hidden="true"
          className={`inline-block size-3 rounded-full ${moduleAccentClassName(workspaceModule.accent)}`}
        />
        <p className="text-heritage-maroon mt-4 text-xs font-bold tracking-[0.14em] uppercase">
          Tamil Ulagam programme
        </p>
        <h1 className="text-global-navy mt-2 text-3xl font-bold tracking-[-0.01em]">
          {workspaceModule.label}
        </h1>
        <p className="text-slate mt-3 leading-7">
          {workspaceModule.description}
        </p>

        <div className="border-global-navy/12 rounded-card mt-8 border bg-white p-5 sm:p-7">
          <span className="bg-champagne text-heritage-maroon rounded-button inline-flex items-center px-3 py-1 text-xs font-bold tracking-[0.08em] uppercase">
            In development
          </span>
          <p className="text-charcoal mt-3 leading-6">
            This programme area is part of Tamil Ulagam&rsquo;s roadmap and
            isn&rsquo;t open yet. There&rsquo;s nothing to set up here — check
            back as it becomes available.
          </p>
        </div>

        <p className="mt-6">
          <Link
            href={backHref}
            className="text-global-navy focus-visible:ring-focus rounded-button text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none"
          >
            Back to {workspaceLabel}
          </Link>
        </p>
      </div>
    </Container>
  );
}
