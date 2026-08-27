import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminDirectory } from "@/components/admin/admin-directory";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Federation Tamil Sangams",
  "Inspect Tamil Sangam operations and verification standing.",
  "/admin/sangams",
);

export default function AdminSangamsPage() {
  return (
    <Suspense fallback={<p role="status">Loading Tamil Sangams…</p>}>
      <AdminDirectory kind="sangam" />
    </Suspense>
  );
}
