import type { JoinJourney } from "@/content/join";

import { JourneyCard } from "./journey-card";

/**
 * The four-journey grid below the hero. Two columns from tablet up (a
 * 2×2 grid reads as one deliberate set of four, not a scrolling list);
 * a single column on mobile. `data-motion-group` gives the set the
 * existing contextual-stagger reveal MotionRuntime already applies
 * everywhere else, rather than a bespoke animation just for this grid.
 */
export function JourneySelector({
  journeys,
  resumingJourneyId,
}: {
  readonly journeys: readonly JoinJourney[];
  readonly resumingJourneyId?: JoinJourney["id"];
}) {
  return (
    <ul
      data-motion-group
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6"
    >
      {journeys.map((journey) => (
        <li key={journey.id}>
          <JourneyCard
            journey={journey}
            resuming={journey.id === resumingJourneyId}
          />
        </li>
      ))}
    </ul>
  );
}
