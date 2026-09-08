"use client";

import type { OrganisationApplication } from "@tamil-ulagam/shared";
import Link from "next/link";

import { getOrganisationDisplayLabel } from "@/content/enrollment";

import { formatDate } from "./application-details";
import { RegistrationStatusBadge } from "./registration-status-badge";

export function ApplicationQueueTable({
  applications,
  duplicateApplicationIds,
}: {
  readonly applications: readonly OrganisationApplication[];
  readonly duplicateApplicationIds?: ReadonlySet<string>;
}) {
  if (applications.length === 0)
    return (
      <div className="rounded-card border-hairline/12 bg-raised border p-7 text-center">
        <h2 className="text-fg text-xl font-bold">No applications found</h2>
        <p className="text-fg-muted mt-2">
          Adjust the search or filters to view the review queue.
        </p>
      </div>
    );
  return (
    <div className="rounded-card border-hairline/12 shadow-card bg-raised overflow-hidden border">
      <div className="border-hairline/10 bg-global-navy/4 text-fg-muted hidden grid-cols-[1.35fr_1fr_1fr_1fr_auto] gap-4 border-b px-5 py-3 text-xs font-bold tracking-[0.08em] uppercase xl:grid">
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
            className="hover:bg-sunken/45 grid gap-4 p-5 transition-colors xl:grid-cols-[1.35fr_1fr_1fr_1fr_auto] xl:items-center"
          >
            <div>
              <p className="text-fg font-bold">
                {application.organisation.name || "Incomplete organisation"}
              </p>
              <p className="text-fg-muted mt-1 text-sm xl:hidden">
                {getOrganisationDisplayLabel(
                  application.organisation.category,
                  application.registration.categoryProfile,
                )}
              </p>
              {duplicateApplicationIds?.has(application.registration.id) ? (
                <p className="text-warning mt-2 text-xs font-semibold">
                  Possible duplicate signal
                </p>
              ) : null}
            </div>
            <div className="text-sm">
              <p className="text-fg-muted mb-1 text-xs font-bold tracking-[0.08em] uppercase xl:hidden">
                Location
              </p>
              <p className="text-fg-body hidden xl:block">
                {getOrganisationDisplayLabel(
                  application.organisation.category,
                  application.registration.categoryProfile,
                )}
              </p>
              <p className="text-fg-muted xl:mt-1">
                {[
                  application.organisation.city,
                  application.organisation.country,
                ]
                  .filter(Boolean)
                  .join(", ") || "Location pending"}
              </p>
            </div>
            <div className="text-sm">
              <p className="text-fg-muted mb-1 text-xs font-bold tracking-[0.08em] uppercase xl:hidden">
                Representative
              </p>
              <p className="text-fg-body">
                {application.registration.representative.fullName}
              </p>
              <p className="text-fg-muted mt-1 break-all">
                {application.registration.representative.email}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 xl:grid">
              <span className="text-fg-muted w-full text-xs font-bold tracking-[0.08em] uppercase xl:hidden">
                Submitted / status
              </span>
              <span className="text-fg-muted text-sm">
                {formatDate(application.registration.submittedAt)}
              </span>
              <RegistrationStatusBadge
                status={application.registration.status}
              />
            </div>
            <Link
              href={`/admin/reviews?application=${encodeURIComponent(application.registration.id)}`}
              className="border-hairline text-fg focus-visible:ring-focus hover:bg-global-navy rounded-button inline-flex min-h-11 items-center justify-center border px-4 py-2 text-sm font-semibold hover:text-white"
            >
              Review
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
