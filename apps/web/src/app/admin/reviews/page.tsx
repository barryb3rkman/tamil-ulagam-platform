import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminReviewWorkspace } from "@/components/admin/admin-review-workspace";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Registration reviews",
  "Review Tamil Ulagam organisation and Tamil Sangam registrations.",
  "/admin/reviews",
);

export default function AdminReviewsPage() {
  return (
    <Suspense fallback={<p role="status">Loading registration reviews…</p>}>
      <AdminReviewWorkspace />
    </Suspense>
  );
}
