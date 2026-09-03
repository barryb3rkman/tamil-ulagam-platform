import { Container, Section } from "@tamil-ulagam/ui";

import type { LegalReviewChecklist as LegalReviewChecklistContent } from "@/content/legal";

interface LegalReviewChecklistProps {
  readonly checklist: LegalReviewChecklistContent;
}

export function LegalReviewChecklist({ checklist }: LegalReviewChecklistProps) {
  return (
    <Section
      tone="navy"
      motion="static"
      aria-labelledby="legal-review-checklist-title"
    >
      <Container size="wide">
        <div className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr] lg:gap-20">
          <div>
            <p className="text-heritage-gold text-eyebrow">
              {checklist.eyebrow}
            </p>
            <h2
              id="legal-review-checklist-title"
              className="mt-5 text-4xl leading-[1.08] font-semibold tracking-[-0.04em] text-balance text-white sm:text-5xl"
            >
              {checklist.title}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/72">
              {checklist.description}
            </p>
          </div>
          <ol className="grid border-t border-white/18 sm:grid-cols-2">
            {checklist.items.map((item, index) => (
              <li
                key={item}
                className="grid grid-cols-[2rem_1fr] gap-3 border-b border-white/18 py-4 leading-7 text-white/86 sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                <span className="text-heritage-gold text-sm font-semibold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
