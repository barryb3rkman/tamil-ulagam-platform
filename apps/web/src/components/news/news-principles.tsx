import { Container, Section } from "@tamil-ulagam/ui";

import { newsContent } from "@/content/news";

/** The four rules, as a plain list. A newsroom that explains its standards
 *  at length is not demonstrating them. */
export function NewsPrinciples() {
  const { principles } = newsContent;

  return (
    <Section tone="ivory" aria-labelledby="news-principles-title">
      <Container size="wide">
        <div className="grid gap-9 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
          <div data-motion-reveal="">
            <p className="text-fg-accent text-eyebrow">EDITORIAL STANDARDS</p>
            <h2
              id="news-principles-title"
              className="text-gradient-ink mt-3 text-4xl leading-tight font-semibold tracking-[-0.025em] text-balance sm:text-5xl"
            >
              {principles.title}
            </h2>
            <p className="text-fg-muted mt-4 text-lg leading-8">
              {principles.description}
            </p>
          </div>

          <ol data-motion-group="stagger" className="grid gap-0">
            {principles.items.map((item, index) => (
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
