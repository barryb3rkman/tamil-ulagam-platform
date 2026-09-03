"use client";

import { isTamilSangam, isTamilSangamProfile } from "@tamil-ulagam/shared";
import type {
  EnrollmentPlatformState,
  Organisation,
} from "@tamil-ulagam/shared";
import { Container } from "@tamil-ulagam/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { BrandMark } from "@/components/brand/brand-mark";

import { usePlatform } from "@/features/enrollment/platform-provider";
import { useWorkspaceInventory } from "@/features/workspace/use-workspace-inventory";

interface WorkspaceCandidate {
  readonly id: string;
  readonly name: string;
}

function isSangamOrganisation(
  state: EnrollmentPlatformState | null,
  organisationId: string,
): boolean {
  const registration = state?.registrations.find(
    (item) => item.organisationId === organisationId,
  );
  return isTamilSangamProfile(registration?.categoryProfile ?? null);
}

export function DashboardOverview() {
  const router = useRouter();
  const { availableOrganisations, currentUser, isHydrated, state } =
    usePlatform();
  const inventory = useWorkspaceInventory();

  const fallbackOrganisations = useMemo(
    (): readonly Organisation[] =>
      availableOrganisations.filter(
        (organisation) => !isSangamOrganisation(state, organisation.id),
      ),
    [availableOrganisations, state],
  );
  const fallbackSangams = useMemo(
    (): readonly Organisation[] =>
      availableOrganisations.filter((organisation) =>
        isSangamOrganisation(state, organisation.id),
      ),
    [availableOrganisations, state],
  );

  const organisationCandidates: readonly WorkspaceCandidate[] = useMemo(() => {
    if (inventory.serviceAvailable) {
      return inventory.managedOrganisations
        .filter((organisation) => !isTamilSangam(organisation))
        .map(toCandidate);
    }
    return fallbackOrganisations.map(toCandidate);
  }, [
    inventory.serviceAvailable,
    inventory.managedOrganisations,
    fallbackOrganisations,
  ]);

  const sangamCandidates: readonly WorkspaceCandidate[] = useMemo(() => {
    if (inventory.serviceAvailable) {
      return inventory.managedOrganisations
        .filter((organisation) => isTamilSangam(organisation))
        .map(toCandidate);
    }
    return fallbackSangams.map(toCandidate);
  }, [
    inventory.serviceAvailable,
    inventory.managedOrganisations,
    fallbackSangams,
  ]);

  const candidatesReady = inventory.serviceAvailable
    ? inventory.state === "loaded"
    : isHydrated;
  const totalCandidates =
    organisationCandidates.length + sangamCandidates.length;

  useEffect(() => {
    if (!isHydrated || !currentUser || !candidatesReady) return;
    if (totalCandidates === 0 || totalCandidates > 1) {
      router.replace("/workspace/member");
      return;
    }
    if (totalCandidates === 1) {
      const organisation = organisationCandidates[0];
      const sangam = sangamCandidates[0];
      if (organisation) {
        router.replace(
          `/workspace/organisation?organization=${organisation.id}`,
        );
      } else if (sangam) {
        router.replace(`/workspace/sangam?sangam=${sangam.id}`);
      }
    }
  }, [
    isHydrated,
    currentUser,
    candidatesReady,
    totalCandidates,
    organisationCandidates,
    sangamCandidates,
    router,
  ]);

  if (!isHydrated) return <DashboardLoading />;
  if (!currentUser) return <SignedOutDashboard />;
  if (!candidatesReady) return <DashboardLoading />;
  return <DashboardLoading label="Taking you to your workspace…" />;
}

function toCandidate(organisation: {
  readonly id: string;
  readonly name: string;
}): WorkspaceCandidate {
  return { id: organisation.id, name: organisation.name };
}

function DashboardLoading({
  label = "Loading your dashboard…",
}: {
  readonly label?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="gradient-aurora fixed inset-0 z-50 grid place-items-center"
    >
      <div className="relative grid place-items-center gap-6 text-center">
        <span
          aria-hidden="true"
          data-motion-ambient
          className="bg-heritage-gold/25 motion-halo absolute size-40 rounded-full blur-3xl"
        />
        <BrandMark orbit className="relative size-20" />
        <span className="relative">
          <span className="text-heritage-gold/85 block text-[0.68rem] font-bold tracking-[0.24em] uppercase">
            Opening your workspace
          </span>
          <span className="mt-2 block text-sm text-white/55">{label}</span>
        </span>
      </div>
    </div>
  );
}

function SignedOutDashboard() {
  return (
    <Container className="py-16 sm:py-20">
      <div className="surface-card mx-auto max-w-xl p-7 sm:p-9">
        <h1 className="text-global-navy text-3xl font-bold">
          Sign in to view your dashboard
        </h1>
        <p className="text-charcoal mt-3">
          Sign in to access your organisation enrollment workspace.
        </p>
        <Link
          className="bg-global-navy rounded-button mt-6 inline-flex px-5 py-3 font-semibold text-white"
          href="/login"
        >
          Sign in
        </Link>
      </div>
    </Container>
  );
}
