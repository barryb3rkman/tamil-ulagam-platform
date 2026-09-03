import type { Metadata } from "next";
import { Suspense } from "react";

import { ManagerPeople } from "@/components/member/manager-people";
import { createApplicationMetadata } from "@/config/metadata";
import { RouteLoading } from "@/components/application/route-loading";

export const metadata: Metadata = createApplicationMetadata(
  "People",
  "Review and decide membership requests for your organisation.",
  "/workspace/organisation/people",
);

export default function WorkspaceOrganisationPeoplePage() {
  return (
    <Suspense fallback={<RouteLoading label="Loading…" />}>
      <ManagerPeople />
    </Suspense>
  );
}
