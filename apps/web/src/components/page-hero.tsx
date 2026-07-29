import type { InitiativeStatus } from "@tamil-ulagam/shared";
import { Container } from "@tamil-ulagam/ui";

import { InitiativeStatusBadge } from "./initiative-status-badge";

export interface PageHeroProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly status?: InitiativeStatus;
}

export function PageHero({
  description,
  eyebrow,
  status,
  title,
}: PageHeroProps) {
  return (
    <section className="border-global-navy/10 bg-warm-ivory py-section relative overflow-hidden border-b">
      <div
        aria-hidden="true"
        className="border-heritage-gold/18 absolute top-0 right-0 h-full w-1/3 border-l bg-[radial-gradient(circle_at_top_right,rgba(214,168,75,0.13),transparent_62%)]"
      />
      <Container className="relative">
        <div className="max-w-4xl">
          <p className="text-heritage-maroon text-sm font-semibold tracking-[0.16em] uppercase">
            {eyebrow}
          </p>
          {status ? (
            <div className="mt-5">
              <InitiativeStatusBadge status={status} />
            </div>
          ) : null}
          <h1 className="font-english text-global-navy mt-5 text-4xl leading-[1.08] font-semibold tracking-[-0.035em] text-balance sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="text-slate mt-6 max-w-3xl text-lg leading-8 sm:text-xl sm:leading-9">
            {description}
          </p>
        </div>
      </Container>
    </section>
  );
}
