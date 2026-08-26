import type { Metadata } from "next";
import { Suspense } from "react";

import { OrganisationWorkspace } from "@/components/organisation/organisation-workspace";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Organisation Workspace",
  "Your organisation's registration status, verification signals and People.",
  "/workspace/organisation",
);

export default function WorkspaceOrganisationPage() {
  return (
    <Suspense fallback={<p role="status">Loading…</p>}>
      <OrganisationWorkspace />
    </Suspense>
  );
}
