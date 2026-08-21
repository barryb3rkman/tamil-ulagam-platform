import type { Metadata } from "next";

import { DashboardRegistration } from "@/components/application/dashboard-registration";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Registration details",
  "Review the current organisation registration.",
  "/dashboard/registration",
);
export default function DashboardRegistrationPage() {
  return <DashboardRegistration />;
}
