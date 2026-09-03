import { StatusBadge, Surface } from "@tamil-ulagam/ui";
import { isTamilSangam, type EligibleOrganisation } from "@tamil-ulagam/shared";
import Link from "next/link";

import { OrganisationMark, SangamMark } from "@/components/join/journey-icons";
import { memberSuccessContent } from "@/content/member";

import { organisationKindLabel } from "./organisation-presentation";

export function MemberRequestSuccess({
  onAddAnother,
  organisation,
}: {
  readonly organisation: EligibleOrganisation;
  readonly onAddAnother: () => void;
}) {
  const isSangam = isTamilSangam(organisation);
  const Icon = isSangam ? SangamMark : OrganisationMark;

  return (
    <div
      data-motion-mask
      className="mx-auto max-w-xl text-center"
      role="status"
      aria-live="polite"
    >
      <Surface level="elevated" density="comfortable">
        <span
          aria-hidden="true"
          className="bg-success/10 text-success mx-auto grid size-12 place-items-center rounded-full text-xl font-bold"
        >
          ✓
        </span>
        <p className="text-heritage-maroon mt-4 text-xs font-bold tracking-[0.1em] uppercase">
          {memberSuccessContent.eyebrow}
        </p>
        <h2 className="text-global-navy mt-3 text-2xl font-bold">
          {memberSuccessContent.title}
        </h2>
        <div className="mt-3 flex items-center justify-center gap-2">
          <span
            aria-hidden="true"
            className={
              isSangam
                ? "bg-teal-depth/12 text-teal-depth grid size-8 place-items-center rounded-full"
                : "bg-heritage-gold/12 text-heritage-gold grid size-8 place-items-center rounded-full"
            }
          >
            <Icon className="size-4" />
          </span>
          <h3 className="text-global-navy text-xl font-bold">
            {organisation.name}
          </h3>
        </div>
        <p className="text-slate mt-1 text-sm">
          {organisationKindLabel(organisation)}
        </p>
        <div className="mt-4 flex justify-center">
          <StatusBadge label="Pending confirmation" tone="warning" />
        </div>

        <p className="text-charcoal mx-auto mt-6 max-w-md leading-7">
          {organisation.name} {memberSuccessContent.body}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/workspace/member"
            className="bg-global-navy hover:bg-heritage-maroon focus-visible:ring-focus rounded-button motion-control inline-flex min-h-12 items-center px-6 font-semibold text-white focus-visible:outline-none"
          >
            {memberSuccessContent.primaryCta}
          </Link>
          <button
            type="button"
            onClick={onAddAnother}
            className="text-global-navy focus-visible:ring-focus rounded-button text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none"
          >
            {memberSuccessContent.secondaryCta}
          </button>
        </div>
      </Surface>
    </div>
  );
}
