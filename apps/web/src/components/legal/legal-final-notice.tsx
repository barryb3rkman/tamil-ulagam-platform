import { Container, Section } from "@tamil-ulagam/ui";

import type { LegalPolicyDocument } from "@/content/legal";

import { RelatedLegalDocuments } from "./legal-document-navigation";

interface LegalFinalNoticeProps {
  readonly document: LegalPolicyDocument<string>;
}

export function LegalFinalNotice({ document }: LegalFinalNoticeProps) {
  return (
    <Section
      tone="white"
      motion="static"
      aria-labelledby="legal-final-notice-title"
    >
      <Container size="narrow">
        <p className="text-fg-accent text-eyebrow">
          {document.finalNotice.eyebrow}
        </p>
        <h2
          id="legal-final-notice-title"
          className="text-fg mt-5 text-4xl leading-[1.08] font-semibold tracking-[-0.04em] text-balance sm:text-5xl"
        >
          {document.finalNotice.title}
        </h2>
        <p className="text-fg-muted mt-6 text-lg leading-8">
          {document.finalNotice.description}
        </p>
        <ul className="border-hairline/12 mt-8 border-y">
          {document.finalNotice.items.map((item) => (
            <li
              key={item}
              className="border-hairline/12 flex gap-4 border-b py-4 leading-7 last:border-b-0"
            >
              <span aria-hidden="true" className="text-fg-accent font-bold">
                —
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <RelatedLegalDocuments links={document.relatedDocuments} />
      </Container>
    </Section>
  );
}
