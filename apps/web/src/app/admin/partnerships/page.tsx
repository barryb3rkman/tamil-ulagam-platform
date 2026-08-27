import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminPartnershipOperations } from "@/components/admin/admin-partnership-operations";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Federation Partnerships",
  "Review and progress Tamil Ulagam partnership enquiries.",
  "/admin/partnerships",
);

export default function AdminPartnershipsPage() {
  return (
    <Suspense fallback={<p role="status">Loading partnership enquiries…</p>}>
      <AdminPartnershipOperations />
    </Suspense>
  );
}
