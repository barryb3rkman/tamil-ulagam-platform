import { Container, Section } from "@tamil-ulagam/ui";

import type { LegalPolicyDocument } from "@/content/legal";

import { LegalDocumentNavigation } from "./legal-document-navigation";
import { LegalDraftNotice } from "./legal-draft-notice";
import { LegalFinalNotice } from "./legal-final-notice";
import { LegalPageHeader } from "./legal-page-header";
import { LegalReviewChecklist } from "./legal-review-checklist";
import { LegalSection } from "./legal-section";

interface LegalDocumentProps {
  readonly document: LegalPolicyDocument<string>;
}

export function LegalDocument({ document }: LegalDocumentProps) {
  return (
    <>
      <LegalPageHeader document={document} />
      <LegalDraftNotice warning={document.warning} />
      <Section tone="ivory" spacing="compact">
        <Container
          size="wide"
          className="grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-16 xl:gap-20"
        >
          <LegalDocumentNavigation
            documentTitle={document.title}
            sections={document.sections}
          />
          <article aria-label={`${document.title} draft document`}>
            {document.sections.map((section) => (
              <LegalSection key={section.id} section={section} />
            ))}
          </article>
        </Container>
      </Section>
      <LegalReviewChecklist checklist={document.reviewChecklist} />
      <LegalFinalNotice document={document} />
    </>
  );
}
