"use client";

import { Container } from "@tamil-ulagam/ui";
import Link from "next/link";

import { joinJourneys } from "@/content/join";
import { usePlatform } from "@/features/enrollment/platform-provider";

import { JoinHero } from "./join-hero";
import { JourneySelector } from "./journey-selector";

const resumableStatuses = new Set(["draft", "needs_changes"]);

/**
 * Top-level /join composition: hero + journey selector, plus the two
 * auth-aware touches the brief asks for — both additive, neither one a
 * redirect:
 *  - an applicant with a resumable organisation application sees the
 *    Organisation card swap to "Continue your registration" copy;
 *  - a reviewer/admin sees a small, dismissable-free but easily ignored
 *    banner pointing at the admin console, rather than being bounced
 *    there automatically ("prefer clarity over clever redirects").
 * No new backend state — both read platform state that already exists.
 */
export function JoinExperience() {
  const { canReviewApplications, currentApplication, isHydrated } =
    usePlatform();

  const resumingJourneyId =
    isHydrated &&
    currentApplication &&
    resumableStatuses.has(currentApplication.registration.status)
      ? "organisation"
      : undefined;

  return (
    <>
      <JoinHero />
      <section
        aria-labelledby="join-selector-title"
        className="surface-canvas py-16 sm:py-20 lg:py-24"
      >
        <Container>
          {isHydrated && canReviewApplications ? (
            <div className="border-heritage-gold/30 bg-heritage-gold/8 rounded-card mb-10 flex flex-wrap items-center justify-between gap-3 border px-5 py-4">
              <p className="text-global-navy text-sm">
                Reviewing applications? Continue in the admin console.
              </p>
              <Link
                href="/admin"
                className="text-heritage-maroon focus-visible:ring-focus rounded-button text-sm font-semibold underline-offset-4 hover:underline"
              >
                Open admin console <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : null}

          <div data-motion-reveal="">
            <h2
              id="join-selector-title"
              className="text-global-navy text-2xl font-bold tracking-[-0.01em] sm:text-3xl"
            >
              Choose your path
            </h2>
            <p className="text-slate mt-2 max-w-xl text-base leading-7">
              Every path leads to the same federation — pick the one that
              matches why you&rsquo;re here.
            </p>
          </div>

          <div className="mt-9 sm:mt-10">
            <JourneySelector
              journeys={joinJourneys}
              resumingJourneyId={resumingJourneyId}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
