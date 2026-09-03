"use client";

import type {
  DuplicateOrganisationSignals,
  EnrollmentPlatformState,
  Organisation,
  OrganisationApplication,
  OrganisationCategory,
  OrganisationCategoryProfile,
  OrganisationRepresentative,
  RegistrationStatus,
  UserProfile,
} from "@tamil-ulagam/shared";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";

import { type CaptchaConfiguration } from "@/lib/supabase/environment";

import { useManagedOrganisationIds } from "./use-managed-organisation-ids";
import { unavailableMessage, usePlatformSession } from "./use-platform-session";
import {
  selectApplications,
  selectAvailableOrganisations,
  selectCurrentApplication,
  selectMyOrganisationApplications,
} from "./platform-selectors";

import {
  type AuthCallbackIntent,
  type AuthCallbackResult,
  type DuplicateSignalsInput,
  type OrganisationEmailVerificationSendResult,
  type PlatformServices,
  type RuntimeAuthResult,
} from "./contracts";
import type { PlatformBackendKind } from "./contracts";
import { type LoginInput, type SignupInput } from "./mock-services";

type PlatformLoginResult =
  | (Extract<RuntimeAuthResult, { readonly ok: true }> & {
      readonly hasApplication: boolean;
      readonly canReview: boolean;
    })
  | Extract<RuntimeAuthResult, { readonly ok: false }>;

interface PlatformContextValue {
  readonly backendKind: PlatformBackendKind;
  readonly canReviewApplications: boolean;
  readonly isHydrated: boolean;
  readonly platformError: string;
  readonly captcha: CaptchaConfiguration;
  readonly state: EnrollmentPlatformState | null;
  readonly currentUser: UserProfile | null;
  readonly currentApplication: OrganisationApplication | null;
  readonly applications: OrganisationApplication[];
  readonly myOrganisationApplications: OrganisationApplication[];
  readonly availableOrganisations: Organisation[];
  readonly signup: (input: SignupInput) => Promise<RuntimeAuthResult>;
  readonly login: (input: LoginInput) => Promise<PlatformLoginResult>;
  readonly requestPasswordReset: (
    email: string,
    captchaToken?: string,
  ) => Promise<void>;
  readonly resolveAuthCallback: (
    intent: AuthCallbackIntent,
    callbackUrl: string,
  ) => Promise<AuthCallbackResult>;
  readonly completePasswordRecovery: (password: string) => Promise<void>;
  readonly signOut: () => Promise<void>;
  readonly updateProfile: (
    input: Pick<UserProfile, "fullName" | "email" | "phone" | "country">,
  ) => Promise<UserProfile>;
  readonly ensureDraft: () => Promise<OrganisationApplication>;
  readonly selectOrganisation: (organisationId: string) => Promise<void>;
  readonly updateOrganisation: (
    input: Partial<Organisation>,
  ) => Promise<Organisation>;
  readonly updateCategory: (
    category: OrganisationCategory,
  ) => Promise<OrganisationApplication>;
  readonly updateCategoryProfile: (
    profile: OrganisationCategoryProfile,
  ) => Promise<OrganisationApplication>;
  readonly updateRepresentative: (
    representative: OrganisationRepresentative,
  ) => Promise<OrganisationApplication>;
  readonly updateCurrentStep: (
    step: 1 | 2 | 3 | 4,
  ) => Promise<OrganisationApplication>;
  readonly submitRegistration: () => Promise<OrganisationApplication>;
  readonly getApplication: (id: string) => OrganisationApplication | null;
  readonly loadApplication: (
    id: string,
  ) => Promise<OrganisationApplication | null>;
  readonly updateApplicationStatus: (
    id: string,
    status: Extract<
      RegistrationStatus,
      "under_review" | "verified" | "needs_changes" | "rejected" | "suspended"
    >,
    feedback?: string,
  ) => Promise<OrganisationApplication>;
  readonly resetDemo: () => Promise<void>;
  readonly checkDuplicateSignals: (
    input: DuplicateSignalsInput,
  ) => Promise<DuplicateOrganisationSignals>;
  readonly requestOrganisationEmailVerification: (
    organisationId: string,
  ) => Promise<OrganisationEmailVerificationSendResult>;
  readonly completeOrganisationEmailVerification: (
    organisationId: string,
    token: string,
  ) => Promise<boolean>;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function PlatformProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const {
    applyState,
    backendKind,
    canReviewApplications,
    captcha,
    isHydrated,
    platformError,
    refresh,
    services,
    state,
  } = usePlatformSession();

  const currentUser =
    state?.users.find((user) => user.id === state.currentUserId) ?? null;

  const managerOnlyOrganisationIds = useManagedOrganisationIds(
    services,
    currentUser?.id ?? null,
  );

  const applications = useMemo(
    () => selectApplications(state, backendKind, canReviewApplications),
    [backendKind, canReviewApplications, state],
  );

  const myOrganisationApplications = useMemo(
    () => selectMyOrganisationApplications(state, managerOnlyOrganisationIds),
    [state, managerOnlyOrganisationIds],
  );

  const availableOrganisations = useMemo(
    () => selectAvailableOrganisations(state),
    [state],
  );

  const currentApplication = useMemo(
    () => selectCurrentApplication(state),
    [state],
  );

  const requireServices = useCallback((): PlatformServices => {
    if (!services) throw new Error(platformError || unavailableMessage);
    return services;
  }, [platformError, services]);

  const value = useMemo<PlatformContextValue>(
    () => ({
      backendKind,
      captcha,
      canReviewApplications,
      isHydrated,
      platformError,
      state,
      currentUser,
      currentApplication,
      applications,
      myOrganisationApplications,
      availableOrganisations,
      signup: async (input) => {
        const runtime = requireServices();
        const result = await runtime.auth.signup(input);
        if (result.ok && !result.requiresEmailConfirmation) {
          await refresh(runtime);
        }
        return result;
      },
      login: async (input) => {
        const runtime = requireServices();
        const result = await runtime.auth.login(input);
        if (!result.ok) return result;
        const { state: nextState, canReview } = await refresh(runtime);
        const hasApplication = nextState.registrations.some(
          (registration) => registration.applicantUserId === result.user.id,
        );
        return { ...result, hasApplication, canReview };
      },
      requestPasswordReset: async (email, captchaToken) => {
        await requireServices().auth.requestPasswordReset(email, captchaToken);
      },
      resolveAuthCallback: async (intent, callbackUrl) =>
        requireServices().auth.resolveAuthCallback(intent, callbackUrl),
      completePasswordRecovery: async (password) => {
        const runtime = requireServices();
        await runtime.auth.completePasswordRecovery(password);
        await refresh(runtime);
      },
      signOut: async () => {
        const runtime = requireServices();
        await runtime.auth.signOut();
        await refresh(runtime);
      },
      updateProfile: async (input) => {
        const runtime = requireServices();
        const result = await runtime.auth.updateProfile(input);
        await refresh(runtime);
        return result;
      },
      ensureDraft: async () => {
        const runtime = requireServices();
        const result = await runtime.registrations.ensureCurrentDraft();
        await refresh(runtime);
        return result;
      },
      selectOrganisation: async (organisationId) => {
        const runtime = requireServices();
        await runtime.organisations.selectCurrentOrganisation(organisationId);
        await refresh(runtime);
      },
      updateOrganisation: async (input) => {
        const runtime = requireServices();
        const result =
          await runtime.organisations.updateCurrentOrganisation(input);
        await refresh(runtime);
        return result;
      },
      updateCategory: async (category) => {
        const runtime = requireServices();
        const result = await runtime.registrations.updateCategory(category);
        await refresh(runtime);
        return result;
      },
      updateCategoryProfile: async (profile) => {
        const runtime = requireServices();
        const result =
          await runtime.registrations.updateCategoryProfile(profile);
        await refresh(runtime);
        return result;
      },
      updateRepresentative: async (representative) => {
        const runtime = requireServices();
        const result =
          await runtime.registrations.updateRepresentative(representative);
        await refresh(runtime);
        return result;
      },
      updateCurrentStep: async (step) => {
        const runtime = requireServices();
        const result = await runtime.registrations.updateCurrentStep(step);
        await refresh(runtime);
        return result;
      },
      submitRegistration: async () => {
        const runtime = requireServices();
        const result = await runtime.registrations.submit();
        await refresh(runtime);
        return result;
      },
      getApplication: (id) =>
        applications.find(
          (application) => application.registration.id === id,
        ) ?? null,
      loadApplication: async (id) => requireServices().admin.getApplication(id),
      updateApplicationStatus: async (id, status, feedback) => {
        const runtime = requireServices();
        const result = await runtime.admin.updateStatus(id, status, feedback);
        await refresh(runtime);
        return result;
      },
      resetDemo: async () => {
        const runtime = requireServices();
        if (!runtime.reset) return;
        applyState(await runtime.reset());
      },
      checkDuplicateSignals: async (input) =>
        requireServices().checkDuplicateSignals(input),
      requestOrganisationEmailVerification: async (organisationId) =>
        requireServices().requestOrganisationEmailVerification(organisationId),
      completeOrganisationEmailVerification: async (organisationId, token) =>
        requireServices().completeOrganisationEmailVerification(
          organisationId,
          token,
        ),
    }),
    [
      applyState,
      applications,
      availableOrganisations,
      backendKind,
      captcha,
      canReviewApplications,
      currentApplication,
      currentUser,
      isHydrated,
      myOrganisationApplications,
      platformError,
      refresh,
      requireServices,
      state,
    ],
  );

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform(): PlatformContextValue {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error("usePlatform must be used inside PlatformProvider.");
  }
  return context;
}
