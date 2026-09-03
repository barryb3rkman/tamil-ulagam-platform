import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminDirectory } from "@/components/admin/admin-directory";
import { createApplicationMetadata } from "@/config/metadata";
import { RouteLoading } from "@/components/application/route-loading";

export const metadata: Metadata = createApplicationMetadata(
  "Federation Tamil Sangams",
  "Inspect Tamil Sangam operations and verification standing.",
  "/admin/sangams",
);

export default function AdminSangamsPage() {
  return (
    <Suspense fallback={<RouteLoading label="Loading Tamil Sangams…" />}>
      <AdminDirectory kind="sangam" />
    </Suspense>
  );
}
