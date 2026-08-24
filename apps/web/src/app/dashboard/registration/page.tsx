import type { Metadata } from "next";
import { Suspense } from "react";

import { DashboardRegistration } from "@/components/application/dashboard-registration";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Registration details",
  "Review the current organisation registration.",
  "/dashboard/registration",
);
export default function DashboardRegistrationPage() {
  return (
    <Suspense fallback={<p role="status">Loading registration…</p>}>
      <DashboardRegistration />
    </Suspense>
  );
}
