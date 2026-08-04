"use client";

import { Container } from "@tamil-ulagam/ui";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { primaryNavigation } from "@/content/navigation";
import { siteContent } from "@/content/site";

import { LanguageSelector } from "./language-selector";
import { MobileNavigation } from "./mobile-navigation";
import { PrimaryNavigation } from "./primary-navigation";

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const sentinelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry?.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <span
        ref={sentinelRef}
        aria-hidden="true"
        data-header-sentinel="true"
        className="pointer-events-none absolute top-0 left-0 size-px"
      />
      <header
        data-scrolled={isScrolled}
        className="motion-site-header border-global-navy/10 bg-warm-ivory sticky top-0 z-40 border-b"
      >
        <Container className="min-h-navigation flex items-center justify-between gap-6">
          <Link
            className="group focus-visible:ring-focus inline-flex items-center gap-3 rounded-sm focus-visible:outline-none"
            href="/"
            aria-label={`${siteContent.shortName} home`}
          >
            <span
              aria-hidden="true"
              className="bg-global-navy font-tamil ring-heritage-gold/60 ring-offset-warm-ivory grid size-12 place-items-center rounded-full text-xl font-bold text-white ring-2 ring-offset-2"
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

          <PrimaryNavigation entries={primaryNavigation} />

          <div className="text-global-navy hidden xl:block">
            <LanguageSelector />
          </div>
          <Link
            href="/partners"
            className="motion-control bg-heritage-maroon hover:bg-deep-navy focus-visible:ring-focus rounded-button hidden min-h-10 items-center px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none xl:inline-flex"
          >
            Partner With Us
          </Link>
          <MobileNavigation entries={primaryNavigation} />
        </Container>
      </header>
    </>
  );
}
