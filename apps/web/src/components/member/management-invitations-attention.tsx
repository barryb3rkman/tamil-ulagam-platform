"use client";

import { Alert } from "@tamil-ulagam/ui";
import Link from "next/link";
import { useEffect, useState } from "react";

import { usePlatform } from "@/features/enrollment/platform-provider";
import { useManagementService } from "@/features/management/use-management-service";

/**
 * The Member Workspace attention item for a pending management
 * invitation (brief section 15). Deliberately silent on load/error/
 * empty — this is a supplementary notice, not the page's primary
 * content, so it never shows a skeleton or error state of its own.
 */
export function ManagementInvitationsAttention() {
  const { currentUser, isHydrated } = usePlatform();
  const managementService = useManagementService();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isHydrated || !currentUser || !managementService) return;
    let cancelled = false;
    managementService
      .listMyInvitations()
      .then((invitations) => {
        if (!cancelled) setCount(invitations.length);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [isHydrated, currentUser, managementService]);

  if (count === 0) return null;

  return (
    <Alert tone="info" title="Management invitation">
      <p>
        {count === 1
          ? "You have a pending invitation to manage an Organisation or Tamil Sangam."
          : `You have ${count} pending invitations to manage an Organisation or Tamil Sangam.`}
      </p>
      <Link
        href="/workspace/invitations"
        className="text-global-navy focus-visible:ring-focus mt-2 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 focus-visible:outline-none"
      >
        Review invitation{count === 1 ? "" : "s"}
      </Link>
    </Alert>
  );
}
