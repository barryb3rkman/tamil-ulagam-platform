"use client";

import { isTamilSangam, isTamilSangamProfile } from "@tamil-ulagam/shared";
import type {
  EnrollmentPlatformState,
  Organisation,
} from "@tamil-ulagam/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { usePlatform } from "@/features/enrollment/platform-provider";
import { useWorkspaceInventory } from "@/features/workspace/use-workspace-inventory";

interface WorkspaceCandidate {
  readonly id: string;
  readonly name: string;
}

/** Backend-agnostic fallback classification, used only when the
 * Supabase-only `useWorkspaceInventory` signal is unavailable (the mock
 * backend). Mirrors `currentApplication`'s own internal
 * `isSangamOrganisationId` helper in `platform-provider.tsx` — the same
 * "look up this organisation's registration and check its category
 * profile" approach, kept independent here rather than exported from the
 * provider so this compatibility-only code path stays out of the
 * provider's public surface. */
function isSangamOrganisation(
  state: EnrollmentPlatformState | null,
  organisationId: string,
): boolean {
  const registration = state?.registrations.find(
    (item) => item.organisationId === organisationId,
  );
  return isTamilSangamProfile(registration?.categoryProfile ?? null);
}

/**
 * `/dashboard` is now a legacy compatibility surface (Phase E1 brief
 * section 17) — it no longer shows registration status content itself
 * (that content now lives, in fuller form, in the Organisation/Sangam
 * Workspace). Its job is only to guide an authenticated visitor to the
 * right V3 workspace: exactly one managed organisation/Sangam redirects
 * there automatically; none redirects to the Member workspace (every
 * authenticated user has one); more than one is genuinely ambiguous, so
 * it shows a workspace-selection screen rather than guessing (never a
 * silent, surprising redirect). Static export forbids a server redirect,
 * so this is a client-side `router.replace` once platform state has
 * hydrated — the same strategy the rest of the app already uses for
 * auth-aware routing.
 *
 * The management-grant signal (`useWorkspaceInventory`, backed by
 * `organization_managers`) is the correct source — see
 * `workspace-options.ts` — but it is Supabase-only and returns nothing
 * under the mock backend. `usePlatform().applications` is kept as a
 * fallback purely so this compatibility route keeps working under a
 * mock-backend deployment; it is not used when the real signal is
 * available.
 */
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
    if (totalCandidates === 0) {
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
    // totalCandidates > 1 is genuinely ambiguous — no redirect; the
    // render below shows the workspace-selection screen instead.
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
  if (totalCandidates > 1) {
    return (
      <WorkspacePicker
        organisationCandidates={organisationCandidates}
        sangamCandidates={sangamCandidates}
      />
    );
  }
  return <DashboardLoading label="Taking you to your workspace…" />;
}

function toCandidate(organisation: {
  readonly id: string;
  readonly name: string;
}): WorkspaceCandidate {
  return { id: organisation.id, name: organisation.name };
}

function WorkspacePicker({
  organisationCandidates,
  sangamCandidates,
}: {
  readonly organisationCandidates: readonly WorkspaceCandidate[];
  readonly sangamCandidates: readonly WorkspaceCandidate[];
}) {
  return (
    <div className="rounded-card border-global-navy/12 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-heritage-maroon text-xs font-bold tracking-[0.14em] uppercase">
        Choose a workspace
      </p>
      <h1 className="text-global-navy mt-2 text-2xl font-bold sm:text-3xl">
        You manage more than one workspace
      </h1>
      <p className="text-charcoal mt-2 max-w-xl">
        Choose the one you want to open — this list always matches what you
        actually manage.
      </p>

      <div className="mt-6 grid gap-6">
        <PickerSection
          heading="Member"
          items={[
            {
              id: "member",
              name: "Your personal membership",
              href: "/workspace/member",
            },
          ]}
        />
        {organisationCandidates.length > 0 ? (
          <PickerSection
            heading="Organisations"
            items={organisationCandidates.map((organisation) => ({
              id: organisation.id,
              name: organisation.name || "Untitled organisation",
              href: `/workspace/organisation?organization=${organisation.id}`,
            }))}
          />
        ) : null}
        {sangamCandidates.length > 0 ? (
          <PickerSection
            heading="Tamil Sangams"
            items={sangamCandidates.map((sangam) => ({
              id: sangam.id,
              name: sangam.name || "Untitled Tamil Sangam",
              href: `/workspace/sangam?sangam=${sangam.id}`,
            }))}
          />
        ) : null}
      </div>
    </div>
  );
}

function PickerSection({
  heading,
  items,
}: {
  readonly heading: string;
  readonly items: readonly { id: string; name: string; href: string }[];
}) {
  return (
    <div>
      <h2 className="text-heritage-maroon mb-2 text-[0.68rem] font-bold tracking-[0.14em] uppercase">
        {heading}
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="surface-card motion-card border-global-navy/10 block p-4"
            >
              <p className="text-global-navy font-semibold">{item.name}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DashboardLoading({
  label = "Loading your dashboard…",
}: {
  readonly label?: string;
}) {
  return (
    <div
      role="status"
      className="rounded-card text-charcoal shadow-card bg-white p-7"
    >
      {label}
    </div>
  );
}

function SignedOutDashboard() {
  return (
    <div className="rounded-card shadow-card bg-white p-7">
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
  );
}
