import type { Metadata } from "next";
import { Suspense } from "react";

import { DashboardRegistration } from "@/components/application/dashboard-registration";
import { createApplicationMetadata } from "@/config/metadata";
import { RouteLoading } from "@/components/application/route-loading";

export const metadata: Metadata = createApplicationMetadata(
  "Registration details",
  "Review the current organisation registration.",
  "/dashboard/registration",
);
export default function DashboardRegistrationPage() {
  return (
    <Suspense fallback={<RouteLoading label="Loading registration…" />}>
      <DashboardRegistration />
    </Suspense>
  );
}
