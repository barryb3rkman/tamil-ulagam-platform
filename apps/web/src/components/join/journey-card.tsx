import { Surface } from "@tamil-ulagam/ui";
import Link from "next/link";

import type { JoinJourney } from "@/content/join";

import {
  MemberMark,
  OrganisationMark,
  PartnerMark,
  SangamMark,
} from "./journey-icons";

const journeyAccent: Record<
  JoinJourney["id"],
  {
    readonly icon: typeof OrganisationMark;
    readonly wash: string;
    readonly ring: string;
  }
> = {
  organisation: {
    icon: OrganisationMark,
    wash: "bg-heritage-gold/12 text-heritage-gold",
    ring: "group-hover:border-heritage-gold/45 group-focus-visible:border-heritage-gold/45",
  },
  sangam: {
    icon: SangamMark,
    wash: "bg-teal-depth/12 text-teal-depth",
    ring: "group-hover:border-teal-depth/40 group-focus-visible:border-teal-depth/40",
  },
  member: {
    icon: MemberMark,
    wash: "bg-indigo-depth/12 text-indigo-depth",
    ring: "group-hover:border-indigo-depth/40 group-focus-visible:border-indigo-depth/40",
  },
  partner: {
    icon: PartnerMark,
    wash: "bg-crimson-ember/12 text-crimson-ember",
    ring: "group-hover:border-crimson-ember/40 group-focus-visible:border-crimson-ember/40",
  },
};

export function JourneyCard({
  journey,
  resuming,
}: {
  readonly journey: JoinJourney;
  /** True when the visitor has an in-progress record this journey can
   * resume — swaps the title/CTA copy to reflect it, per the
   * auth-aware "surface a contextual resume action" requirement. No
   * new backend state: this is driven entirely by the platform state
   * the caller already has. */
  readonly resuming?: boolean;
}) {
  const accent = journeyAccent[journey.id];
  const Icon = accent.icon;
  const title = (resuming && journey.resumeTitle) || journey.title;
  const cta = (resuming && journey.resumeCta) || journey.cta;

  return (
    <Link
      href={journey.href}
      className="group focus-visible:ring-focus rounded-card block focus-visible:outline-none"
    >
      <Surface
        level="card"
        density="comfortable"
        className={`motion-card h-full ${accent.ring}`}
      >
        <span
          aria-hidden="true"
          className={`grid size-12 place-items-center rounded-full ${accent.wash}`}
        >
          <Icon className="size-6" />
        </span>
        <p className="text-heritage-maroon mt-5 text-xs font-bold tracking-[0.14em] uppercase">
          {journey.eyebrow}
        </p>
        <h3 className="text-global-navy mt-2 text-xl font-bold tracking-[-0.01em]">
          {title}
        </h3>
        <p className="text-slate mt-2 text-sm leading-6">
          {journey.description}
        </p>
        <span className="text-global-navy group-hover:text-heritage-maroon mt-5 inline-flex items-center gap-2 text-sm font-semibold">
          {cta}
          <span aria-hidden="true" className="motion-arrow inline-block">
            →
          </span>
        </span>
      </Surface>
    </Link>
  );
}
