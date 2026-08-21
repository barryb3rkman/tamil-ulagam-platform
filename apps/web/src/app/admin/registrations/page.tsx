import type { Metadata } from "next";

import { AdminRegistrationQueue } from "@/components/application/admin-registration-queue";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Registration queue",
  "Filter and review organisation registrations.",
  "/admin/registrations",
);
export default function AdminRegistrationsPage() {
  return <AdminRegistrationQueue />;
}
