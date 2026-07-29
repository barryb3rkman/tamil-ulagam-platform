import { Container, LinkButton, Section } from "@tamil-ulagam/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { PageHero } from "@/components/page-hero";
import { createPageMetadata } from "@/config/metadata";
import { getInitiative, initiatives } from "@/content/initiatives";

export interface InitiativePageProps {
  readonly params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return initiatives.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: InitiativePageProps): Promise<Metadata> {
  const { slug } = await params;
  const initiative = getInitiative(slug);

  if (!initiative) {
    return createPageMetadata(
      "Initiative not found",
      "The requested Tamil Ulagam initiative page could not be found.",
      "/initiatives",
    );
  }

  return createPageMetadata(
    initiative.title,
    initiative.shortDescription,
    initiative.href as `/initiatives/${string}`,
  );
}

export default async function InitiativePage({ params }: InitiativePageProps) {
  const { slug } = await params;
  const initiative = getInitiative(slug);

  if (!initiative) {
    notFound();
  }

  return (
    <>
      <PageHero
        eyebrow="Tamil Ulagam initiative"
        title={initiative.title}
        description={initiative.shortDescription}
        status={initiative.status}
      />
      <Section tone="white">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <h2 className="text-global-navy text-3xl font-semibold tracking-[-0.02em]">
                Planned direction
              </h2>
              <p className="text-slate mt-5 max-w-2xl text-lg leading-8">
                {initiative.description}
              </p>
              <LinkButton className="mt-7" href="/roadmap" variant="secondary">
                View the platform roadmap
              </LinkButton>
            </div>
            <EmptyState
              title="Not currently available"
              description={`The ${initiative.title.toLowerCase()} initiative is planned. Tamil Ulagam is not currently accepting applications, listings, registrations, or payments for this service.`}
            />
          </div>
        </Container>
      </Section>
    </>
  );
}
