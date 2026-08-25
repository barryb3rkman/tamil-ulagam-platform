"use client";

import { Alert, StatusBadge, Surface } from "@tamil-ulagam/ui";
import { isTamilSangam, type EligibleOrganisation } from "@tamil-ulagam/shared";
import { useState } from "react";

import { OrganisationMark, SangamMark } from "@/components/join/journey-icons";
import { memberConfirmContent } from "@/content/member";

import {
  organisationKindLabel,
  organisationLocationLabel,
} from "./organisation-presentation";

/**
 * A focused confirmation surface — not another form. No membership-type
 * selector (deliberately not asked at this stage, see the Phase C2
 * report) and nothing already known from the authenticated profile is
 * re-requested.
 */
export function MemberConfirmRequest({
  organisation,
  onBack,
  onConfirm,
}: {
  readonly organisation: EligibleOrganisation;
  readonly onBack: () => void;
  readonly onConfirm: () => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isSangam = isTamilSangam(organisation);
  const Icon = isSangam ? SangamMark : OrganisationMark;

  const confirm = async () => {
    setSubmitting(true);
    setError("");
    try {
      await onConfirm();
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The request could not be sent. Please try again.",
      );
      setSubmitting(false);
    }
  };

  return (
    <div data-motion-reveal="" className="mx-auto max-w-xl">
      <Surface level="elevated" density="comfortable">
        <span
          aria-hidden="true"
          className={
            isSangam
              ? "bg-teal-depth/12 text-teal-depth grid size-12 place-items-center rounded-full"
              : "bg-heritage-gold/12 text-heritage-gold grid size-12 place-items-center rounded-full"
          }
        >
          <Icon className="size-6" />
        </span>
        <p className="text-heritage-maroon mt-4 text-xs font-bold tracking-[0.1em] uppercase">
          {organisationKindLabel(organisation)}
        </p>
        <h2 className="text-global-navy mt-1 text-2xl font-bold">
          You&rsquo;re requesting to join {organisation.name}.
        </h2>
        <p className="text-slate mt-2">
          {organisationLocationLabel(organisation)}
        </p>
        <div className="mt-3">
          <StatusBadge label="Verified" tone="success" />
        </div>

        <p className="text-charcoal mt-6 leading-7">
          {memberConfirmContent.disclaimer}
        </p>

        {error ? (
          <Alert tone="error" role="alert" className="mt-4">
            {error}
          </Alert>
        ) : null}

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={confirm}
            disabled={submitting}
            aria-busy={submitting}
            className="bg-global-navy hover:bg-heritage-maroon focus-visible:ring-focus rounded-button motion-control inline-flex min-h-12 items-center px-6 font-semibold text-white focus-visible:outline-none disabled:opacity-60"
          >
            {submitting ? "Sending request…" : "Request membership"}
          </button>
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="text-global-navy focus-visible:ring-focus rounded-button text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none"
          >
            Back to search
          </button>
        </div>
      </Surface>
    </div>
  );
}
