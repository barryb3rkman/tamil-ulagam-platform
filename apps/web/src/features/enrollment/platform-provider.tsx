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
import { isTamilSangamProfile } from "@tamil-ulagam/shared";
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
  type DuplicateSignalsInput,
  type OrganisationEmailVerificationSendResult,
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

  // `refresh` can be triggered concurrently from more than one source
  // during startup: the eager initial call below, plus every
  // `onAuthStateChange` event the backend fires while restoring a
  // persisted session (e.g. Supabase's own "INITIAL_SESSION" followed
  // shortly by a same-session "SIGNED_IN"). Whichever call *finishes*
  // last does not always correspond to the call that *started* last, so
  // `refreshSequence` identifies the most-recently-started call and every
  // earlier one is discarded on arrival — this already protected `state`
  // and `canReviewApplications` from being clobbered by a stale result.
  // `isHydrated` used to be set independently of this guard (see
  // `initialise` below, previously in a bare `finally`), so the very
  // first call to settle — even one whose session lookup raced ahead of
  // the real session being restored — could permanently latch
  // `canReviewApplications = false` with `isHydrated = true` and nothing
  // left to correct it, since no further refresh was guaranteed to
  // arrive. Setting `isHydrated` from inside this same staleness check
  // means the UI only ever commits to the outcome of the *latest*
  // triggered refresh, never an earlier one still in flight — exactly
  // the "wait for restoration, then decide" behaviour access checks need.
  const refresh = useCallback(async (runtime: PlatformServices) => {
    const sequence = ++refreshSequence.current;
    try {
      const [nextState, reviewer] = await Promise.all([
        runtime.snapshot(),
        runtime.canReviewApplications(),
      ]);
      if (sequence === refreshSequence.current) {
        setState(nextState);
        setCanReviewApplications(reviewer);
        setPlatformError("");
        setIsHydrated(true);
      }
      return { state: nextState, canReview: reviewer };
    } catch (error: unknown) {
      // A failed lookup (expired session, network error) still resolves
      // the loading state rather than hanging indefinitely. Guarded by
      // the same staleness check as the success path, so a failure from
      // an earlier, superseded call can never overwrite the error (or
      // lack of one) left by whichever call actually is the latest.
      if (sequence === refreshSequence.current) {
        setIsHydrated(true);
        setPlatformError(getPlatformErrorMessage(error));
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribe: () => void = () => undefined;

    // Tracks whether refresh() was reached at all, so the safety-net
    // catch below knows whether refresh() already resolved the loading
    // state itself (in which case re-setting it could clobber a
    // meanwhile-successful later call) or whether setup never got that
    // far (in which case nothing else will ever resolve it).
    let refreshStarted = false;

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
          // refresh() already resolves isHydrated/platformError itself
          // (guarded by sequence) whether it succeeds or fails — this
          // catch only exists so a rejected promise here can't become an
          // unhandled rejection.
          void refresh(runtime).catch(() => undefined);
        });
        refreshStarted = true;
        const first = await refresh(runtime);

        // Defense in depth against a narrow, real timing window in the
        // Supabase browser client's own cookie storage: a freshly-signed-in
        // session is persisted across several `document.cookie` writes in
        // a loop (large tokens are chunked), not one atomic write. If a
        // full page navigation to a protected route (a hard refresh, a
        // fresh tab from a bookmark, the redirect right after sign-in)
        // lands while that loop is still mid-flight, the very first read
        // on the new page can see a partial set of chunks — the SDK's own
        // storage layer explicitly treats that as "no session" rather
        // than guessing at a corrupt one. That first read is otherwise
        // indistinguishable from a genuinely logged-out visitor, so a
        // single short, bounded re-check (not a retry loop) is the
        // cheapest reliable way to tell them apart without waiting on an
        // auth event that this specific race does not guarantee will
        // fire again. A real anonymous visitor pays this once, in the
        // background, with no visible effect on public pages that don't
        // render anything conditioned on `isHydrated`.
        if (
          active &&
          runtime.kind === "supabase" &&
          !first.state.currentUserId
        ) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          if (active) await refresh(runtime).catch(() => undefined);
        }
      } catch (error: unknown) {
        // If refresh() was reached, it already resolved isHydrated (and
        // platformError) itself before rethrowing, guarded by the same
        // staleness check that protects it from a concurrent later call —
        // redoing that here could overwrite a meanwhile-successful
        // result. Only a failure BEFORE refresh() ever started (e.g.
        // constructing the runtime services) needs this fallback.
        if (active && !refreshStarted) {
          setPlatformError(getPlatformErrorMessage(error));
          setIsHydrated(true);
        }
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

  // See the identical filter (and its full rationale) in
  // supabase-services.ts's currentApplicationFromState — kept in sync
  // here since this hook duplicates that resolution for the values it
  // exposes directly, rather than reusing it as a service call.
  const currentApplication = useMemo(() => {
    if (!state?.currentUserId) return null;
    const isSangamOrganisationId = (organisationId: string): boolean => {
      const registration = state.registrations.find(
        (item) => item.organisationId === organisationId,
      );
      return isTamilSangamProfile(registration?.categoryProfile ?? null);
    };
    const memberships = state.memberships.filter(
      (membership) =>
        membership.userId === state.currentUserId &&
        !isSangamOrganisationId(membership.organisationId),
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
        setState(await runtime.reset());
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
