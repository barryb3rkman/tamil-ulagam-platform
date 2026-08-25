"use client";

import { EmptyState, Skeleton } from "@tamil-ulagam/ui";
import type { EligibleOrganisation, Membership } from "@tamil-ulagam/shared";
import { useMemo, useState } from "react";

import { memberDirectoryContent } from "@/content/member";

import { OrganisationDiscoveryCard } from "./organisation-discovery-card";

/**
 * Search-first discovery. The eligible-organisation directory is fetched
 * once (see member-registration.tsx) and filtered entirely client-side
 * here — a reasonable choice while the verified-organisation count stays
 * in the tens/low hundreds (a handful of network round trips' worth of
 * JSON). If that count grows into the thousands, move filtering to a
 * server-side RPC (e.g. a `search_membership_eligible_organizations`
 * function with `ilike`/trigram indexes) rather than shipping the whole
 * directory to the browser — but building that now, for a directory this
 * size, would be premature.
 */
export function MemberDirectory({
  organisations,
  myMembershipsByOrganisation,
  onSelect,
}: {
  readonly organisations: readonly EligibleOrganisation[];
  readonly myMembershipsByOrganisation: ReadonlyMap<string, Membership>;
  readonly onSelect: (organisation: EligibleOrganisation) => void;
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return organisations;
    return organisations.filter((organisation) =>
      [
        organisation.name,
        organisation.city,
        organisation.region,
        organisation.country,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [organisations, query]);

  return (
    <div data-motion-reveal="">
      <h2 className="text-global-navy text-2xl font-bold tracking-[-0.01em]">
        {memberDirectoryContent.title}
      </h2>
      <p className="text-slate mt-2 max-w-xl">
        {memberDirectoryContent.description}
      </p>

      <div className="mt-6">
        <label htmlFor="member-directory-search" className="sr-only">
          {memberDirectoryContent.searchLabel}
        </label>
        <div className="border-global-navy/15 focus-within:ring-focus rounded-button flex items-center gap-3 border bg-white px-4 py-3">
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
          <input
            id="member-directory-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={memberDirectoryContent.searchPlaceholder}
            className="text-charcoal placeholder:text-slate min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
          />
        </div>
        <p className="text-slate mt-2 text-sm" aria-live="polite">
          {results.length === organisations.length
            ? `${results.length} verified organisation${results.length === 1 ? "" : "s"}`
            : `${results.length} of ${organisations.length} organisations match "${query}"`}
        </p>
      </div>

      <div className="mt-6">
        {organisations.length === 0 ? (
          <EmptyState
            title="No verified organisations yet"
            description="No Organisation or Tamil Sangam has completed verification yet. Check back soon."
          />
        ) : results.length === 0 ? (
          <EmptyState
            title="No matches"
            description="Try a different name, city, region or country."
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
