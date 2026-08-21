"use client";

import Link from "next/link";

import { usePlatform } from "@/features/enrollment/platform-provider";

import { ApplicationQueueTable } from "./application-queue-table";

export function AdminOverview() {
  const { applications, isHydrated } = usePlatform();
  if (!isHydrated) return <p role="status">Loading review workspace…</p>;
  const counts = [
    {
      label: "Awaiting Review",
      value: applications.filter((item) =>
        ["submitted", "under_review"].includes(item.registration.status),
      ).length,
    },
    {
      label: "Verified",
      value: applications.filter(
        (item) => item.registration.status === "verified",
      ).length,
    },
    {
      label: "Changes Requested",
      value: applications.filter(
        (item) => item.registration.status === "needs_changes",
      ).length,
    },
    {
      label: "Rejected",
      value: applications.filter(
        (item) => item.registration.status === "rejected",
      ).length,
    },
  ];
  return (
    <div className="grid gap-7">
      <div>
        <p className="text-heritage-maroon text-xs font-bold tracking-[0.14em] uppercase">
          Review operations
        </p>
        <h1 className="text-global-navy mt-3 text-3xl font-bold sm:text-4xl">
          Admin dashboard
        </h1>
        <p className="text-slate mt-3 max-w-2xl leading-7">
          Review organisation applications and manage clear registration status
          transitions.
        </p>
      </div>
      <section
        aria-label="Registration summary"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {counts.map((item, index) => (
          <article
            key={item.label}
            className={`rounded-card border p-5 ${index === 0 ? "border-global-navy bg-global-navy shadow-card text-white" : "border-global-navy/12 bg-white"}`}
          >
            <p
              className={`text-sm ${index === 0 ? "text-white/65" : "text-slate"}`}
            >
              {item.label}
            </p>
            <p
              className={`mt-2 text-3xl font-bold ${index === 0 ? "text-white" : "text-global-navy"}`}
            >
              {item.value}
            </p>
            {index === 0 ? (
              <p className="mt-2 text-xs text-white/60">
                Requires review attention
              </p>
            ) : null}
          </article>
        ))}
      </section>
      <section aria-labelledby="recent-applications-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2
              id="recent-applications-title"
              className="text-global-navy text-2xl font-bold"
            >
              Recent applications
            </h2>
            <p className="text-slate mt-1 text-sm">
              Most recently updated applications.
            </p>
          </div>
          <Link
            href="/admin/registrations"
            className="text-global-navy focus-visible:ring-focus text-sm font-semibold underline underline-offset-4"
          >
            View full queue
          </Link>
        </div>
        <ApplicationQueueTable
          applications={[...applications]
            .sort((a, b) =>
              b.registration.updatedAt.localeCompare(a.registration.updatedAt),
            )
            .slice(0, 5)}
        />
      </section>
    </div>
  );
}
