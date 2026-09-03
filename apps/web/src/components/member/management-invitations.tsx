"use client";

import type {
  MyManagementInvitation,
  OrganizationManagerRole,
} from "@tamil-ulagam/shared";
import {
  Alert,
  Button,
  Container,
  EmptyState,
  Skeleton,
} from "@tamil-ulagam/ui";
import Link from "next/link";
import { useEffect, useState } from "react";

import { usePlatform } from "@/features/enrollment/platform-provider";
import { useManagementService } from "@/features/management/use-management-service";
import { getPlatformErrorMessage } from "@/lib/supabase/errors";
import { withReturnTarget } from "@/lib/return-target";
import { ListSkeleton } from "@/components/workspace/workspace-skeleton";

type DataState = "loading" | "loaded" | "error";

const roleLabel: Record<OrganizationManagerRole, string> = {
  owner: "Owner",
  admin: "Admin",
  representative: "Representative",
};

export function ManagementInvitations() {
  const { currentUser, isHydrated } = usePlatform();
  const managementService = useManagementService();

  const [dataState, setDataState] = useState<DataState>("loading");
  const [invitations, setInvitations] = useState<
    readonly MyManagementInvitation[]
  >([]);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (!isHydrated || !currentUser || !managementService) return;
    let cancelled = false;
    managementService
      .listMyInvitations()
      .then((data) => {
        if (cancelled) return;
        setInvitations(data);
        setDataState("loaded");
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setError(getPlatformErrorMessage(caught));
        setDataState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [isHydrated, currentUser, managementService]);

  const accept = async (invitation: MyManagementInvitation) => {
    if (!managementService) return;
    setActioningId(invitation.id);
    setActionError("");
    try {
      await managementService.acceptInvitation(invitation.id);
      window.location.reload();
    } catch (caught: unknown) {
      setActionError(getPlatformErrorMessage(caught));
      setActioningId(null);
    }
  };

  const decline = async (invitation: MyManagementInvitation) => {
    if (!managementService) return;
    setActioningId(invitation.id);
    setActionError("");
    try {
      await managementService.declineInvitation(invitation.id);
      setInvitations((current) =>
        current.filter((i) => i.id !== invitation.id),
      );
    } catch (caught: unknown) {
      setActionError(getPlatformErrorMessage(caught));
    } finally {
      setActioningId(null);
    }
  };

  if (!isHydrated) {
    return <ListSkeleton />;
  }

  if (!currentUser) {
    return (
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-global-navy text-2xl font-bold">
            Sign in to review management invitations
          </h1>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={withReturnTarget("/login", "/workspace/invitations")}
              className="bg-global-navy hover:bg-heritage-maroon focus-visible:ring-focus rounded-button motion-control inline-flex min-h-11 items-center px-5 text-sm font-semibold text-white focus-visible:outline-none"
            >
              Sign in
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  if (!managementService) {
    return (
      <Container className="py-16 sm:py-20">
        <Alert tone="info" title="Invitations is not available here">
          Management administration is not configured for this deployment.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-12 sm:py-16 lg:py-20">
      <p className="text-heritage-maroon text-xs font-bold tracking-[0.14em] uppercase">
        MANAGEMENT INVITATIONS
      </p>
      <h1 className="text-global-navy mt-2 text-3xl font-bold tracking-[-0.01em]">
        Your invitations
      </h1>
      <p className="text-slate mt-2 max-w-xl">
        Accepting grants you management authority only — it does not make you a
        Member of the Organisation or Tamil Sangam.
      </p>

      <div className="mt-8">
        {dataState === "loading" ? (
          <Skeleton className="h-48 w-full" />
        ) : dataState === "error" ? (
          <Alert tone="error" role="alert">
            {error}
          </Alert>
        ) : invitations.length === 0 ? (
          <EmptyState
            title="No pending invitations"
            description="Invitations to manage an Organisation or Tamil Sangam will appear here."
          />
        ) : (
          <div className="grid gap-4">
            {actionError ? (
              <Alert tone="error" role="alert">
                {actionError}
              </Alert>
            ) : null}
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="surface-card grid gap-4 p-5 sm:flex sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-global-navy font-bold">
                    {invitation.organisationName || "Untitled organisation"}
                  </p>
                  <p className="text-slate text-sm">
                    {invitation.organisationKind === "sangam"
                      ? "Tamil Sangam"
                      : "Organisation"}{" "}
                    · Invited as {roleLabel[invitation.role]}
                  </p>
                  <p className="text-slate mt-1 text-xs">
                    Invited by {invitation.inviterName || "a manager"} on{" "}
                    {new Date(invitation.invitedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    disabled={actioningId === invitation.id}
                    aria-busy={actioningId === invitation.id}
                    onClick={() => void accept(invitation)}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={actioningId === invitation.id}
                    onClick={() => void decline(invitation)}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
