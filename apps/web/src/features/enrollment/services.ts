import type {
  MockPlatformState,
  Organisation,
  OrganisationApplication,
  OrganisationCategory,
  OrganisationCategoryProfile,
  OrganisationRegistration,
  OrganisationRepresentative,
  RegistrationStatus,
  UserProfile,
} from "@tamil-ulagam/shared";

import {
  createEmptyCategoryProfile,
  createEmptyOrganisation,
  createEmptyRepresentative,
  createDemoUser,
  demoCredentials,
} from "./mock-data";
import type { MockStateRepository } from "./repository";

export interface SignupInput {
  readonly fullName: string;
  readonly email: string;
  readonly password: string;
  readonly termsAccepted: boolean;
  readonly captchaToken?: string;
  readonly returnTarget?: string | null;
}

export interface LoginInput {
  readonly email: string;
  readonly password: string;
  readonly captchaToken?: string;
}

export type AuthResult =
  | { readonly ok: true; readonly user: UserProfile }
  | { readonly ok: false; readonly message: string };

export interface AuthService {
  signup(input: SignupInput): Promise<AuthResult>;
  login(input: LoginInput): Promise<AuthResult>;
  requestPasswordReset(email: string, captchaToken?: string): Promise<void>;
  completePasswordRecovery(password: string): Promise<void>;
  signOut(): void;
  getCurrentUser(): UserProfile | null;
  updateProfile(
    input: Pick<UserProfile, "fullName" | "email" | "phone" | "country">,
  ): UserProfile;
}

export interface OrganisationService {
  getCurrentOrganisation(): Organisation | null;
  listCurrentOrganisations(): Organisation[];
  selectCurrentOrganisation(organisationId: string): void;
  updateCurrentOrganisation(input: Partial<Organisation>): Organisation;
}

export interface RegistrationService {
  ensureCurrentDraft(): OrganisationApplication;
  getCurrentApplication(): OrganisationApplication | null;
  updateCategory(category: OrganisationCategory): OrganisationApplication;
  updateCategoryProfile(
    profile: OrganisationCategoryProfile,
  ): OrganisationApplication;
  updateRepresentative(
    representative: OrganisationRepresentative,
  ): OrganisationApplication;
  updateCurrentStep(step: 1 | 2 | 3 | 4): OrganisationApplication;
  submit(): OrganisationApplication;
}

export interface AdminService {
  listApplications(): OrganisationApplication[];
  getApplication(id: string): OrganisationApplication | null;
  updateStatus(
    id: string,
    status: Extract<
      RegistrationStatus,
      "under_review" | "verified" | "needs_changes" | "rejected" | "suspended"
    >,
    feedback?: string,
  ): OrganisationApplication;
}

export interface MockPlatformServices {
  readonly auth: AuthService;
  readonly organisations: OrganisationService;
  readonly registrations: RegistrationService;
  readonly admin: AdminService;
  readonly snapshot: () => MockPlatformState;
  readonly reset: () => MockPlatformState;
}

function delay(duration = 320): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

function applicationFromState(
  state: MockPlatformState,
  registration: OrganisationRegistration,
): OrganisationApplication | null {
  const organisation = state.organisations.find(
    (item) => item.id === registration.organisationId,
  );
  const representativeUser = state.users.find(
    (item) => item.id === registration.applicantUserId,
  );
  if (!organisation || !representativeUser) return null;
  return { organisation, registration, representativeUser };
}

export function createMockPlatformServices(
  repository: MockStateRepository,
  now: () => string = () => new Date().toISOString(),
): MockPlatformServices {
  const save = (state: MockPlatformState) => {
    repository.save(state);
    return state;
  };

  const currentApplication = (
    state: MockPlatformState,
  ): OrganisationApplication | null => {
    if (!state.currentUserId) return null;
    const membership = state.memberships.find(
      (item) => item.userId === state.currentUserId && item.isPrimary,
    );
    if (!membership) return null;
    const registration = state.registrations.find(
      (item) => item.organisationId === membership.organisationId,
    );
    return registration ? applicationFromState(state, registration) : null;
  };

  const ensureDraft = (): OrganisationApplication => {
    const state = repository.load();
    const existing = currentApplication(state);
    if (existing) return existing;

    const user = state.users.find((item) => item.id === state.currentUserId);
    if (!user) throw new Error("Sign in before starting a registration.");

    const timestamp = now();
    const organisation = createEmptyOrganisation(
      state.currentUserId === "user-current"
        ? "organisation-current"
        : `organisation-${user.id}`,
      timestamp,
    );
    const registration: OrganisationRegistration = {
      id:
        state.currentUserId === "user-current"
          ? "registration-current"
          : `registration-${user.id}`,
      organisationId: organisation.id,
      applicantUserId: user.id,
      status: "draft",
      currentStep: 1,
      categoryProfile: null,
      representative: createEmptyRepresentative(user),
      adminFeedback: "",
      submittedAt: "",
      reviewedAt: "",
      reviewedBy: "",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    state.organisations.push(organisation);
    state.memberships.push({
      id: `membership-${user.id}`,
      userId: user.id,
      organisationId: organisation.id,
      role: "owner",
      isPrimary: true,
      createdAt: timestamp,
    });
    state.registrations.push(registration);
    save(state);
    return { organisation, registration, representativeUser: user };
  };

  const auth: AuthService = {
    async signup(input) {
      await delay();
      const state = repository.load();
      const normalizedEmail = input.email.trim().toLowerCase();
      if (
        state.users.some(
          (user) =>
            user.email.toLowerCase() === normalizedEmail &&
            user.id !== "user-current",
        )
      ) {
        return {
          ok: false,
          message: "An account with this email already exists. Try signing in.",
        };
      }

      const timestamp = now();
      const existingIndex = state.users.findIndex(
        (user) => user.id === "user-current",
      );
      const user: UserProfile = {
        id: "user-current",
        fullName: input.fullName.trim(),
        email: normalizedEmail,
        phone: "",
        country: "",
        termsAcceptedAt: input.termsAccepted ? timestamp : null,
        createdAt:
          existingIndex >= 0
            ? (state.users[existingIndex]?.createdAt ?? timestamp)
            : timestamp,
      };
      if (existingIndex >= 0) state.users[existingIndex] = user;
      else state.users.push(user);
      state.currentUserId = user.id;
      save(state);
      return { ok: true, user };
    },

    async login(input) {
      await delay();
      const state = repository.load();
      const email = input.email.trim().toLowerCase();
      const isDemoLogin =
        email === demoCredentials.email &&
        input.password === demoCredentials.password;
      const isCurrentMockLogin =
        state.users.some(
          (user) => user.id === "user-current" && user.email === email,
        ) && input.password === demoCredentials.password;

      if (!isDemoLogin && !isCurrentMockLogin) {
        return {
          ok: false,
          message: "Those credentials were not recognised.",
        };
      }

      let user = state.users.find(
        (item) => item.email.trim().toLowerCase() === email,
      );
      if (!user && isDemoLogin) {
        user = createDemoUser();
        state.users.push(user);
      }
      if (!user) {
        return { ok: false, message: "That account is unavailable." };
      }
      state.currentUserId = user.id;
      save(state);
      return { ok: true, user };
    },

    async requestPasswordReset() {
      await delay();
    },

    async completePasswordRecovery() {
      await delay();
      const state = repository.load();
      state.currentUserId = null;
      save(state);
    },

    signOut() {
      const state = repository.load();
      state.currentUserId = null;
      save(state);
    },

    getCurrentUser() {
      const state = repository.load();
      return (
        state.users.find((user) => user.id === state.currentUserId) ?? null
      );
    },

    updateProfile(input) {
      const state = repository.load();
      const index = state.users.findIndex(
        (user) => user.id === state.currentUserId,
      );
      if (index < 0) throw new Error("Sign in before updating your account.");
      const existing = state.users[index] as UserProfile;
      const updated = { ...existing, ...input };
      state.users[index] = updated;
      save(state);
      return updated;
    },
  };

  const organisations: OrganisationService = {
    getCurrentOrganisation() {
      return currentApplication(repository.load())?.organisation ?? null;
    },
    listCurrentOrganisations() {
      const state = repository.load();
      if (!state.currentUserId) return [];
      const organisationIds = new Set(
        state.memberships
          .filter((membership) => membership.userId === state.currentUserId)
          .map((membership) => membership.organisationId),
      );
      return state.organisations.filter((organisation) =>
        organisationIds.has(organisation.id),
      );
    },
    selectCurrentOrganisation(organisationId) {
      const state = repository.load();
      if (!state.currentUserId) {
        throw new Error("Sign in before selecting an organisation.");
      }
      const memberships = state.memberships.filter(
        (membership) => membership.userId === state.currentUserId,
      );
      if (
        !memberships.some(
          (membership) => membership.organisationId === organisationId,
        )
      ) {
        throw new Error("That organisation is not linked to this account.");
      }
      for (const membership of memberships) {
        membership.isPrimary = membership.organisationId === organisationId;
      }
      save(state);
    },
    updateCurrentOrganisation(input) {
      const state = repository.load();
      const application = currentApplication(state);
      if (!application) throw new Error("Start a registration first.");
      const index = state.organisations.findIndex(
        (item) => item.id === application.organisation.id,
      );
      const updated: Organisation = {
        ...application.organisation,
        ...input,
        id: application.organisation.id,
        createdAt: application.organisation.createdAt,
        updatedAt: now(),
      };
      state.organisations[index] = updated;
      save(state);
      return updated;
    },
  };

  const registrations: RegistrationService = {
    ensureCurrentDraft: ensureDraft,
    getCurrentApplication() {
      return currentApplication(repository.load());
    },
    updateCategory(category) {
      const state = repository.load();
      const application = currentApplication(state) ?? ensureDraft();
      const freshState = repository.load();
      const organisationIndex = freshState.organisations.findIndex(
        (item) => item.id === application.organisation.id,
      );
      const registrationIndex = freshState.registrations.findIndex(
        (item) => item.id === application.registration.id,
      );
      const organisation = freshState.organisations[
        organisationIndex
      ] as Organisation;
      const registration = freshState.registrations[
        registrationIndex
      ] as OrganisationRegistration;
      organisation.category = category;
      organisation.updatedAt = now();
      registration.categoryProfile = createEmptyCategoryProfile(category);
      registration.updatedAt = now();
      save(freshState);
      return applicationFromState(
        freshState,
        registration,
      ) as OrganisationApplication;
    },
    updateCategoryProfile(profile) {
      const state = repository.load();
      const application = currentApplication(state);
      if (!application) throw new Error("Start a registration first.");
      application.registration.categoryProfile = profile;
      application.registration.updatedAt = now();
      save(state);
      return application;
    },
    updateRepresentative(representative) {
      const state = repository.load();
      const application = currentApplication(state);
      if (!application) throw new Error("Start a registration first.");
      application.registration.representative = representative;
      application.registration.updatedAt = now();
      save(state);
      return application;
    },
    updateCurrentStep(step) {
      const state = repository.load();
      const application = currentApplication(state);
      if (!application) throw new Error("Start a registration first.");
      application.registration.currentStep = step;
      application.registration.updatedAt = now();
      save(state);
      return application;
    },
    submit() {
      const state = repository.load();
      const application = currentApplication(state);
      if (!application) throw new Error("Start a registration first.");
      application.registration.status = "submitted";
      application.registration.submittedAt = now();
      application.registration.adminFeedback = "";
      application.registration.reviewedAt = "";
      application.registration.reviewedBy = "";
      application.registration.updatedAt = now();
      save(state);
      return application;
    },
  };

  const admin: AdminService = {
    listApplications() {
      const state = repository.load();
      return state.registrations
        .map((registration) => applicationFromState(state, registration))
        .filter(
          (application): application is OrganisationApplication =>
            application !== null,
        );
    },
    getApplication(id) {
      const state = repository.load();
      const registration = state.registrations.find((item) => item.id === id);
      return registration ? applicationFromState(state, registration) : null;
    },
    updateStatus(id, status, feedback = "") {
      const state = repository.load();
      const registration = state.registrations.find((item) => item.id === id);
      if (!registration) throw new Error("Registration not found.");
      registration.status = status;
      registration.adminFeedback = feedback.trim();
      registration.reviewedAt = now();
      registration.reviewedBy = "Tamil Ulagam review team";
      registration.updatedAt = now();
      save(state);
      return applicationFromState(
        state,
        registration,
      ) as OrganisationApplication;
    },
  };

  return {
    auth,
    organisations,
    registrations,
    admin,
    snapshot: () => repository.load(),
    reset: () => repository.reset(),
  };
}
