"use client";

import { useState } from "react";

import { usePlatform } from "@/features/enrollment/platform-provider";

import { formatDate } from "./application-details";

/**
 * Organisation-email verification is a distinct trust signal from
 * Supabase account-email confirmation: it proves control of the
 * organisation's declared official contact inbox, not the signed-in
 * person's own login email. It is never required to submit or progress
 * an application — only ever a strong, admin-visible signal.
 */
export function OrganisationEmailVerificationCard({
  organisationId,
  officialEmail,
  verifiedAt,
  verificationSentAt,
  canRequest,
}: {
  readonly organisationId: string;
  readonly officialEmail: string;
  readonly verifiedAt: string | null;
  readonly verificationSentAt: string | null;
  readonly canRequest: boolean;
}) {
  const { requestOrganisationEmailVerification } = usePlatform();
  const [state, setState] = useState<
    "idle" | "sending" | "sent" | "not_configured" | "error"
  >("idle");

  const status = verifiedAt
    ? "verified"
    : verificationSentAt
      ? "pending"
      : "not_verified";

  const send = async () => {
    setState("sending");
    const result = await requestOrganisationEmailVerification(organisationId);
    if (result.ok) {
      setState("sent");
      return;
    }
    setState(result.reason === "not_configured" ? "not_configured" : "error");
  };

  return (
    <section className="border-global-navy/12 rounded-card border bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-global-navy text-lg font-bold">
            Organisation email
          </h2>
          <p className="text-charcoal mt-1 break-all">{officialEmail}</p>
        </div>
        <StatusPill status={status} />
      </div>
      <p className="text-slate mt-3 max-w-xl text-sm leading-6">
        {status === "verified"
          ? `Verified ${verifiedAt ? formatDate(verifiedAt) : ""}. This confirms someone with access to this inbox controls it — separate from your own account sign-in.`
          : status === "pending"
            ? `A verification link was sent ${verificationSentAt ? formatDate(verificationSentAt) : "recently"}. This is a trust signal for reviewers, not required to submit.`
            : "Not yet verified. This is a strong trust signal for reviewers, but is never required to submit your application."}
      </p>
      {canRequest && status !== "verified" ? (
        <div className="mt-4">
          <button
            type="button"
            disabled={state === "sending"}
            onClick={() => void send()}
            className="border-global-navy text-global-navy focus-visible:ring-focus rounded-button min-h-11 border px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {state === "sending"
              ? "Sending…"
              : status === "pending"
                ? "Resend verification"
                : "Send verification"}
          </button>
          <div aria-live="polite" className="mt-2 text-sm">
            {state === "sent" ? (
              <p className="text-success">
                Verification email sent to {officialEmail}.
              </p>
            ) : null}
            {state === "not_configured" ? (
              <p className="text-slate">
                Email verification sending isn&apos;t configured for this
                environment yet. Your request has been noted — try again once
                it&apos;s available.
              </p>
            ) : null}
            {state === "error" ? (
              <p className="text-error">
                The verification request couldn&apos;t be sent. Please try
                again.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function StatusPill({
  status,
}: {
  readonly status: "verified" | "pending" | "not_verified";
}) {
  const label =
    status === "verified"
      ? "Verified"
      : status === "pending"
        ? "Verification pending"
        : "Not verified";
  const className =
    status === "verified"
      ? "bg-success/10 text-success"
      : status === "pending"
        ? "bg-warning/10 text-warning"
        : "bg-global-navy/8 text-slate";
  return (
    <span
      className={`rounded-button px-3 py-1 text-xs font-bold tracking-[0.08em] uppercase ${className}`}
    >
      {label}
    </span>
  );
}
