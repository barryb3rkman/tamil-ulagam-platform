"use client";

import type {
  DuplicateOrganisationSignals,
  OrganisationApplication,
} from "@tamil-ulagam/shared";
import { Alert, Button, Dialog, StageProgress } from "@tamil-ulagam/ui";
import { useEffect, useState } from "react";

import { ApplicationDetails } from "@/components/application/application-details";
import {
  organisationReviewContent as content,
  organisationStages,
} from "@/content/organisation";
import { usePlatform } from "@/features/enrollment/platform-provider";

export function OrganisationReview({
  application,
  onEdit,
  onSubmitted,
}: {
  readonly application: OrganisationApplication;
  readonly onEdit: (stage: 1 | 2 | 3) => void;
  readonly onSubmitted: () => Promise<void>;
}) {
  const { checkDuplicateSignals } = usePlatform();
  const [duplicateSignals, setDuplicateSignals] =
    useState<DuplicateOrganisationSignals | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void checkDuplicateSignals({
      name: application.organisation.name,
      officialEmail: application.organisation.officialEmail,
      registrationNumber: application.organisation.registrationNumber,
      excludeOrganisationId: application.organisation.id,
    })
      .then((signals) => {
        if (active) setDuplicateSignals(signals);
      })
      .catch(() => {
        // Best-effort only; review can proceed without it.
      });
    return () => {
      active = false;
    };
  }, [application, checkDuplicateSignals]);

  const submit = async () => {
    setPending(true);
    setError("");
    try {
      await onSubmitted();
      setConfirmOpen(false);
    } catch (submissionError: unknown) {
      setConfirmOpen(false);
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Your registration could not be submitted. Please try again.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="gradient-warm-welcome">
      <div className="mx-auto max-w-[74rem] px-5 py-10 sm:px-7 sm:py-14 lg:px-10">
        <div className="mb-7 max-w-3xl">
          <p className="text-heritage-maroon text-xs font-bold tracking-[0.18em] uppercase">
            {content.eyebrow}
          </p>
          <h1 className="text-global-navy mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
            {content.title}
          </h1>
          <p className="text-slate mt-3 leading-7">{content.description}</p>
        </div>
        <StageProgress stages={[...organisationStages]} currentStage={4} />

        {error ? (
          <Alert tone="error" role="alert" className="mb-5">
            {error}
          </Alert>
        ) : null}
        {duplicateSignals &&
        (duplicateSignals.nameMatch ||
          duplicateSignals.emailMatch ||
          duplicateSignals.registrationNumberMatch) ? (
          <Alert tone="warning" title="Possible duplicate" className="mb-6">
            An organisation with similar details may already exist. You can
            still submit — a reviewer will confirm before verifying.
          </Alert>
        ) : null}

        <ApplicationDetails application={application} onEdit={onEdit} />

        <div className="bg-deep-navy rounded-card mt-7 grid gap-6 p-6 text-white sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-heritage-gold text-xs font-bold tracking-[0.14em] uppercase">
              What happens next
            </p>
            <ol className="mt-4 grid gap-3 text-sm text-white/75 sm:grid-cols-3">
              {content.whatHappensNext.map((item) => (
                <li key={item.title}>
                  <strong className="block text-white">{item.title}</strong>
                  {item.description}
                </li>
              ))}
            </ol>
          </div>
          <Button
            size="large"
            onClick={() => setConfirmOpen(true)}
            className="bg-heritage-gold text-deep-navy hover:bg-white"
          >
            {content.submitCta}
          </Button>
        </div>

        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title={content.confirmDialogTitle}
        >
          <p className="text-slate leading-7">{content.confirmDialogBody}</p>
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Continue reviewing
            </Button>
            <Button
              onClick={() => void submit()}
              disabled={pending}
              aria-busy={pending}
            >
              {pending ? "Submitting…" : "Confirm submission"}
            </Button>
          </div>
        </Dialog>
      </div>
    </section>
  );
}
