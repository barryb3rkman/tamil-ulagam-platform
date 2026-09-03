import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminDirectory } from "@/components/admin/admin-directory";
import { createApplicationMetadata } from "@/config/metadata";
import { RouteLoading } from "@/components/application/route-loading";

export const metadata: Metadata = createApplicationMetadata(
  "Federation Organisations",
  "Inspect Tamil Ulagam Organisation operations and verification standing.",
  "/admin/organisations",
);

export default function AdminOrganisationsPage() {
  return (
    <Suspense fallback={<RouteLoading label="Loading Organisations…" />}>
      <AdminDirectory kind="organisation" />
    </Suspense>
  );
}
