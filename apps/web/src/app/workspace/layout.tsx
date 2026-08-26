import { Suspense, type ReactNode } from "react";

import { WorkspaceShell } from "@/components/workspace/workspace-shell";

/**
 * The shared V3 chrome for every `/workspace/*` route (Phase E1). Before
 * this, `RouteFrame` gave these routes no header/navigation at all —
 * each workspace page built its own ad hoc sign-in prompt with no
 * persistent identity or way to move between workspaces. `WorkspaceShell`
 * reads the URL via `useSearchParams`, so it needs its own `<Suspense>`
 * boundary here, independent of the one each page already wraps its own
 * content in.
 */
export default function WorkspaceLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="bg-warm-ivory min-h-[calc(100vh-4rem)]">
          <div
            role="status"
            aria-label="Loading workspace"
            className="bg-deep-navy flex min-h-20 items-center px-5 sm:px-7 lg:px-10"
          >
            <span
              aria-hidden="true"
              className="h-9 w-40 animate-pulse rounded-sm bg-white/10"
            />
          </div>
        </div>
      }
    >
      <WorkspaceShell>{children}</WorkspaceShell>
    </Suspense>
  );
}
