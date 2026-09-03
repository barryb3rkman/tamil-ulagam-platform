import type { Metadata } from "next";
import { Suspense } from "react";

import { OrganisationWorkspace } from "@/components/organisation/organisation-workspace";
import { createApplicationMetadata } from "@/config/metadata";
import { RouteLoading } from "@/components/application/route-loading";

export const metadata: Metadata = createApplicationMetadata(
  "Organisation Workspace",
  "Your organisation's registration status, verification signals and People.",
  "/workspace/organisation",
);

export default function WorkspaceOrganisationPage() {
  return (
    <Suspense fallback={<RouteLoading label="Loading…" />}>
      <OrganisationWorkspace />
    </Suspense>
  );
}
