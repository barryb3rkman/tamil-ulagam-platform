import type { Metadata } from "next";

import { DashboardOverview } from "@/components/application/dashboard-overview";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Organisation dashboard",
  "Review a Tamil Ulagam organisation enrollment status.",
  "/dashboard",
);
export default function DashboardPage() {
  return <DashboardOverview />;
}
