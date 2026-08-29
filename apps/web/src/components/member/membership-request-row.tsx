"use client";

import { StatusBadge } from "@tamil-ulagam/ui";
import type { MembershipRequestSummary } from "@tamil-ulagam/shared";
import { useState } from "react";

const statusPresentation: Record<
  MembershipRequestSummary["status"],
  {
    readonly label: string;
    readonly tone: "neutral" | "success" | "warning" | "maroon";
  }
> = {
  pending: { label: "Pending confirmation", tone: "warning" },
  approved: { label: "Active", tone: "success" },
  rejected: { label: "Not confirmed", tone: "neutral" },
  revoked: { label: "Ended", tone: "neutral" },
};

function formatDate(value: string | null): string {
  if (!value) return "Unknown date";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Unknown date";
  }
}

function locationLabel(request: MembershipRequestSummary): string {
  return [request.memberCity, request.memberRegion, request.memberCountry]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

/**
 * One pending affiliation confirmation in the manager's People queue
 * (H4 brief section 21) — "Confirm member"/"Not a member", never
 * "Approve join request". Shows only what a manager is permitted to see
 * (full name/phone/location via the profiles RLS policy the service
 * layer already enforces, email captured directly on the affiliation
 * row at submission time) plus the category-aware connection answer,
 * when one was asked.
 */
export function MembershipRequestRow({
  onApprove,
  onReject,
  request,
}: {
  readonly request: MembershipRequestSummary;
  readonly onApprove: (request: MembershipRequestSummary) => Promise<void>;
  readonly onReject: (request: MembershipRequestSummary) => Promise<void>;
}) {
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");
  const presentation = statusPresentation[request.status];
  const location = locationLabel(request);

  const act = async (action: "approve" | "reject") => {
    setBusy(action);
    setError("");
    try {
      await (action === "approve" ? onApprove(request) : onReject(request));
    } catch (actionError: unknown) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : `That decision could not be completed.`,
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="border-global-navy/10 density-compact grid gap-3 border-b py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
      <div className="min-w-0">
        <p className="text-global-navy font-semibold">
          {request.memberFullName || "Member"}
        </p>
        <p className="text-slate mt-0.5 text-sm break-words">
          {[request.memberEmail, request.memberPhone]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {location ? <p className="text-slate text-sm">{location}</p> : null}
        {request.connectionType ? (
          <p className="text-charcoal mt-1 text-sm">
            {request.connectionType}
            {request.connectionContext ? ` — ${request.connectionContext}` : ""}
            {request.connectionContextExtra
              ? ` (${request.connectionContextExtra})`
              : ""}
          </p>
        ) : null}
        <p className="text-slate mt-1 text-sm">
          Submitted {formatDate(request.requestedAt ?? request.invitedAt)}
        </p>
        {error ? (
          <p role="alert" className="text-error mt-1 text-sm font-semibold">
            {error}
          </p>
        ) : null}
      </div>
      <StatusBadge label={presentation.label} tone={presentation.tone} />
      {request.status === "pending" ? (
        <div className="flex items-center gap-3 sm:justify-end">
          <button
            type="button"
            onClick={() => act("approve")}
            disabled={busy !== null}
            aria-busy={busy === "approve"}
            className="bg-success hover:bg-success/85 focus-visible:ring-focus rounded-button motion-control inline-flex min-h-9 items-center px-4 text-sm font-semibold text-white focus-visible:outline-none disabled:opacity-60"
          >
            {busy === "approve" ? "Confirming…" : "Confirm member"}
          </button>
          <button
            type="button"
            onClick={() => act("reject")}
            disabled={busy !== null}
            aria-busy={busy === "reject"}
            className="border-heritage-maroon text-heritage-maroon hover:bg-heritage-maroon rounded-button motion-control inline-flex min-h-9 items-center border px-4 text-sm font-semibold hover:text-white focus-visible:outline-none disabled:opacity-60"
          >
            {busy === "reject" ? "Saving…" : "Not a member"}
          </button>
        </div>
      ) : (
        <span aria-hidden="true" />
      )}
    </div>
  );
}
