import type { Metadata } from "next";

import { AdminOverview } from "@/components/application/admin-overview";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Admin review",
  "Review Tamil Ulagam organisation registrations.",
  "/admin",
);
export default function AdminPage() {
  return <AdminOverview />;
}
