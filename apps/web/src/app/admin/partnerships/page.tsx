import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminPartnershipOperations } from "@/components/admin/admin-partnership-operations";
import { createApplicationMetadata } from "@/config/metadata";
import { RouteLoading } from "@/components/application/route-loading";

export const metadata: Metadata = createApplicationMetadata(
  "Federation Partnerships",
  "Review and progress Tamil Ulagam partnership enquiries.",
  "/admin/partnerships",
);

export default function AdminPartnershipsPage() {
  return (
    <Suspense
      fallback={<RouteLoading label="Loading partnership enquiries…" />}
    >
      <AdminPartnershipOperations />
    </Suspense>
  );
}
