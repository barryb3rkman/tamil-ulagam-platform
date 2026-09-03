"use client";

import type {
  AdminManagerSummary,
  AdminOrganisationSummary,
  RegistrationStatus,
} from "@tamil-ulagam/shared";
import { DataTable, StatusBadge } from "@tamil-ulagam/ui";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { SelectField, TextField } from "@/components/application/form-fields";
import { useAdminOperations } from "@/features/admin/admin-operations-provider";
import {
  categoryLabels,
  formatOperationalDate,
  registrationStatusPresentation,
} from "@/features/admin/admin-presentation";
import { getPlatformErrorMessage } from "@/lib/supabase/errors";

import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminPageHeader,
} from "./admin-primitives";

export function AdminDirectory({
  kind,
}: {
  readonly kind: "organisation" | "sangam";
}) {
  const { capabilities, service } = useAdminOperations();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("organization");
  const [entries, setEntries] = useState<AdminOrganisationSummary[]>([]);
  const [managerState, setManagerState] = useState<{
    readonly organisationId: string;
    readonly items: readonly AdminManagerSummary[];
  }>({ organisationId: "", items: [] });
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("all");
  const [status, setStatus] = useState<RegistrationStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!service || !capabilities.canOperateFederation) return;
    let cancelled = false;
    service
      .listOrganisations()
      .then((items) => {
        if (cancelled) return;
        setEntries(items.filter((item) => item.kind === kind));
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
  }, [capabilities.canOperateFederation, kind, service]);

  const selected = entries.find((item) => item.id === selectedId) ?? null;
  useEffect(() => {
    if (!service || !selected) return;
    let cancelled = false;
    service
      .listOrganisationManagers(selected.id)
      .then((items) => {
        if (!cancelled) setManagerState({ organisationId: selected.id, items });
      })
      .catch(() => {
        if (!cancelled)
          setManagerState({ organisationId: selected.id, items: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [selected, service]);

  const countries = useMemo(
    () =>
      [...new Set(entries.map((item) => item.country).filter(Boolean))].sort(),
    [entries],
  );
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return entries.filter(
      (item) =>
        (!query || item.name.toLowerCase().includes(query)) &&
        (country === "all" || item.country === country) &&
        (status === "all" || item.applicationStatus === status),
    );
  }, [country, entries, search, status]);
  const managers =
    selected && managerState.organisationId === selected.id
      ? managerState.items
      : [];

  if (!capabilities.canOperateFederation)
    return (
      <AdminErrorState message="Federation administrator access is required for operational directories." />
    );

  const plural = kind === "sangam" ? "Tamil Sangams" : "Organisations";
  return (
    <div className="grid gap-7">
      <AdminPageHeader
        eyebrow="Federation directory"
        title={plural}
        description={
          kind === "sangam"
            ? "Inspect Tamil Sangams classified through the verified Tamil community subtype, never by name inference."
            : "Inspect Organisation standing, verification and operational relationships without exposing a public member directory."
        }
      />
      {error ? <AdminErrorState message={error} /> : null}
      {selected ? (
        <OperationalEntityDetail
          entry={selected}
          managers={managers}
          closeHref={
            kind === "sangam" ? "/admin/sangams" : "/admin/organisations"
          }
        />
      ) : null}
      <section
        aria-label={`${plural} filters`}
        className="border-global-navy/12 rounded-card grid gap-4 border bg-white p-5 sm:grid-cols-3"
      >
        <TextField
          label={`Search ${kind === "sangam" ? "Tamil Sangam" : "Organisation"}`}
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <SelectField
          label="Country"
          value={country}
          options={[
            { value: "all", label: "All countries" },
            ...countries.map((item) => ({ value: item, label: item })),
          ]}
          onChange={(event) => setCountry(event.target.value)}
        />
        <SelectField
          label="Review state"
          value={status}
          options={[
            { value: "all", label: "All states" },
            { value: "submitted", label: "Submitted" },
            { value: "under_review", label: "Under review" },
            { value: "needs_changes", label: "Changes requested" },
            { value: "verified", label: "Verified" },
            { value: "rejected", label: "Rejected" },
            { value: "suspended", label: "Suspended" },
          ]}
          onChange={(event) =>
            setStatus(event.target.value as RegistrationStatus | "all")
          }
        />
      </section>
      <p className="text-slate text-sm" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "record" : "records"}
      </p>
      {loading ? (
        <AdminLoadingState label={`Loading ${plural}`} />
      ) : filtered.length ? (
        <DataTable
          caption={`${plural} operational directory`}
          rows={filtered}
          rowKey={(row) => row.id}
          columns={[
            {
              key: "identity",
              header: kind === "sangam" ? "Tamil Sangam" : "Organisation",
              render: (row) => (
                <div>
                  <p className="text-global-navy font-bold break-words">
                    {row.name}
                  </p>
                  <p className="text-slate mt-1 text-sm">
                    {row.category
                      ? categoryLabels[row.category]
                      : "Category pending"}
                  </p>
                </div>
              ),
            },
            {
              key: "location",
              header: "Location",
              render: (row) => (
                <span className="text-charcoal text-sm">
                  {[row.city, row.region, row.country]
                    .filter(Boolean)
                    .join(", ") || "Not recorded"}
                </span>
              ),
            },
            {
              key: "standing",
              header: "Standing",
              render: (row) => (
                <div className="grid gap-2">
                  <StatusBadge
                    {...registrationStatusPresentation[row.applicationStatus]}
                  />
                  <span className="text-slate text-xs">
                    {row.registrationStatus === "registered"
                      ? "Formally registered"
                      : "Informal / unregistered"}
                  </span>
                </div>
              ),
            },
            {
              key: "relationships",
              header: "Relationships",
              render: (row) => (
                <span className="text-charcoal text-sm">
                  {row.managerCount} manager{row.managerCount === 1 ? "" : "s"}{" "}
                  · {row.memberCount} approved member
                  {row.memberCount === 1 ? "" : "s"}
                </span>
              ),
            },
            {
              key: "action",
              header: "Action",
              render: (row) => (
                <Link
                  href={`${kind === "sangam" ? "/admin/sangams" : "/admin/organisations"}?organization=${encodeURIComponent(row.id)}`}
                  className="focus-visible:ring-focus text-global-navy decoration-heritage-gold inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
                >
                  Inspect
                </Link>
              ),
            },
          ]}
        />
      ) : (
        <AdminEmptyState
          title={`No ${plural.toLowerCase()} match these filters`}
          description="Adjust the search or filters. New verified records will appear here when their lifecycle permits Federation visibility."
        />
      )}
    </div>
  );
}

function OperationalEntityDetail({
  entry,
  managers,
  closeHref,
}: {
  readonly entry: AdminOrganisationSummary;
  readonly managers: readonly AdminManagerSummary[];
  readonly closeHref: string;
}) {
  return (
    <section
      aria-labelledby="entity-detail-title"
      className="border-heritage-gold/50 rounded-large shadow-card border bg-white p-5 sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-slate text-[0.64rem] font-bold tracking-[0.16em] uppercase">
            Operational detail
          </p>
          <h2
            id="entity-detail-title"
            className="text-global-navy mt-2 text-2xl font-bold"
          >
            {entry.name}
          </h2>
        </div>
        <Link
          href={closeHref}
          className="focus-visible:ring-focus text-global-navy inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
        >
          Close detail
        </Link>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <DetailBlock
          title="Identity & verification"
          items={[
            ["Type", entry.kind === "sangam" ? "Tamil Sangam" : "Organisation"],
            [
              "Category",
              entry.category ? categoryLabels[entry.category] : "Pending",
            ],
            [
              "Review state",
              registrationStatusPresentation[entry.applicationStatus].label,
            ],
            [
              "Official email",
              entry.officialEmailVerifiedAt
                ? `Verified ${formatOperationalDate(entry.officialEmailVerifiedAt)}`
                : "Not verified",
            ],
          ]}
        />
        <DetailBlock
          title="Membership (affiliation)"
          items={[
            ["Approved members", String(entry.memberCount)],
            ["Meaning", "Community affiliation only"],
          ]}
        />
        <DetailBlock
          title="Management (authority)"
          items={
            managers.length
              ? managers.map(
                  (manager) =>
                    [
                      manager.role.replace(/^./, (value) =>
                        value.toUpperCase(),
                      ),
                      manager.fullName,
                    ] as const,
                )
              : [["Managers", "No manager details available"]]
          }
        />
      </div>
      {entry.kind === "sangam" ? (
        <div className="border-global-navy/10 mt-5 border-t pt-5 text-sm">
          <p className="text-global-navy font-semibold">
            Sangam network context
          </p>
          <p className="text-slate mt-1 leading-6">
            {entry.networkAffiliated === null
              ? "Network affiliation not recorded."
              : entry.networkAffiliated
                ? `Affiliated${entry.networkName ? ` — ${entry.networkName}` : ""}`
                : "No network affiliation recorded."}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function DetailBlock({
  title,
  items,
}: {
  readonly title: string;
  readonly items: readonly (readonly [string, string])[];
}) {
  return (
    <div className="bg-warm-ivory rounded-card p-5">
      <h3 className="text-global-navy font-bold">{title}</h3>
      <dl className="mt-4 grid gap-3">
        {items.map(([label, value]) => (
          <div key={`${label}-${value}`}>
            <dt className="text-slate text-xs font-bold tracking-[0.08em] uppercase">
              {label}
            </dt>
            <dd className="text-charcoal mt-1 break-words">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
