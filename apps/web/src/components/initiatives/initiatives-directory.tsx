import { Container, LinkButton, Section } from "@tamil-ulagam/ui";

import { InitiativeStatusBadge } from "@/components/initiative-status-badge";
import { initiatives } from "@/content/initiatives";
import {
  initiativeOverviewContent,
  initiativeOverviewDetails,
} from "@/content/initiatives-overview";

export function InitiativesDirectory() {
  const { directory } = initiativeOverviewContent;

  return (
    <Section tone="ivory" aria-labelledby="initiatives-directory-title">
      <Container size="wide">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-heritage-maroon text-sm font-semibold tracking-[0.14em] uppercase">
              {directory.eyebrow}
            </p>
            <h2
              id="initiatives-directory-title"
              className="text-global-navy mt-4 text-4xl leading-[1.06] font-semibold tracking-[-0.04em] text-balance sm:text-5xl"
            >
              {directory.title}
            </h2>
          </div>
          <p className="text-slate max-w-xl leading-7">
            {directory.description}
          </p>
        </div>
        <ul
          data-testid="initiatives-directory"
          className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          {initiatives.map((initiative, index) => {
            const detail = initiativeOverviewDetails[initiative.slug];

            return (
              <li key={initiative.slug}>
                <article className="border-global-navy/12 group hover:shadow-card flex h-full flex-col border bg-white p-6 transition-shadow">
                  <span className="text-heritage-gold text-sm font-semibold tracking-[0.12em]">
                    0{index + 1}
                  </span>
                  <InitiativeStatusBadge status={initiative.status} />
                  <h3 className="text-global-navy mt-5 text-xl font-semibold tracking-[-0.025em]">
                    {initiative.title}
                  </h3>
                  <p className="text-slate mt-3 flex-1 text-sm leading-6">
                    {detail.purpose}
                  </p>
                  <LinkButton
                    href={initiative.href}
                    variant="text"
                    className="mt-6 self-start text-sm"
                  >
                    Explore the vision
                    <span
                      aria-hidden="true"
                      className="ml-2 transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </LinkButton>
                </article>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
