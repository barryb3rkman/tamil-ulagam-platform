"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { ConfirmDialog } from "@/components/application/confirm-dialog";
import { usePlatform } from "@/features/enrollment/platform-provider";

/**
 * Signing out used to happen the instant the button was pressed, which is a
 * harsh way to lose a half-finished form. This asks first, and gives every
 * shell the same wording so the prompt reads the same wherever it appears.
 */
export function useSignOutPrompt(): {
  readonly requestSignOut: () => void;
  readonly signOutPrompt: ReactNode;
} {
  const router = useRouter();
  const { signOut } = usePlatform();
  const [asking, setAsking] = useState(false);

  return {
    requestSignOut: () => setAsking(true),
    signOutPrompt: asking ? (
      <ConfirmDialog
        title="Sign out of Tamil Ulagam?"
        description="You will be returned to the sign-in page. Anything you have typed but not saved will be lost."
        confirmLabel="Sign out"
        pendingLabel="Signing out…"
        cancelLabel="Stay signed in"
        tone="destructive"
        onCancel={() => setAsking(false)}
        onConfirm={async () => {
          await signOut();
          router.push("/login");
        }}
      />
    ) : null,
  };
}
