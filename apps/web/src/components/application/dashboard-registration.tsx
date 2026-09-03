"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { usePlatform } from "@/features/enrollment/platform-provider";

import { ApplicationDetails } from "./application-details";
import { OrganisationEmailVerificationCard } from "./organisation-email-verification";
import { RegistrationStatusBadge } from "./registration-status-badge";

export function DashboardRegistration() {
  const {
    completeOrganisationEmailVerification,
    currentApplication,
    isHydrated,
  } = usePlatform();
  const searchParams = useSearchParams();
  const [verificationNotice, setVerificationNotice] = useState("");
  const consumedRef = useRef(false);

  useEffect(() => {
    const token = searchParams.get("verify_org_email");
    const organisationId = searchParams.get("organisation");
    if (!token || !organisationId || consumedRef.current) return;
    consumedRef.current = true;
    void completeOrganisationEmailVerification(organisationId, token).then(
      (verified) => {
        setVerificationNotice(
          verified
            ? "Organisation email verified."
            : "This verification link is invalid or has expired.",
        );
      },
    );
  }, [completeOrganisationEmailVerification, searchParams]);

  if (!isHydrated) return <p role="status">Loading registration…</p>;
  if (!currentApplication)
    return (
      <div className="rounded-card shadow-card bg-white p-7">
        <h1 className="text-global-navy text-3xl font-bold">
          No organisation registration
        </h1>
        <Link
          href="/register"
          className="text-global-navy mt-4 inline-flex font-semibold underline underline-offset-4"
        >
          Start registration
        </Link>
      </div>
    );
  const canEdit = ["draft", "needs_changes"].includes(
    currentApplication.registration.status,
  );
  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-heritage-maroon text-eyebrow-sm">
            Registration record
          </p>
          <h1 className="text-global-navy mt-3 text-3xl font-bold">
            {currentApplication.organisation.name ||
              "Organisation registration"}
          </h1>
          <p className="text-slate mt-3 max-w-2xl leading-7">
            Review the organisation information and application history held in
            your registration record.
          </p>
        </div>
        <RegistrationStatusBadge
          status={currentApplication.registration.status}
        />
      </div>
      {currentApplication.registration.adminFeedback ? (
        <div className="border-warning/30 bg-warning/8 rounded-card border p-5">
          <p className="text-warning font-bold">Review feedback</p>
          <p className="mt-2 leading-7">
            {currentApplication.registration.adminFeedback}
          </p>
        </div>
      ) : null}
      {verificationNotice ? (
        <p role="status" className="text-charcoal text-sm font-semibold">
          {verificationNotice}
        </p>
      ) : null}
      {currentApplication.organisation.officialEmail ? (
        <OrganisationEmailVerificationCard
          organisationId={currentApplication.organisation.id}
          officialEmail={currentApplication.organisation.officialEmail}
          verifiedAt={currentApplication.organisation.officialEmailVerifiedAt}
          verificationSentAt={
            currentApplication.organisation.officialEmailVerificationSentAt
          }
          canRequest
        />
      ) : null}
      <ApplicationDetails application={currentApplication} includeTimeline />
      {canEdit ? (
        <Link
          href="/register"
          className="bg-global-navy rounded-button inline-flex w-fit px-5 py-3 font-semibold text-white"
        >
          Edit registration
        </Link>
      ) : (
        <p className="text-slate rounded-button border-global-navy/12 border bg-white p-4 text-sm leading-6">
          This record is read-only while the application has its current status.
          If the review team requests changes, editing will become available.
        </p>
      )}
    </div>
  );
}
