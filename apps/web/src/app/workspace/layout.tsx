import { Suspense, type ReactNode } from "react";

import { WorkspaceShell } from "@/components/workspace/workspace-shell";

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
