"use client";

import type {
  OrganisationCategory,
  RegistrationStatus,
} from "@tamil-ulagam/shared";
import { useMemo, useState } from "react";

import { organisationCategories } from "@/content/enrollment";
import { usePlatform } from "@/features/enrollment/platform-provider";

import { ApplicationQueueTable } from "./application-queue-table";
import { SelectField, TextField } from "./form-fields";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "needs_changes", label: "Changes Requested" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
] as const;

export function AdminRegistrationQueue() {
  const { applications, isHydrated } = usePlatform();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RegistrationStatus | "all">("all");
  const [category, setCategory] = useState<OrganisationCategory | "all">("all");
  const filtered = useMemo(
    () =>
      applications.filter((application) => {
        const matchesSearch = application.organisation.name
          .toLowerCase()
          .includes(search.trim().toLowerCase());
        const matchesStatus =
          status === "all" || application.registration.status === status;
        const matchesCategory =
          category === "all" || application.organisation.category === category;
        return matchesSearch && matchesStatus && matchesCategory;
      }),
    [applications, category, search, status],
  );
  if (!isHydrated) return <p role="status">Loading registration queue…</p>;
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-heritage-maroon text-xs font-bold tracking-[0.14em] uppercase">
          Application review
        </p>
        <h1 className="text-global-navy mt-3 text-3xl font-bold sm:text-4xl">
          Registration queue
        </h1>
        <p className="text-slate mt-3">
          Search and filter organisation applications awaiting review.
        </p>
      </div>
      <section
        aria-label="Application filters"
        className="rounded-card border-global-navy/12 grid gap-4 border bg-white p-5 shadow-sm sm:grid-cols-3"
      >
        <TextField
          label="Search organisation"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <SelectField
          label="Status"
          value={status}
          options={statusOptions}
          onChange={(event) =>
            setStatus(event.target.value as RegistrationStatus | "all")
          }
        />
        <SelectField
          label="Category"
          value={category}
          options={[
            { value: "all", label: "All categories" },
            ...organisationCategories,
          ]}
          onChange={(event) =>
            setCategory(event.target.value as OrganisationCategory | "all")
          }
        />
      </section>
      <div className="flex items-center justify-between gap-4">
        <p className="text-slate text-sm" aria-live="polite">
          {filtered.length} application{filtered.length === 1 ? "" : "s"}
        </p>
        {search || status !== "all" || category !== "all" ? (
          <button
            type="button"
            className="text-global-navy focus-visible:ring-focus decoration-heritage-gold min-h-10 text-sm font-semibold underline decoration-2 underline-offset-4"
            onClick={() => {
              setSearch("");
              setStatus("all");
              setCategory("all");
            }}
          >
            Clear filters
          </button>
        ) : null}
      </div>
      <ApplicationQueueTable applications={filtered} />
    </div>
  );
}
