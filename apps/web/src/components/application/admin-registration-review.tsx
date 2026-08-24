"use client";

import type {
  DuplicateOrganisationSignals,
  RegistrationStatus,
} from "@tamil-ulagam/shared";
import { Button } from "@tamil-ulagam/ui";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { getCategoryLabel } from "@/content/enrollment";
import { usePlatform } from "@/features/enrollment/platform-provider";

import { ApplicationDetails, formatDate } from "./application-details";
import { OrganisationEmailVerificationCard } from "./organisation-email-verification";
import { RegistrationStatusBadge } from "./registration-status-badge";
import { TextareaField } from "./form-fields";

type ReviewAction = "verify" | "needs_changes" | "reject" | "suspend" | null;

export function AdminRegistrationReview({ id }: { readonly id: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const {
    checkDuplicateSignals,
    getApplication,
    isHydrated,
    updateApplicationStatus,
  } = usePlatform();
  const searchParams = useSearchParams();
  const applicationId =
    id === "review" ? (searchParams.get("application") ?? "") : id;
  const [action, setAction] = useState<ReviewAction>(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [operationError, setOperationError] = useState("");
  const [pending, setPending] = useState(false);
  const [duplicateSignals, setDuplicateSignals] =
    useState<DuplicateOrganisationSignals | null>(null);
  const application = isHydrated ? getApplication(applicationId) : null;

  useEffect(() => {
    if (!application) return;
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
        // Best-effort signal only; review can proceed without it.
      });
    return () => {
      active = false;
    };
  }, [application, checkDuplicateSignals]);

  if (!isHydrated) return <p role="status">Loading application…</p>;
  if (!application)
    return (
      <div className="rounded-card shadow-card bg-white p-7">
        <h1 className="text-global-navy text-3xl font-bold">
          Application not found
        </h1>
        <Link
          href="/admin/registrations"
          className="text-global-navy mt-4 inline-flex font-semibold underline underline-offset-4"
        >
          Return to queue
        </Link>
      </div>
    );

  const openAction = (nextAction: Exclude<ReviewAction, null>) => {
    setAction(nextAction);
    setFeedback("");
    setError("");
    dialogRef.current?.showModal();
  };
  const completeAction = async () => {
    if (!action) return;
    if (
      (action === "needs_changes" ||
        action === "reject" ||
        action === "suspend") &&
      !feedback.trim()
    ) {
      setError(
        action === "needs_changes"
          ? "Enter the changes the applicant needs to make."
          : action === "suspend"
            ? "Enter a reason for suspension."
            : "Enter a reason for rejection.",
      );
      return;
    }
    const status: Extract<
      RegistrationStatus,
      "verified" | "needs_changes" | "rejected" | "suspended"
    > =
      action === "verify"
        ? "verified"
        : action === "needs_changes"
          ? "needs_changes"
          : action === "suspend"
            ? "suspended"
            : "rejected";
    setPending(true);
    setOperationError("");
    try {
      await updateApplicationStatus(applicationId, status, feedback);
      dialogRef.current?.close();
      setAction(null);
    } catch (reviewError: unknown) {
      setOperationError(
        reviewError instanceof Error
          ? reviewError.message
          : "The review decision could not be saved. Please try again.",
      );
      dialogRef.current?.close();
    } finally {
      setPending(false);
    }
  };
  const markUnderReview = async () => {
    setPending(true);
    setOperationError("");
    try {
      await updateApplicationStatus(applicationId, "under_review");
    } catch (reviewError: unknown) {
      setOperationError(
        reviewError instanceof Error
          ? reviewError.message
          : "The application status could not be updated.",
      );
    } finally {
      setPending(false);
    }
  };
  const title =
    action === "verify"
      ? "Verify this organisation?"
      : action === "needs_changes"
        ? "Request changes"
        : action === "suspend"
          ? "Suspend this organisation?"
          : "Reject this registration?";

  return (
    <div className="grid gap-6">
      <Link
        href="/admin/registrations"
        className="text-global-navy focus-visible:ring-focus w-fit text-sm font-semibold underline underline-offset-4"
      >
        ← Back to registration queue
      </Link>
      {operationError ? (
        <p
          role="alert"
          className="border-error/25 bg-error/5 text-error rounded-button border p-4"
        >
          {operationError}
        </p>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-heritage-maroon text-xs font-bold tracking-[0.14em] uppercase">
            Application review
          </p>
          <h1 className="text-global-navy mt-3 text-3xl font-bold sm:text-4xl">
            {application.organisation.name || "Incomplete organisation"}
          </h1>
          <p className="text-slate mt-2">
            {getCategoryLabel(application.organisation.category)}
            <span aria-hidden="true"> · </span>
            {[application.organisation.city, application.organisation.country]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
        <RegistrationStatusBadge status={application.registration.status} />
      </div>
      {application.registration.adminFeedback ? (
        <div className="border-global-navy/12 rounded-card border bg-white p-5">
          <p className="text-global-navy font-bold">Current review feedback</p>
          <p className="text-slate mt-2 leading-7">
            {application.registration.adminFeedback}
          </p>
        </div>
      ) : null}
      {duplicateSignals &&
      (duplicateSignals.nameMatch ||
        duplicateSignals.emailMatch ||
        duplicateSignals.registrationNumberMatch) ? (
        <div
          role="alert"
          className="border-heritage-gold/40 bg-heritage-gold/10 rounded-card border p-5"
        >
          <p className="text-global-navy font-bold">Possible duplicate</p>
          <ul className="text-slate mt-2 list-disc pl-5 text-sm leading-6">
            {duplicateSignals.emailMatch ? (
              <li>Official email matches another organisation.</li>
            ) : null}
            {duplicateSignals.nameMatch ? (
              <li>Similar organisation name already exists.</li>
            ) : null}
            {duplicateSignals.registrationNumberMatch ? (
              <li>Registration number matches another organisation.</li>
            ) : null}
          </ul>
          {duplicateSignals.matches.length > 0 ? (
            <p className="text-slate mt-2 text-sm">
              Matched:{" "}
              {duplicateSignals.matches.map((match) => match.name).join(", ")}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid gap-6">
          {application.organisation.officialEmail ? (
            <OrganisationEmailVerificationCard
              organisationId={application.organisation.id}
              officialEmail={application.organisation.officialEmail}
              verifiedAt={application.organisation.officialEmailVerifiedAt}
              verificationSentAt={
                application.organisation.officialEmailVerificationSentAt
              }
              canRequest={false}
            />
          ) : null}
          <ApplicationDetails application={application} includeTimeline />
        </div>
        <aside
          aria-label="Application review actions"
          className="border-global-navy/12 rounded-card shadow-card order-first border bg-white p-5 xl:sticky xl:top-24 xl:order-last"
        >
          <p className="text-heritage-maroon text-xs font-bold tracking-[0.14em] uppercase">
            Review decision
          </p>
          <div className="border-global-navy/10 mt-4 border-b pb-5">
            <RegistrationStatusBadge status={application.registration.status} />
            <dl className="mt-5 grid gap-4 text-sm">
              <div>
                <dt className="text-slate">Representative</dt>
                <dd className="text-global-navy mt-1 font-semibold">
                  {application.registration.representative.fullName}
                </dd>
              </div>
              <div>
                <dt className="text-slate">Submitted</dt>
                <dd className="text-charcoal mt-1">
                  {formatDate(application.registration.submittedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-slate">Application reference</dt>
                <dd className="text-charcoal mt-1 break-all">
                  {application.registration.id}
                </dd>
              </div>
            </dl>
          </div>
          <div className="mt-5 grid gap-2.5">
            <Button
              onClick={() => openAction("verify")}
              disabled={pending}
              className="bg-success hover:bg-global-navy w-full"
            >
              Verify
            </Button>
            <Button
              variant="secondary"
              onClick={() => openAction("needs_changes")}
              disabled={pending}
              className="w-full"
            >
              Request Changes
            </Button>
            <Button
              variant="ghost"
              onClick={() => void markUnderReview()}
              disabled={
                pending || application.registration.status === "under_review"
              }
              className="w-full"
            >
              Mark Under Review
            </Button>
            <Button
              variant="ghost"
              className="text-heritage-maroon hover:bg-heritage-maroon/7 w-full"
              onClick={() => openAction("reject")}
              disabled={pending}
            >
              Reject
            </Button>
            {application.registration.status === "verified" ||
            application.registration.status === "under_review" ? (
              <Button
                variant="ghost"
                className="text-heritage-maroon hover:bg-heritage-maroon/7 w-full"
                onClick={() => openAction("suspend")}
                disabled={pending}
              >
                Suspend
              </Button>
            ) : null}
          </div>
          <p className="text-slate mt-4 text-xs leading-5">
            Decisions update the applicant&apos;s dashboard and registration
            record.
          </p>
        </aside>
      </div>
      <dialog
        ref={dialogRef}
        aria-labelledby="review-action-title"
        className="backdrop:bg-deep-navy/70 rounded-large shadow-navigation m-auto max-h-[90vh] w-[min(92vw,36rem)] overflow-y-auto border-0 p-0"
        onClose={() => {
          setAction(null);
          setError("");
        }}
      >
        <div className="bg-white p-6 sm:p-8">
          <h2
            id="review-action-title"
            className="text-global-navy text-2xl font-bold"
          >
            {title}
          </h2>
          <p className="text-slate mt-3 leading-7">
            {action === "verify"
              ? "Confirm that the reviewed organisation information meets the current verification requirements."
              : action === "needs_changes"
                ? "Give the representative clear, actionable feedback. It will appear on their dashboard."
                : action === "suspend"
                  ? "Explain why access is being restricted. The reason will appear on the representative's dashboard."
                  : "Explain why this registration was not approved. The reason will appear on the representative's dashboard."}
          </p>
          {action !== "verify" ? (
            <div className="mt-5">
              <TextareaField
                label="Feedback message"
                required
                autoFocus
                value={feedback}
                error={error}
                onChange={(event) => {
                  setFeedback(event.target.value);
                  setError("");
                }}
              />
            </div>
          ) : null}
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => dialogRef.current?.close()}>
              Cancel
            </Button>
            <Button
              className={
                action === "reject" || action === "suspend"
                  ? "bg-heritage-maroon hover:bg-deep-navy"
                  : undefined
              }
              onClick={() => void completeAction()}
              disabled={pending}
              aria-busy={pending}
            >
              {action === "verify"
                ? "Confirm verification"
                : action === "needs_changes"
                  ? "Send change request"
                  : action === "suspend"
                    ? "Confirm suspension"
                    : "Confirm rejection"}
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
