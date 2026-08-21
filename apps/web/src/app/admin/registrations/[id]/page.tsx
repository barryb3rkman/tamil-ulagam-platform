import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminRegistrationReview } from "@/components/application/admin-registration-review";
import { createApplicationMetadata } from "@/config/metadata";

const registrationIds = [
  "registration-toronto",
  "registration-learning",
  "registration-anbu",
  "registration-enterprise",
  "registration-foundation",
  "registration-current",
  "review",
] as const;

export const metadata: Metadata = createApplicationMetadata(
  "Review registration",
  "Review a Tamil Ulagam organisation application.",
  "/admin/registrations",
);

export function generateStaticParams() {
  return registrationIds.map((id) => ({ id }));
}

export default async function AdminRegistrationReviewPage({
  params,
}: {
  readonly params: Promise<{ readonly id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<p role="status">Loading application…</p>}>
      <AdminRegistrationReview id={id} />
    </Suspense>
  );
}
