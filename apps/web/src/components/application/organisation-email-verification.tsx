"use client";

import { useState } from "react";

import { ContactGlyph } from "@/components/workspace/panel-glyphs";
import { usePlatform } from "@/features/enrollment/platform-provider";

import { formatDate } from "./application-details";

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
    <section className="border-hairline/[0.09] rounded-card bg-raised relative flex h-full min-h-48 flex-col overflow-hidden border p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-fg-muted text-eyebrow-sm">Trust signal</p>
          <h2 className="text-fg mt-1.5 text-[1.0625rem] font-bold tracking-[-0.01em]">
            Organisation email
          </h2>
        </div>
        <span
          aria-hidden="true"
          className="border-hairline/8 text-fg/35 bg-raised grid size-10 shrink-0 place-items-center rounded-xl border"
        >
          <ContactGlyph />
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <p className="text-fg-body min-w-0 text-sm break-all">
          {officialEmail}
        </p>
        <StatusPill status={status} />
      </div>
      <p className="text-fg-muted mt-3 max-w-xl text-sm leading-6">
        {status === "verified"
          ? `Verified ${verifiedAt ? formatDate(verifiedAt) : ""}. This confirms someone with access to this inbox controls it — separate from your own account sign-in.`
          : status === "pending"
            ? `A verification link was sent ${verificationSentAt ? formatDate(verificationSentAt) : "recently"}. This is a trust signal for reviewers, not required to submit.`
            : "Not yet verified. This is a strong trust signal for reviewers, but is never required to submit your application."}
      </p>
      {canRequest && status !== "verified" ? (
        <div className="mt-auto pt-5">
          <button
            type="button"
            disabled={state === "sending"}
            onClick={() => void send()}
            className="border-hairline/12 text-fg hover:border-heritage-gold/55 hover:bg-heritage-gold/8 focus-visible:ring-focus rounded-button motion-control bg-raised inline-flex min-h-10 items-center border px-3.5 text-sm font-bold disabled:opacity-60"
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
              <p className="text-fg-muted">
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
        : "bg-global-navy/8 text-fg-muted";
  return (
    <span
      className={`rounded-button px-3 py-1 text-xs font-bold tracking-[0.08em] uppercase ${className}`}
    >
      {label}
    </span>
  );
}
