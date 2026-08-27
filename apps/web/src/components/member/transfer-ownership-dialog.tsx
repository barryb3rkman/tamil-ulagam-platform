"use client";

import type {
  ManagerWithProfile,
  PreviousOwnerOutcome,
} from "@tamil-ulagam/shared";
import { Button, Dialog } from "@tamil-ulagam/ui";
import { useState } from "react";

import { useManagementService } from "@/features/management/use-management-service";
import { getPlatformErrorMessage } from "@/lib/supabase/errors";

const outcomeLabel: Record<PreviousOwnerOutcome, string> = {
  admin: "Become an Admin",
  representative: "Become a Representative",
  leave: "Leave management entirely",
};

/**
 * The one deliberately heavier confirmation dialog in G1 (brief section
 * 24) — a two-step form (choose the new owner, choose what happens to
 * you) rather than a single dropdown, since transferring ownership is
 * irreversible without the new owner transferring it back.
 */
export function TransferOwnershipDialog({
  organisationId,
  organisationName,
  candidates,
  onClose,
  onTransferred,
}: {
  readonly organisationId: string;
  readonly organisationName: string;
  readonly candidates: readonly ManagerWithProfile[];
  readonly onClose: () => void;
  readonly onTransferred: () => void;
}) {
  const managementService = useManagementService();
  const [selectedUserId, setSelectedUserId] = useState<string>(
    candidates[0]?.userId ?? "",
  );
  const [outcome, setOutcome] = useState<PreviousOwnerOutcome>("admin");
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const selected = candidates.find((c) => c.userId === selectedUserId);

  const submit = async () => {
    if (!managementService || !selected) return;
    setPending(true);
    setError("");
    try {
      await managementService.transferOwnership(
        organisationId,
        selected.userId,
        outcome,
      );
      onTransferred();
    } catch (caught: unknown) {
      setError(getPlatformErrorMessage(caught));
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open onClose={onClose} title="Transfer ownership">
      <div className="grid gap-6">
        <p className="text-slate leading-7">
          This is a significant, immediate change to {organisationName}. The new
          owner gains full management authority; you will no longer be able to
          undo this yourself unless they transfer ownership back to you.
        </p>

        <div>
          <p className="text-global-navy mb-2 text-sm font-semibold">
            New owner
          </p>
          <ul className="grid gap-2">
            {candidates.map((candidate) => (
              <li key={candidate.userId}>
                <label className="border-global-navy/12 has-checked:border-heritage-gold has-checked:bg-heritage-gold/5 motion-card flex cursor-pointer items-center gap-3 rounded-lg border p-3">
                  <input
                    type="radio"
                    name="transfer-target"
                    value={candidate.userId}
                    checked={selectedUserId === candidate.userId}
                    onChange={() => setSelectedUserId(candidate.userId)}
                  />
                  <span className="text-charcoal text-sm font-semibold">
                    {candidate.fullName || "Unnamed manager"}
                  </span>
                  <span className="text-slate ml-auto text-xs uppercase">
                    Currently {candidate.role}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-global-navy mb-2 text-sm font-semibold">
            What happens to you
          </p>
          <ul className="grid gap-2">
            {(["admin", "representative", "leave"] as const).map((option) => (
              <li key={option}>
                <label className="border-global-navy/12 has-checked:border-heritage-gold has-checked:bg-heritage-gold/5 motion-card flex cursor-pointer items-center gap-3 rounded-lg border p-3">
                  <input
                    type="radio"
                    name="transfer-outcome"
                    value={option}
                    checked={outcome === option}
                    onChange={() => setOutcome(option)}
                  />
                  <span className="text-charcoal text-sm font-semibold">
                    {outcomeLabel[option]}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        {selected ? (
          <div className="border-heritage-gold/40 bg-heritage-gold/8 rounded-card border p-4 text-sm">
            <p className="text-global-navy font-semibold">
              Confirm: {selected.fullName || "This manager"} becomes Owner of{" "}
              {organisationName}. You will {outcomeLabel[outcome].toLowerCase()}
              .
            </p>
          </div>
        ) : null}

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
            className="mt-0.5"
          />
          <span className="text-charcoal">
            I understand this immediately transfers ownership and cannot be
            undone by me alone.
          </span>
        </label>

        {error ? (
          <p role="alert" className="text-error text-sm">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-heritage-maroon hover:bg-deep-navy"
            disabled={pending || !selected || !confirmed}
            aria-busy={pending}
            onClick={() => void submit()}
          >
            {pending ? "Transferring…" : "Transfer ownership"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
