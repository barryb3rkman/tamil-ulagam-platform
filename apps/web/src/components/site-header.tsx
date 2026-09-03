"use client";

import { BrandMark } from "@/components/brand/brand-mark";
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
        className="motion-site-header border-global-navy/8 sticky top-0 z-40 border-b"
      >
        <Container
          size="wide"
          className="min-h-navigation flex items-center justify-between gap-4 min-[85rem]:grid min-[85rem]:grid-cols-[auto_minmax(0,1fr)_auto] min-[85rem]:gap-2"
        >
          <div className="flex items-center gap-5">
            <Link
              className="group focus-visible:ring-focus inline-flex items-center gap-3 rounded-sm focus-visible:outline-none"
              href="/"
              aria-label={`${siteContent.shortName} home`}
            >
              <span className="relative grid place-items-center">
                <span
                  aria-hidden="true"
                  className="bg-heritage-gold/0 group-hover:bg-heritage-gold/18 absolute size-12 rounded-full blur-lg transition-colors duration-500"
                />
                <BrandMark className="relative size-12 shrink-0 transition-transform duration-500 group-hover:rotate-[8deg]" />
              </span>
              <span className="leading-tight">
                <span className="text-global-navy block text-base font-bold tracking-[-0.01em]">
                  {siteContent.shortName}
                </span>
                <span
                  lang="ta"
                  className="font-tamil text-heritage-maroon hidden text-[0.78rem] sm:block"
                >
                  தமிழ் உலகம்
                </span>
              </span>
            </Link>
            <span
              aria-hidden="true"
              className="via-global-navy/12 hidden h-8 w-px bg-gradient-to-b from-transparent to-transparent min-[85rem]:block"
            />
          </div>

          <PrimaryNavigation entries={primaryNavigation} />

          <div className="hidden items-center gap-2 min-[85rem]:flex min-[85rem]:justify-self-end">
            {!isHydrated ? null : signedIn && currentUser ? (
              <>
                <Link
                  href="/workspace/member"
                  className="motion-control bg-global-navy hover:bg-heritage-maroon focus-visible:ring-focus rounded-button inline-flex min-h-10 items-center px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-[0_0.4rem_1.2rem_rgba(6,29,50,0.18)] transition-all hover:-translate-y-0.5 focus-visible:outline-none"
                >
                  Open workspace
                </Link>
                <Link
                  href="/dashboard/account"
                  className="motion-control focus-visible:ring-focus group rounded-button inline-flex min-h-10 items-center gap-2 px-2 py-1.5 focus-visible:outline-none"
                >
                  <span
                    aria-hidden="true"
                    className="gradient-gold-leaf text-ink ring-heritage-gold/30 grid size-8 place-items-center rounded-full text-xs font-bold ring-2"
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
                  className="motion-control border-global-navy/12 text-global-navy hover:border-heritage-gold/60 hover:text-heritage-maroon focus-visible:ring-focus rounded-button inline-flex min-h-10 items-center border bg-white/70 px-4 py-2 text-sm font-bold backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_0.4rem_1rem_rgba(6,29,50,0.08)] focus-visible:outline-none"
                >
                  Log in
                </Link>
                <Link
                  href="/join"
                  className="motion-control gradient-gold-leaf text-ink focus-visible:ring-focus rounded-button relative inline-flex min-h-10 items-center px-4 py-2 text-sm font-bold whitespace-nowrap shadow-[0_0.5rem_1.5rem_rgba(214,168,75,0.32)] ring-1 ring-white/40 transition-all hover:-translate-y-0.5 hover:shadow-[0_0.7rem_2rem_rgba(214,168,75,0.45)] focus-visible:outline-none"
                >
                  Join Tamil Ulagam
                </Link>
              </>
            )}
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
