import type { Metadata } from "next";
import { Suspense } from "react";

import { SangamWorkspace } from "@/components/sangam/sangam-workspace";
import { createApplicationMetadata } from "@/config/metadata";
import { RouteLoading } from "@/components/application/route-loading";

export const metadata: Metadata = createApplicationMetadata(
  "Sangam Workspace",
  "Your Tamil Sangam's registration status, verification signals and People.",
  "/workspace/sangam",
);

export default function WorkspaceSangamPage() {
  return (
    <Suspense fallback={<RouteLoading label="Loading…" />}>
      <SangamWorkspace />
    </Suspense>
  );
}
