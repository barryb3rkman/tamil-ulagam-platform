import type { Metadata } from "next";

import { AccountForm } from "@/components/application/account-form";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Account details",
  "Manage the current Tamil Ulagam account profile.",
  "/dashboard/account",
);
export default function DashboardAccountPage() {
  return <AccountForm />;
}
