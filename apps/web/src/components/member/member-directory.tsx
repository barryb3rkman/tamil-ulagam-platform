"use client";

import { EmptyState, Skeleton } from "@tamil-ulagam/ui";
import {
  isTamilSangam,
  type EligibleOrganisation,
  type Membership,
  type OrganisationCategory,
} from "@tamil-ulagam/shared";
import { useMemo, useState } from "react";

import { organisationCategories } from "@/content/enrollment";
import { memberDirectoryContent } from "@/content/member";

import type { AffiliationType } from "./affiliation-type-stage";
import { OrganisationDiscoveryCard } from "./organisation-discovery-card";

export function MemberDirectory({
  kind,
  myMembershipsByOrganisation,
  onBack,
  onSelect,
  organisations,
}: {
  readonly kind: AffiliationType;
  readonly organisations: readonly EligibleOrganisation[];
  readonly myMembershipsByOrganisation: ReadonlyMap<string, Membership>;
  readonly onSelect: (organisation: EligibleOrganisation) => void;
  readonly onBack: () => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<OrganisationCategory | "">("");

  const scoped = useMemo(
    () =>
      organisations.filter((organisation) =>
        kind === "sangam"
          ? isTamilSangam(organisation)
          : !isTamilSangam(organisation),
      ),
    [organisations, kind],
  );

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return scoped.filter((organisation) => {
      if (
        kind === "organisation" &&
        category &&
        organisation.category !== category
      ) {
        return false;
      }
      if (!normalized) return true;
      return [
        organisation.name,
        organisation.city,
        organisation.region,
        organisation.country,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [scoped, query, category, kind]);

  const title =
    kind === "sangam"
      ? memberDirectoryContent.sangamTitle
      : memberDirectoryContent.organisationTitle;
  const description =
    kind === "sangam"
      ? memberDirectoryContent.sangamDescription
      : memberDirectoryContent.organisationDescription;

  return (
    <div data-motion-reveal="">
      <button
        type="button"
        onClick={onBack}
        className="text-global-navy focus-visible:ring-focus rounded-button mb-4 text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none"
      >
        Back
      </button>
      <h2 className="text-global-navy text-2xl font-bold tracking-[-0.01em]">
        {title}
      </h2>
      <p className="text-slate mt-2 max-w-xl">{description}</p>

      <div className="mt-6 grid gap-3 sm:flex sm:items-center">
        <div className="border-global-navy/15 focus-within:ring-focus rounded-button flex flex-1 items-center gap-3 border bg-white px-4 py-3">
          <span aria-hidden="true" className="text-slate">
            <svg
              viewBox="0 0 20 20"
              className="size-4"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="9" cy="9" r="6.5" strokeWidth="1.5" />
              <path
                d="M17.5 17.5 14 14"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <label htmlFor="member-directory-search" className="sr-only">
            {memberDirectoryContent.searchLabel}
          </label>
          <input
            id="member-directory-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={memberDirectoryContent.searchPlaceholder}
            className="text-charcoal placeholder:text-slate min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
          />
        </div>
        {kind === "organisation" ? (
          <div className="sm:w-56">
            <label htmlFor="member-directory-category" className="sr-only">
              {memberDirectoryContent.categoryLabel}
            </label>
            <select
              id="member-directory-category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as OrganisationCategory | "")
              }
              className="motion-control focus-visible:ring-focus border-global-navy/20 bg-warm-ivory/20 text-charcoal hover:border-global-navy/35 rounded-button focus-visible:border-interactive-blue min-h-11 w-full border px-4 py-2 text-sm focus-visible:bg-white focus-visible:outline-none"
            >
              <option value="">{memberDirectoryContent.allCategories}</option>
              {organisationCategories
                .filter((option) => option.value !== "tamil_community")
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </div>
        ) : null}
      </div>
      <p className="text-slate mt-2 text-sm" aria-live="polite">
        {results.length === scoped.length
          ? `${results.length} verified ${kind === "sangam" ? "Sangam" : "organisation"}${results.length === 1 ? "" : "s"}`
          : `${results.length} of ${scoped.length} match`}
      </p>

      <div className="mt-6">
        {scoped.length === 0 ? (
          <EmptyState
            title={memberDirectoryContent.noneVerifiedTitle}
            description={memberDirectoryContent.noneVerifiedDescription}
          />
        ) : results.length === 0 ? (
          <EmptyState
            title={memberDirectoryContent.emptyTitle}
            description={memberDirectoryContent.emptyDescription}
          />
        ) : (
          <ul
            data-motion-group
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {results.map((organisation) => (
              <li key={organisation.id}>
                <OrganisationDiscoveryCard
                  organisation={organisation}
                  existingMembership={myMembershipsByOrganisation.get(
                    organisation.id,
                  )}
                  onSelect={() => onSelect(organisation)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-global-navy/12 mt-8 border-t pt-6">
        <p className="text-global-navy text-sm font-semibold">
          {memberDirectoryContent.cantFindTitle}
        </p>
        <p className="text-slate mt-1 max-w-lg text-sm leading-6">
          {memberDirectoryContent.cantFindDescription}{" "}
          <a
            href={kind === "sangam" ? "/join/sangam" : "/join/organisation"}
            className="text-global-navy focus-visible:ring-focus underline underline-offset-4"
          >
            {kind === "sangam"
              ? "Tamil Sangam registration"
              : "Organisation registration"}
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export function MemberDirectorySkeleton() {
  return (
    <div role="status" aria-label="Loading organisations">
      <Skeleton shape="text" className="h-8 w-64" />
      <Skeleton shape="text" className="mt-3 h-4 w-96" />
      <Skeleton className="mt-6 h-12 w-full" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-48 w-full" />
        ))}
      </div>
    </div>
  );
}
