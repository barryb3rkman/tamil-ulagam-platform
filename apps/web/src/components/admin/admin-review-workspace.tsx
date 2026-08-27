"use client";

import { useSearchParams } from "next/navigation";

import { AdminRegistrationQueue } from "@/components/application/admin-registration-queue";
import { AdminRegistrationReview } from "@/components/application/admin-registration-review";

export function AdminReviewWorkspace() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("application");
  return applicationId ? (
    <AdminRegistrationReview id={applicationId} />
  ) : (
    <AdminRegistrationQueue />
  );
}
