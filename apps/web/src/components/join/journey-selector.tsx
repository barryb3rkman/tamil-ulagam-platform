import type { JoinJourney } from "@/content/join";

import { JourneyCard } from "./journey-card";

export interface JourneyOverride {
  readonly title: string;
  readonly cta: string;
  readonly href?: `/${string}`;
}

export function JourneySelector({
  journeys,
  overrides,
}: {
  readonly journeys: readonly JoinJourney[];
  readonly overrides?: Partial<
    Record<JoinJourney["id"], JourneyOverride | undefined>
  >;
}) {
  return (
    <ul
      data-motion-group
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6"
    >
      {journeys.map((journey) => (
        <li key={journey.id}>
          <JourneyCard journey={journey} override={overrides?.[journey.id]} />
        </li>
      ))}
    </ul>
  );
}
