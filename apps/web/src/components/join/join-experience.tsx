"use client";

import {
  isTamilSangamProfile,
  type OrganisationApplication,
} from "@tamil-ulagam/shared";
import { Container } from "@tamil-ulagam/ui";
import { useMemo } from "react";

import { joinJourneys } from "@/content/join";
import { usePlatform } from "@/features/enrollment/platform-provider";

import { JoinHero } from "./join-hero";
import { JourneySelector, type JourneyOverride } from "./journey-selector";

const resumableStatuses = new Set(["draft", "needs_changes"]);

function overrideFor(
  application: OrganisationApplication | undefined,
  workspaceHref: (organisationId: string) => `/${string}`,
): JourneyOverride | undefined {
  if (!application) return undefined;
  const { status } = application.registration;
  if (status === "verified") {
    return {
      title: "Open workspace",
      cta: "Go to your workspace",
      href: workspaceHref(application.organisation.id),
    };
  }
  if (resumableStatuses.has(status)) {
    return {
      title: "Continue your registration",
      cta: "Resume where you left off",
    };
  }
  return undefined;
}

/**
 * Top-level /join composition: hero + journey selector, personalized
 * (H2 brief section 23) from state the platform already loads on
 * hydration — no new fetch, no new backend call, and never a redirect
 * ("prefer clarity over clever redirects"): a signed-in visitor with a
 * draft/needs-changes registration sees "Continue your registration";
 * one with a verified organisation or Sangam sees "Open workspace"
 * linking straight there; everyone else still sees the normal "Start
 * registration" entrance — including someone who already has one
 * entity, since registering a second Organisation or Sangam remains a
 * legitimate action. The old admin-console banner is gone entirely
 * (H2 brief section 22): reviewer/admin access belongs in the
 * authenticated header/workspace switcher, not as a second product
 * bolted onto the public entrance.
 */
export function JoinExperience() {
  const { isHydrated, myOrganisationApplications } = usePlatform();

  const { organisationOverride, sangamOverride } = useMemo(() => {
    if (!isHydrated) return {};
    const sangam = myOrganisationApplications.find((application) =>
      isTamilSangamProfile(application.registration.categoryProfile),
    );
    const organisation = myOrganisationApplications.find(
      (application) =>
        !isTamilSangamProfile(application.registration.categoryProfile),
    );
    return {
      organisationOverride: overrideFor(
        organisation,
        (id) => `/workspace/organisation?organization=${id}`,
      ),
      sangamOverride: overrideFor(
        sangam,
        (id) => `/workspace/sangam?sangam=${id}`,
      ),
    };
  }, [isHydrated, myOrganisationApplications]);

  return (
    <>
      <JoinHero />
      <section
        aria-labelledby="join-selector-title"
        className="surface-canvas py-16 sm:py-20 lg:py-24"
      >
        <Container>
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
              overrides={{
                organisation: organisationOverride,
                sangam: sangamOverride,
              }}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
