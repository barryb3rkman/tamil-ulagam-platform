import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminMembershipOperations } from "@/components/admin/admin-membership-operations";
import { createApplicationMetadata } from "@/config/metadata";
import { RouteLoading } from "@/components/application/route-loading";

export const metadata: Metadata = createApplicationMetadata(
  "Federation Memberships",
  "Review Tamil Ulagam membership affiliation operations.",
  "/admin/memberships",
);

export default function AdminMembershipsPage() {
  return (
    <Suspense fallback={<RouteLoading label="Loading memberships…" />}>
      <AdminMembershipOperations />
    </Suspense>
  );
}
