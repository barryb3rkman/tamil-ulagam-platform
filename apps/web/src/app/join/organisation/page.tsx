"use client";

import { Container } from "@tamil-ulagam/ui";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * `/join/organisation` — the future V3 route for the Organisation
 * journey. The real, fully auth-aware registration flow already lives
 * at `/register` (draft creation, resume-at-step, non-editable-status
 * handling — see registration-wizard.tsx) and is not being duplicated
 * here per the Phase C1 brief; this route exists so the journey
 * architecture is in place, and simply hands off to it.
 *
 * Static export has no middleware/redirects(), so the handoff is a
 * client-side replace. The markup rendered before that effect can run
 * — the only thing a no-JS or slow-JS visitor ever sees — is a real,
 * working link to `/register`, not a bare "redirecting…" dead end.
 */
export default function JoinOrganisationPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/register");
  }, [router]);

  return (
    <div className="surface-canvas grid min-h-[60vh] place-items-center py-20">
      <Container size="narrow" className="text-center">
        <p className="text-slate text-sm">Taking you to registration…</p>
        <p className="mt-4">
          <Link
            href="/register"
            className="text-heritage-maroon focus-visible:ring-focus rounded-button font-semibold underline-offset-4 hover:underline"
          >
            Continue to organisation registration
          </Link>
        </p>
      </Container>
    </div>
  );
}
