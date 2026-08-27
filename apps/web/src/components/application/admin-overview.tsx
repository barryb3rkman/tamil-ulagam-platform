"use client";

import type {
  AdminActivityItem,
  AdminAttentionSummary,
} from "@tamil-ulagam/shared";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  AdminErrorState,
  AdminLoadingState,
  AdminPageHeader,
} from "@/components/admin/admin-primitives";
import { useAdminOperations } from "@/features/admin/admin-operations-provider";
import {
  activityDomainLabels,
  formatOperationalDate,
} from "@/features/admin/admin-presentation";
import { usePlatform } from "@/features/enrollment/platform-provider";
import { getPlatformErrorMessage } from "@/lib/supabase/errors";

const initialSummary: AdminAttentionSummary = {
  registrationReviews: 0,
  registrationFollowUps: 0,
  pendingMemberships: 0,
  newPartnershipEnquiries: 0,
  verifiedOrganisations: 0,
  verifiedSangams: 0,
};

export function AdminOverview() {
  const { applications } = usePlatform();
  const { capabilities, service } = useAdminOperations();
  const [summary, setSummary] = useState(initialSummary);
  const [activity, setActivity] = useState<AdminActivityItem[]>([]);
  const [loading, setLoading] = useState(capabilities.canOperateFederation);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!service || !capabilities.canOperateFederation) return;
    let cancelled = false;
    Promise.all([service.getAttentionSummary(), service.listRecentActivity(10)])
      .then(([nextSummary, nextActivity]) => {
        if (cancelled) return;
        setSummary(nextSummary);
        setActivity(nextActivity);
        setError("");
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(getPlatformErrorMessage(caught));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [capabilities.canOperateFederation, service]);

  const reviewerAttention = applications.filter((item) =>
    ["submitted", "under_review"].includes(item.registration.status),
  ).length;
  const registrationReviews = capabilities.canOperateFederation
    ? summary.registrationReviews
    : reviewerAttention;

  const operationsLoading = capabilities.canOperateFederation && loading;

  return (
    <div className="grid gap-8 lg:gap-10">
      <AdminPageHeader
        eyebrow="Federation operations"
        title="What needs attention now"
        description={
          capabilities.canOperateFederation
            ? "Review current operational work across registrations, affiliations and partnership conversations."
            : "Review registration applications within your assigned Federation responsibility."
        }
      />

      {error ? <AdminErrorState message={error} /> : null}
      {operationsLoading ? (
        <AdminLoadingState label="Loading Federation operations" />
      ) : (
        <section
          aria-labelledby="attention-title"
          className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]"
        >
          <div className="bg-global-navy rounded-large shadow-card p-6 text-white sm:p-8">
            <p className="text-heritage-gold text-xs font-bold tracking-[0.14em] uppercase">
              Needs attention
            </p>
            <h2
              id="attention-title"
              className="mt-3 text-2xl font-bold sm:text-3xl"
            >
              Operational work queue
            </h2>
            <div className="mt-7 grid gap-3">
              <AttentionLink
                href="/admin/reviews"
                label="Registration applications awaiting review"
                count={registrationReviews}
              />
              {capabilities.canOperateFederation ? (
                <>
                  <AttentionLink
                    href="/admin/reviews?status=needs_changes"
                    label="Applications awaiting applicant follow-up"
                    count={summary.registrationFollowUps}
                  />
                  <AttentionLink
                    href="/admin/memberships?status=pending"
                    label="Membership requests requiring intervention"
                    count={summary.pendingMemberships}
                  />
                  <AttentionLink
                    href="/admin/partnerships?status=new"
                    label="New partnership enquiries"
                    count={summary.newPartnershipEnquiries}
                  />
                </>
              ) : null}
            </div>
          </div>

          <aside className="border-global-navy/12 rounded-large border bg-white p-6 sm:p-8">
            <p className="text-heritage-maroon text-xs font-bold tracking-[0.14em] uppercase">
              Review responsibility
            </p>
            <h2 className="text-global-navy mt-3 text-xl font-bold">
              {capabilities.canOperateFederation
                ? "Federation Admin"
                : "Registration Reviewer"}
            </h2>
            <p className="text-slate mt-3 leading-7">
              {capabilities.canOperateFederation
                ? "Operational access includes Federation directories, membership escalation and partnership lifecycle management."
                : "Your access is limited to registration review. Operational directories, membership escalation and partnerships remain Admin-only."}
            </p>
          </aside>
        </section>
      )}

      {capabilities.canOperateFederation ? (
        <section aria-labelledby="directories-title">
          <p className="text-heritage-maroon text-xs font-bold tracking-[0.14em] uppercase">
            Federation directories
          </p>
          <h2
            id="directories-title"
            className="text-global-navy mt-2 text-2xl font-bold"
          >
            Verified network visibility
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DirectoryLink
              href="/admin/organisations"
              label="Organisations"
              value={summary.verifiedOrganisations}
              description="Verified non-Sangam entities"
            />
            <DirectoryLink
              href="/admin/sangams"
              label="Tamil Sangams"
              value={summary.verifiedSangams}
              description="Verified Tamil Sangam entities"
            />
            <DirectoryLink
              href="/admin/memberships"
              label="Memberships"
              value={summary.pendingMemberships}
              description="Pending affiliations requiring attention"
            />
          </div>
        </section>
      ) : null}

      {capabilities.canOperateFederation ? (
        <section aria-labelledby="recent-activity-title">
          <h2
            id="recent-activity-title"
            className="text-global-navy text-2xl font-bold"
          >
            Recent operational activity
          </h2>
          {activity.length ? (
            <ol className="border-global-navy/12 divide-global-navy/10 rounded-card mt-5 divide-y border bg-white">
              {activity.map((item) => (
                <li
                  key={`${item.domain}-${item.id}`}
                  className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="text-global-navy font-semibold break-words">
                      {item.title}
                    </p>
                    <p className="text-slate mt-1 text-sm">
                      {activityDomainLabels[item.domain]} · {item.description} ·{" "}
                      {humanize(item.status)}
                    </p>
                  </div>
                  <time
                    className="text-slate text-sm"
                    dateTime={item.occurredAt}
                  >
                    {formatOperationalDate(item.occurredAt)}
                  </time>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-slate border-global-navy/12 rounded-card mt-5 border bg-white p-6">
              Operational decisions will appear here as they are recorded.
            </p>
          )}
        </section>
      ) : null}
    </div>
  );
}

function AttentionLink({
  href,
  label,
  count,
}: {
  readonly href: string;
  readonly label: string;
  readonly count: number;
}) {
  return (
    <Link
      href={href}
      className="focus-visible:ring-focus-inverse rounded-card group hover:border-heritage-gold/60 flex min-h-16 items-center justify-between gap-5 border border-white/15 bg-white/[0.04] px-4 py-3 hover:bg-white/[0.07]"
    >
      <span className="leading-6 font-semibold">{label}</span>
      <span className="bg-heritage-gold text-deep-navy grid min-h-9 min-w-9 place-items-center rounded-full px-2 text-sm font-bold">
        {count}
      </span>
    </Link>
  );
}

function DirectoryLink({
  href,
  label,
  value,
  description,
}: {
  readonly href: string;
  readonly label: string;
  readonly value: number;
  readonly description: string;
}) {
  return (
    <Link
      href={href}
      className="border-global-navy/12 focus-visible:ring-focus rounded-card group hover:border-heritage-gold/70 border bg-white p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-global-navy text-lg font-bold">{label}</h3>
        <span className="text-heritage-maroon text-2xl font-bold">{value}</span>
      </div>
      <p className="text-slate mt-2 text-sm leading-6">{description}</p>
      <span className="text-global-navy decoration-heritage-gold mt-4 inline-flex text-sm font-semibold underline underline-offset-4">
        Open directory
      </span>
    </Link>
  );
}

function humanize(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/^./, (character) => character.toUpperCase());
}
