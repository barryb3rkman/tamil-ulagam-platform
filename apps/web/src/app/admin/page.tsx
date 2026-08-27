import type { Metadata } from "next";

import { AdminOverview } from "@/components/application/admin-overview";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Federation Admin",
  "Operate Tamil Ulagam registration, organisation, Sangam, membership and partnership workflows.",
  "/admin",
);
export default function AdminPage() {
  return <AdminOverview />;
}
