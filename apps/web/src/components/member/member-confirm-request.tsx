"use client";

import { Alert, StatusBadge, Surface } from "@tamil-ulagam/ui";
import {
  isTamilSangam,
  type EligibleOrganisation,
  type MemberProfile,
} from "@tamil-ulagam/shared";
import { useState } from "react";

import { RadioGroup, TextField } from "@/components/application/form-fields";
import { OrganisationMark, SangamMark } from "@/components/join/journey-icons";
import {
  memberConfirmContent,
  categoryConnectionQuestions,
} from "@/content/member";
import type { ValidationErrors } from "@/features/enrollment/validation";

import {
  organisationKindLabel,
  organisationLocationLabel,
} from "./organisation-presentation";

export interface ConnectionAnswer {
  readonly connectionType: string;
  readonly connectionContext: string;
  readonly connectionContextExtra: string;
}

export function MemberConfirmRequest({
  answer,
  onAnswerChange,
  onBack,
  onConfirm,
  organisation,
  profile,
}: {
  readonly organisation: EligibleOrganisation;
  readonly profile: MemberProfile;
  readonly answer: ConnectionAnswer;
  readonly onAnswerChange: (answer: ConnectionAnswer) => void;
  readonly onBack: () => void;
  readonly onConfirm: () => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const isSangam = isTamilSangam(organisation);
  const Icon = isSangam ? SangamMark : OrganisationMark;
  const question =
    !isSangam && organisation.category
      ? categoryConnectionQuestions[organisation.category]
      : null;
  const showContext =
    question &&
    (!question.contextOnlyForOptions ||
      question.contextOnlyForOptions.includes(answer.connectionType));

  const confirm = async () => {
    if (question && !answer.connectionType.trim()) {
      setFieldErrors({
        connectionType: "Select the option that best describes you.",
      });
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    setError("");
    try {
      await onConfirm();
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The affiliation could not be submitted. Please try again.",
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
        <p className="text-heritage-maroon text-eyebrow-sm mt-4">
          {organisationKindLabel(organisation)}
        </p>
        <h2 className="text-global-navy mt-1 text-2xl font-bold">
          {memberConfirmContent.title}
        </h2>
        <p className="text-charcoal mt-2 font-semibold">{organisation.name}</p>
        <p className="text-slate mt-1">
          {organisationLocationLabel(organisation)}
        </p>
        <div className="mt-3">
          <StatusBadge label="Verified" tone="success" />
        </div>

        <dl className="border-global-navy/10 mt-6 grid gap-4 border-t pt-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate text-eyebrow-sm">Your details</dt>
            <dd className="text-charcoal mt-1">{profile.fullName}</dd>
            <dd className="text-charcoal">{profile.phone}</dd>
          </div>
          <div>
            <dt className="text-slate text-eyebrow-sm">Location</dt>
            <dd className="text-charcoal mt-1">
              {[profile.city, profile.region, profile.country]
                .filter(Boolean)
                .join(", ")}
            </dd>
          </div>
        </dl>

        {question ? (
          <div className="border-global-navy/10 mt-6 grid gap-4 border-t pt-5">
            <RadioGroup
              label={question.prompt}
              name="connection-type"
              required
              value={answer.connectionType}
              options={question.options}
              error={fieldErrors.connectionType}
              onChange={(event) =>
                onAnswerChange({
                  ...answer,
                  connectionType: event.target.value,
                })
              }
            />
            {showContext && question.contextLabel ? (
              <TextField
                label={question.contextLabel}
                value={answer.connectionContext}
                onChange={(event) =>
                  onAnswerChange({
                    ...answer,
                    connectionContext: event.target.value,
                  })
                }
              />
            ) : null}
            {showContext && question.extraLabel ? (
              <TextField
                label={question.extraLabel}
                value={answer.connectionContextExtra}
                onChange={(event) =>
                  onAnswerChange({
                    ...answer,
                    connectionContextExtra: event.target.value,
                  })
                }
              />
            ) : null}
          </div>
        ) : null}

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
            onClick={() => void confirm()}
            disabled={submitting}
            aria-busy={submitting}
            className="bg-global-navy hover:bg-heritage-maroon focus-visible:ring-focus rounded-button motion-control inline-flex min-h-12 items-center px-6 font-semibold text-white focus-visible:outline-none disabled:opacity-60"
          >
            {submitting ? "Submitting…" : memberConfirmContent.submitCta}
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
