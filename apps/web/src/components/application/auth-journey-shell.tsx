"use client";

import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { getSafeReturnTarget } from "@/lib/return-target";

import { authJourneyPresentation } from "./auth-journey";
import { AuthShell } from "./auth-shell";

export function AuthJourneyShell({
  children,
  mode,
}: {
  readonly children: ReactNode;
  readonly mode: "login" | "signup";
}) {
  const returnTarget = getSafeReturnTarget(useSearchParams().get("next"));
  const presentation = authJourneyPresentation(returnTarget, mode);

  return (
    <AuthShell
      portalLabel={presentation.portalLabel}
      eyebrow={presentation.eyebrow}
      title={mode === "login" ? "Welcome back" : "Create your account"}
      description={presentation.description}
      supportingCopy={presentation.supportingCopy}
    >
      {children}
    </AuthShell>
  );
}
