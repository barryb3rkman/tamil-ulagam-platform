import Link from "next/link";

import type { JoinJourney } from "@/content/join";

import type { JourneyOverride } from "./journey-selector";
import {
  MemberMark,
  OrganisationMark,
  PartnerMark,
  SangamMark,
} from "./journey-icons";

const journeyIcon: Record<JoinJourney["id"], typeof OrganisationMark> = {
  organisation: OrganisationMark,
  sangam: SangamMark,
  member: MemberMark,
  partner: PartnerMark,
};

export function JourneyCard({
  journey,
  override,
}: {
  readonly journey: JoinJourney;
  readonly override?: JourneyOverride;
}) {
  const Icon = journeyIcon[journey.id];
  const title = override?.title ?? journey.title;
  const cta = override?.cta ?? journey.cta;
  const href = override?.href ?? journey.href;

  return (
    <Link
      href={href}
      className="group focus-visible:ring-focus rounded-card border-hairline/[0.09] motion-lift hover:border-heritage-gold/45 bg-raised relative block h-full overflow-hidden border p-6 hover:shadow-[0_1.25rem_3rem_rgba(6,29,50,0.12)] focus-visible:outline-none"
    >
      <span
        aria-hidden="true"
        className="gradient-gold-leaf ease-premium absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
      />
      <span
        aria-hidden="true"
        className="border-hairline/10 text-fg/70 group-hover:border-heritage-gold/45 group-hover:bg-heritage-gold/10 group-hover:text-fg-accent bg-raised grid size-12 place-items-center rounded-2xl border transition-colors duration-300"
      >
        <Icon className="size-6" />
      </span>
      <p className="text-fg-muted text-eyebrow-sm mt-5">{journey.eyebrow}</p>
      <h3 className="text-fg mt-2 text-xl font-bold tracking-[-0.01em]">
        {title}
      </h3>
      <p className="text-fg-muted mt-2 text-sm leading-6">
        {journey.description}
      </p>
      <span className="text-fg group-hover:text-fg-accent mt-5 inline-flex items-center gap-2 text-sm font-bold transition-colors duration-300">
        {cta}
        <span
          aria-hidden="true"
          className="inline-block transition-transform duration-300 group-hover:translate-x-1"
        >
          &rarr;
        </span>
      </span>
    </Link>
  );
}
