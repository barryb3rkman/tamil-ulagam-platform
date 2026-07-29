import { Container } from "@tamil-ulagam/ui";
import Link from "next/link";

import { primaryNavigation } from "@/content/navigation";
import { siteContent } from "@/content/site";

import { LanguageSelector } from "./language-selector";
import { MobileNavigation } from "./mobile-navigation";

export function SiteHeader() {
  return (
    <header className="border-global-navy/10 bg-warm-ivory relative z-40 border-b">
      <Container className="min-h-navigation flex items-center justify-between gap-6">
        <Link
          className="group focus-visible:ring-focus inline-flex items-center gap-3 rounded-sm focus-visible:outline-none"
          href="/"
          aria-label={`${siteContent.shortName} home`}
        >
          <span
            aria-hidden="true"
            className="bg-global-navy font-tamil ring-heritage-gold/60 ring-offset-warm-ivory grid size-10 place-items-center rounded-full text-lg font-bold text-white ring-2 ring-offset-2"
          >
            த
          </span>
          <span className="leading-tight">
            <span className="text-global-navy block text-base font-bold tracking-[-0.01em]">
              {siteContent.shortName}
            </span>
            <span className="text-slate hidden text-[0.68rem] tracking-[0.12em] uppercase sm:block">
              Global Federation
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {primaryNavigation.map((entry) => (
            <Link
              key={entry.href}
              className="rounded-button text-global-navy hover:bg-global-navy/5 hover:text-heritage-maroon focus-visible:ring-focus px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none"
              href={entry.href}
            >
              {entry.label}
            </Link>
          ))}
        </nav>

        <div className="text-global-navy hidden xl:block">
          <LanguageSelector />
        </div>
        <MobileNavigation entries={primaryNavigation} />
      </Container>
    </header>
  );
}
