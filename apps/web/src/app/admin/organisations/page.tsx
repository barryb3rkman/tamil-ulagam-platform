import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminDirectory } from "@/components/admin/admin-directory";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Federation Organisations",
  "Inspect Tamil Ulagam Organisation operations and verification standing.",
  "/admin/organisations",
);

export default function AdminOrganisationsPage() {
  return (
    <Suspense fallback={<p role="status">Loading Organisations…</p>}>
      <AdminDirectory kind="organisation" />
    </Suspense>
  );
}
