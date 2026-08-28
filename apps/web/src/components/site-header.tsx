"use client";

import { Container } from "@tamil-ulagam/ui";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { primaryNavigation } from "@/content/navigation";
import { siteContent } from "@/content/site";
import { usePlatform } from "@/features/enrollment/platform-provider";

import { MobileNavigation } from "./mobile-navigation";
import { PrimaryNavigation } from "./primary-navigation";

function initials(fullName: string): string {
  return (
    fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "?"
  );
}

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const sentinelRef = useRef<HTMLSpanElement>(null);
  const { currentUser, isHydrated } = usePlatform();
  const signedIn = isHydrated && Boolean(currentUser);

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
        <Container
          size="wide"
          className="min-h-navigation flex items-center justify-between gap-4 min-[85rem]:grid min-[85rem]:grid-cols-[auto_minmax(0,1fr)_auto] min-[85rem]:gap-2"
        >
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

          <div className="hidden items-center gap-2 min-[85rem]:flex min-[85rem]:justify-self-end">
            {!isHydrated ? null : signedIn && currentUser ? (
              <>
                <Link
                  href="/workspace/member"
                  className="motion-control bg-global-navy hover:bg-heritage-maroon focus-visible:ring-focus rounded-button inline-flex min-h-10 items-center px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-white focus-visible:outline-none"
                >
                  Open workspace
                </Link>
                <Link
                  href="/dashboard/account"
                  className="motion-control focus-visible:ring-focus group rounded-button inline-flex min-h-10 items-center gap-2 px-2 py-1.5 focus-visible:outline-none"
                >
                  <span
                    aria-hidden="true"
                    className="bg-global-navy text-warm-ivory grid size-8 place-items-center rounded-full text-xs font-bold"
                  >
                    {initials(currentUser.fullName)}
                  </span>
                  <span className="text-global-navy hidden max-w-28 truncate text-sm font-semibold lg:block">
                    {currentUser.fullName}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="motion-control text-global-navy hover:bg-global-navy/5 hover:text-heritage-maroon focus-visible:ring-focus rounded-button inline-flex min-h-10 items-center px-2.5 py-2 text-sm font-semibold focus-visible:outline-none"
                >
                  Login
                </Link>
                <Link
                  href="/join"
                  className="motion-control bg-global-navy hover:bg-heritage-maroon focus-visible:ring-focus rounded-button inline-flex min-h-10 items-center px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-white focus-visible:outline-none"
                >
                  Join Tamil Ulagam
                </Link>
              </>
            )}
            <Link
              href="/partners"
              className="motion-control bg-heritage-maroon hover:bg-deep-navy focus-visible:ring-focus rounded-button inline-flex min-h-10 items-center px-4 py-2 text-sm font-semibold whitespace-nowrap text-white focus-visible:outline-none"
            >
              Partner With Us
            </Link>
          </div>
          <MobileNavigation
            entries={primaryNavigation}
            isHydrated={isHydrated}
            signedIn={signedIn}
            currentUser={currentUser}
          />
        </Container>
      </header>
    </>
  );
}
