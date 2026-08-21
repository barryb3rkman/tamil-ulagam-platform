import type { ReactNode } from "react";

import { ApplicationShell } from "@/components/application/application-shell";

export default function AdminLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <ApplicationShell area="admin">{children}</ApplicationShell>;
}
