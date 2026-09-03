"use client";

import type {
  AdminMembershipSummary,
  MembershipHistoryEvent,
  MembershipStatus,
} from "@tamil-ulagam/shared";
import { Button, DataTable, Dialog, StatusBadge } from "@tamil-ulagam/ui";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import {
  SelectField,
  TextareaField,
  TextField,
} from "@/components/application/form-fields";
import { useAdminOperations } from "@/features/admin/admin-operations-provider";
import {
  formatOperationalDate,
  membershipStatusPresentation,
} from "@/features/admin/admin-presentation";

import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminPageHeader,
} from "./admin-primitives";
import {
  useAdminDecision,
  useAdminHistory,
  useAdminRecords,
} from "@/features/admin/use-admin-records";

type MembershipAction = "approve" | "reject" | "revoke";

/** Turning someone down or taking access away has to be explained. */
function membershipNoteRequirement(chosen: MembershipAction): string | null {
  return chosen === "reject" || chosen === "revoke"
    ? "Enter a clear reason for this decision."
    : null;
}

export function AdminMembershipOperations() {
  const { capabilities, service } = useAdminOperations();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("membership");
  const requestedStatus = searchParams.get("status");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<MembershipStatus | "all">(
    requestedStatus === "pending" ? "pending" : "all",
  );
  const [kind, setKind] = useState<"all" | "organisation" | "sangam">("all");

  const listMemberships = useMemo(
    () => (service ? () => service.listMemberships() : null),
    [service],
  );
  const listHistory = useMemo(
    () => (service ? (id: string) => service.listMembershipHistory(id) : null),
    [service],
  );

  const {
    records: memberships,
    loading,
    error,
    reload,
  } = useAdminRecords<AdminMembershipSummary>({
    enabled: capabilities.canOperateFederation,
    load: listMemberships,
  });
  const history = useAdminHistory<MembershipHistoryEvent>({
    load: listHistory,
    recordId: selectedId,
  });
  const {
    action,
    begin: beginAction,
    error: actionError,
    note,
    pending,
    run: runDecision,
    setNote,
  } = useAdminDecision<MembershipAction>({
    noteRequirement: membershipNoteRequirement,
  });

  const selected = memberships.find((item) => item.id === selectedId) ?? null;
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return memberships.filter(
      (membership) =>
        (!query ||
          membership.memberFullName.toLowerCase().includes(query) ||
          membership.organisationName.toLowerCase().includes(query)) &&
        (status === "all" || membership.status === status) &&
        (kind === "all" || membership.organisationKind === kind),
    );
  }, [kind, memberships, search, status]);

  const completeAction = () =>
    runDecision(async (chosen, reason) => {
      if (!service || !selected) return;
      await service.decideMembership(selected.id, chosen, reason);
      reload();
    });

  if (!capabilities.canOperateFederation)
    return (
      <AdminErrorState message="Federation administrator access is required for membership operations." />
    );

  return (
    <div className="grid gap-7">
      <AdminPageHeader
        eyebrow="Federation operations"
        title="Memberships"
        description="Inspect affiliation requests and apply only the existing secure Admin escalation actions. Membership does not grant management authority."
      />
      {error ? <AdminErrorState message={error} /> : null}
      {selected ? (
        <MembershipDetail
          membership={selected}
          history={history}
          onAction={(nextAction) => {
            beginAction(nextAction);
          }}
        />
      ) : null}
      <section
        aria-label="Membership filters"
        className="border-global-navy/12 rounded-card grid gap-4 border bg-white p-5 sm:grid-cols-3"
      >
        <TextField
          label="Search member or organisation"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <SelectField
          label="Status"
          value={status}
          options={[
            { value: "all", label: "All statuses" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
            { value: "revoked", label: "Revoked" },
          ]}
          onChange={(event) =>
            setStatus(event.target.value as MembershipStatus | "all")
          }
        />
        <SelectField
          label="Entity type"
          value={kind}
          options={[
            { value: "all", label: "Organisations and Sangams" },
            { value: "organisation", label: "Organisations" },
            { value: "sangam", label: "Tamil Sangams" },
          ]}
          onChange={(event) => setKind(event.target.value as typeof kind)}
        />
      </section>
      <p className="text-slate text-sm" aria-live="polite">
        {filtered.length} membership{" "}
        {filtered.length === 1 ? "record" : "records"}
      </p>
      {loading ? (
        <AdminLoadingState label="Loading membership operations" />
      ) : filtered.length ? (
        <DataTable
          caption="Federation membership operations"
          rows={filtered}
          rowKey={(row) => row.id}
          columns={[
            {
              key: "member",
              header: "Member",
              render: (row) => (
                <div className="min-w-0">
                  <p className="text-global-navy font-bold break-words">
                    {row.memberFullName}
                  </p>
                  <p className="text-slate mt-1 text-sm break-all">
                    {row.memberEmail}
                  </p>
                </div>
              ),
            },
            {
              key: "organisation",
              header: "Organisation / Sangam",
              render: (row) => (
                <div>
                  <p className="text-charcoal font-semibold break-words">
                    {row.organisationName}
                  </p>
                  <p className="text-slate mt-1 text-xs">
                    {row.organisationKind === "sangam"
                      ? "Tamil Sangam"
                      : "Organisation"}
                  </p>
                </div>
              ),
            },
            {
              key: "requested",
              header: "Requested",
              render: (row) => (
                <span className="text-slate text-sm">
                  {formatOperationalDate(row.requestedAt ?? row.invitedAt)}
                </span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <StatusBadge {...membershipStatusPresentation[row.status]} />
              ),
            },
            {
              key: "action",
              header: "Action",
              render: (row) => (
                <Link
                  href={`/admin/memberships?membership=${encodeURIComponent(row.id)}`}
                  className="focus-visible:ring-focus text-global-navy decoration-heritage-gold inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
                >
                  Inspect
                </Link>
              ),
            },
          ]}
        />
      ) : (
        <AdminEmptyState
          title="No membership activity matches these filters"
          description="Pending and decided affiliation records will appear here without being mixed with manager authority."
        />
      )}

      <Dialog
        open={action !== null}
        onClose={() => beginAction(null)}
        title={
          action === "approve"
            ? "Confirm this member?"
            : action === "reject"
              ? "Mark as not a member?"
              : "Revoke affiliation?"
        }
      >
        <p className="text-slate leading-7">
          {action === "approve"
            ? "Confirm this affiliation claim. This does not grant Organisation management authority."
            : "Record a clear reason for the member and the immutable history."}
        </p>
        {action !== "approve" ? (
          <div className="mt-5">
            <TextareaField
              label="Decision note"
              required
              value={note}
              error={actionError}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        ) : actionError ? (
          <p role="alert" className="text-error mt-4">
            {actionError}
          </p>
        ) : null}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => beginAction(null)}>
            Cancel
          </Button>
          <Button
            disabled={pending}
            aria-busy={pending}
            onClick={() => void completeAction()}
          >
            {action === "approve"
              ? "Confirm member"
              : action === "reject"
                ? "Not a member"
                : "Confirm revocation"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

function MembershipDetail({
  membership,
  history,
  onAction,
}: {
  readonly membership: AdminMembershipSummary;
  readonly history: readonly MembershipHistoryEvent[];
  readonly onAction: (action: MembershipAction) => void;
}) {
  return (
    <section
      aria-labelledby="membership-detail-title"
      className="border-heritage-gold/50 rounded-large shadow-card border bg-white p-5 sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-slate text-[0.64rem] font-bold tracking-[0.16em] uppercase">
            Affiliation detail
          </p>
          <h2
            id="membership-detail-title"
            className="text-global-navy mt-2 text-2xl font-bold"
          >
            {membership.memberFullName}
          </h2>
          <p className="text-slate mt-1 break-words">
            {membership.organisationName}
          </p>
        </div>
        <Link
          href="/admin/memberships"
          className="focus-visible:ring-focus text-global-navy inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
        >
          Close detail
        </Link>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="bg-warm-ivory rounded-card p-5">
          <StatusBadge {...membershipStatusPresentation[membership.status]} />
          <dl className="mt-5 grid gap-4">
            <Detail label="Member email" value={membership.memberEmail} />
            <Detail
              label="Membership type"
              value={membership.membershipType || "General"}
            />
            <Detail
              label="Requested"
              value={formatOperationalDate(
                membership.requestedAt ?? membership.invitedAt,
              )}
            />
            <Detail
              label="Decided"
              value={formatOperationalDate(membership.decidedAt)}
            />
            <Detail
              label="Decision actor"
              value={membership.decidedByName || "Not decided"}
            />
          </dl>
          <div className="mt-6 grid gap-2">
            {membership.status === "pending" ? (
              <>
                <Button onClick={() => onAction("approve")}>
                  Confirm member
                </Button>
                <Button variant="secondary" onClick={() => onAction("reject")}>
                  Not a member
                </Button>
              </>
            ) : membership.status === "approved" ? (
              <Button variant="secondary" onClick={() => onAction("revoke")}>
                Revoke affiliation
              </Button>
            ) : null}
          </div>
        </div>
        <div>
          <h3 className="text-global-navy font-bold">Application history</h3>
          {history.length ? (
            <ol className="border-global-navy/10 mt-4 grid gap-0 border-l pl-5">
              {history.map((event) => (
                <li
                  key={event.id}
                  className="border-global-navy/10 relative border-b py-4 first:pt-0 last:border-b-0"
                >
                  <span
                    aria-hidden="true"
                    className="bg-heritage-gold absolute top-5 -left-[1.45rem] size-2 rounded-full"
                  />
                  <p className="text-global-navy font-semibold">
                    {membershipStatusPresentation[event.newStatus].label}
                  </p>
                  <p className="text-slate mt-1 text-sm">
                    {formatOperationalDate(event.createdAt)}
                  </p>
                  {event.note ? (
                    <p className="text-charcoal mt-2 leading-6">{event.note}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-slate mt-4">
              No membership decisions have been recorded yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Detail({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div>
      <dt className="text-slate text-xs font-bold tracking-[0.08em] uppercase">
        {label}
      </dt>
      <dd className="text-charcoal mt-1 break-words">{value}</dd>
    </div>
  );
}
