"use client";

import type {
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
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  getPlatformRuntimeEnvironment,
  type CaptchaConfiguration,
} from "@/lib/supabase/environment";
import { getPlatformErrorMessage } from "@/lib/supabase/errors";

import {
  adaptMockPlatformServices,
  type AuthCallbackIntent,
  type AuthCallbackResult,
  type PlatformServices,
  type RuntimeAuthResult,
} from "./platform-services";
import { BrowserMockStateRepository } from "./repository";
import {
  createMockPlatformServices,
  type LoginInput,
  type SignupInput,
} from "./services";
import { createSupabasePlatformServices } from "./supabase-services";

type PlatformBackendKind = "mock" | "supabase" | "unavailable";

type PlatformLoginResult =
  | (Extract<RuntimeAuthResult, { readonly ok: true }> & {
      readonly hasApplication: boolean;
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
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

function createRuntimeServices(): {
  readonly services: PlatformServices | null;
  readonly captcha: CaptchaConfiguration;
  readonly error: string;
} {
  const environment = getPlatformRuntimeEnvironment();
  if (
    environment.backend === "supabase-local" ||
    environment.backend === "supabase-hosted"
  ) {
    return {
      services: createSupabasePlatformServices(getSupabaseBrowserClient()),
      captcha: environment.captcha,
      error: "",
    };
  }
  if (environment.backend === "mock") {
    return {
      services: adaptMockPlatformServices(
        createMockPlatformServices(
          new BrowserMockStateRepository(window.localStorage),
        ),
      ),
      captcha: environment.captcha,
      error: "",
    };
  }
  return {
    services: null,
    captcha: environment.captcha,
    error:
      environment.backend === "unavailable"
        ? environment.message
        : unavailableMessage,
  };
}

function applicationFromState(
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

const unavailableMessage =
  "Organisation enrollment is not configured for this deployment. Set the public Supabase environment values and rebuild the site.";

export function PlatformProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [services, setServices] = useState<PlatformServices | null>(null);
  const [backendKind, setBackendKind] =
    useState<PlatformBackendKind>("unavailable");
  const [state, setState] = useState<EnrollmentPlatformState | null>(null);
  const [canReviewApplications, setCanReviewApplications] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [platformError, setPlatformError] = useState("");
  const [captcha, setCaptcha] = useState<CaptchaConfiguration>({
    enabled: false,
  });
  const refreshSequence = useRef(0);

  const refresh = useCallback(async (runtime: PlatformServices) => {
    const sequence = ++refreshSequence.current;
    const [nextState, reviewer] = await Promise.all([
      runtime.snapshot(),
      runtime.canReviewApplications(),
    ]);
    if (sequence === refreshSequence.current) {
      setState(nextState);
      setCanReviewApplications(reviewer);
      setPlatformError("");
    }
    return nextState;
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribe: () => void = () => undefined;

    const initialise = async () => {
      try {
        const configuration = createRuntimeServices();
        const runtime = configuration.services;
        setCaptcha(configuration.captcha);
        if (!runtime) {
          if (!active) return;
          setBackendKind("unavailable");
          setPlatformError(configuration.error || unavailableMessage);
          setIsHydrated(true);
          return;
        }

        if (!active) return;
        setServices(runtime);
        setBackendKind(runtime.kind);
        unsubscribe = runtime.onAuthStateChange(() => {
          void refresh(runtime).catch((error: unknown) => {
            if (active) setPlatformError(getPlatformErrorMessage(error));
          });
        });
        await refresh(runtime);
      } catch (error: unknown) {
        if (active) setPlatformError(getPlatformErrorMessage(error));
      } finally {
        if (active) setIsHydrated(true);
      }
    };

    void initialise();
    return () => {
      active = false;
      unsubscribe();
    };
  }, [refresh]);

  const currentUser =
    state?.users.find((user) => user.id === state.currentUserId) ?? null;

  const applications = useMemo(() => {
    if (!state) return [];
    const linkedOrganisationIds = new Set(
      state.memberships
        .filter((membership) => membership.userId === state.currentUserId)
        .map((membership) => membership.organisationId),
    );
    return state.registrations.flatMap((registration) => {
      if (
        backendKind === "supabase" &&
        canReviewApplications &&
        (registration.applicantUserId === state.currentUserId ||
          linkedOrganisationIds.has(registration.organisationId))
      ) {
        return [];
      }
      const application = applicationFromState(state, registration.id);
      return application ? [application] : [];
    });
  }, [backendKind, canReviewApplications, state]);

  const availableOrganisations = useMemo(() => {
    if (!state?.currentUserId) return [];
    const organisationIds = new Set(
      state.memberships
        .filter((membership) => membership.userId === state.currentUserId)
        .map((membership) => membership.organisationId),
    );
    return state.organisations.filter((organisation) =>
      organisationIds.has(organisation.id),
    );
  }, [state]);

  const currentApplication = useMemo(() => {
    if (!state?.currentUserId) return null;
    const memberships = state.memberships.filter(
      (membership) => membership.userId === state.currentUserId,
    );
    const membership =
      memberships.find((item) => item.isPrimary) ?? memberships.at(0);
    if (!membership) return null;
    const registration = state.registrations.find(
      (item) => item.organisationId === membership.organisationId,
    );
    return registration ? applicationFromState(state, registration.id) : null;
  }, [state]);

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
        const nextState = await refresh(runtime);
        const hasApplication = nextState.registrations.some(
          (registration) => registration.applicantUserId === result.user.id,
        );
        return { ...result, hasApplication };
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
        setState(await runtime.reset());
      },
    }),
    [
      applications,
      availableOrganisations,
      backendKind,
      captcha,
      canReviewApplications,
      currentApplication,
      currentUser,
      isHydrated,
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
