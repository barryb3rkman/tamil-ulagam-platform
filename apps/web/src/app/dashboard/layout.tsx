import { Suspense, type ReactNode } from "react";

import { ApplicationShell } from "@/components/application/application-shell";

export default function DashboardLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          aria-label="Loading your workspace"
          className="bg-warm-ivory grid min-h-[100dvh] place-items-center"
        >
          <span
            aria-hidden="true"
            className="border-global-navy/15 border-t-heritage-gold size-10 animate-spin rounded-full border-2"
          />
        </div>
      }
    >
      <ApplicationShell area="member">{children}</ApplicationShell>
    </Suspense>
  );
}
