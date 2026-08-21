import type { ReactNode } from "react";

import { ApplicationShell } from "@/components/application/application-shell";

export default function DashboardLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <ApplicationShell area="member">{children}</ApplicationShell>;
}
