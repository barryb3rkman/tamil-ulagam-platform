import type { InitiativeEntry } from "@tamil-ulagam/shared";

import {
  getInitiativeDetailIdentity,
  getInitiativeEcosystemGroup,
  getInitiativeImageKey,
  type InitiativeDetail,
} from "@/content/initiative-details";
import { initiatives, type InitiativeSlug } from "@/content/initiatives";

import { InitiativeHero } from "./initiative-hero";
import {
  InitiativeAudienceSection,
  InitiativeCapabilitiesSection,
  InitiativeDevelopmentPath,
  InitiativeFinalCta,
  InitiativeParticipationSection,
  InitiativePreviousNext,
  InitiativePurposeSection,
  InitiativeReadinessSection,
  RelatedInitiatives,
} from "./initiative-detail-sections";

export interface InitiativeDetailPageProps {
  readonly detail: InitiativeDetail;
}

function getSequenceEntry(index: number): InitiativeEntry | undefined {
  return initiatives[index];
}

export function InitiativeDetailPage({ detail }: InitiativeDetailPageProps) {
  const initiative = getInitiativeDetailIdentity(detail.slug);
  const group = getInitiativeEcosystemGroup(detail.slug);
  const currentIndex = initiatives.findIndex(
    (entry) => entry.slug === detail.slug,
  );
  const previous = getSequenceEntry(currentIndex - 1);
  const next = getSequenceEntry(currentIndex + 1);
  const related = detail.related.map((entry) => ({
    ...entry,
    initiative: getInitiativeDetailIdentity(entry.slug),
  })) as readonly {
    readonly relationship: string;
    readonly slug: InitiativeSlug;
    readonly initiative: InitiativeEntry;
  }[];

  return (
    <>
      <InitiativeHero
        detail={detail}
        groupTitle={group.title}
        imageKey={getInitiativeImageKey(detail.slug)}
        initiative={initiative}
      />
      <InitiativePurposeSection detail={detail} initiative={initiative} />
      <InitiativeCapabilitiesSection detail={detail} layout={detail.layout} />
      <InitiativeAudienceSection detail={detail} />
      <InitiativeReadinessSection
        detail={detail}
        initiative={initiative}
        layout={detail.layout}
      />
      <InitiativeDevelopmentPath detail={detail} />
      <InitiativeParticipationSection detail={detail} layout={detail.layout} />
      <RelatedInitiatives related={related} />
      <InitiativePreviousNext
        previous={
          previous ? { href: previous.href, title: previous.title } : undefined
        }
        next={next ? { href: next.href, title: next.title } : undefined}
      />
      <InitiativeFinalCta initiative={initiative} />
    </>
  );
}
