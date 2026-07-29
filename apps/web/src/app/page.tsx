import { Container, LinkButton, Section } from "@tamil-ulagam/ui";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { PageHero } from "@/components/page-hero";
import { createPageMetadata } from "@/config/metadata";
import { primaryCallToAction, siteContent } from "@/content/site";

export const metadata: Metadata = createPageMetadata(
  "Tamil Ulagam Global Federation",
  siteContent.description,
  "/",
);

export default function HomePage() {
  return (
    <>
      <PageHero
        eyebrow="Public website foundation"
        title="Connecting the Tamil world with purpose and trust"
        description={siteContent.purpose}
      />
      <Section tone="white">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="text-heritage-maroon text-sm font-semibold tracking-[0.14em] uppercase">
                Foundation phase
              </p>
              <h2 className="text-global-navy mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
                A permanent platform, introduced responsibly
              </h2>
              <p className="text-slate mt-5 max-w-2xl text-lg leading-8">
                This first release establishes the public information and
                engineering foundation. Membership, Tamil ID, chapters, and
                service initiatives remain planned for later phases.
              </p>
              <LinkButton className="mt-7" href={primaryCallToAction.href}>
                {primaryCallToAction.label}
              </LinkButton>
            </div>
            <EmptyState
              title="Services are not open yet"
              description="No membership applications, payments, partner listings, event registrations, or service applications are currently being accepted."
              action={{
                label: "View planned initiatives",
                href: "/initiatives",
              }}
            />
          </div>
        </Container>
      </Section>
    </>
  );
}
