"use client";

import type { OrganisationApplication } from "@tamil-ulagam/shared";
import Link from "next/link";

import { getOrganisationDisplayLabel } from "@/content/enrollment";
import { usePlatform } from "@/features/enrollment/platform-provider";

import { formatDate } from "./application-details";
import { RegistrationStatusBadge } from "./registration-status-badge";

export function ApplicationQueueTable({
  applications,
}: {
  readonly applications: readonly OrganisationApplication[];
}) {
  const { backendKind } = usePlatform();
  if (applications.length === 0)
    return (
      <div className="rounded-card border-global-navy/12 border bg-white p-7 text-center">
        <h2 className="text-global-navy text-xl font-bold">
          No applications found
        </h2>
        <p className="text-slate mt-2">
          Adjust the search or filters to view the review queue.
        </p>
      </div>
    );
  return (
    <div className="rounded-card border-global-navy/12 shadow-card overflow-hidden border bg-white">
      <div className="border-global-navy/10 bg-global-navy/4 text-slate hidden grid-cols-[1.35fr_1fr_1fr_1fr_auto] gap-4 border-b px-5 py-3 text-xs font-bold tracking-[0.08em] uppercase xl:grid">
        <span>Organisation</span>
        <span>Category / location</span>
        <span>Representative</span>
        <span>Submitted / status</span>
        <span>Action</span>
      </div>
      <ul className="divide-global-navy/10 divide-y">
        {applications.map((application) => (
          <li
            key={application.registration.id}
            className="hover:bg-warm-ivory/45 grid gap-4 p-5 transition-colors xl:grid-cols-[1.35fr_1fr_1fr_1fr_auto] xl:items-center"
          >
            <div>
              <p className="text-global-navy font-bold">
                {application.organisation.name || "Incomplete organisation"}
              </p>
              <p className="text-slate mt-1 text-sm xl:hidden">
                {getOrganisationDisplayLabel(
                  application.organisation.category,
                  application.registration.categoryProfile,
                )}
              </p>
            </div>
            <div className="text-sm">
              <p className="text-slate mb-1 text-xs font-bold tracking-[0.08em] uppercase xl:hidden">
                Location
              </p>
              <p className="text-charcoal hidden xl:block">
                {getOrganisationDisplayLabel(
                  application.organisation.category,
                  application.registration.categoryProfile,
                )}
              </p>
              <p className="text-slate xl:mt-1">
                {[
                  application.organisation.city,
                  application.organisation.country,
                ]
                  .filter(Boolean)
                  .join(", ") || "Location pending"}
              </p>
            </div>
            <div className="text-sm">
              <p className="text-slate mb-1 text-xs font-bold tracking-[0.08em] uppercase xl:hidden">
                Representative
              </p>
              <p className="text-charcoal">
                {application.registration.representative.fullName}
              </p>
              <p className="text-slate mt-1 break-all">
                {application.registration.representative.email}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 xl:grid">
              <span className="text-slate w-full text-xs font-bold tracking-[0.08em] uppercase xl:hidden">
                Submitted / status
              </span>
              <span className="text-slate text-sm">
                {formatDate(application.registration.submittedAt)}
              </span>
              <RegistrationStatusBadge
                status={application.registration.status}
              />
            </div>
            <Link
              href={
                backendKind === "supabase"
                  ? `/admin/registrations/review?application=${encodeURIComponent(application.registration.id)}`
                  : `/admin/registrations/${application.registration.id}`
              }
              className="border-global-navy text-global-navy focus-visible:ring-focus hover:bg-global-navy rounded-button inline-flex min-h-11 items-center justify-center border px-4 py-2 text-sm font-semibold hover:text-white"
            >
              Review
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
