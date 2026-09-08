import { Container } from "@tamil-ulagam/ui";

/**
 * The numbers, split by what kind of claim each one is.
 *
 * The top row is the Tamil world as it already stands — facts about the
 * diaspora, not about this federation, and stated flatly because they are
 * true today. The lower row is what Tamil Ulagam is aiming at, and is
 * labelled a target for the same reason: a reader can tell which is which,
 * and neither is dressed up as the other.
 *
 * Figures come from the source presentation. Deliberately no years — the
 * public site does not date itself.
 */
const worldFigures = [
  { value: "80M+", label: "Tamil speakers", detail: "across the world" },
  { value: "100+", label: "Countries", detail: "with Tamil communities" },
  { value: "2,000+", label: "Years", detail: "of continuous heritage" },
  { value: "2nd", label: "Largest", detail: "linguistic diaspora on earth" },
] as const;

const targetFigures = [
  { value: "1 Crore", label: "Members" },
  { value: "50+", label: "Global chapters" },
  { value: "6", label: "Continents" },
  { value: "30+", label: "Countries with care" },
] as const;

export function ImpactFigures() {
  return (
    <section
      aria-labelledby="impact-figures-title"
      className="impact-band relative isolate overflow-hidden py-16 sm:py-20"
    >
      <span aria-hidden="true" className="impact-band-glow" />
      <Container size="wide">
        <div data-motion-reveal="" className="max-w-3xl">
          <p className="text-heritage-gold/85 text-eyebrow">THE TAMIL WORLD</p>
          <h2
            id="impact-figures-title"
            className="mt-3 text-4xl leading-tight font-semibold tracking-[-0.025em] text-balance text-white sm:text-5xl"
          >
            Eighty million people, one language, no single home.
          </h2>
        </div>

        <ul
          data-motion-group="stagger"
          className="mt-10 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-4"
        >
          {worldFigures.map((figure) => (
            <li key={figure.label} className="figure-item">
              <p className="text-gradient-gold text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">
                {figure.value}
              </p>
              <p className="mt-3 text-base font-bold text-white">
                {figure.label}
              </p>
              <p className="mt-1 text-sm leading-6 text-white/60">
                {figure.detail}
              </p>
            </li>
          ))}
        </ul>

        <div className="border-hairline mt-12 border-t pt-9">
          <p className="text-heritage-gold/75 text-eyebrow-sm">
            WHAT WE ARE BUILDING TOWARDS
          </p>
          <ul
            data-motion-group="stagger"
            className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {targetFigures.map((figure) => (
              <li key={figure.label} className="flex items-baseline gap-3">
                <span className="text-champagne text-2xl font-semibold tracking-[-0.02em]">
                  {figure.value}
                </span>
                <span className="text-sm leading-6 text-white/65">
                  {figure.label}
                  <span className="sr-only"> — target</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
