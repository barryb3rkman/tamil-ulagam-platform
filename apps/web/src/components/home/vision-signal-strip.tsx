import { Container } from "@tamil-ulagam/ui";

import { homepageContent } from "@/content/homepage";

export function VisionSignalStrip() {
  return (
    <section
      aria-label="Tamil Ulagam vision signals"
      className="border-global-navy/10 border-y bg-white"
    >
      <Container>
        <ul className="divide-global-navy/10 grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3 xl:grid-cols-6">
          {homepageContent.visionSignals.map((signal, index) => (
            <li
              key={signal}
              className="flex items-center gap-4 px-0 py-6 sm:px-7 first:sm:pl-0 last:sm:pr-0 lg:py-7"
            >
              <span
                aria-hidden="true"
                className="bg-heritage-maroon/35 h-6 w-0.5 shrink-0"
              />
              <span
                aria-hidden="true"
                className="text-heritage-gold text-sm font-semibold"
              >
                0{index + 1}
              </span>
              <span className="text-global-navy text-[0.78rem] font-semibold tracking-[0.07em] uppercase sm:text-sm">
                {signal}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
