"use client";

import { Button } from "@tamil-ulagam/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

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
    currentApplication,
    isHydrated,
    submitRegistration,
    updateCurrentStep,
  } = usePlatform();
  const [error, setError] = useState("");

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

  const edit = (step: 1 | 2 | 3 | 4) => {
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
      <div className="border-heritage-gold/30 bg-heritage-gold/7 rounded-card mb-6 flex flex-col gap-4 border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-global-navy font-bold">Organisation type</p>
          <p className="text-slate mt-1 text-sm">
            Confirm that the selected category best represents the organisation.
          </p>
        </div>
        <Button variant="ghost" onClick={() => edit(1)}>
          Edit type
        </Button>
      </div>
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
      <ProgressIndicator currentStep={5} />
      <div>{children}</div>
    </section>
  );
}
