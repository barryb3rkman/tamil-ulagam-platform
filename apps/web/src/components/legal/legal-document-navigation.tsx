import Link from "next/link";

import type { LegalDocumentLink, LegalSectionContent } from "@/content/legal";

interface LegalDocumentNavigationProps {
  readonly documentTitle: string;
  readonly sections: readonly LegalSectionContent<string>[];
}

export function LegalDocumentNavigation({
  documentTitle,
  sections,
}: LegalDocumentNavigationProps) {
  return (
    <aside className="lg:self-start">
      <nav
        aria-label={`${documentTitle} table of contents`}
        className="border-global-navy/14 bg-white px-5 py-6 lg:sticky lg:top-28 lg:px-6"
      >
        <h2 className="text-global-navy text-sm font-semibold tracking-[0.14em] uppercase">
          On this page
        </h2>
        <ol className="border-global-navy/12 mt-5 border-t">
          {sections.map((section) => (
            <li key={section.id} className="border-global-navy/12 border-b">
              <a
                href={`#${section.id}`}
                className="focus-visible:ring-focus hover:text-interactive-blue grid grid-cols-[2rem_1fr] gap-3 rounded-sm py-3 text-sm leading-6 transition-colors focus-visible:outline-none"
              >
                <span className="text-heritage-gold font-semibold">
                  {section.number}
                </span>
                <span>{section.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  );
}

interface RelatedLegalDocumentsProps {
  readonly links: readonly LegalDocumentLink[];
}

export function RelatedLegalDocuments({ links }: RelatedLegalDocumentsProps) {
  return (
    <nav aria-label="Related legal documents" className="mt-8">
      <h3 className="text-global-navy text-sm font-semibold tracking-[0.14em] uppercase">
        Related documents and guidance
      </h3>
      <ul className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:gap-5">
        {links.map((link) => (
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
    </nav>
  );
}
