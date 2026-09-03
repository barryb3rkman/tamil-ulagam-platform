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

import type { LoginInput, SignupInput } from "./mock-services";

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

export interface DuplicateSignalsInput {
  readonly name: string;
  readonly officialEmail: string;
  readonly registrationNumber: string;
  readonly excludeOrganisationId?: string;
}

export type OrganisationEmailVerificationSendResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "not_configured" | "error" };

export interface PlatformServices {
  readonly kind: "mock" | "supabase";
  readonly auth: RuntimeAuthService;
  readonly organisations: RuntimeOrganisationService;
  readonly registrations: RuntimeRegistrationService;
  readonly admin: RuntimeAdminService;
  readonly snapshot: () => Promise<EnrollmentPlatformState>;
  readonly canReviewApplications: () => Promise<boolean>;
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
  readonly onAuthStateChange: (
    listener: (event: RuntimeAuthEvent) => void,
  ) => () => void;
  readonly reset?: () => Promise<EnrollmentPlatformState>;
}
