"use client";

import type {
  PartnershipArea,
  PartnershipEnquiry,
  PartnershipHistoryEvent,
  PartnershipStatus,
} from "@tamil-ulagam/shared";
import { partnershipAreas } from "@tamil-ulagam/shared";
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
  partnershipAreaLabels,
  partnershipStatusPresentation,
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

type PartnershipAction = Exclude<PartnershipStatus, "new">;

/** Declining is the only transition that owes the sender an explanation. */
function partnershipNoteRequirement(chosen: PartnershipAction): string | null {
  return chosen === "declined"
    ? "Enter a reason for declining this enquiry."
    : null;
}

export function AdminPartnershipOperations() {
  const { capabilities, service } = useAdminOperations();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("enquiry");
  const requestedStatus = searchParams.get("status");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PartnershipStatus | "all">(
    requestedStatus === "new" ? "new" : "all",
  );
  const [area, setArea] = useState<PartnershipArea | "all">("all");

  const listEnquiries = useMemo(
    () => (service ? () => service.listPartnershipEnquiries() : null),
    [service],
  );
  const listHistory = useMemo(
    () => (service ? (id: string) => service.listPartnershipHistory(id) : null),
    [service],
  );

  const {
    records: enquiries,
    loading,
    error,
    reload,
  } = useAdminRecords<PartnershipEnquiry>({
    enabled: capabilities.canOperateFederation,
    load: listEnquiries,
  });
  const history = useAdminHistory<PartnershipHistoryEvent>({
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
  } = useAdminDecision<PartnershipAction>({
    noteRequirement: partnershipNoteRequirement,
  });

  const selected = enquiries.find((item) => item.id === selectedId) ?? null;
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return enquiries.filter(
      (enquiry) =>
        (!query ||
          enquiry.name.toLowerCase().includes(query) ||
          enquiry.organisationName.toLowerCase().includes(query)) &&
        (status === "all" || enquiry.status === status) &&
        (area === "all" || enquiry.area === area),
    );
  }, [area, enquiries, search, status]);

  const completeAction = () =>
    runDecision(async (chosen, reason) => {
      if (!service || !selected) return;
      await service.transitionPartnership(selected.id, chosen, reason);
      reload();
    });

  if (!capabilities.canOperateFederation)
    return (
      <AdminErrorState message="Federation administrator access is required for partnership operations." />
    );

  return (
    <div className="grid gap-7">
      <AdminPageHeader
        eyebrow="Federation operations"
        title="Partnership enquiries"
        description="Review incoming conversations and record controlled, auditable status changes. An enquiry is never presented as an approved partnership."
      />
      {error ? <AdminErrorState message={error} /> : null}
      {selected ? (
        <PartnershipDetail
          enquiry={selected}
          history={history}
          onAction={beginAction}
        />
      ) : null}
      <section
        aria-label="Partnership filters"
        className="border-global-navy/12 rounded-card grid gap-4 border bg-white p-5 sm:grid-cols-3"
      >
        <TextField
          label="Search name or organisation"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <SelectField
          label="Status"
          value={status}
          options={[
            { value: "all", label: "All statuses" },
            { value: "new", label: "New" },
            { value: "in_discussion", label: "In discussion" },
            { value: "active", label: "Active" },
            { value: "declined", label: "Declined" },
          ]}
          onChange={(event) =>
            setStatus(event.target.value as PartnershipStatus | "all")
          }
        />
        <SelectField
          label="Partnership area"
          value={area}
          options={[
            { value: "all", label: "All areas" },
            ...partnershipAreas.map((item) => ({
              value: item,
              label: partnershipAreaLabels[item],
            })),
          ]}
          onChange={(event) =>
            setArea(event.target.value as PartnershipArea | "all")
          }
        />
      </section>
      <p className="text-slate text-sm" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "enquiry" : "enquiries"}
      </p>
      {loading ? (
        <AdminLoadingState label="Loading partnership enquiries" />
      ) : filtered.length ? (
        <DataTable
          caption="Federation partnership enquiries"
          rows={filtered}
          rowKey={(row) => row.id}
          columns={[
            {
              key: "contact",
              header: "Contact",
              render: (row) => (
                <div className="min-w-0">
                  <p className="text-global-navy font-bold break-words">
                    {row.name}
                  </p>
                  <p className="text-slate mt-1 text-sm break-all">
                    {row.email}
                  </p>
                </div>
              ),
            },
            {
              key: "organisation",
              header: "Organisation",
              render: (row) => (
                <span className="text-charcoal break-words">
                  {row.organisationName || "Not supplied"}
                </span>
              ),
            },
            {
              key: "context",
              header: "Country / area",
              render: (row) => (
                <span className="text-charcoal text-sm">
                  {row.country}
                  <br />
                  <span className="text-slate">
                    {partnershipAreaLabels[row.area]}
                  </span>
                </span>
              ),
            },
            {
              key: "submitted",
              header: "Submitted",
              render: (row) => (
                <span className="text-slate text-sm">
                  {formatOperationalDate(row.createdAt)}
                </span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <StatusBadge {...partnershipStatusPresentation[row.status]} />
              ),
            },
            {
              key: "action",
              header: "Action",
              render: (row) => (
                <Link
                  href={`/admin/partnerships?enquiry=${encodeURIComponent(row.id)}`}
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
          title="No partnership enquiries match these filters"
          description="New public enquiries will appear here after their input has passed the controlled submission boundary."
        />
      )}

      <Dialog
        open={action !== null}
        onClose={() => beginAction(null)}
        title={
          action === "in_discussion"
            ? "Begin discussion?"
            : action === "active"
              ? "Mark partnership active?"
              : "Decline enquiry?"
        }
      >
        <p className="text-slate leading-7">
          {action === "active"
            ? "Confirm that the required Federation agreement and approvals are in place before marking this relationship active."
            : action === "in_discussion"
              ? "This records that the Federation has begun a discussion. It does not establish an active partnership."
              : "Record a clear reason for declining this enquiry."}
        </p>
        <div className="mt-5">
          <TextareaField
            label={
              action === "declined" ? "Reason" : "Operational note (optional)"
            }
            required={action === "declined"}
            value={note}
            error={actionError}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => beginAction(null)}>
            Cancel
          </Button>
          <Button
            disabled={pending}
            aria-busy={pending}
            onClick={() => void completeAction()}
          >
            Confirm status change
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

function PartnershipDetail({
  enquiry,
  history,
  onAction,
}: {
  readonly enquiry: PartnershipEnquiry;
  readonly history: readonly PartnershipHistoryEvent[];
  readonly onAction: (action: PartnershipAction) => void;
}) {
  return (
    <section
      aria-labelledby="partnership-detail-title"
      className="border-heritage-gold/50 rounded-large shadow-card border bg-white p-5 sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-slate text-eyebrow-sm">Enquiry detail</p>
          <h2
            id="partnership-detail-title"
            className="text-global-navy mt-2 text-2xl font-bold"
          >
            {enquiry.organisationName || enquiry.name}
          </h2>
        </div>
        <Link
          href="/admin/partnerships"
          className="focus-visible:ring-focus text-global-navy inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
        >
          Close detail
        </Link>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Detail label="Contact" value={enquiry.name} />
            <Detail label="Email" value={enquiry.email} />
            <Detail
              label="Organisation"
              value={enquiry.organisationName || "Not supplied"}
            />
            <Detail label="Country" value={enquiry.country} />
            <Detail label="Area" value={partnershipAreaLabels[enquiry.area]} />
            <Detail
              label="Submitted"
              value={formatOperationalDate(enquiry.createdAt)}
            />
          </dl>
          <div className="border-global-navy/10 mt-6 border-t pt-5">
            <h3 className="text-global-navy font-bold">Message</h3>
            <p className="text-charcoal mt-3 leading-7 break-words whitespace-pre-wrap">
              {enquiry.message}
            </p>
          </div>
        </div>
        <aside className="bg-warm-ivory rounded-card p-5">
          <StatusBadge {...partnershipStatusPresentation[enquiry.status]} />
          <div className="mt-5 grid gap-2">
            {enquiry.status === "new" ? (
              <Button onClick={() => onAction("in_discussion")}>
                Mark in discussion
              </Button>
            ) : enquiry.status === "in_discussion" ? (
              <>
                <Button onClick={() => onAction("active")}>Mark active</Button>
                <Button
                  variant="secondary"
                  onClick={() => onAction("declined")}
                >
                  Decline enquiry
                </Button>
              </>
            ) : null}
          </div>
          <h3 className="text-global-navy mt-7 font-bold">Status history</h3>
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
                    {partnershipStatusPresentation[event.newStatus].label}
                  </p>
                  <p className="text-slate mt-1 text-sm">
                    {event.actorName} · {formatOperationalDate(event.createdAt)}
                  </p>
                  {event.note ? (
                    <p className="text-charcoal mt-2 text-sm leading-6">
                      {event.note}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-slate mt-3 text-sm">
              No status history is available.
            </p>
          )}
        </aside>
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
    <div className="min-w-0">
      <dt className="text-slate text-xs font-bold tracking-[0.08em] uppercase">
        {label}
      </dt>
      <dd className="text-charcoal mt-1 break-words">{value}</dd>
    </div>
  );
}
