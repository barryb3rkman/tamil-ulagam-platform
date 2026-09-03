import { Container, Section } from "@tamil-ulagam/ui";

import type { LegalReviewWarning } from "@/content/legal";

interface LegalDraftNoticeProps {
  readonly warning: LegalReviewWarning;
}

export function LegalDraftNotice({ warning }: LegalDraftNoticeProps) {
  return (
    <Section
      tone="ivory"
      spacing="compact"
      motion="static"
      aria-labelledby="legal-draft-notice-title"
    >
      <Container size="wide">
        <div className="border-heritage-maroon border-l-4 bg-white px-6 py-7 shadow-sm sm:px-8 lg:grid lg:grid-cols-[0.8fr_1.2fr] lg:gap-14 lg:px-10 lg:py-9">
          <div>
            <p className="text-heritage-maroon text-eyebrow">
              {warning.eyebrow}
            </p>
            <h2
              id="legal-draft-notice-title"
              className="text-global-navy mt-4 text-3xl leading-tight font-semibold tracking-[-0.035em] text-balance sm:text-4xl"
            >
              {warning.title}
            </h2>
            <p className="text-slate mt-5 leading-8">{warning.description}</p>
          </div>
          <ul className="border-global-navy/12 mt-8 border-t lg:mt-0">
            {warning.items.map((item) => (
              <li
                key={item}
                className="border-global-navy/12 flex gap-4 border-b py-4 leading-7"
              >
                <span
                  aria-hidden="true"
                  className="bg-heritage-maroon mt-[0.65rem] size-2 shrink-0 rounded-full"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
