"use client";

import type {
  ManagementHistoryEvent,
  ManagerInvitation,
  ManagerWithProfile,
  OrganizationManagerRole,
} from "@tamil-ulagam/shared";
import {
  Alert,
  Button,
  DataTable,
  Dialog,
  EmptyState,
  Skeleton,
  StatusBadge,
} from "@tamil-ulagam/ui";
import { useEffect, useState } from "react";

import { SelectField, TextField } from "@/components/application/form-fields";
import { useManagementService } from "@/features/management/use-management-service";
import { getPlatformErrorMessage } from "@/lib/supabase/errors";

import { TransferOwnershipDialog } from "./transfer-ownership-dialog";

const roleLabel: Record<OrganizationManagerRole, string> = {
  owner: "Owner",
  admin: "Admin",
  representative: "Representative",
};

const invitationStatusPresentation: Record<
  ManagerInvitation["status"],
  {
    readonly label: string;
    readonly tone: "neutral" | "success" | "warning" | "maroon";
  }
> = {
  pending: { label: "Pending", tone: "warning" },
  accepted: { label: "Accepted", tone: "success" },
  declined: { label: "Declined", tone: "maroon" },
  expired: { label: "Expired", tone: "neutral" },
  revoked: { label: "Revoked", tone: "neutral" },
};

const historyEventLabel: Record<ManagementHistoryEvent["eventType"], string> = {
  invited: "Invitation sent",
  invitation_accepted: "Invitation accepted",
  invitation_declined: "Invitation declined",
  invitation_revoked: "Invitation revoked",
  role_changed: "Role changed",
  manager_removed: "Manager removed",
  manager_left: "Left management",
  ownership_transferred: "Ownership transferred",
};

type ConfirmAction =
  | { readonly kind: "remove"; readonly manager: ManagerWithProfile }
  | { readonly kind: "leave"; readonly manager: ManagerWithProfile }
  | { readonly kind: "revoke"; readonly invitation: ManagerInvitation }
  | {
      readonly kind: "role";
      readonly manager: ManagerWithProfile;
      readonly newRole: "admin" | "representative";
    };

export function OrganisationManagers({
  organisationId,
  organisationName,
  isSangam,
  currentUserId,
}: {
  readonly organisationId: string;
  readonly organisationName: string;
  readonly isSangam: boolean;
  readonly currentUserId: string;
}) {
  const managementService = useManagementService();
  const noun = isSangam ? "Sangam" : "Organisation";

  const [managers, setManagers] = useState<readonly ManagerWithProfile[]>([]);
  const [invitations, setInvitations] = useState<readonly ManagerInvitation[]>(
    [],
  );
  const [history, setHistory] = useState<readonly ManagementHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null,
  );

  const reload = () => {
    if (!managementService) return;
    setLoading(true);
    setError("");
    Promise.all([
      managementService.listManagers(organisationId),
      managementService.listInvitations(organisationId),
    ])
      .then(([managerRows, invitationRows]) => {
        setManagers(managerRows);
        setInvitations(invitationRows);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setError(getPlatformErrorMessage(caught));
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!managementService) return;
    let cancelled = false;
    Promise.all([
      managementService.listManagers(organisationId),
      managementService.listInvitations(organisationId),
    ])
      .then(([managerRows, invitationRows]) => {
        if (cancelled) return;
        setManagers(managerRows);
        setInvitations(invitationRows);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setError(getPlatformErrorMessage(caught));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [managementService, organisationId]);

  useEffect(() => {
    if (!showHistory || !managementService) return;
    managementService
      .listHistory(organisationId)
      .then(setHistory)
      .catch(() => undefined);
  }, [showHistory, managementService, organisationId]);

  if (!managementService) {
    return (
      <Alert tone="info" title="Managers is not available here">
        Management administration is not configured for this deployment.
      </Alert>
    );
  }

  const self = managers.find((manager) => manager.userId === currentUserId);
  const isOwner = self?.role === "owner";
  const isActiveManager = Boolean(self);
  const pendingInvitations = invitations.filter((i) => i.status === "pending");
  const decidedInvitations = invitations.filter((i) => i.status !== "pending");
  const otherActiveManagers = managers.filter(
    (m) => m.userId !== currentUserId,
  );

  if (loading)
    return (
      <div role="status" aria-label="Loading managers" className="grid gap-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-20" />
        ))}
      </div>
    );
  if (error)
    return (
      <Alert tone="error" role="alert">
        {error}
      </Alert>
    );

  return (
    <div className="grid gap-8">
      <div>
        <h2 className="text-global-navy text-xl font-bold">{noun} managers</h2>
        <p className="text-slate mt-2 text-sm leading-6">
          People who can administer this {noun.toLowerCase()}. Management access
          is separate from membership — belonging as a Member never grants
          administrative authority, and management never implies Member
          affiliation.
        </p>
      </div>

      {isOwner ? (
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setInviteOpen(true)}>Invite manager</Button>
          {otherActiveManagers.length > 0 ? (
            <Button variant="secondary" onClick={() => setTransferOpen(true)}>
              Transfer ownership
            </Button>
          ) : null}
        </div>
      ) : null}

      <section aria-labelledby="active-managers-heading">
        <h2
          id="active-managers-heading"
          className="text-global-navy text-lg font-bold"
        >
          Active managers
        </h2>
        <div className="mt-3">
          <DataTable
            caption={`Active managers of ${organisationName}`}
            rows={managers}
            rowKey={(row) => row.id}
            columns={[
              {
                key: "name",
                header: "Manager",
                render: (row) => (
                  <div>
                    <p className="text-global-navy font-bold">
                      {row.userId === currentUserId
                        ? `${row.fullName || "You"} (You)`
                        : row.fullName || "Unnamed manager"}
                    </p>
                  </div>
                ),
              },
              {
                key: "role",
                header: "Role",
                render: (row) => (
                  <span className="text-charcoal text-sm font-semibold">
                    {roleLabel[row.role]}
                  </span>
                ),
              },
              {
                key: "granted",
                header: "Granted",
                render: (row) => (
                  <span className="text-slate text-sm">
                    {new Date(row.grantedAt).toLocaleDateString()}
                  </span>
                ),
              },
              {
                key: "actions",
                header: "Action",
                render: (row) => (
                  <ManagerRowActions
                    manager={row}
                    isOwner={isOwner}
                    isSelf={row.userId === currentUserId}
                    onChangeRole={(newRole) =>
                      setConfirmAction({ kind: "role", manager: row, newRole })
                    }
                    onRemove={() =>
                      setConfirmAction({ kind: "remove", manager: row })
                    }
                    onLeave={() =>
                      setConfirmAction({ kind: "leave", manager: row })
                    }
                  />
                ),
              },
            ]}
          />
        </div>
      </section>

      <section aria-labelledby="pending-invitations-heading">
        <h2
          id="pending-invitations-heading"
          className="text-global-navy text-lg font-bold"
        >
          Pending invitations
        </h2>
        <p className="text-slate mt-1 text-sm">
          An invitation grants no access until the recipient accepts it.
        </p>
        <div className="mt-3">
          {pendingInvitations.length === 0 ? (
            <EmptyState
              title="No pending invitations"
              description="Invitations you send will appear here until they're accepted, declined, or revoked."
            />
          ) : (
            <DataTable
              caption={`Pending management invitations for ${organisationName}`}
              rows={pendingInvitations}
              rowKey={(row) => row.id}
              columns={[
                {
                  key: "email",
                  header: "Email",
                  render: (row) => (
                    <span className="text-charcoal text-sm break-all">
                      {row.email}
                    </span>
                  ),
                },
                {
                  key: "role",
                  header: "Invited role",
                  render: (row) => (
                    <span className="text-charcoal text-sm font-semibold">
                      {roleLabel[row.role]}
                    </span>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (row) => (
                    <StatusBadge
                      {...invitationStatusPresentation[row.status]}
                    />
                  ),
                },
                {
                  key: "invited",
                  header: "Invited",
                  render: (row) => (
                    <span className="text-slate text-sm">
                      {new Date(row.invitedAt).toLocaleDateString()}
                    </span>
                  ),
                },
                {
                  key: "actions",
                  header: "Action",
                  render: (row) =>
                    isOwner ? (
                      <Button
                        variant="ghost"
                        className="text-heritage-maroon hover:bg-heritage-maroon/7"
                        onClick={() =>
                          setConfirmAction({ kind: "revoke", invitation: row })
                        }
                      >
                        Revoke
                      </Button>
                    ) : null,
                },
              ]}
            />
          )}
        </div>
      </section>

      {isActiveManager ? (
        <section aria-labelledby="management-history-heading">
          <button
            type="button"
            onClick={() => setShowHistory((current) => !current)}
            aria-expanded={showHistory}
            className="focus-visible:ring-focus text-global-navy rounded-button inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 focus-visible:outline-none"
          >
            <span id="management-history-heading">
              {showHistory
                ? "Hide management history"
                : "View management history"}
            </span>
          </button>
          {showHistory ? (
            <div className="mt-4">
              {decidedInvitations.length === 0 && history.length === 0 ? (
                <EmptyState
                  title="No management history yet"
                  description="Invitations, role changes, removals, and ownership transfers will appear here."
                />
              ) : history.length === 0 ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <ul className="surface-card divide-global-navy/10 divide-y px-5">
                  {history.map((event) => (
                    <li key={event.id} className="py-3">
                      <p className="text-charcoal text-sm font-semibold">
                        {historyEventLabel[event.eventType]}
                        {event.managerName ? ` — ${event.managerName}` : ""}
                      </p>
                      <p className="text-slate mt-0.5 text-xs">
                        {new Date(event.createdAt).toLocaleString()}
                        {event.actorName && event.actorName !== "System"
                          ? ` · by ${event.actorName}`
                          : ""}
                      </p>
                      {event.note ? (
                        <p className="text-slate mt-1 text-sm">{event.note}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </section>
      ) : null}

      {inviteOpen ? (
        <InviteManagerDialog
          organisationId={organisationId}
          onClose={() => setInviteOpen(false)}
          onInvited={() => {
            setInviteOpen(false);
            reload();
          }}
        />
      ) : null}

      {transferOpen ? (
        <TransferOwnershipDialog
          organisationId={organisationId}
          organisationName={organisationName}
          candidates={otherActiveManagers}
          onClose={() => setTransferOpen(false)}
          onTransferred={() => {
            setTransferOpen(false);
            reload();
          }}
        />
      ) : null}

      {confirmAction ? (
        <ConfirmActionDialog
          action={confirmAction}
          organisationId={organisationId}
          onClose={() => setConfirmAction(null)}
          onDone={() => {
            setConfirmAction(null);
            reload();
          }}
        />
      ) : null}
    </div>
  );
}

function ManagerRowActions({
  manager,
  isOwner,
  isSelf,
  onChangeRole,
  onRemove,
  onLeave,
}: {
  readonly manager: ManagerWithProfile;
  readonly isOwner: boolean;
  readonly isSelf: boolean;
  readonly onChangeRole: (role: "admin" | "representative") => void;
  readonly onRemove: () => void;
  readonly onLeave: () => void;
}) {
  if (manager.role === "owner") return null;
  if (isOwner && !isSelf) {
    const otherRole = manager.role === "admin" ? "representative" : "admin";
    return (
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" onClick={() => onChangeRole(otherRole)}>
          Make {roleLabel[otherRole]}
        </Button>
        <Button
          variant="ghost"
          className="text-heritage-maroon hover:bg-heritage-maroon/7"
          onClick={onRemove}
        >
          Remove
        </Button>
      </div>
    );
  }
  if (isSelf) {
    return (
      <Button
        variant="ghost"
        className="text-heritage-maroon hover:bg-heritage-maroon/7"
        onClick={onLeave}
      >
        Leave management
      </Button>
    );
  }
  return null;
}

function InviteManagerDialog({
  organisationId,
  onClose,
  onInvited,
}: {
  readonly organisationId: string;
  readonly onClose: () => void;
  readonly onInvited: () => void;
}) {
  const managementService = useManagementService();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "representative">("admin");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!managementService) return;
    setPending(true);
    setError("");
    try {
      await managementService.inviteManager(organisationId, email, role);
      onInvited();
    } catch (caught: unknown) {
      setError(getPlatformErrorMessage(caught));
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open onClose={onClose} title="Invite a manager">
      <form onSubmit={(event) => void submit(event)} className="grid gap-5">
        <p className="text-slate text-sm leading-6">
          Management access is separate from membership — invite someone by
          email regardless of whether they already belong as a Member.
        </p>
        {error ? (
          <p role="alert" className="text-error text-sm">
            {error}
          </p>
        ) : null}
        <TextField
          label="Email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <SelectField
          label="Role"
          required
          value={role}
          options={[
            { value: "admin", label: "Admin" },
            { value: "representative", label: "Representative" },
          ]}
          onChange={(event) =>
            setRole(event.target.value as "admin" | "representative")
          }
        />
        <p className="text-slate text-xs leading-5">
          Email delivery is not configured yet — the invitation is created
          immediately and the recipient will see it after signing in, but no
          email is sent.
        </p>
        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={pending} aria-busy={pending}>
            {pending ? "Sending…" : "Send invitation"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function ConfirmActionDialog({
  action,
  organisationId,
  onClose,
  onDone,
}: {
  readonly action: ConfirmAction;
  readonly organisationId: string;
  readonly onClose: () => void;
  readonly onDone: () => void;
}) {
  const managementService = useManagementService();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const title =
    action.kind === "remove"
      ? "Remove this manager?"
      : action.kind === "leave"
        ? "Leave management?"
        : action.kind === "revoke"
          ? "Revoke this invitation?"
          : `Change role to ${roleLabel[action.newRole]}?`;

  const description =
    action.kind === "remove"
      ? "They will immediately lose management access. If they are separately an approved Member, their membership is not affected."
      : action.kind === "leave"
        ? "You will immediately lose management access to this organisation. Any ordinary Membership you hold is not affected."
        : action.kind === "revoke"
          ? "The invitation can no longer be accepted."
          : "The management history will record this change.";

  const confirmLabel =
    action.kind === "remove"
      ? "Remove manager"
      : action.kind === "leave"
        ? "Leave management"
        : action.kind === "revoke"
          ? "Revoke invitation"
          : "Confirm role change";

  const submit = async () => {
    if (!managementService) return;
    setPending(true);
    setError("");
    try {
      if (action.kind === "remove") {
        await managementService.removeManager(
          organisationId,
          action.manager.userId,
        );
      } else if (action.kind === "leave") {
        await managementService.leaveManagement(organisationId);
      } else if (action.kind === "revoke") {
        await managementService.revokeInvitation(action.invitation.id);
      } else {
        await managementService.changeManagerRole(
          organisationId,
          action.manager.userId,
          action.newRole,
        );
      }
      onDone();
    } catch (caught: unknown) {
      setError(getPlatformErrorMessage(caught));
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open onClose={onClose} title={title}>
      <p className="text-slate leading-7">{description}</p>
      {error ? (
        <p role="alert" className="text-error mt-4">
          {error}
        </p>
      ) : null}
      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className={
            action.kind === "remove" ||
            action.kind === "leave" ||
            action.kind === "revoke"
              ? "bg-heritage-maroon hover:bg-deep-navy"
              : undefined
          }
          disabled={pending}
          aria-busy={pending}
          onClick={() => void submit()}
        >
          {pending ? "Saving…" : confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
