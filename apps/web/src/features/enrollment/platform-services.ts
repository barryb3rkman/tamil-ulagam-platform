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

import type { LoginInput, MockPlatformServices, SignupInput } from "./services";

export type RuntimeAuthResult =
  | {
      readonly ok: true;
      readonly user: UserProfile;
      readonly requiresEmailConfirmation?: boolean;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

export type AuthCallbackIntent = "confirmation" | "recovery";

export type RuntimeAuthEvent =
  | "initial_session"
  | "signed_in"
  | "signed_out"
  | "password_recovery"
  | "token_refreshed"
  | "user_updated";

export type AuthCallbackResult =
  | {
      readonly status: "confirmation_success";
      readonly hasSession: boolean;
    }
  | { readonly status: "recovery_ready" }
  | { readonly status: "invalid"; readonly message: string };

export interface RuntimeAuthService {
  signup(input: SignupInput): Promise<RuntimeAuthResult>;
  login(input: LoginInput): Promise<RuntimeAuthResult>;
  requestPasswordReset(email: string, captchaToken?: string): Promise<void>;
  resolveAuthCallback(
    intent: AuthCallbackIntent,
    callbackUrl: string,
  ): Promise<AuthCallbackResult>;
  completePasswordRecovery(password: string): Promise<void>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<UserProfile | null>;
  updateProfile(
    input: Pick<UserProfile, "fullName" | "email" | "phone" | "country">,
  ): Promise<UserProfile>;
}

export interface RuntimeOrganisationService {
  getCurrentOrganisation(): Promise<Organisation | null>;
  listCurrentOrganisations(): Promise<Organisation[]>;
  selectCurrentOrganisation(organisationId: string): Promise<void>;
  updateCurrentOrganisation(
    input: Partial<Organisation>,
  ): Promise<Organisation>;
}

export interface RuntimeRegistrationService {
  ensureCurrentDraft(): Promise<OrganisationApplication>;
  getCurrentApplication(): Promise<OrganisationApplication | null>;
  updateCategory(
    category: OrganisationCategory,
  ): Promise<OrganisationApplication>;
  updateCategoryProfile(
    profile: OrganisationCategoryProfile,
  ): Promise<OrganisationApplication>;
  updateRepresentative(
    representative: OrganisationRepresentative,
  ): Promise<OrganisationApplication>;
  updateCurrentStep(step: 1 | 2 | 3 | 4): Promise<OrganisationApplication>;
  submit(): Promise<OrganisationApplication>;
}

export interface RuntimeAdminService {
  listApplications(): Promise<OrganisationApplication[]>;
  getApplication(id: string): Promise<OrganisationApplication | null>;
  updateStatus(
    id: string,
    status: Extract<
      RegistrationStatus,
      "under_review" | "verified" | "needs_changes" | "rejected" | "suspended"
    >,
    feedback?: string,
  ): Promise<OrganisationApplication>;
}

export interface PlatformServices {
  readonly kind: "mock" | "supabase";
  readonly auth: RuntimeAuthService;
  readonly organisations: RuntimeOrganisationService;
  readonly registrations: RuntimeRegistrationService;
  readonly admin: RuntimeAdminService;
  readonly snapshot: () => Promise<EnrollmentPlatformState>;
  readonly canReviewApplications: () => Promise<boolean>;
  readonly onAuthStateChange: (
    listener: (event: RuntimeAuthEvent) => void,
  ) => () => void;
  readonly reset?: () => Promise<EnrollmentPlatformState>;
}

export function adaptMockPlatformServices(
  services: MockPlatformServices,
): PlatformServices {
  return {
    kind: "mock",
    auth: {
      signup: (input) => services.auth.signup(input),
      login: (input) => services.auth.login(input),
      requestPasswordReset: (email, captchaToken) =>
        services.auth.requestPasswordReset(email, captchaToken),
      async resolveAuthCallback(intent, callbackUrl) {
        const url = new URL(callbackUrl);
        const mockFlow = url.searchParams.get("mock");
        if (intent === "recovery" && mockFlow === "recovery") {
          return { status: "recovery_ready" };
        }
        if (intent === "confirmation" && mockFlow === "confirmation") {
          return { status: "confirmation_success", hasSession: true };
        }
        return {
          status: "invalid",
          message:
            "This link is invalid or has expired. Request a new link and try again.",
        };
      },
      completePasswordRecovery: (password) =>
        services.auth.completePasswordRecovery(password),
      signOut: async () => services.auth.signOut(),
      getCurrentUser: async () => services.auth.getCurrentUser(),
      updateProfile: async (input) => services.auth.updateProfile(input),
    },
    organisations: {
      getCurrentOrganisation: async () =>
        services.organisations.getCurrentOrganisation(),
      listCurrentOrganisations: async () =>
        services.organisations.listCurrentOrganisations(),
      selectCurrentOrganisation: async (organisationId) =>
        services.organisations.selectCurrentOrganisation(organisationId),
      updateCurrentOrganisation: async (input) =>
        services.organisations.updateCurrentOrganisation(input),
    },
    registrations: {
      ensureCurrentDraft: async () =>
        services.registrations.ensureCurrentDraft(),
      getCurrentApplication: async () =>
        services.registrations.getCurrentApplication(),
      updateCategory: async (category) =>
        services.registrations.updateCategory(category),
      updateCategoryProfile: async (profile) =>
        services.registrations.updateCategoryProfile(profile),
      updateRepresentative: async (representative) =>
        services.registrations.updateRepresentative(representative),
      updateCurrentStep: async (step) =>
        services.registrations.updateCurrentStep(step),
      submit: async () => services.registrations.submit(),
    },
    admin: {
      listApplications: async () => services.admin.listApplications(),
      getApplication: async (id) => services.admin.getApplication(id),
      updateStatus: async (id, status, feedback) =>
        services.admin.updateStatus(id, status, feedback),
    },
    snapshot: async () => services.snapshot(),
    canReviewApplications: async () => true,
    onAuthStateChange: () => () => undefined,
    reset: async () => services.reset(),
  };
}
