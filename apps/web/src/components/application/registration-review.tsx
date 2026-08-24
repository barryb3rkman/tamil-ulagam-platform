"use client";

import type { DuplicateOrganisationSignals } from "@tamil-ulagam/shared";
import { Button } from "@tamil-ulagam/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { usePlatform } from "@/features/enrollment/platform-provider";
import {
  isValid,
  validateCategoryProfile,
  validateOrganisation,
  validateRepresentative,
} from "@/features/enrollment/validation";

import { ApplicationDetails } from "./application-details";
import { ProgressIndicator } from "./progress-indicator";

export function RegistrationReview() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const {
    checkDuplicateSignals,
    currentApplication,
    isHydrated,
    submitRegistration,
    updateCurrentStep,
  } = usePlatform();
  const [error, setError] = useState("");
  const [duplicateSignals, setDuplicateSignals] =
    useState<DuplicateOrganisationSignals | null>(null);

  useEffect(() => {
    if (!currentApplication) return;
    let active = true;
    void checkDuplicateSignals({
      name: currentApplication.organisation.name,
      officialEmail: currentApplication.organisation.officialEmail,
      registrationNumber: currentApplication.organisation.registrationNumber,
      excludeOrganisationId: currentApplication.organisation.id,
    })
      .then((signals) => {
        if (active) setDuplicateSignals(signals);
      })
      .catch(() => {
        // Best-effort: a gentle warning is not worth blocking review on.
      });
    return () => {
      active = false;
    };
  }, [checkDuplicateSignals, currentApplication]);

  if (!isHydrated)
    return (
      <ReviewFrame>
        <p role="status">Loading your saved registration…</p>
      </ReviewFrame>
    );
  if (!currentApplication)
    return (
      <ReviewFrame>
        <h2 className="text-global-navy text-2xl font-bold">
          No registration to review
        </h2>
        <Link
          href="/register"
          className="text-global-navy mt-4 inline-flex font-semibold underline"
        >
          Start a registration
        </Link>
      </ReviewFrame>
    );

  const edit = (step: 1 | 2 | 3) => {
    void updateCurrentStep(step).then(() => router.push("/register"));
  };
  const validateAll = () => {
    const valid =
      isValid(validateOrganisation(currentApplication.organisation)) &&
      isValid(
        validateCategoryProfile(
          currentApplication.registration.categoryProfile,
        ),
      ) &&
      isValid(
        validateRepresentative(currentApplication.registration.representative),
      );
    if (!valid) {
      setError(
        "Some required information is incomplete. Return to the relevant section before submitting.",
      );
      return;
    }
    setError("");
    dialogRef.current?.showModal();
  };
  const submit = async () => {
    try {
      await submitRegistration();
      dialogRef.current?.close();
      router.push("/dashboard");
    } catch (submissionError: unknown) {
      dialogRef.current?.close();
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "The registration could not be submitted. Please try again.",
      );
    }
  };

  return (
    <ReviewFrame>
      {error ? (
        <p
          role="alert"
          className="border-error/25 bg-error/5 text-error rounded-button mb-5 border p-4"
        >
          {error}
        </p>
      ) : null}
      {duplicateSignals &&
      (duplicateSignals.nameMatch ||
        duplicateSignals.emailMatch ||
        duplicateSignals.registrationNumberMatch) ? (
        <div
          role="status"
          className="border-heritage-gold/40 bg-heritage-gold/10 rounded-card mb-6 border p-5"
        >
          <p className="text-global-navy font-bold">Possible duplicate</p>
          <p className="text-slate mt-1 text-sm leading-6">
            {duplicateSignals.emailMatch
              ? "Official email matches another organisation. "
              : ""}
            {duplicateSignals.nameMatch
              ? "Similar organisation name already exists. "
              : ""}
            {duplicateSignals.registrationNumberMatch
              ? "Registration number matches another organisation. "
              : ""}
            You can still submit — a reviewer will confirm before verifying.
          </p>
        </div>
      ) : null}
      <ApplicationDetails application={currentApplication} onEdit={edit} />
      <div className="bg-deep-navy rounded-card mt-7 grid gap-6 p-6 text-white sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-heritage-gold text-xs font-bold tracking-[0.14em] uppercase">
            What happens next
          </p>
          <ol className="mt-4 grid gap-3 text-sm text-white/75 sm:grid-cols-3">
            <li>
              <strong className="block text-white">1. Submit</strong>The
              application enters review.
            </li>
            <li>
              <strong className="block text-white">2. Track</strong>Status
              appears in your dashboard.
            </li>
            <li>
              <strong className="block text-white">3. Respond</strong>Update
              details if changes are requested.
            </li>
          </ol>
        </div>
        <Button
          size="large"
          onClick={validateAll}
          className="bg-heritage-gold text-deep-navy hover:bg-white"
        >
          Submit Registration
        </Button>
      </div>
      <dialog
        ref={dialogRef}
        aria-labelledby="submit-dialog-title"
        className="backdrop:bg-deep-navy/60 rounded-large shadow-navigation m-auto w-[min(92vw,34rem)] border-0 p-0"
      >
        <div className="bg-white p-6 sm:p-8">
          <h2
            id="submit-dialog-title"
            className="text-global-navy text-2xl font-bold"
          >
            Submit this registration?
          </h2>
          <p className="text-slate mt-3 leading-7">
            After submission, editing pauses while the application is reviewed.
            An administrator can request specific changes.
          </p>
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => dialogRef.current?.close()}>
              Continue reviewing
            </Button>
            <Button onClick={() => void submit()}>Confirm submission</Button>
          </div>
        </div>
      </dialog>
    </ReviewFrame>
  );
}

function ReviewFrame({ children }: { readonly children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-7 max-w-3xl">
        <p className="text-heritage-maroon text-xs font-bold tracking-[0.18em] uppercase">
          Review & submit
        </p>
        <h1 className="text-global-navy mt-4 text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
          Review your registration
        </h1>
        <p className="text-slate mt-4 text-lg leading-8">
          Confirm each section before submitting the organisation for review.
        </p>
      </div>
      <ProgressIndicator currentStep={4} />
      <div>{children}</div>
    </section>
  );
}
