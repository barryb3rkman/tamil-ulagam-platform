import { Container, Section } from "@tamil-ulagam/ui";

import { PortalCardGrid } from "@/components/portal-card-grid";

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
        <PortalCardGrid
          testId="initiatives-directory"
          linkLabel="Explore the vision"
          cards={initiatives.map((initiative, index) => ({
            title: initiative.title,
            description: initiativeOverviewDetails[initiative.slug].purpose,
            href: initiative.href,
            marker: String(index + 1).padStart(2, "0"),
          }))}
        />
      </Container>
    </Section>
  );
}
