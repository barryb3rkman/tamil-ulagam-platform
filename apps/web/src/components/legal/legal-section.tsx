import Link from "next/link";

import type { LegalSectionContent } from "@/content/legal";

import {
  LegalDecisionRequired,
  LegalOperationalTrigger,
} from "./legal-decision-required";

interface LegalSectionProps {
  readonly section: LegalSectionContent<string>;
}

export function LegalSection({ section }: LegalSectionProps) {
  const headingId = `${section.id}-title`;

  return (
    <section
      id={section.id}
      aria-labelledby={headingId}
      className="border-global-navy/12 scroll-mt-28 border-t py-10 first:border-t-0 first:pt-0 sm:py-12"
    >
      <div className="grid gap-4 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-6">
        <p
          aria-hidden="true"
          className="text-heritage-gold pt-1 text-sm font-semibold tracking-[0.12em]"
        >
          {section.number}
        </p>
        <div>
          <h2
            id={headingId}
            className="text-global-navy text-3xl leading-tight font-semibold tracking-[-0.035em] text-balance sm:text-4xl"
          >
            {section.title}
          </h2>
          <div className="text-charcoal/88 mt-6 grid max-w-3xl gap-4 text-[1.03rem] leading-8">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {section.items ? (
            <div className="mt-7">
              {section.itemIntroduction ? (
                <p className="text-global-navy font-semibold">
                  {section.itemIntroduction}
                </p>
              ) : null}
              <ul className="border-global-navy/12 mt-4 grid border-t sm:grid-cols-2">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="border-global-navy/12 flex gap-3 border-b py-3 leading-7 sm:px-4 sm:odd:pl-0 sm:even:border-l"
                  >
                    <span
                      aria-hidden="true"
                      className="text-heritage-gold font-bold"
                    >
                      —
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {section.links ? (
            <ul className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:gap-5">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="focus-visible:ring-focus text-global-navy decoration-heritage-gold hover:text-interactive-blue rounded-sm font-semibold underline underline-offset-4 transition-colors focus-visible:outline-none"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          {section.decisionRequired ? (
            <LegalDecisionRequired decision={section.decisionRequired} />
          ) : null}
          {section.operationalTrigger ? (
            <LegalOperationalTrigger trigger={section.operationalTrigger} />
          ) : null}
        </div>
      </div>
    </section>
  );
}
