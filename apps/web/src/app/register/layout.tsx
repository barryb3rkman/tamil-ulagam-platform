import type { ReactNode } from "react";

import { ApplicationShell } from "@/components/application/application-shell";

export default function RegisterLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <ApplicationShell area="member">{children}</ApplicationShell>;
}
