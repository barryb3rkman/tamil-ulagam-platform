import type {
  EnrollmentPlatformState,
  Organisation,
  OrganisationApplication,
  OrganisationCategory,
  OrganisationCategoryProfile,
  OrganisationRegistration,
  OrganisationRepresentative,
  UserProfile,
} from "@tamil-ulagam/shared";
import { isTamilSangamProfile, withBasePath } from "@tamil-ulagam/shared";
import type {
  AuthChangeEvent,
  EmailOtpType,
  SupabaseClient,
  User,
} from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import {
  mapCategoryProfileToDatabase,
  mapOrganisationToDatabase,
  mapRepresentativeToDatabase,
} from "@/lib/supabase/domain-mappers";
import {
  mapApplicationRow,
  mapCategoryDetailRow,
  mapOrganizationMemberRow,
  mapOrganizationRow,
  mapProfileRow,
  mapReviewHistoryRow,
  type ApplicationReviewHistoryRow,
  type CategoryDetailRow,
  type OrganizationApplicationRow,
  type OrganizationMemberRow,
  type OrganizationRow,
  type ProfileRow,
} from "@/lib/supabase/database-row-mappers";
import {
  getPlatformErrorMessage,
  mapSupabaseError,
  PlatformServiceError,
} from "@/lib/supabase/errors";

import type {
  AuthCallbackIntent,
  AuthCallbackResult,
  PlatformServices,
  RuntimeAuthEvent,
  RuntimeAuthResult,
} from "./platform-services";
import type { LoginInput, SignupInput } from "./services";

const categoryTables = [
  "organization_tamil_community_details",
  "organization_education_details",
  "organization_healthcare_details",
  "organization_business_details",
  "organization_nonprofit_details",
  "organization_other_details",
] as const;

function toRows<Row>(value: unknown, context: string): Row[] {
  if (!Array.isArray(value)) {
    throw new PlatformServiceError(
      `The enrollment service returned an invalid ${context} response.`,
      "unknown",
    );
  }
  return value as Row[];
}

function toOptionalRow<Row>(value: unknown, context: string): Row | null {
  if (value === null) return null;
  if (!value || typeof value !== "object") {
    throw new PlatformServiceError(
      `The enrollment service returned an invalid ${context} response.`,
      "unknown",
    );
  }
  return value as Row;
}

function requireRow<Row>(value: unknown, context: string): Row {
  const row = toOptionalRow<Row>(value, context);
  if (!row) {
    throw new PlatformServiceError(
      `The enrollment service returned an empty ${context} response.`,
      "unknown",
    );
  }
  return row;
}

function assertNoError(error: unknown, fallback: string): void {
  if (error) throw mapSupabaseError(error, fallback);
}

function isMissingSessionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const record = error as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name : "";
  const message = typeof record.message === "string" ? record.message : "";
  return (
    name === "AuthSessionMissingError" ||
    message.toLowerCase().includes("auth session missing")
  );
}

function mapAuthUser(user: User, profile: ProfileRow | null): UserProfile {
  const fullName =
    profile?.full_name ||
    (typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : "");
  return {
    id: user.id,
    fullName,
    email: user.email ?? "",
    phone: profile?.phone ?? user.phone ?? "",
    country: profile?.country ?? "",
    termsAcceptedAt: profile?.terms_accepted_at ?? null,
    createdAt: profile?.created_at ?? user.created_at,
  };
}

function emptyState(): EnrollmentPlatformState {
  return {
    version: 1,
    currentUserId: null,
    users: [],
    organisations: [],
    memberships: [],
    registrations: [],
  };
}

async function loadProfile(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<ProfileRow | null> {
  const { data, error } = await client
    .from("profiles")
    .select("id, full_name, phone, country, created_at")
    .eq("id", userId)
    .maybeSingle();
  assertNoError(error, "The account profile could not be loaded.");
  return toOptionalRow<ProfileRow>(data, "profile");
}

async function hasReviewerRole(
  client: SupabaseClient<Database>,
  authenticatedUser?: User,
): Promise<boolean> {
  if (!authenticatedUser) {
    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();
    if (isMissingSessionError(userError)) return false;
    assertNoError(userError, "Your session could not be restored.");
    if (!user) return false;
  }
  const { data, error } = await client.rpc("is_application_reviewer");
  assertNoError(error, "Review permissions could not be loaded.");
  return data === true;
}

async function loadCategoryDetails(
  client: SupabaseClient<Database>,
  organizationIds: readonly string[],
): Promise<Map<string, CategoryDetailRow>> {
  const details = new Map<string, CategoryDetailRow>();
  if (organizationIds.length === 0) return details;

  const results = await Promise.all(
    categoryTables.map((table) =>
      client.from(table).select("*").in("organization_id", organizationIds),
    ),
  );

  for (const result of results) {
    assertNoError(
      result.error,
      "Organisation category details could not be loaded.",
    );
    for (const row of toRows<CategoryDetailRow>(
      result.data,
      "category details",
    )) {
      details.set(row.organization_id, row);
    }
  }
  return details;
}

async function loadSnapshot(
  client: SupabaseClient<Database>,
): Promise<EnrollmentPlatformState> {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();
  if (isMissingSessionError(userError)) return emptyState();
  assertNoError(userError, "Your session could not be restored.");
  if (!user) return emptyState();

  const [profile, membershipResult, reviewer] = await Promise.all([
    loadProfile(client, user.id),
    client
      .from("organization_members")
      .select("id, organization_id, user_id, role, is_primary, created_at")
      .eq("user_id", user.id),
    hasReviewerRole(client, user),
  ]);
  assertNoError(
    membershipResult.error,
    "Organisation memberships could not be loaded.",
  );
  const membershipRows = toRows<OrganizationMemberRow>(
    membershipResult.data,
    "membership",
  );
  const memberOrganizationIds = membershipRows.map(
    (membership) => membership.organization_id,
  );

  const applicationQuery = client.from("organization_applications").select("*");
  const organizationQuery = client.from("organizations").select("*");
  const [applicationResult, organizationResult] = await Promise.all([
    reviewer || memberOrganizationIds.length === 0
      ? applicationQuery
      : applicationQuery.in("organization_id", memberOrganizationIds),
    reviewer || memberOrganizationIds.length === 0
      ? organizationQuery
      : organizationQuery.in("id", memberOrganizationIds),
  ]);
  assertNoError(
    applicationResult.error,
    "Organisation applications could not be loaded.",
  );
  assertNoError(organizationResult.error, "Organisations could not be loaded.");

  const applicationRows = toRows<OrganizationApplicationRow>(
    applicationResult.data,
    "application",
  );
  const organizationRows = toRows<OrganizationRow>(
    organizationResult.data,
    "organisation",
  );
  const organizationIds = organizationRows.map((row) => row.id);
  const applicationIds = applicationRows.map((row) => row.id);
  const relatedProfileIds = [
    ...new Set(
      applicationRows.flatMap((row) =>
        [row.submitted_by, row.reviewed_by].filter((id): id is string =>
          Boolean(id),
        ),
      ),
    ),
  ];

  const [categoryDetails, profileResult, historyResult] = await Promise.all([
    loadCategoryDetails(client, organizationIds),
    relatedProfileIds.length > 0
      ? client
          .from("profiles")
          .select("id, full_name, phone, country, created_at")
          .in("id", relatedProfileIds)
      : Promise.resolve({ data: [], error: null }),
    applicationIds.length > 0
      ? client
          .from("application_review_history")
          .select("*")
          .in("application_id", applicationIds)
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);
  assertNoError(
    profileResult.error,
    "Representative profiles could not be loaded.",
  );
  assertNoError(
    historyResult.error,
    "Application history could not be loaded.",
  );

  const profileRows = toRows<ProfileRow>(profileResult.data, "profile");
  const profileById = new Map(profileRows.map((row) => [row.id, row]));
  if (profile) profileById.set(profile.id, profile);
  const organizationById = new Map(
    organizationRows.map((row) => [row.id, row]),
  );
  const reviewRows = toRows<ApplicationReviewHistoryRow>(
    historyResult.data,
    "review history",
  );

  const registrations = applicationRows.map((row) => {
    const organization = organizationById.get(row.organization_id);
    const categoryProfile = organization?.category
      ? mapCategoryDetailRow(
          organization.category,
          categoryDetails.get(organization.id),
        )
      : null;
    const reviewerProfile = row.reviewed_by
      ? profileById.get(row.reviewed_by)
      : undefined;
    return mapApplicationRow(
      row,
      categoryProfile,
      reviewerProfile?.full_name ??
        (row.reviewed_by ? "Tamil Ulagam review team" : ""),
    );
  });

  const usersById = new Map<string, UserProfile>();
  usersById.set(user.id, mapAuthUser(user, profile));
  for (const row of applicationRows) {
    if (usersById.has(row.submitted_by)) continue;
    const applicantProfile = profileById.get(row.submitted_by);
    usersById.set(row.submitted_by, {
      id: row.submitted_by,
      fullName: applicantProfile?.full_name || row.representative_full_name,
      email: row.representative_email,
      phone: applicantProfile?.phone || row.representative_phone,
      country: applicantProfile?.country ?? "",
      termsAcceptedAt: applicantProfile?.terms_accepted_at ?? null,
      createdAt: applicantProfile?.created_at ?? row.created_at,
    });
  }

  return {
    version: 1,
    currentUserId: user.id,
    users: [...usersById.values()],
    organisations: organizationRows.map(mapOrganizationRow),
    memberships: membershipRows.map(mapOrganizationMemberRow),
    registrations: registrations.map((registration) => ({
      ...registration,
    })),
    reviewHistory: reviewRows.map(mapReviewHistoryRow),
  };
}

function applicationFromState(
  state: EnrollmentPlatformState,
  registration: OrganisationRegistration,
): OrganisationApplication | null {
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

// A Tamil Sangam (Phase D1) is registered through its own entry point
// (ensure_sangam_application_draft) precisely so it never becomes "the"
// application the generic Organisation journey resolves and edits — see
// that function's doc comment. This filter is the client-side half of
// that guarantee: even if a Sangam ever ended up as a caller's primary
// organisation_members row (e.g. it was their first-ever registration),
// the Organisation journey's own draft resolution must still skip past
// it rather than silently editing the Sangam record. A caller with no
// Sangam at all is completely unaffected — this filter is then a no-op.
function isSangamOrganisationId(
  state: EnrollmentPlatformState,
  organisationId: string,
): boolean {
  const registration = state.registrations.find(
    (item) => item.organisationId === organisationId,
  );
  return isTamilSangamProfile(registration?.categoryProfile ?? null);
}

function currentApplicationFromState(
  state: EnrollmentPlatformState,
): OrganisationApplication | null {
  if (!state.currentUserId) return null;
  const memberships = state.memberships.filter(
    (item) =>
      item.userId === state.currentUserId &&
      !isSangamOrganisationId(state, item.organisationId),
  );
  const membership =
    memberships.find((item) => item.isPrimary) ?? memberships.at(0);
  if (!membership) return null;
  const registration = state.registrations.find(
    (item) => item.organisationId === membership.organisationId,
  );
  return registration ? applicationFromState(state, registration) : null;
}

async function requireCurrentApplication(
  client: SupabaseClient<Database>,
): Promise<OrganisationApplication> {
  const application = currentApplicationFromState(await loadSnapshot(client));
  if (!application) {
    throw new PlatformServiceError(
      "Start an organisation registration before continuing.",
      "not_found",
    );
  }
  return application;
}

async function profileForUser(
  client: SupabaseClient<Database>,
  user: User,
): Promise<UserProfile> {
  return mapAuthUser(user, await loadProfile(client, user.id));
}

function authFailure(error: unknown): RuntimeAuthResult {
  return { ok: false, message: getPlatformErrorMessage(error) };
}

function authCallbackUrl(intent: AuthCallbackIntent): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const url = new URL(
    withBasePath("/auth/callback", basePath),
    window.location.origin,
  );
  url.searchParams.set("flow", intent);
  return url.toString();
}

function mapAuthEvent(event: AuthChangeEvent): RuntimeAuthEvent {
  const events: Record<AuthChangeEvent, RuntimeAuthEvent> = {
    INITIAL_SESSION: "initial_session",
    SIGNED_IN: "signed_in",
    SIGNED_OUT: "signed_out",
    PASSWORD_RECOVERY: "password_recovery",
    TOKEN_REFRESHED: "token_refreshed",
    USER_UPDATED: "user_updated",
    MFA_CHALLENGE_VERIFIED: "signed_in",
  };
  return events[event];
}

function invalidCallback(message?: string): AuthCallbackResult {
  return {
    status: "invalid",
    message:
      message ??
      "This link is invalid or has expired. Request a new link and try again.",
  };
}

function callbackErrorFromUrl(callbackUrl: URL): AuthCallbackResult | null {
  const hash = new URLSearchParams(callbackUrl.hash.replace(/^#/, ""));
  const errorCode =
    callbackUrl.searchParams.get("error_code") ?? hash.get("error_code") ?? "";
  const error =
    callbackUrl.searchParams.get("error") ?? hash.get("error") ?? "";
  if (!errorCode && !error) return null;
  return invalidCallback();
}

export function createSupabasePlatformServices(
  client: SupabaseClient<Database>,
): PlatformServices {
  let latestAuthEvent: RuntimeAuthEvent = "initial_session";

  const auth = {
    async signup(input: SignupInput): Promise<RuntimeAuthResult> {
      if (!input.termsAccepted) {
        return authFailure(
          new Error(
            "Agree to the Terms of Use and Privacy Policy to continue.",
          ),
        );
      }
      const { data, error } = await client.auth.signUp({
        email: input.email.trim().toLowerCase(),
        password: input.password,
        options: {
          data: {
            full_name: input.fullName.trim(),
            terms_accepted: "true",
          },
          emailRedirectTo: authCallbackUrl("confirmation"),
          ...(input.captchaToken ? { captchaToken: input.captchaToken } : {}),
        },
      });
      if (error) return authFailure(error);
      if (!data.user) {
        return authFailure(
          new Error("The account could not be created. Please try again."),
        );
      }
      return {
        ok: true,
        user: data.session
          ? await profileForUser(client, data.user)
          : mapAuthUser(data.user, null),
        requiresEmailConfirmation: !data.session,
      };
    },

    async login(input: LoginInput): Promise<RuntimeAuthResult> {
      const { data, error } = await client.auth.signInWithPassword({
        email: input.email.trim().toLowerCase(),
        password: input.password,
        ...(input.captchaToken
          ? { options: { captchaToken: input.captchaToken } }
          : {}),
      });
      if (error) return authFailure(error);
      if (!data.user) return authFailure(new Error("Account unavailable."));
      return { ok: true, user: await profileForUser(client, data.user) };
    },

    async requestPasswordReset(
      email: string,
      captchaToken?: string,
    ): Promise<void> {
      const { error } = await client.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: authCallbackUrl("recovery"),
          ...(captchaToken ? { captchaToken } : {}),
        },
      );
      assertNoError(error, "The password reset request could not be sent.");
    },

    async resolveAuthCallback(
      intent: AuthCallbackIntent,
      callbackUrlValue: string,
    ): Promise<AuthCallbackResult> {
      let callbackUrl: URL;
      try {
        callbackUrl = new URL(callbackUrlValue);
      } catch {
        return invalidCallback();
      }
      const callbackError = callbackErrorFromUrl(callbackUrl);
      if (callbackError) return callbackError;

      const tokenHash = callbackUrl.searchParams.get("token_hash")?.trim();
      const suppliedType = callbackUrl.searchParams.get("type")?.trim();
      if (tokenHash) {
        const expectedTypes: readonly EmailOtpType[] =
          intent === "recovery" ? ["recovery"] : ["signup", "email"];
        if (!suppliedType || !expectedTypes.includes(suppliedType)) {
          return invalidCallback();
        }
        const { error } = await client.auth.verifyOtp({
          token_hash: tokenHash,
          type: suppliedType,
        });
        if (error) return invalidCallback();
      }

      const { data, error } = await client.auth.getSession();
      if (error || !data.session) return invalidCallback();
      await new Promise<void>((resolve) => window.setTimeout(resolve, 0));

      if (intent === "recovery") {
        return latestAuthEvent === "password_recovery"
          ? { status: "recovery_ready" }
          : invalidCallback(
              "This page does not contain an active password recovery session. Request a new reset link before setting a password.",
            );
      }
      return latestAuthEvent === "signed_in"
        ? { status: "confirmation_success", hasSession: true }
        : invalidCallback(
            "Email confirmation could not be completed from this link. Request a new confirmation email or try signing in.",
          );
    },

    async completePasswordRecovery(password: string): Promise<void> {
      if (latestAuthEvent !== "password_recovery") {
        throw new PlatformServiceError(
          "This password recovery session is no longer valid. Request a new reset link.",
          "authentication",
        );
      }
      const { error } = await client.auth.updateUser({ password });
      assertNoError(error, "Your new password could not be saved.");
      const { error: signOutError } = await client.auth.signOut({
        scope: "local",
      });
      assertNoError(
        signOutError,
        "Your password was updated, but the recovery session could not be cleared. Close this page before signing in again.",
      );
      latestAuthEvent = "signed_out";
    },

    async signOut(): Promise<void> {
      const { error } = await client.auth.signOut();
      assertNoError(error, "You could not be signed out. Please try again.");
    },

    async getCurrentUser(): Promise<UserProfile | null> {
      const {
        data: { user },
        error,
      } = await client.auth.getUser();
      if (isMissingSessionError(error)) return null;
      assertNoError(error, "Your session could not be restored.");
      return user ? profileForUser(client, user) : null;
    },

    async updateProfile(
      input: Pick<UserProfile, "fullName" | "email" | "phone" | "country">,
    ): Promise<UserProfile> {
      const {
        data: { user },
        error: authError,
      } = await client.auth.updateUser({
        email: input.email.trim().toLowerCase(),
        data: { full_name: input.fullName.trim() },
      });
      assertNoError(authError, "Your account details could not be updated.");
      if (!user) {
        throw new PlatformServiceError(
          "Sign in before updating your account.",
          "authentication",
        );
      }

      const { data, error } = await client
        .from("profiles")
        .update({
          full_name: input.fullName.trim(),
          phone: input.phone.trim(),
          country: input.country.trim(),
        })
        .eq("id", user.id)
        .select("id, full_name, phone, country, created_at")
        .single();
      assertNoError(error, "Your profile could not be updated.");
      return mapProfileRow(
        requireRow<ProfileRow>(data, "profile"),
        user.email ?? input.email.trim().toLowerCase(),
      );
    },
  };

  const registrations = {
    async ensureCurrentDraft(): Promise<OrganisationApplication> {
      const existing = currentApplicationFromState(await loadSnapshot(client));
      if (existing) return existing;
      const { error } = await client.rpc(
        "create_organization_application_draft",
      );
      assertNoError(
        error,
        "The organisation registration could not be started.",
      );
      return requireCurrentApplication(client);
    },

    async getCurrentApplication(): Promise<OrganisationApplication | null> {
      return currentApplicationFromState(await loadSnapshot(client));
    },

    async updateCategory(
      category: OrganisationCategory,
    ): Promise<OrganisationApplication> {
      const application = await requireCurrentApplication(client);
      const { error } = await client
        .from("organizations")
        .update({ category })
        .eq("id", application.organisation.id);
      assertNoError(error, "The organisation category could not be saved.");
      return requireCurrentApplication(client);
    },

    async updateCategoryProfile(
      profile: OrganisationCategoryProfile,
    ): Promise<OrganisationApplication> {
      const application = await requireCurrentApplication(client);
      if (application.organisation.category !== profile.category) {
        throw new PlatformServiceError(
          "The category details do not match the selected organisation category.",
          "validation",
        );
      }
      const mutation = mapCategoryProfileToDatabase(
        application.organisation.id,
        profile,
      );
      let error: unknown = null;
      switch (mutation.table) {
        case "organization_tamil_community_details":
          ({ error } = await client
            .from("organization_tamil_community_details")
            .upsert(mutation.values, { onConflict: "organization_id" }));
          break;
        case "organization_education_details":
          ({ error } = await client
            .from("organization_education_details")
            .upsert(mutation.values, { onConflict: "organization_id" }));
          break;
        case "organization_healthcare_details":
          ({ error } = await client
            .from("organization_healthcare_details")
            .upsert(mutation.values, { onConflict: "organization_id" }));
          break;
        case "organization_business_details":
          ({ error } = await client
            .from("organization_business_details")
            .upsert(mutation.values, { onConflict: "organization_id" }));
          break;
        case "organization_nonprofit_details":
          ({ error } = await client
            .from("organization_nonprofit_details")
            .upsert(mutation.values, { onConflict: "organization_id" }));
          break;
        case "organization_other_details":
          ({ error } = await client
            .from("organization_other_details")
            .upsert(mutation.values, { onConflict: "organization_id" }));
          break;
      }
      assertNoError(error, "The category details could not be saved.");
      return requireCurrentApplication(client);
    },

    async updateRepresentative(
      representative: OrganisationRepresentative,
    ): Promise<OrganisationApplication> {
      const application = await requireCurrentApplication(client);
      const { error } = await client
        .from("organization_applications")
        .update(mapRepresentativeToDatabase(representative))
        .eq("id", application.registration.id);
      assertNoError(error, "The representative details could not be saved.");
      return requireCurrentApplication(client);
    },

    async updateCurrentStep(
      step: 1 | 2 | 3 | 4,
    ): Promise<OrganisationApplication> {
      const application = await requireCurrentApplication(client);
      const { error } = await client
        .from("organization_applications")
        .update({ current_step: step })
        .eq("id", application.registration.id);
      assertNoError(error, "Registration progress could not be saved.");
      return requireCurrentApplication(client);
    },

    async submit(): Promise<OrganisationApplication> {
      const application = await requireCurrentApplication(client);
      const { error } = await client.rpc("submit_organization_application", {
        target_application_id: application.registration.id,
      });
      assertNoError(
        error,
        "The organisation registration could not be submitted.",
      );
      return requireCurrentApplication(client);
    },
  };

  const organisations = {
    async getCurrentOrganisation(): Promise<Organisation | null> {
      return (
        currentApplicationFromState(await loadSnapshot(client))?.organisation ??
        null
      );
    },

    async listCurrentOrganisations(): Promise<Organisation[]> {
      const state = await loadSnapshot(client);
      if (!state.currentUserId) return [];
      const ids = new Set(
        state.memberships
          .filter((item) => item.userId === state.currentUserId)
          .map((item) => item.organisationId),
      );
      return state.organisations.filter((item) => ids.has(item.id));
    },

    async selectCurrentOrganisation(organisationId: string): Promise<void> {
      const { error } = await client.rpc("select_primary_organization", {
        target_organization_id: organisationId,
      });
      assertNoError(error, "The selected organisation could not be changed.");
    },

    async updateCurrentOrganisation(
      input: Partial<Organisation>,
    ): Promise<Organisation> {
      const application = await requireCurrentApplication(client);
      const next = { ...application.organisation, ...input };
      const { data, error } = await client
        .from("organizations")
        .update(mapOrganisationToDatabase(next))
        .eq("id", application.organisation.id)
        .select("*")
        .single();
      assertNoError(error, "The organisation details could not be saved.");
      return mapOrganizationRow(
        requireRow<OrganizationRow>(data, "organisation"),
      );
    },
  };

  const getAdminApplication = async (
    id: string,
  ): Promise<OrganisationApplication | null> => {
    if (!(await hasReviewerRole(client))) return null;
    const state = await loadSnapshot(client);
    const registration = state.registrations.find((item) => item.id === id);
    const representedOrganisationIds = new Set(
      state.memberships
        .filter((membership) => membership.userId === state.currentUserId)
        .map((membership) => membership.organisationId),
    );
    if (
      registration?.applicantUserId === state.currentUserId ||
      (registration &&
        representedOrganisationIds.has(registration.organisationId))
    ) {
      return null;
    }
    return registration ? applicationFromState(state, registration) : null;
  };

  const admin = {
    async listApplications(): Promise<OrganisationApplication[]> {
      if (!(await hasReviewerRole(client))) return [];
      const state = await loadSnapshot(client);
      const representedOrganisationIds = new Set(
        state.memberships
          .filter((membership) => membership.userId === state.currentUserId)
          .map((membership) => membership.organisationId),
      );
      return state.registrations.flatMap((registration) => {
        if (
          registration.applicantUserId === state.currentUserId ||
          representedOrganisationIds.has(registration.organisationId)
        ) {
          return [];
        }
        const application = applicationFromState(state, registration);
        return application ? [application] : [];
      });
    },

    async getApplication(id: string): Promise<OrganisationApplication | null> {
      return getAdminApplication(id);
    },

    async updateStatus(id, status, feedback = "") {
      const reviewFeedback = feedback.trim();
      const reviewArgs = {
        target_application_id: id,
        target_status: status,
        ...(reviewFeedback ? { review_feedback: reviewFeedback } : {}),
      };
      const { error } = await client.rpc(
        "review_organization_application",
        reviewArgs,
      );
      assertNoError(error, "The review decision could not be saved.");
      const application = await getAdminApplication(id);
      if (!application) {
        throw new PlatformServiceError(
          "The reviewed application could not be reloaded.",
          "not_found",
        );
      }
      return application;
    },
  } satisfies PlatformServices["admin"];

  return {
    kind: "supabase",
    auth,
    organisations,
    registrations,
    admin,
    snapshot: () => loadSnapshot(client),
    canReviewApplications: () => hasReviewerRole(client),
    async checkDuplicateSignals(input) {
      const { data, error } = await client.rpc(
        "check_duplicate_organization_signals",
        {
          candidate_name: input.name,
          candidate_official_email: input.officialEmail,
          candidate_registration_number: input.registrationNumber,
          exclude_organization_id: input.excludeOrganisationId ?? undefined,
        },
      );
      if (error || !data) {
        return {
          nameMatch: false,
          emailMatch: false,
          registrationNumberMatch: false,
          matches: [],
        };
      }
      const result = data as {
        nameMatch?: boolean;
        emailMatch?: boolean;
        registrationNumberMatch?: boolean;
        matches?: readonly { id: string; name: string }[];
      };
      return {
        nameMatch: Boolean(result.nameMatch),
        emailMatch: Boolean(result.emailMatch),
        registrationNumberMatch: Boolean(result.registrationNumberMatch),
        matches: result.matches ?? [],
      };
    },
    async requestOrganisationEmailVerification(organisationId) {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      const redirectPath = new URL(
        withBasePath("/dashboard/registration", basePath),
        window.location.origin,
      ).toString();
      const { data, error } = await client.functions.invoke(
        "organization-email-verification",
        { body: { organizationId: organisationId, redirectPath } },
      );
      if (error) return { ok: false, reason: "error" };
      const result = data as { ok?: boolean; reason?: string } | null;
      if (result?.ok) return { ok: true };
      return {
        ok: false,
        reason:
          result?.reason === "not_configured" ? "not_configured" : "error",
      };
    },
    async completeOrganisationEmailVerification(organisationId, token) {
      const { data, error } = await client.rpc("verify_organization_email", {
        target_organization_id: organisationId,
        raw_token: token,
      });
      return !error && data === true;
    },
    onAuthStateChange(listener) {
      const { data } = client.auth.onAuthStateChange((event) => {
        const mappedEvent = mapAuthEvent(event);
        latestAuthEvent = mappedEvent;
        window.setTimeout(() => listener(mappedEvent), 0);
      });
      return () => data.subscription.unsubscribe();
    },
  };
}
