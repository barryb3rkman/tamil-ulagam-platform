import { Container } from "@tamil-ulagam/ui";

import { homepageContent } from "@/content/homepage";

export function VisionSignalStrip() {
  return (
    <section
      aria-label="Tamil Ulagam vision signals"
      className="border-global-navy/10 border-y bg-white"
    >
      <Container>
        <ul className="divide-global-navy/10 grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {homepageContent.visionSignals.map((signal, index) => (
            <li
              key={signal}
              className="flex items-center gap-4 px-0 py-5 sm:px-6 first:sm:pl-0 last:sm:pr-0 lg:py-7"
            >
              <span
                aria-hidden="true"
                className="text-heritage-gold text-xs font-semibold"
              >
                0{index + 1}
              </span>
              <span className="text-global-navy text-sm font-semibold tracking-[0.04em] uppercase">
                {signal}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
