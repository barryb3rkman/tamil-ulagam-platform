"use client";

import type {
  OrganisationCategory,
  RegistrationStatus,
} from "@tamil-ulagam/shared";
import { isTamilSangamProfile } from "@tamil-ulagam/shared";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const requestedStatus = searchParams.get("status");
  const [status, setStatus] = useState<RegistrationStatus | "all">(
    statusOptions.some((option) => option.value === requestedStatus)
      ? (requestedStatus as RegistrationStatus)
      : "all",
  );
  const [category, setCategory] = useState<OrganisationCategory | "all">("all");
  const [kind, setKind] = useState<"all" | "organisation" | "sangam">("all");
  const [country, setCountry] = useState("all");
  const countries = useMemo(
    () =>
      [
        ...new Set(
          applications.map((item) => item.organisation.country).filter(Boolean),
        ),
      ].sort(),
    [applications],
  );
  const duplicateApplicationIds = useMemo(() => {
    const duplicateIds = new Set<string>();
    for (const application of applications) {
      const name = application.organisation.name.trim().toLowerCase();
      const email = application.organisation.officialEmail.trim().toLowerCase();
      const registrationNumber = application.organisation.registrationNumber
        .trim()
        .toLowerCase();
      const duplicate = applications.some((candidate) => {
        if (candidate.registration.id === application.registration.id)
          return false;
        return (
          (name !== "" &&
            candidate.organisation.name.trim().toLowerCase() === name) ||
          (email !== "" &&
            candidate.organisation.officialEmail.trim().toLowerCase() ===
              email) ||
          (registrationNumber !== "" &&
            candidate.organisation.registrationNumber.trim().toLowerCase() ===
              registrationNumber)
        );
      });
      if (duplicate) duplicateIds.add(application.registration.id);
    }
    return duplicateIds;
  }, [applications]);
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
        const isSangam = isTamilSangamProfile(
          application.registration.categoryProfile,
        );
        const matchesKind =
          kind === "all" || (kind === "sangam" ? isSangam : !isSangam);
        const matchesCountry =
          country === "all" || application.organisation.country === country;
        return (
          matchesSearch &&
          matchesStatus &&
          matchesCategory &&
          matchesKind &&
          matchesCountry
        );
      }),
    [applications, category, country, kind, search, status],
  );
  if (!isHydrated) return <p role="status">Loading registration queue…</p>;
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-heritage-maroon text-eyebrow-sm">
          Application review
        </p>
        <h1 className="text-global-navy mt-3 text-3xl font-bold sm:text-4xl">
          Registration queue
        </h1>
        <p className="text-slate mt-3">
          Search and filter Organisation and Tamil Sangam applications without
          changing the trusted review lifecycle.
        </p>
      </div>
      <section
        aria-label="Application filters"
        className="rounded-card border-global-navy/12 grid gap-4 border bg-white p-5 shadow-sm sm:grid-cols-2 xl:grid-cols-5"
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
        <SelectField
          label="Entity type"
          value={kind}
          options={[
            { value: "all", label: "All types" },
            { value: "organisation", label: "Organisations" },
            { value: "sangam", label: "Tamil Sangams" },
          ]}
          onChange={(event) =>
            setKind(event.target.value as "all" | "organisation" | "sangam")
          }
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
      </section>
      <div className="flex items-center justify-between gap-4">
        <p className="text-slate text-sm" aria-live="polite">
          {filtered.length} application{filtered.length === 1 ? "" : "s"}
        </p>
        {search ||
        status !== "all" ||
        category !== "all" ||
        kind !== "all" ||
        country !== "all" ? (
          <button
            type="button"
            className="text-global-navy focus-visible:ring-focus decoration-heritage-gold min-h-10 text-sm font-semibold underline decoration-2 underline-offset-4"
            onClick={() => {
              setSearch("");
              setStatus("all");
              setCategory("all");
              setKind("all");
              setCountry("all");
            }}
          >
            Clear filters
          </button>
        ) : null}
      </div>
      <ApplicationQueueTable
        applications={filtered}
        duplicateApplicationIds={duplicateApplicationIds}
      />
    </div>
  );
}
