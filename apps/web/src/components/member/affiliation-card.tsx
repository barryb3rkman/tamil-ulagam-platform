"use client";

import { Dialog, StatusBadge, Surface } from "@tamil-ulagam/ui";
import {
  isTamilSangam,
  type EligibleOrganisation,
  type Membership,
} from "@tamil-ulagam/shared";
import Link from "next/link";
import { useState } from "react";

import { OrganisationMark, SangamMark } from "@/components/join/journey-icons";
import { useMembershipService } from "@/features/membership/use-membership-service";

import {
  organisationKindLabel,
  organisationLocationLabel,
} from "./organisation-presentation";

const statusPresentation: Record<
  Membership["status"],
  {
    readonly label: string;
    readonly tone: "neutral" | "success" | "warning" | "maroon";
  }
> = {
  pending: { label: "Pending review", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Not approved", tone: "neutral" },
  revoked: { label: "Ended", tone: "neutral" },
};

function formatDate(value: string | null): string {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function AffiliationCard({
  organisation,
  membership,
  onLeft,
}: {
  readonly organisation: EligibleOrganisation;
  readonly membership: Membership;
  readonly onLeft?: (membership: Membership) => void;
}) {
  const membershipService = useMembershipService();
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  const [reason, setReason] = useState<string | null>(null);
  const isSangam = isTamilSangam(organisation);
  const Icon = isSangam ? SangamMark : OrganisationMark;
  const presentation = statusPresentation[membership.status];

  const loadReason = async () => {
    if (!membershipService || reason !== null) return;
    try {
      const history = await membershipService.listMembershipHistory(
        membership.id,
      );
      const decision = history.find((event) => event.note);
      setReason(decision?.note || "No reason was recorded.");
    } catch {
      setReason("The explanation could not be loaded.");
    }
  };

  const confirmLeave = async () => {
    if (!membershipService) return;
    setLeaving(true);
    setError("");
    try {
      const updated = await membershipService.leaveMembership(membership.id);
      setConfirmingLeave(false);
      onLeft?.(updated);
    } catch (leaveError: unknown) {
      setError(
        leaveError instanceof Error
          ? leaveError.message
          : "The membership could not be left. Please try again.",
      );
    } finally {
      setLeaving(false);
    }
  };

  return (
    <Surface
      level="card"
      density="comfortable"
      className="border-global-navy/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className={
              isSangam
                ? "bg-teal-depth/12 text-teal-depth grid size-10 shrink-0 place-items-center rounded-full"
                : "bg-heritage-gold/12 text-heritage-gold grid size-10 shrink-0 place-items-center rounded-full"
            }
          >
            <Icon className="size-5" />
          </span>
          <div>
            <p className="text-heritage-maroon text-xs font-bold tracking-[0.1em] uppercase">
              {organisationKindLabel(organisation)}
            </p>
            <h3 className="text-global-navy mt-1 text-lg font-bold">
              {organisation.name}
            </h3>
            <p className="text-slate mt-0.5 text-sm">
              {organisationLocationLabel(organisation)}
            </p>
          </div>
        </div>
        <StatusBadge label={presentation.label} tone={presentation.tone} />
      </div>

      <div className="text-slate mt-4 text-sm">
        {membership.status === "approved" && membership.decidedAt ? (
          <p>Member since {formatDate(membership.decidedAt)}</p>
        ) : membership.status === "pending" ? (
          <p>
            Requested{" "}
            {formatDate(membership.requestedAt ?? membership.invitedAt)}
          </p>
        ) : membership.status === "rejected" ? (
          <div>
            <p>Reviewed {formatDate(membership.decidedAt)}</p>
            {reason === null ? (
              <button
                type="button"
                onClick={loadReason}
                className="text-global-navy focus-visible:ring-focus rounded-button mt-1 text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none"
              >
                See why
              </button>
            ) : (
              <p className="text-charcoal mt-1">{reason}</p>
            )}
          </div>
        ) : (
          <p>Ended {formatDate(membership.decidedAt)}</p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        {membership.status === "approved" ? (
          <button
            type="button"
            onClick={() => setConfirmingLeave(true)}
            className="text-heritage-maroon focus-visible:ring-focus rounded-button text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none"
          >
            Leave organisation
          </button>
        ) : membership.status === "rejected" ||
          membership.status === "revoked" ? (
          <Link
            href="/join/member"
            className="text-global-navy focus-visible:ring-focus rounded-button text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none"
          >
            Request again
          </Link>
        ) : null}
      </div>

      <Dialog
        open={confirmingLeave}
        onClose={() => setConfirmingLeave(false)}
        title={`Leave ${organisation.name}?`}
      >
        <p className="text-slate text-sm leading-6">
          Your affiliation will end. Any organisation-management permissions you
          separately hold are not affected. You may request membership again
          later if the organisation allows it.
        </p>
        {error ? (
          <p role="alert" className="text-error mt-3 text-sm font-semibold">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={confirmLeave}
            disabled={leaving}
            aria-busy={leaving}
            className="bg-heritage-maroon hover:bg-deep-navy focus-visible:ring-focus rounded-button motion-control inline-flex min-h-10 items-center px-4 text-sm font-semibold text-white focus-visible:outline-none disabled:opacity-60"
          >
            {leaving ? "Leaving…" : "Confirm leave"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmingLeave(false)}
            disabled={leaving}
            className="text-global-navy focus-visible:ring-focus rounded-button text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none"
          >
            Cancel
          </button>
        </div>
      </Dialog>
    </Surface>
  );
}
