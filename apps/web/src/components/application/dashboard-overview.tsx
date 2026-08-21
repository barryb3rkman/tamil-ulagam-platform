"use client";

import { ImageWithFallback } from "@tamil-ulagam/ui";
import Link from "next/link";

import { images } from "@/config/images";
import {
  getCategoryLabel,
  registrationStatusPresentation,
} from "@/content/enrollment";
import { usePlatform } from "@/features/enrollment/platform-provider";

import { formatDate } from "./application-details";
import { RegistrationStatusBadge } from "./registration-status-badge";

export function DashboardOverview() {
  const { currentApplication, currentUser, isHydrated } = usePlatform();
  if (!isHydrated) return <DashboardLoading />;
  if (!currentUser) return <SignedOutDashboard />;
  if (!currentApplication) {
    return (
      <div className="rounded-large border-global-navy/12 shadow-card overflow-hidden border bg-white">
        <div className="bg-deep-navy p-7 text-white sm:p-10">
          <p className="text-heritage-gold text-xs font-bold tracking-[0.14em] uppercase">
            Welcome, {firstName(currentUser.fullName)}
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Begin your organisation enrollment
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-white/70">
            Your personal account is ready. Create a separate organisation
            registration when you are authorised to represent it.
          </p>
          <Link
            href="/register"
            className="bg-heritage-gold text-deep-navy focus-visible:ring-focus rounded-button mt-6 inline-flex min-h-11 items-center px-5 py-3 font-semibold"
          >
            Register an organisation
          </Link>
        </div>
      </div>
    );
  }

  const { organisation, registration } = currentApplication;
  const presentation = registrationStatusPresentation[registration.status];
  const canEdit =
    registration.status === "draft" || registration.status === "needs_changes";
  const completion = calculateCompletion(currentApplication);
  const location = [organisation.city, organisation.country]
    .filter(Boolean)
    .join(", ");
  const primaryAction =
    registration.status === "draft"
      ? { href: "/register", label: "Continue Registration" }
      : registration.status === "needs_changes"
        ? { href: "/register", label: "Update Registration" }
        : { href: "/dashboard/registration", label: "View Registration" };

  return (
    <div className="grid gap-6 lg:gap-7">
      <header>
        <p className="text-heritage-maroon text-xs font-bold tracking-[0.14em] uppercase">
          Organisation portal
        </p>
        <h1 className="text-global-navy mt-2 text-3xl font-bold tracking-[-0.025em] sm:text-4xl">
          Welcome back, {firstName(currentUser.fullName)}
        </h1>
      </header>

      <section
        aria-labelledby="organisation-status-title"
        className="rounded-large shadow-navigation bg-deep-navy grid overflow-hidden text-white xl:grid-cols-[minmax(0,0.9fr)_minmax(28rem,1.1fr)]"
      >
        <div className="relative flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:min-h-[31rem] xl:p-11">
          <div
            aria-hidden="true"
            className="border-heritage-gold/20 absolute top-10 right-0 h-24 w-10 border-y border-l"
          />
          <p className="text-heritage-gold text-xs font-bold tracking-[0.14em] uppercase">
            {getCategoryLabel(organisation.category)}
          </p>
          <h2
            id="organisation-status-title"
            className="mt-3 text-3xl leading-tight font-bold tracking-[-0.03em] sm:text-4xl"
          >
            {organisation.name || "Organisation registration"}
          </h2>
          {location ? (
            <p className="mt-2 text-sm text-white/62 sm:text-base">
              {location}
            </p>
          ) : null}

          <div className="border-heritage-gold/25 mt-7 border-t pt-7">
            <RegistrationStatusBadge status={registration.status} />
            <h3 className="mt-4 text-xl font-bold sm:text-2xl">
              {presentation.title}
            </h3>
            <p className="mt-2 max-w-xl leading-7 text-white/72">
              {presentation.description}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={primaryAction.href}
                className="bg-heritage-gold text-deep-navy focus-visible:ring-focus rounded-button inline-flex min-h-11 items-center justify-center px-5 py-3 font-semibold"
              >
                {primaryAction.label}
              </Link>
              {registration.status === "needs_changes" &&
              registration.adminFeedback ? (
                <Link
                  href="#review-feedback"
                  className="focus-visible:ring-focus rounded-button inline-flex min-h-11 items-center justify-center border border-white/25 px-5 py-3 font-semibold hover:border-white/55"
                >
                  Review Feedback
                </Link>
              ) : null}
            </div>
          </div>
        </div>
        <div className="bg-global-navy relative h-52 overflow-hidden sm:h-72 xl:h-auto">
          <ImageWithFallback
            asset={images.portalDashboardVisual}
            className="h-full w-full object-cover"
            priority
            sizes="(min-width: 1280px) 48vw, 100vw"
          />
        </div>
      </section>

      {registration.adminFeedback &&
      ["needs_changes", "rejected", "suspended"].includes(
        registration.status,
      ) ? (
        <section
          id="review-feedback"
          className={`rounded-card border p-5 sm:p-6 ${registration.status === "needs_changes" ? "border-warning/30 bg-warning/8" : "border-heritage-maroon/25 bg-heritage-maroon/5"}`}
          role="status"
          aria-labelledby="review-feedback-title"
        >
          <h2
            id="review-feedback-title"
            className="text-global-navy text-lg font-bold"
          >
            Feedback from the review team
          </h2>
          <p className="text-charcoal mt-2 max-w-4xl leading-7">
            {registration.adminFeedback}
          </p>
        </section>
      ) : null}

      <section
        aria-labelledby="registration-record-title"
        className="rounded-card border-global-navy/12 grid gap-5 border bg-white p-5 shadow-sm sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
      >
        <div>
          <h2
            id="registration-record-title"
            className="text-global-navy text-xl font-bold"
          >
            Registration
          </h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-slate">Current status</dt>
              <dd className="text-global-navy mt-1 font-semibold">
                {presentation.label}
              </dd>
            </div>
            <div>
              <dt className="text-slate">Last updated</dt>
              <dd className="text-charcoal mt-1">
                {formatDate(registration.updatedAt)}
              </dd>
            </div>
            {canEdit ? (
              <div>
                <dt className="text-slate">Profile completion</dt>
                <dd className="text-global-navy mt-1 font-semibold">
                  {completion}%
                </dd>
              </div>
            ) : (
              <div>
                <dt className="text-slate">Application reference</dt>
                <dd className="text-charcoal mt-1 break-all">
                  {registration.id}
                </dd>
              </div>
            )}
          </dl>
          {canEdit ? (
            <div className="bg-global-navy/10 mt-4 h-1.5 max-w-xl overflow-hidden rounded-full">
              <div
                className="bg-heritage-gold h-full rounded-full"
                style={{ width: `${completion}%` }}
                role="progressbar"
                aria-label="Registration profile completion"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={completion}
              />
            </div>
          ) : null}
        </div>
        <Link
          className="border-global-navy text-global-navy focus-visible:ring-focus rounded-button inline-flex min-h-11 items-center justify-center border px-4 py-2 font-semibold"
          href="/dashboard/registration"
        >
          View Registration
        </Link>
      </section>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div
      role="status"
      className="rounded-card text-slate shadow-card bg-white p-7"
    >
      Loading your dashboard…
    </div>
  );
}

function SignedOutDashboard() {
  return (
    <div className="rounded-card shadow-card bg-white p-7">
      <h1 className="text-global-navy text-3xl font-bold">
        Sign in to view your dashboard
      </h1>
      <p className="text-slate mt-3">
        Sign in to access your organisation enrollment workspace.
      </p>
      <Link
        className="bg-global-navy rounded-button mt-6 inline-flex px-5 py-3 font-semibold text-white"
        href="/login"
      >
        Sign in
      </Link>
    </div>
  );
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

function calculateCompletion(
  application: NonNullable<
    ReturnType<typeof usePlatform>["currentApplication"]
  >,
): number {
  const values = [
    application.organisation.category,
    application.organisation.name,
    application.organisation.country,
    application.organisation.region,
    application.organisation.city,
    application.organisation.streetAddress,
    application.organisation.officialEmail,
    application.organisation.officialPhone,
    application.organisation.description,
    application.organisation.registrationStatus,
    application.registration.categoryProfile,
    application.registration.representative.fullName,
    application.registration.representative.email,
    application.registration.representative.phone,
    application.registration.representative.designation,
    application.registration.representative.relationship,
    application.registration.representative.authorisedDeclaration,
    application.registration.representative.accuracyDeclaration,
  ];
  return Math.round((values.filter(Boolean).length / values.length) * 100);
}
