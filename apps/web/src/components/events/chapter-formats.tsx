import { Container, Section } from "@tamil-ulagam/ui";

import { eventsContent } from "@/content/events";

/** Four ways a chapter fills the calendar. Numbered, because the rail that
 *  draws down the left of them is what turns four short lines into a list
 *  worth reading rather than four stranded paragraphs. */
export function ChapterFormats() {
  const { formats } = eventsContent;

  return (
    <Section tone="ivory" aria-labelledby="chapter-formats-title">
      <Container size="wide">
        <div className="grid gap-9 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
          <div data-motion-reveal="">
            <p className="text-fg-accent text-eyebrow">CHAPTER PROGRAMMES</p>
            <h2
              id="chapter-formats-title"
              className="text-gradient-ink mt-3 text-4xl leading-tight font-semibold tracking-[-0.025em] text-balance sm:text-5xl"
            >
              {formats.title}
            </h2>
            <p className="text-fg-muted mt-4 text-lg leading-8">
              {formats.description}
            </p>
          </div>

          <ol data-motion-group="stagger" className="grid gap-0">
            {formats.items.map((item, index) => (
              <li key={item.title} className="format-row">
                <span aria-hidden="true" className="format-row-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-fg text-xl font-semibold">
                    {item.title}
                  </h3>
                  <p className="text-fg-muted mt-1.5 leading-7">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
