import type { Metadata } from "next";
import { Suspense } from "react";

import { SangamWorkspace } from "@/components/sangam/sangam-workspace";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Sangam Workspace",
  "Your Tamil Sangam's registration status, verification signals and People.",
  "/workspace/sangam",
);

export default function WorkspaceSangamPage() {
  return (
    <Suspense fallback={<p role="status">Loading…</p>}>
      <SangamWorkspace />
    </Suspense>
  );
}
