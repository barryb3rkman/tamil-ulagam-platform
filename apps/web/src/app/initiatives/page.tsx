import { Container, LinkButton, Section } from "@tamil-ulagam/ui";
import type { Metadata } from "next";

import { InitiativeStatusBadge } from "@/components/initiative-status-badge";
import { PageHero } from "@/components/page-hero";
import { createPageMetadata } from "@/config/metadata";
import { initiatives } from "@/content/initiatives";

const description =
  "Explore the service areas Tamil Ulagam intends to develop incrementally with appropriate governance, expertise, and partnerships.";

export const metadata: Metadata = createPageMetadata(
  "Initiatives",
  description,
  "/initiatives",
);

export default function InitiativesPage() {
  return (
    <>
      <PageHero
        eyebrow="Future service ecosystem"
        title="Initiatives being planned for responsible growth"
        description={description}
      />
      <Section tone="white">
        <Container>
          <ul className="grid gap-5 md:grid-cols-2">
            {initiatives.map((initiative) => (
              <li
                key={initiative.slug}
                className="rounded-card border-global-navy/12 bg-warm-ivory flex flex-col border p-7"
              >
                <InitiativeStatusBadge status={initiative.status} />
                <h2 className="text-global-navy mt-5 text-2xl font-semibold">
                  {initiative.title}
                </h2>
                <p className="text-slate mt-3 flex-1 leading-7">
                  {initiative.shortDescription}
                </p>
                <LinkButton
                  className="mt-6 self-start"
                  href={initiative.href}
                  variant="text"
                >
                  Read the planned scope
                </LinkButton>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
