import type {
  DuplicateSignalsInput,
  PlatformServices,
  RuntimeAdminService,
  RuntimeAuthService,
  RuntimeOrganisationService,
  RuntimeRegistrationService,
} from "./contracts";
import type {
  DuplicateOrganisationSignals,
  MockPlatformState,
  Organisation,
  OrganisationApplication,
  OrganisationRegistration,
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
): PlatformServices {
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

  const auth: RuntimeAuthService = {
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

    async resolveAuthCallback(intent, callbackUrl) {
      await Promise.resolve();
      const flow = new URL(callbackUrl).searchParams.get("mock");
      if (intent === "recovery" && flow === "recovery") {
        return { status: "recovery_ready" };
      }
      if (intent === "confirmation" && flow === "confirmation") {
        return { status: "confirmation_success", hasSession: true };
      }
      return {
        status: "invalid",
        message:
          "This link is invalid or has expired. Request a new link and try again.",
      };
    },

    async completePasswordRecovery() {
      await delay();
      const state = repository.load();
      state.currentUserId = null;
      save(state);
    },

    async signOut() {
      const state = repository.load();
      state.currentUserId = null;
      save(state);
    },

    async getCurrentUser() {
      const state = repository.load();
      return (
        state.users.find((user) => user.id === state.currentUserId) ?? null
      );
    },

    async updateProfile(input) {
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

  const organisations: RuntimeOrganisationService = {
    async getCurrentOrganisation() {
      return currentApplication(repository.load())?.organisation ?? null;
    },
    async listCurrentOrganisations() {
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
    async selectCurrentOrganisation(organisationId) {
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
    async updateCurrentOrganisation(input) {
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

  const registrations: RuntimeRegistrationService = {
    ensureCurrentDraft: () => Promise.resolve(ensureDraft()),
    async getCurrentApplication() {
      return currentApplication(repository.load());
    },
    async updateCategory(category) {
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
    async updateCategoryProfile(profile) {
      const state = repository.load();
      const application = currentApplication(state);
      if (!application) throw new Error("Start a registration first.");
      application.registration.categoryProfile = profile;
      application.registration.updatedAt = now();
      save(state);
      return application;
    },
    async updateRepresentative(representative) {
      const state = repository.load();
      const application = currentApplication(state);
      if (!application) throw new Error("Start a registration first.");
      application.registration.representative = representative;
      application.registration.updatedAt = now();
      save(state);
      return application;
    },
    async updateCurrentStep(step) {
      const state = repository.load();
      const application = currentApplication(state);
      if (!application) throw new Error("Start a registration first.");
      application.registration.currentStep = step;
      application.registration.updatedAt = now();
      save(state);
      return application;
    },
    async submit() {
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

  const admin: RuntimeAdminService = {
    async listApplications() {
      const state = repository.load();
      return state.registrations
        .map((registration) => applicationFromState(state, registration))
        .filter(
          (application): application is OrganisationApplication =>
            application !== null,
        );
    },
    async getApplication(id) {
      const state = repository.load();
      const registration = state.registrations.find((item) => item.id === id);
      return registration ? applicationFromState(state, registration) : null;
    },
    async updateStatus(id, status, feedback = "") {
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
    kind: "mock",
    auth,
    organisations,
    registrations,
    admin,
    snapshot: () => Promise.resolve(repository.load()),
    reset: () => Promise.resolve(repository.reset()),
    canReviewApplications: () => Promise.resolve(true),
    checkDuplicateSignals: (input) =>
      Promise.resolve(duplicateSignals(repository.load(), input)),
    requestOrganisationEmailVerification: () =>
      Promise.resolve({ ok: false, reason: "not_configured" }),
    completeOrganisationEmailVerification: () => Promise.resolve(false),
    onAuthStateChange: () => () => undefined,
  };
}

function duplicateSignals(
  state: MockPlatformState,
  input: DuplicateSignalsInput,
): DuplicateOrganisationSignals {
  const name = input.name.trim().toLowerCase();
  const email = input.officialEmail.trim().toLowerCase();
  const number = input.registrationNumber.trim().toLowerCase();
  const others = state.organisations.filter(
    (organisation) => organisation.id !== input.excludeOrganisationId,
  );
  const matches = (
    value: string,
    read: (organisation: Organisation) => string,
  ) =>
    value !== "" &&
    others.some(
      (organisation) => read(organisation).trim().toLowerCase() === value,
    );
  return {
    nameMatch: matches(name, (organisation) => organisation.name),
    emailMatch: matches(email, (organisation) => organisation.officialEmail),
    registrationNumberMatch: matches(
      number,
      (organisation) => organisation.registrationNumber,
    ),
    matches: [],
  };
}
