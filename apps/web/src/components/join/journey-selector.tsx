import type { JoinJourney } from "@/content/join";

import { JourneyCard } from "./journey-card";

/** A personalized title/cta/href swap for one journey card — see
 * join-experience.tsx's overrideFor(). `href` is optional: a "Continue
 * your registration" override reuses the journey's own href (the
 * wizard itself resolves to the in-progress draft), while "Open
 * workspace" needs a specific organisation id and always supplies one. */
export interface JourneyOverride {
  readonly title: string;
  readonly cta: string;
  readonly href?: `/${string}`;
}

/**
 * The four-journey grid below the hero. Two columns from tablet up (a
 * 2×2 grid reads as one deliberate set of four, not a scrolling list);
 * a single column on mobile. `data-motion-group` gives the set the
 * existing contextual-stagger reveal MotionRuntime already applies
 * everywhere else, rather than a bespoke animation just for this grid.
 */
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
