import { Suspense, type ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminOperationsProvider } from "@/features/admin/admin-operations-provider";

export default function AdminLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <AdminOperationsProvider>
      <Suspense
        fallback={
          <div
            role="status"
            aria-label="Loading Federation Admin"
            className="bg-warm-ivory min-h-[calc(100vh-4rem)]"
          >
            <div className="bg-deep-navy flex min-h-20 items-center px-5 sm:px-7 lg:px-10">
              <span
                aria-hidden="true"
                className="h-9 w-48 animate-pulse rounded-sm bg-white/10"
              />
            </div>
          </div>
        }
      >
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </AdminOperationsProvider>
  );
}
