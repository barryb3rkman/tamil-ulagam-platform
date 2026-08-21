// @vitest-environment node

import type { OrganisationCategory } from "@tamil-ulagam/shared";
import {
  createClient,
  type PostgrestError,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";

import type { Database, Tables } from "./database.types";

const localDescribe =
  process.env.RUN_SUPABASE_INTEGRATION === "true"
    ? describe.sequential
    : describe.skip;

const password = "LocalTest!2048Aa";

interface TestActor {
  readonly user: User;
  readonly email: string;
  readonly client: SupabaseClient<Database>;
}

interface TestApplication {
  readonly actor: TestActor;
  readonly category: OrganisationCategory;
  readonly application: Tables<"organization_applications">;
}

function requireEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value)
    throw new Error(`${name} is required for local integration tests.`);
  return value;
}

function assertNoError(
  error: PostgrestError | null,
  context: string,
): asserts error is null {
  if (error) throw new Error(`${context}: ${error.message}`);
}

function requireData<T>(value: T | null, context: string): T {
  if (value === null) throw new Error(`${context} returned no data.`);
  return value;
}

localDescribe("local Supabase organisation enrollment security", () => {
  let apiUrl = "";
  let anonKey = "";
  let admin: SupabaseClient<Database>;
  const actors = new Map<string, TestActor>();
  const applications = new Map<OrganisationCategory, TestApplication>();

  beforeAll(() => {
    apiUrl = requireEnvironment("SUPABASE_LOCAL_URL");
    anonKey = requireEnvironment("SUPABASE_LOCAL_ANON_KEY");
    admin = createClient<Database>(
      apiUrl,
      requireEnvironment("SUPABASE_LOCAL_SERVICE_ROLE_KEY"),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  });

  async function createActor(
    slug: string,
    fullName: string,
    metadata: Readonly<Record<string, unknown>> = {},
    phone?: string,
  ): Promise<TestActor> {
    const email = `local-${slug}@tamil-ulagam.test`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      ...(phone ? { phone, phone_confirm: true } : {}),
      user_metadata: { full_name: fullName, ...metadata },
    });
    if (error) throw new Error(`Create ${slug}: ${error.message}`);

    const client = createClient<Database>(apiUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const signIn = await client.auth.signInWithPassword({ email, password });
    if (signIn.error) {
      throw new Error(`Sign in ${slug}: ${signIn.error.message}`);
    }
    const actor = { user: data.user, email, client };
    actors.set(slug, actor);
    return actor;
  }

  async function createDraft(
    actor: TestActor,
    category: OrganisationCategory,
  ): Promise<TestApplication> {
    const { data, error } = await actor.client.rpc(
      "create_organization_application_draft",
      { initial_category: category },
    );
    assertNoError(error, `Create ${category} draft`);
    const result = {
      actor,
      category,
      application: requireData(data, `Create ${category} draft`),
    };
    applications.set(category, result);
    return result;
  }

  async function completeCommonDetails({
    actor,
    category,
    application,
  }: TestApplication): Promise<void> {
    const label = category.replaceAll("_", " ");
    const organizationResult = await actor.client
      .from("organizations")
      .update({
        name: `Local ${label} organisation`,
        country: "Canada",
        region: "Ontario",
        city: "Toronto",
        street_address: "100 Tamil Community Way",
        official_email: actor.email,
        official_phone: "+1 416 555 0100",
        description: `A local ${label} organisation used for database verification.`,
        registration_status: "informal",
      })
      .eq("id", application.organization_id)
      .select("id")
      .single();
    assertNoError(organizationResult.error, `Update ${category} organisation`);

    const representativeResult = await actor.client
      .from("organization_applications")
      .update({
        representative_full_name: `Local ${label} representative`,
        representative_email: actor.email,
        representative_phone: "+1 416 555 0101",
        representative_designation: "Authorised Representative",
        representative_relationship: "authorised_representative",
        authorization_declaration: true,
        accuracy_declaration: true,
        current_step: 4,
      })
      .eq("id", application.id)
      .select("id")
      .single();
    assertNoError(
      representativeResult.error,
      `Update ${category} representative`,
    );
  }

  async function completeCategoryDetails(
    testApplication: TestApplication,
  ): Promise<void> {
    const { actor, category, application } = testApplication;
    const organizationId = application.organization_id;

    switch (category) {
      case "tamil_community": {
        const { error } = await actor.client
          .from("organization_tamil_community_details")
          .upsert({
            organization_id: organizationId,
            subtype: "Tamil Sangam",
            primary_activities: ["Tamil language education"],
          });
        assertNoError(error, "Save Tamil community details");
        break;
      }
      case "education": {
        const { error } = await actor.client
          .from("organization_education_details")
          .upsert({
            organization_id: organizationId,
            institution_type: "Tamil Language Institute",
            governance_type: "Non-profit",
            tamil_programmes_offered: true,
            tamil_programmes_description: "Tamil language programmes",
          });
        assertNoError(error, "Save education details");
        break;
      }
      case "healthcare": {
        const { error } = await actor.client
          .from("organization_healthcare_details")
          .upsert({
            organization_id: organizationId,
            facility_type: "Clinic",
            ownership_type: "Private",
            systems_of_medicine: ["Modern Medicine"],
            main_services: "Primary care",
            licensed: false,
          });
        assertNoError(error, "Save healthcare details");
        break;
      }
      case "business": {
        const { error } = await actor.client
          .from("organization_business_details")
          .upsert({
            organization_id: organizationId,
            business_type: "Private Company",
            industry: "Technology",
            products_services: "Community technology services",
          });
        assertNoError(error, "Save business details");
        break;
      }
      case "nonprofit": {
        const { error } = await actor.client
          .from("organization_nonprofit_details")
          .upsert({
            organization_id: organizationId,
            subtype: "Non-profit Association",
            primary_areas: ["Community development"],
          });
        assertNoError(error, "Save nonprofit details");
        break;
      }
      case "other": {
        const { error } = await actor.client
          .from("organization_other_details")
          .upsert({
            organization_id: organizationId,
            organization_type: "Professional network",
            primary_purpose: "Connect Tamil professionals responsibly.",
          });
        assertNoError(error, "Save other organisation details");
        break;
      }
    }
  }

  async function readStatus(
    actor: TestActor,
    applicationId: string,
  ): Promise<Tables<"organization_applications">["status"]> {
    const { data, error } = await actor.client
      .from("organization_applications")
      .select("status")
      .eq("id", applicationId)
      .single();
    assertNoError(error, "Read application status");
    return requireData(data, "Read application status").status;
  }

  it("creates safe profiles from real Auth users without deriving roles", async () => {
    const excessiveName = `  ${"அ".repeat(190)}  `;
    const applicant = await createActor(
      "applicant",
      excessiveName,
      { role: "admin", reviewer: true },
      "+14165550111",
    );
    await createActor("unrelated", "Unrelated User", { role: "reviewer" });
    await createActor("reviewer", "Local Reviewer", { role: "admin" });

    const { data: profile, error } = await applicant.client
      .from("profiles")
      .select("*")
      .single();
    assertNoError(error, "Load trigger-created profile");
    expect(profile?.id).toBe(applicant.user.id);
    expect(profile?.full_name).toHaveLength(160);
    expect(profile?.phone).toBe(applicant.user.phone);
    expect(profile?.phone).not.toBe("");
    expect(profile).not.toHaveProperty("email");

    const { data: roles, error: roleError } = await applicant.client
      .from("user_roles")
      .select("role");
    assertNoError(roleError, "Read applicant roles");
    expect(roles).toEqual([]);
  });

  it("enforces private profile reads and allowed self updates", async () => {
    const applicant = requireData(actors.get("applicant") ?? null, "Applicant");
    const unrelated = requireData(actors.get("unrelated") ?? null, "Unrelated");

    const updateResult = await applicant.client
      .from("profiles")
      .update({
        full_name: "Arun Kumar",
        country: "Canada",
        phone: "+14165550112",
      })
      .eq("id", applicant.user.id)
      .select("full_name, country, phone")
      .single();
    assertNoError(updateResult.error, "Update own profile");
    expect(updateResult.data).toMatchObject({
      full_name: "Arun Kumar",
      country: "Canada",
      phone: "+14165550112",
    });

    const otherProfile = await unrelated.client
      .from("profiles")
      .select("id")
      .eq("id", applicant.user.id);
    assertNoError(otherProfile.error, "Query another profile");
    expect(otherProfile.data).toEqual([]);

    const forbiddenIdentityChange = await applicant.client
      .from("profiles")
      .update({ id: unrelated.user.id })
      .eq("id", applicant.user.id);
    expect(forbiddenIdentityChange.error).not.toBeNull();
  });

  it("creates an incomplete draft atomically and enforces organisation and membership RLS", async () => {
    const applicant = requireData(actors.get("applicant") ?? null, "Applicant");
    const unrelated = requireData(actors.get("unrelated") ?? null, "Unrelated");
    const draft = await createDraft(applicant, "tamil_community");

    const duplicateDraft = await applicant.client.rpc(
      "create_organization_application_draft",
      { initial_category: "business" },
    );
    assertNoError(duplicateDraft.error, "Reuse current draft");
    expect(duplicateDraft.data?.id).toBe(draft.application.id);

    const partialSave = await applicant.client
      .from("organizations")
      .update({ name: "Local Tamil Sangam" })
      .eq("id", draft.application.organization_id)
      .select("name")
      .single();
    assertNoError(partialSave.error, "Save incomplete draft");
    expect(partialSave.data?.name).toBe("Local Tamil Sangam");

    const unrelatedRead = await unrelated.client
      .from("organizations")
      .select("id")
      .eq("id", draft.application.organization_id);
    assertNoError(unrelatedRead.error, "Unrelated organisation read");
    expect(unrelatedRead.data).toEqual([]);

    const unrelatedApplicationRead = await unrelated.client
      .from("organization_applications")
      .select("id")
      .eq("id", draft.application.id);
    assertNoError(unrelatedApplicationRead.error, "Unrelated application read");
    expect(unrelatedApplicationRead.data).toEqual([]);

    const unrelatedUpdate = await unrelated.client
      .from("organizations")
      .update({ name: "Unauthorized change" })
      .eq("id", draft.application.organization_id)
      .select("id");
    assertNoError(unrelatedUpdate.error, "Blocked unrelated update");
    expect(unrelatedUpdate.data).toEqual([]);

    const membershipInsert = await unrelated.client
      .from("organization_members")
      .insert({
        organization_id: draft.application.organization_id,
        user_id: unrelated.user.id,
        role: "admin",
      });
    expect(membershipInsert.error).not.toBeNull();

    const ownMembershipEscalation = await applicant.client
      .from("organization_members")
      .update({ role: "admin" })
      .eq("organization_id", draft.application.organization_id)
      .eq("user_id", applicant.user.id);
    expect(ownMembershipEscalation.error).not.toBeNull();

    const statusManipulation = await applicant.client
      .from("organization_applications")
      .update({ status: "verified" })
      .eq("id", draft.application.id);
    expect(statusManipulation.error).not.toBeNull();

    const incompleteSubmit = await applicant.client.rpc(
      "submit_organization_application",
      { target_application_id: draft.application.id },
    );
    expect(incompleteSubmit.error?.message).toContain(
      "Complete every required organization field",
    );
    expect(await readStatus(applicant, draft.application.id)).toBe("draft");

    const history = await applicant.client
      .from("application_review_history")
      .select("new_status")
      .eq("application_id", draft.application.id);
    assertNoError(history.error, "Read draft history");
    expect(history.data?.map((event) => event.new_status)).toEqual(["draft"]);
  });

  it("allows only represented primary organisations to be selected", async () => {
    const applicant = requireData(actors.get("applicant") ?? null, "Applicant");
    const unrelated = requireData(actors.get("unrelated") ?? null, "Unrelated");
    const draft = requireData(
      applications.get("tamil_community") ?? null,
      "Tamil application",
    );
    const secondOrganization = await admin
      .from("organizations")
      .insert({ name: "Second represented organisation", category: "other" })
      .select("id")
      .single();
    assertNoError(secondOrganization.error, "Create second organisation");
    const secondId = requireData(
      secondOrganization.data,
      "Create second organisation",
    ).id;
    const membership = await admin.from("organization_members").insert({
      organization_id: secondId,
      user_id: applicant.user.id,
      role: "representative",
      is_primary: false,
    });
    assertNoError(membership.error, "Create second membership");

    const selectSecond = await applicant.client.rpc(
      "select_primary_organization",
      { target_organization_id: secondId },
    );
    assertNoError(selectSecond.error, "Select represented organisation");
    const selected = await applicant.client
      .from("organization_members")
      .select("organization_id, is_primary")
      .eq("user_id", applicant.user.id);
    assertNoError(selected.error, "Read selected memberships");
    expect(
      selected.data?.find((item) => item.is_primary)?.organization_id,
    ).toBe(secondId);

    const selectUnrelated = await unrelated.client.rpc(
      "select_primary_organization",
      { target_organization_id: secondId },
    );
    expect(selectUnrelated.error).not.toBeNull();

    const restorePrimary = await applicant.client.rpc(
      "select_primary_organization",
      { target_organization_id: draft.application.organization_id },
    );
    assertNoError(restorePrimary.error, "Restore primary organisation");
  });

  it("prevents ordinary users from creating application roles", async () => {
    const applicant = requireData(actors.get("applicant") ?? null, "Applicant");
    const unrelated = requireData(actors.get("unrelated") ?? null, "Unrelated");
    const insertOwnRole = await applicant.client.from("user_roles").insert({
      user_id: applicant.user.id,
      role: "admin",
    });
    expect(insertOwnRole.error).not.toBeNull();

    const insertOtherRole = await unrelated.client.from("user_roles").insert({
      user_id: unrelated.user.id,
      role: "reviewer",
    });
    expect(insertOtherRole.error).not.toBeNull();
  });

  it("validates and submits complete applications for all six categories", async () => {
    const categoryActors: ReadonlyArray<
      readonly [OrganisationCategory, string, string]
    > = [
      ["education", "education", "Meena Education"],
      ["healthcare", "healthcare", "Anbu Healthcare"],
      ["business", "business", "Kavin Business"],
      ["nonprofit", "nonprofit", "Malar Nonprofit"],
      ["other", "other", "Nila Network"],
    ];

    for (const [category, slug, name] of categoryActors) {
      const actor = await createActor(slug, name);
      await createDraft(actor, category);
    }

    for (const testApplication of applications.values()) {
      await completeCommonDetails(testApplication);
      await completeCategoryDetails(testApplication);
      const submission = await testApplication.actor.client.rpc(
        "submit_organization_application",
        { target_application_id: testApplication.application.id },
      );
      assertNoError(submission.error, `Submit ${testApplication.category}`);
      expect(submission.data?.status).toBe("submitted");

      const history = await testApplication.actor.client
        .from("application_review_history")
        .select("new_status")
        .eq("application_id", testApplication.application.id)
        .order("created_at", { ascending: true });
      assertNoError(history.error, `Read ${testApplication.category} history`);
      expect(history.data?.map((event) => event.new_status)).toEqual([
        "draft",
        "submitted",
      ]);
    }
  });

  it("enforces reviewer authorization, change requests, resubmission and immutable history", async () => {
    const applicant = requireData(actors.get("applicant") ?? null, "Applicant");
    const unrelated = requireData(actors.get("unrelated") ?? null, "Unrelated");
    const reviewer = requireData(actors.get("reviewer") ?? null, "Reviewer");
    const tamil = requireData(
      applications.get("tamil_community") ?? null,
      "Tamil application",
    );

    const ordinaryReview = await unrelated.client.rpc(
      "review_organization_application",
      {
        target_application_id: tamil.application.id,
        target_status: "verified",
      },
    );
    expect(ordinaryReview.error).not.toBeNull();

    const grantReviewer = await admin.from("user_roles").insert({
      user_id: reviewer.user.id,
      role: "reviewer",
    });
    assertNoError(grantReviewer.error, "Grant reviewer role");

    const submittedQueue = await reviewer.client
      .from("organization_applications")
      .select("id, status")
      .eq("status", "submitted");
    assertNoError(submittedQueue.error, "Load reviewer queue");
    expect(submittedQueue.data?.length).toBeGreaterThanOrEqual(6);

    const underReview = await reviewer.client.rpc(
      "review_organization_application",
      {
        target_application_id: tamil.application.id,
        target_status: "under_review",
      },
    );
    assertNoError(underReview.error, "Mark under review");
    expect(underReview.data?.status).toBe("under_review");

    const missingFeedback = await reviewer.client.rpc(
      "review_organization_application",
      {
        target_application_id: tamil.application.id,
        target_status: "needs_changes",
      },
    );
    expect(missingFeedback.error?.message).toContain("Feedback is required");
    expect(await readStatus(reviewer, tamil.application.id)).toBe(
      "under_review",
    );

    const needsChanges = await reviewer.client.rpc(
      "review_organization_application",
      {
        target_application_id: tamil.application.id,
        target_status: "needs_changes",
        review_feedback: "Confirm the official phone number.",
      },
    );
    assertNoError(needsChanges.error, "Request changes");
    expect(needsChanges.data?.admin_feedback).toBe(
      "Confirm the official phone number.",
    );

    const correction = await applicant.client
      .from("organizations")
      .update({ official_phone: "+1 416 555 0199" })
      .eq("id", tamil.application.organization_id)
      .select("official_phone")
      .single();
    assertNoError(correction.error, "Correct requested details");

    const resubmission = await applicant.client.rpc(
      "submit_organization_application",
      { target_application_id: tamil.application.id },
    );
    assertNoError(resubmission.error, "Resubmit application");
    expect(resubmission.data?.status).toBe("submitted");
    expect(resubmission.data?.admin_feedback).toBeNull();

    const reviewHistory = await applicant.client
      .from("application_review_history")
      .select("previous_status, new_status")
      .eq("application_id", tamil.application.id)
      .order("created_at", { ascending: true });
    assertNoError(reviewHistory.error, "Read resubmission history");
    expect(reviewHistory.data?.map((event) => event.new_status)).toEqual([
      "draft",
      "submitted",
      "under_review",
      "needs_changes",
      "submitted",
    ]);
    expect(reviewHistory.data?.at(-1)?.previous_status).toBe("needs_changes");

    const historyInsert = await applicant.client
      .from("application_review_history")
      .insert({
        application_id: tamil.application.id,
        new_status: "verified",
      });
    expect(historyInsert.error).not.toBeNull();
    const existingHistoryId = requireData(
      (
        await applicant.client
          .from("application_review_history")
          .select("id")
          .eq("application_id", tamil.application.id)
          .limit(1)
          .single()
      ).data,
      "Existing history",
    ).id;
    const historyUpdate = await applicant.client
      .from("application_review_history")
      .update({ feedback: "Tampered" })
      .eq("id", existingHistoryId);
    expect(historyUpdate.error).not.toBeNull();
    const historyDelete = await applicant.client
      .from("application_review_history")
      .delete()
      .eq("id", existingHistoryId);
    expect(historyDelete.error).not.toBeNull();
  });

  it("prevents self-review and represented-organisation decisions", async () => {
    const applicant = requireData(actors.get("applicant") ?? null, "Applicant");
    const reviewer = requireData(actors.get("reviewer") ?? null, "Reviewer");
    const tamil = requireData(
      applications.get("tamil_community") ?? null,
      "Tamil application",
    );
    const nonprofit = requireData(
      applications.get("nonprofit") ?? null,
      "Nonprofit application",
    );

    const grantApplicantReviewer = await admin.from("user_roles").insert({
      user_id: applicant.user.id,
      role: "reviewer",
    });
    assertNoError(
      grantApplicantReviewer.error,
      "Grant applicant reviewer role",
    );
    const selfReview = await applicant.client.rpc(
      "review_organization_application",
      {
        target_application_id: tamil.application.id,
        target_status: "verified",
      },
    );
    expect(selfReview.error?.message).toContain(
      "cannot decide an application they submitted or represent",
    );

    const representedMembership = await admin
      .from("organization_members")
      .insert({
        organization_id: nonprofit.application.organization_id,
        user_id: reviewer.user.id,
        role: "representative",
      });
    assertNoError(
      representedMembership.error,
      "Create represented reviewer membership",
    );
    const representedDecision = await reviewer.client.rpc(
      "review_organization_application",
      {
        target_application_id: nonprofit.application.id,
        target_status: "rejected",
        review_feedback: "This must not be accepted.",
      },
    );
    expect(representedDecision.error?.message).toContain(
      "cannot decide an application they submitted or represent",
    );
    expect(await readStatus(reviewer, nonprofit.application.id)).toBe(
      "submitted",
    );
  });

  it("supports valid rejection, verification and reasoned suspension atomically", async () => {
    const reviewer = requireData(actors.get("reviewer") ?? null, "Reviewer");
    const tamil = requireData(
      applications.get("tamil_community") ?? null,
      "Tamil application",
    );
    const education = requireData(
      applications.get("education") ?? null,
      "Education application",
    );
    const unrelated = requireData(actors.get("unrelated") ?? null, "Unrelated");

    const reject = await reviewer.client.rpc(
      "review_organization_application",
      {
        target_application_id: education.application.id,
        target_status: "rejected",
        review_feedback: "Representative authority could not be confirmed.",
      },
    );
    assertNoError(reject.error, "Reject education application");
    expect(reject.data?.status).toBe("rejected");

    const reviewAgain = await reviewer.client.rpc(
      "review_organization_application",
      {
        target_application_id: tamil.application.id,
        target_status: "under_review",
      },
    );
    assertNoError(reviewAgain.error, "Review resubmitted application");
    const verify = await reviewer.client.rpc(
      "review_organization_application",
      {
        target_application_id: tamil.application.id,
        target_status: "verified",
      },
    );
    assertNoError(verify.error, "Verify application");
    expect(verify.data?.status).toBe("verified");

    const missingSuspensionReason = await reviewer.client.rpc(
      "review_organization_application",
      {
        target_application_id: tamil.application.id,
        target_status: "suspended",
      },
    );
    expect(missingSuspensionReason.error?.message).toContain(
      "Feedback is required",
    );
    expect(await readStatus(reviewer, tamil.application.id)).toBe("verified");

    const unauthorizedSuspension = await unrelated.client.rpc(
      "review_organization_application",
      {
        target_application_id: tamil.application.id,
        target_status: "suspended",
        review_feedback: "Unauthorized suspension.",
      },
    );
    expect(unauthorizedSuspension.error).not.toBeNull();

    const suspension = await reviewer.client.rpc(
      "review_organization_application",
      {
        target_application_id: tamil.application.id,
        target_status: "suspended",
        review_feedback: "Access paused for a governance review.",
      },
    );
    assertNoError(suspension.error, "Suspend verified application");
    expect(suspension.data).toMatchObject({
      status: "suspended",
      admin_feedback: "Access paused for a governance review.",
    });

    const finalHistory = await reviewer.client
      .from("application_review_history")
      .select("new_status, feedback")
      .eq("application_id", tamil.application.id)
      .order("created_at", { ascending: true });
    assertNoError(finalHistory.error, "Read final review history");
    expect(finalHistory.data?.at(-1)).toMatchObject({
      new_status: "suspended",
      feedback: "Access paused for a governance review.",
    });
  });
});
