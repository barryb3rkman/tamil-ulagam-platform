import { Container, Section } from "@tamil-ulagam/ui";
import Link from "next/link";

import { InitiativeStatusBadge } from "@/components/initiative-status-badge";
import {
  getOverviewInitiatives,
  initiativeOverviewContent,
} from "@/content/initiatives-overview";

export function EcosystemGroups() {
  return (
    <Section
      id="ecosystem"
      tone="ivory"
      aria-labelledby="ecosystem-groups-title"
      className="scroll-mt-24"
    >
      <Container size="wide">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-heritage-maroon text-sm font-semibold tracking-[0.14em] uppercase">
              ECOSYSTEM GROUPS
            </p>
            <h2
              id="ecosystem-groups-title"
              className="text-global-navy mt-4 text-4xl leading-[1.06] font-semibold tracking-[-0.04em] text-balance sm:text-5xl"
            >
              Three connected pathways.
            </h2>
          </div>
          <p className="text-slate max-w-xl leading-7">
            Each pathway is distinct in purpose, while designed to grow from a
            shared and responsible platform foundation.
          </p>
        </div>
        <ol className="border-global-navy/12 mt-12 grid border-y lg:grid-cols-3 lg:divide-x">
          {initiativeOverviewContent.groups.map((group) => {
            const groupInitiatives = getOverviewInitiatives(
              group.initiativeSlugs,
            );

            return (
              <li
                key={group.id}
                className="border-global-navy/12 p-7 sm:p-9 lg:border-b-0"
              >
                <span className="text-heritage-gold text-3xl font-semibold">
                  {group.number}
                </span>
                <h3 className="text-global-navy mt-7 text-2xl font-semibold tracking-[-0.03em]">
                  {group.title}
                </h3>
                <p className="text-slate mt-4 leading-7">{group.description}</p>
                <ul className="border-global-navy/12 mt-7 divide-y border-y">
                  {groupInitiatives.map((initiative) => (
                    <li key={initiative.slug}>
                      <Link
                        href={initiative.href}
                        className="focus-visible:ring-focus group flex items-center justify-between gap-4 py-4 focus-visible:outline-none"
                      >
                        <span className="text-global-navy group-hover:text-heritage-maroon font-semibold transition-colors">
                          {initiative.title}
                        </span>
                        <InitiativeStatusBadge status={initiative.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </Container>
    </Section>
  );
}
