import { Badge, Container } from "@tamil-ulagam/ui";
import Link from "next/link";

import type { LegalPolicyDocument } from "@/content/legal";

interface LegalPageHeaderProps {
  readonly document: LegalPolicyDocument<string>;
}

export function LegalPageHeader({ document }: LegalPageHeaderProps) {
  return (
    <header className="bg-deep-navy relative overflow-hidden text-white">
      <div
        aria-hidden="true"
        className="border-heritage-gold/20 absolute top-0 right-[9%] h-40 w-40 border-r border-b"
      />
      <Container size="wide" className="relative py-14 sm:py-18 lg:py-22">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-white/68">
            <li>
              <Link
                href="/"
                className="focus-visible:ring-focus rounded-sm underline decoration-white/35 underline-offset-4 transition-colors hover:text-white focus-visible:outline-none"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-white/90">
              {document.breadcrumb}
            </li>
          </ol>
        </nav>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-end lg:gap-20">
          <div className="max-w-4xl">
            <p className="text-heritage-gold text-eyebrow">
              {document.eyebrow}
            </p>
            <Badge
              tone="maroon"
              className="text-heritage-maroon mt-6 border border-white/20 bg-white"
            >
              {document.status.label}
            </Badge>
            <h1
              id={`${document.key}-title`}
              className="mt-6 text-5xl leading-[1] font-semibold tracking-[-0.05em] text-balance sm:text-6xl lg:text-7xl"
            >
              {document.title}
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-white/80 sm:text-xl sm:leading-9">
              {document.openingStatement}
            </p>
          </div>

          <dl className="border-y border-white/18 text-sm">
            <div className="grid grid-cols-[1fr_auto] gap-5 border-b border-white/18 py-4">
              <dt className="text-white/62">Effective date</dt>
              <dd className="font-semibold text-white">
                {document.status.effectiveDate}
              </dd>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-5 border-b border-white/18 py-4">
              <dt className="text-white/62">Last reviewed</dt>
              <dd className="font-semibold text-white">
                {document.status.lastReviewed}
              </dd>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-5 border-b border-white/18 py-4">
              <dt className="text-white/62">Organisation details</dt>
              <dd className="font-semibold text-white">
                {document.status.organisationDetails}
              </dd>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-5 py-4">
              <dt className="text-white/62">Contact details</dt>
              <dd className="font-semibold text-white">
                {document.status.contactDetails}
              </dd>
            </div>
          </dl>
        </div>
      </Container>
    </header>
  );
}
