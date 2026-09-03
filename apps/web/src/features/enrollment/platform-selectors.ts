import type {
  EnrollmentPlatformState,
  Organisation,
  OrganisationApplication,
} from "@tamil-ulagam/shared";
import { isTamilSangamProfile } from "@tamil-ulagam/shared";

import type { PlatformBackendKind } from "./contracts";

/**
 * The views the platform context derives from one snapshot of state.
 *
 * These carry real access rules — which applications a reviewer may see,
 * which organisations count as yours, which registration the dashboard
 * treats as current. They were four useMemo bodies inside the provider,
 * which meant the only way to exercise a rule was to mount the whole
 * tree with a mocked backend. As plain functions they can be tested for
 * what they are.
 */

export function applicationFromState(
  state: EnrollmentPlatformState,
  registrationId: string,
): OrganisationApplication | null {
  const registration = state.registrations.find(
    (item) => item.id === registrationId,
  );
  if (!registration) return null;
  const organisation = state.organisations.find(
    (item) => item.id === registration.organisationId,
  );
  const representativeUser = state.users.find(
    (item) => item.id === registration.applicantUserId,
  );
  if (!organisation || !representativeUser) return null;
  return {
    organisation,
    registration,
    representativeUser,
    reviewHistory: state.reviewHistory?.filter(
      (event) => event.applicationId === registration.id,
    ),
  };
}

function organisationIdsFor(state: EnrollmentPlatformState): Set<string> {
  return new Set(
    state.memberships
      .filter((membership) => membership.userId === state.currentUserId)
      .map((membership) => membership.organisationId),
  );
}

/**
 * The review queue. A reviewer on the real backend never sees their own
 * registration, or one belonging to an organisation they are part of —
 * nobody reviews themselves.
 */
export function selectApplications(
  state: EnrollmentPlatformState | null,
  backendKind: PlatformBackendKind,
  canReviewApplications: boolean,
): OrganisationApplication[] {
  if (!state) return [];
  const linked = organisationIdsFor(state);
  return state.registrations.flatMap((registration) => {
    const isOwn =
      registration.applicantUserId === state.currentUserId ||
      linked.has(registration.organisationId);
    if (backendKind === "supabase" && canReviewApplications && isOwn) return [];
    const application = applicationFromState(state, registration.id);
    return application ? [application] : [];
  });
}

/**
 * The registrations shown as yours. Management grants count here even
 * without a membership row, which is how a manager reaches an
 * organisation they run but never joined.
 */
export function selectMyOrganisationApplications(
  state: EnrollmentPlatformState | null,
  managerOnlyOrganisationIds: ReadonlySet<string>,
): OrganisationApplication[] {
  if (!state) return [];
  const linked = new Set([
    ...organisationIdsFor(state),
    ...managerOnlyOrganisationIds,
  ]);
  return state.registrations.flatMap((registration) => {
    if (
      registration.applicantUserId !== state.currentUserId &&
      !linked.has(registration.organisationId)
    ) {
      return [];
    }
    const application = applicationFromState(state, registration.id);
    return application ? [application] : [];
  });
}

export function selectAvailableOrganisations(
  state: EnrollmentPlatformState | null,
): Organisation[] {
  if (!state?.currentUserId) return [];
  const ids = organisationIdsFor(state);
  return state.organisations.filter((organisation) => ids.has(organisation.id));
}

/**
 * The single registration the dashboard treats as current.
 *
 * Tamil Sangams are excluded: they have their own workspace, and letting
 * one win here would send a Sangam manager to the organisation screens.
 * The primary membership wins, otherwise the first one, so the answer is
 * stable for someone who belongs to several.
 */
export function selectCurrentApplication(
  state: EnrollmentPlatformState | null,
): OrganisationApplication | null {
  if (!state?.currentUserId) return null;
  const isSangam = (organisationId: string): boolean => {
    const registration = state.registrations.find(
      (item) => item.organisationId === organisationId,
    );
    return isTamilSangamProfile(registration?.categoryProfile ?? null);
  };
  const memberships = state.memberships.filter(
    (membership) =>
      membership.userId === state.currentUserId &&
      !isSangam(membership.organisationId),
  );
  const membership =
    memberships.find((item) => item.isPrimary) ?? memberships.at(0);
  if (!membership) return null;
  const registration = state.registrations.find(
    (item) => item.organisationId === membership.organisationId,
  );
  return registration ? applicationFromState(state, registration.id) : null;
}
