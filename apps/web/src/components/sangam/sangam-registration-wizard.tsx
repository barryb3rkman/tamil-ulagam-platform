"use client";

import type {
  Organisation,
  OrganisationApplication,
  TamilCommunityProfile,
} from "@tamil-ulagam/shared";
import {
  Alert,
  ImageWithFallback,
  Skeleton,
  StageProgress,
} from "@tamil-ulagam/ui";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  CheckboxField,
  FormActions,
  FormError,
  RadioGroup,
  TextField,
} from "@/components/application/form-fields";
import {
  sangamNetworkAffiliationOptions,
  sangamRegisteredOptions,
  sangamStageOneContent,
  sangamStages,
  sangamStageThreeContent,
  sangamStageTwoContent,
} from "@/content/sangam";
import { usePlatform } from "@/features/enrollment/platform-provider";
import { useAutosave } from "@/features/enrollment/use-autosave";
import {
  isValid,
  type ValidationErrors,
} from "@/features/enrollment/validation";
import {
  normalizeUrl,
  validatePresident,
  validateSangamIdentity,
  validateSangamRegistrationDetails,
  validateSocialLinks,
  validateSpoc,
  validateWebsite,
} from "@/features/sangam/sangam-validation";
import { useSangamRegistrationService } from "@/features/sangam/use-sangam-registration-service";
import { joinImages } from "@/config/join-images";

import {
  RegistrationDocumentField,
  type DocumentUploadStatus,
} from "./registration-document-field";
import { SangamLoggedOut } from "./sangam-logged-out";
import { SangamReview } from "./sangam-review";
import { SangamStatusScreen } from "./sangam-status-screen";
import { SocialLinksField } from "./social-links-field";

type LoadState = "loading" | "loaded" | "error";
type Stage = 1 | 2 | 3 | 4;

const editableStatuses = new Set(["draft", "needs_changes"]);

/**
 * Top-level /join/sangam orchestrator — Phase H3 (Tamil Sangam
 * registration V2) rewrite. Four stages (About your Sangam /
 * Registration details / Leadership & contact / Review & submit),
 * replacing the old three-intake-stage structure that asked for a
 * generic "Representative" and an "Official Sangam email" — both
 * retired from the Sangam UX (H3 brief sections 3/4). SPOC is the one
 * human contact mapped into the shared `representative` concept
 * (fullName/email/phone/relationship + declaration) purely for storage
 * compatibility with submit_organization_application; the President is
 * genuinely new, Sangam-only state living on TamilCommunityProfile.
 * There is deliberately no separate `representative` state any more —
 * it is derived at persist-time from `profile`'s SPOC fields plus the
 * local `declared` flag.
 */
export function SangamRegistrationWizard() {
  const { currentUser, isHydrated } = usePlatform();
  const service = useSangamRegistrationService();

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState("");
  const [application, setApplication] =
    useState<OrganisationApplication | null>(null);
  const [stage, setStage] = useState<Stage>(1);
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [profile, setProfile] = useState<TamilCommunityProfile | null>(null);
  const [declared, setDeclared] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [pending, setPending] = useState(false);
  const [documentStatus, setDocumentStatus] =
    useState<DocumentUploadStatus>("idle");
  const [documentError, setDocumentError] = useState("");
  const initializedRef = useRef<string | null>(null);

  // Autosave (preserved from H2) — text/select/radio/social-link edits
  // autosave normally through the same shared hook. Document upload is
  // deliberately NOT part of this: it persists on upload completion via
  // its own dedicated call (handleDocumentSelect below), so an unrelated
  // text-field autosave tick can never re-upload the same file (H3 brief
  // section 23).
  const persistCurrentStage = async () => {
    if (!service || !application || !organisation || !profile) return;
    if (stage === 1) {
      await Promise.all([
        service.updateOrganisation(organisation.id, organisation),
        service.updateCategoryProfile(organisation.id, profile),
      ]);
    } else if (stage === 2) {
      await Promise.all([
        service.updateOrganisation(organisation.id, organisation),
        service.updateCategoryProfile(organisation.id, profile),
      ]);
    } else if (stage === 3) {
      const [normalisedOrganisation, normalisedProfile] =
        sanitiseUrlsForPersistence(organisation, profile);
      await Promise.all([
        service.updateOrganisation(
          normalisedOrganisation.id,
          normalisedOrganisation,
        ),
        service.updateCategoryProfile(
          normalisedOrganisation.id,
          normalisedProfile,
        ),
        service.updateRepresentative(
          application.registration.id,
          spocAsRepresentative(profile, declared),
        ),
      ]);
    }
  };

  const autosave = useAutosave(
    persistCurrentStage,
    [organisation, profile, declared],
    { enabled: Boolean(service && application && organisation && profile) },
  );

  const load = useCallback(() => {
    if (!service) return;
    service
      .ensureDraft()
      .then((result) => {
        setApplication(result);
        setLoadState("loaded");
      })
      .catch((error: unknown) => {
        setLoadError(
          error instanceof Error
            ? error.message
            : "Your Tamil Sangam registration could not be started.",
        );
        setLoadState("error");
      });
  }, [service]);

  useEffect(() => {
    if (isHydrated && currentUser && service) load();
  }, [isHydrated, currentUser, service, load]);

  useEffect(() => {
    if (!application) return;
    if (initializedRef.current === application.registration.id) return;
    initializedRef.current = application.registration.id;
    setOrganisation(application.organisation);
    const loadedProfile =
      application.registration.categoryProfile?.category === "tamil_community"
        ? application.registration.categoryProfile
        : null;
    setProfile(loadedProfile);
    setDeclared(
      application.registration.representative.authorisedDeclaration &&
        application.registration.representative.accuracyDeclaration,
    );
    setDocumentStatus(
      loadedProfile?.registrationDocumentPath ? "uploaded" : "idle",
    );
    setStage(
      Math.min(4, Math.max(1, application.registration.currentStep)) as Stage,
    );
  }, [application]);

  if (!isHydrated) {
    return (
      <SangamFrame currentStage={1}>
        <Skeleton className="h-96 w-full" />
      </SangamFrame>
    );
  }

  if (!currentUser) {
    return <SangamLoggedOut />;
  }

  if (!service) {
    return (
      <SangamFrame currentStage={1}>
        <Alert tone="info" title="Sangam registration is not available here">
          Tamil Sangam registration is not configured for this deployment.
        </Alert>
      </SangamFrame>
    );
  }

  if (loadState === "loading") {
    return (
      <SangamFrame currentStage={1}>
        <Skeleton className="h-96 w-full" />
      </SangamFrame>
    );
  }

  if (loadState === "error") {
    return (
      <SangamFrame currentStage={1}>
        <Alert tone="error" role="alert" title="Something went wrong">
          {loadError}
        </Alert>
        <button
          type="button"
          onClick={() => {
            setLoadState("loading");
            load();
          }}
          className="border-global-navy text-global-navy focus-visible:ring-focus rounded-button mt-4 min-h-11 border px-5 text-sm font-semibold"
        >
          Try again
        </button>
      </SangamFrame>
    );
  }

  if (!application || !organisation || !profile) {
    return (
      <SangamFrame currentStage={1}>
        <Skeleton className="h-96 w-full" />
      </SangamFrame>
    );
  }

  if (!editableStatuses.has(application.registration.status)) {
    return <SangamStatusScreen application={application} />;
  }

  const moveTo = async (nextStage: Stage) => {
    await autosave.flush();
    await service.updateCurrentStep(application.registration.id, nextStage);
    setStage(nextStage);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRegistrationStatusChange = (value: string) => {
    const previous = organisation.registrationStatus;
    // H3 brief section 8: switching from Yes to No must not preserve a
    // now-irrelevant registration number/document.
    const clearingDocument = previous === "registered" && value === "informal";
    setOrganisation({
      ...organisation,
      registrationStatus: value as Organisation["registrationStatus"],
      registrationNumber: clearingDocument
        ? ""
        : organisation.registrationNumber,
    });
    if (clearingDocument) {
      if (profile.registrationDocumentPath) {
        void service.removeRegistrationDocument(organisation.id).catch(() => {
          // Best-effort — the field is no longer required either way;
          // a leftover object is cleaned up on the next successful call.
        });
      }
      setProfile({
        ...profile,
        registrationDocumentPath: "",
        registrationDocumentFilename: "",
        registrationDocumentUploadedAt: "",
      });
      setDocumentStatus("idle");
      setDocumentError("");
    }
  };

  const handleDocumentSelect = async (file: File) => {
    setDocumentStatus("uploading");
    setDocumentError("");
    try {
      const result = await service.uploadRegistrationDocument(
        organisation.id,
        application.registration.id,
        file,
      );
      setProfile({
        ...profile,
        registrationDocumentPath: result.path,
        registrationDocumentFilename: result.filename,
        registrationDocumentUploadedAt: result.uploadedAt,
      });
      setDocumentStatus("uploaded");
    } catch (error: unknown) {
      setDocumentStatus("error");
      setDocumentError(
        error instanceof Error
          ? error.message
          : "The registration document could not be uploaded.",
      );
    }
  };

  const handleDocumentRemove = async () => {
    setDocumentError("");
    try {
      await service.removeRegistrationDocument(organisation.id);
      setProfile({
        ...profile,
        registrationDocumentPath: "",
        registrationDocumentFilename: "",
        registrationDocumentUploadedAt: "",
      });
      setDocumentStatus("idle");
    } catch (error: unknown) {
      setDocumentError(
        error instanceof Error
          ? error.message
          : "The registration document could not be removed.",
      );
    }
  };

  const submitStage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (documentStatus === "uploading") {
      // H3 brief section 24 — Continue must behave safely mid-upload
      // rather than advancing with a not-yet-confirmed document.
      setErrors({
        form: "Wait for the registration document to finish uploading.",
      });
      return;
    }
    if (stage === 1) {
      const nextErrors = validateSangamIdentity(organisation, profile);
      setErrors(nextErrors);
      if (!isValid(nextErrors)) return;
      setPending(true);
      try {
        await service.updateOrganisation(organisation.id, organisation);
        await service.updateCategoryProfile(organisation.id, profile);
        await moveTo(2);
      } catch (error: unknown) {
        setErrors({
          form:
            error instanceof Error
              ? error.message
              : "Your Sangam's details could not be saved.",
        });
      } finally {
        setPending(false);
      }
      return;
    }
    if (stage === 2) {
      const nextErrors = validateSangamRegistrationDetails(
        organisation,
        documentStatus === "uploaded" &&
          Boolean(profile.registrationDocumentPath),
      );
      setErrors(nextErrors);
      if (!isValid(nextErrors)) return;
      setPending(true);
      try {
        await service.updateOrganisation(organisation.id, organisation);
        await service.updateCategoryProfile(organisation.id, profile);
        await moveTo(3);
      } catch (error: unknown) {
        setErrors({
          form:
            error instanceof Error
              ? error.message
              : "Registration details could not be saved.",
        });
      } finally {
        setPending(false);
      }
      return;
    }
    if (stage === 3) {
      const nextErrors: ValidationErrors = {
        ...validateSpoc(profile),
        ...validatePresident(profile),
        ...validateWebsite(organisation),
      };
      const socialLinksError = validateSocialLinks(profile.socialLinks);
      if (socialLinksError) nextErrors.socialLinks = socialLinksError;
      if (!declared) {
        nextErrors.declaration =
          "Confirm that you are authorised to represent this Tamil Sangam and that the information is accurate.";
      }
      setErrors(nextErrors);
      if (!isValid(nextErrors)) return;
      setPending(true);
      try {
        const [normalisedOrganisation, normalisedProfile] =
          sanitiseUrlsForPersistence(organisation, profile);
        await service.updateOrganisation(
          normalisedOrganisation.id,
          normalisedOrganisation,
        );
        await service.updateCategoryProfile(
          normalisedOrganisation.id,
          normalisedProfile,
        );
        await service.updateRepresentative(
          application.registration.id,
          spocAsRepresentative(profile, declared),
        );
        await moveTo(4);
      } catch (error: unknown) {
        setErrors({
          form:
            error instanceof Error
              ? error.message
              : "Leadership and contact details could not be saved.",
        });
      } finally {
        setPending(false);
      }
    }
  };

  if (stage === 4) {
    return (
      <SangamReview
        application={{
          ...application,
          organisation,
          registration: {
            ...application.registration,
            categoryProfile: profile,
            representative: spocAsRepresentative(profile, declared),
          },
        }}
        onEdit={(targetStage) => void moveTo(targetStage)}
        onSubmitted={(updated) => setApplication(updated)}
      />
    );
  }

  return (
    <SangamFrame currentStage={stage}>
      <form noValidate onSubmit={submitStage} className="grid gap-6">
        {stage === 1 ? (
          <StageAboutYourSangam
            organisation={organisation}
            profile={profile}
            errors={errors}
            onOrganisationChange={setOrganisation}
            onProfileChange={setProfile}
          />
        ) : null}
        {stage === 2 ? (
          <StageRegistrationDetails
            organisation={organisation}
            profile={profile}
            errors={errors}
            documentStatus={documentStatus}
            documentError={documentError}
            onOrganisationChange={setOrganisation}
            onProfileChange={setProfile}
            onRegistrationStatusChange={handleRegistrationStatusChange}
            onDocumentSelect={(file) => void handleDocumentSelect(file)}
            onDocumentRemove={() => void handleDocumentRemove()}
          />
        ) : null}
        {stage === 3 ? (
          <StageLeadershipContact
            organisation={organisation}
            profile={profile}
            declared={declared}
            errors={errors}
            onOrganisationChange={setOrganisation}
            onProfileChange={setProfile}
            onDeclaredChange={setDeclared}
          />
        ) : null}
        <FormError message={errors.form ?? ""} />
        <FormActions
          onBack={
            stage > 1 ? () => void moveTo((stage - 1) as Stage) : undefined
          }
          onRetry={() => void autosave.retry()}
          pending={pending}
          saveStatus={autosave.status}
          nextLabel={stage === 3 ? "Review & submit" : "Continue"}
        />
      </form>
    </SangamFrame>
  );
}

/** Maps the SPOC — the Sangam UX's one human contact concept that
 * corresponds to the shared representative model (H3 brief section 4) —
 * into the exact shape submit_organization_application and the review
 * screen already expect. `relationship` is fixed to
 * "authorised_representative" rather than exposed as a choice: the
 * Sangam wizard no longer asks "what is your role", it asks for a named
 * SPOC and a named President as two separate, always-present fields. */
function spocAsRepresentative(
  profile: TamilCommunityProfile,
  declared: boolean,
) {
  return {
    fullName: profile.spocFullName,
    email: profile.spocEmail,
    phone: profile.spocPhone,
    designation: "",
    relationship: "authorised_representative" as const,
    authorisedDeclaration: declared,
    accuracyDeclaration: declared,
  };
}

/** Defensive normalization, applied right before either the debounced
 * autosave or the explicit stage-3 submit talks to the server — a bare
 * domain (accepted while typing, per H3 brief section 17) violates the
 * database's own `organizations_website_format`/
 * `organization_social_links_url_format` check constraints, which
 * require an explicit http(s):// scheme. The field-level onBlur handlers
 * already normalize on the way out of each input for a real user, but
 * autosave can also fire mid-typing (before any blur), so this is a
 * second, unconditional guarantee rather than the only one. Falls back
 * to the original (already-validated-or-empty) value when normalization
 * itself fails, rather than silently dropping user input. */
function sanitiseUrlsForPersistence(
  organisation: Organisation,
  profile: TamilCommunityProfile,
): [Organisation, TamilCommunityProfile] {
  const website = organisation.website.trim()
    ? normalizeUrl(organisation.website) || organisation.website
    : "";
  const socialLinks = profile.socialLinks.map((link) =>
    link.trim() ? normalizeUrl(link) || link : link,
  );
  return [
    { ...organisation, website },
    { ...profile, socialLinks },
  ];
}

function SangamFrame({
  children,
  currentStage,
}: {
  readonly children: React.ReactNode;
  readonly currentStage: number;
}) {
  return (
    <section className="gradient-warm-welcome">
      <div className="mx-auto max-w-[74rem] px-5 py-10 sm:px-7 sm:py-14 lg:px-10">
        <div className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)] lg:items-center">
          <div>
            <p className="text-heritage-maroon text-xs font-bold tracking-[0.16em] uppercase">
              Tamil Sangam registration
            </p>
            <h1 className="text-global-navy mt-3 text-3xl leading-tight font-bold tracking-[-0.03em] sm:text-4xl">
              Register your Sangam
            </h1>
            <p className="text-slate mt-3 max-w-xl leading-7">
              A few short stages to get your Sangam into federation review.
            </p>
          </div>
          {currentStage === 1 ? (
            <div className="rounded-large border-global-navy/10 shadow-card hidden min-h-48 overflow-hidden border bg-white sm:block">
              <ImageWithFallback
                asset={joinImages.sangamJourneyHero}
                className="h-full w-full object-cover"
                sizes="(min-width: 1024px) 32vw, 100vw"
              />
            </div>
          ) : null}
        </div>
        <StageProgress stages={[...sangamStages]} currentStage={currentStage} />
        {children}
      </div>
    </section>
  );
}

function StageAboutYourSangam({
  organisation,
  profile,
  errors,
  onOrganisationChange,
  onProfileChange,
}: {
  readonly organisation: Organisation;
  readonly profile: TamilCommunityProfile;
  readonly errors: ValidationErrors;
  readonly onOrganisationChange: (organisation: Organisation) => void;
  readonly onProfileChange: (profile: TamilCommunityProfile) => void;
}) {
  const updateOrg = (key: keyof Organisation, value: string) =>
    onOrganisationChange({ ...organisation, [key]: value });
  return (
    <div className="surface-card grid gap-6 p-5 sm:p-7 lg:p-8">
      <div className="max-w-xl">
        <h2 className="text-global-navy text-xl font-bold tracking-[-0.01em] sm:text-2xl">
          {sangamStageOneContent.title}
        </h2>
        <p className="text-slate mt-2 leading-6">
          {sangamStageOneContent.description}
        </p>
      </div>
      <TextField
        label="Sangam name"
        required
        value={organisation.name}
        error={errors.name}
        onChange={(event) => updateOrg("name", event.target.value)}
      />
      <div className="grid items-start gap-5 sm:grid-cols-2">
        <div className="sm:max-w-60">
          <TextField
            label="Year of commencement"
            required
            inputMode="numeric"
            maxLength={4}
            value={organisation.yearEstablished}
            error={errors.yearEstablished}
            onChange={(event) =>
              updateOrg("yearEstablished", event.target.value)
            }
          />
        </div>
        <div className="sm:max-w-60">
          <TextField
            label="Approximate number of members"
            required
            inputMode="numeric"
            maxLength={7}
            value={profile.memberCount}
            error={errors.memberCount}
            onChange={(event) =>
              onProfileChange({
                ...profile,
                memberCount: event.target.value.replace(/[^\d]/g, ""),
              })
            }
          />
        </div>
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-3">
        <TextField
          label="Country"
          required
          value={organisation.country}
          error={errors.country}
          onChange={(event) => updateOrg("country", event.target.value)}
        />
        <TextField
          label="State / Province / Region"
          required
          value={organisation.region}
          error={errors.region}
          onChange={(event) => updateOrg("region", event.target.value)}
        />
        <TextField
          label="City"
          required
          value={organisation.city}
          error={errors.city}
          onChange={(event) => updateOrg("city", event.target.value)}
        />
      </div>
    </div>
  );
}

function StageRegistrationDetails({
  documentError,
  documentStatus,
  errors,
  onDocumentRemove,
  onDocumentSelect,
  onOrganisationChange,
  onProfileChange,
  onRegistrationStatusChange,
  organisation,
  profile,
}: {
  readonly organisation: Organisation;
  readonly profile: TamilCommunityProfile;
  readonly errors: ValidationErrors;
  readonly documentStatus: DocumentUploadStatus;
  readonly documentError: string;
  readonly onOrganisationChange: (organisation: Organisation) => void;
  readonly onProfileChange: (profile: TamilCommunityProfile) => void;
  readonly onRegistrationStatusChange: (value: string) => void;
  readonly onDocumentSelect: (file: File) => void;
  readonly onDocumentRemove: () => void;
}) {
  const updateOrg = (key: keyof Organisation, value: string) =>
    onOrganisationChange({ ...organisation, [key]: value });
  const networkValue =
    profile.networkAffiliated === "yes" || profile.networkAffiliated === "no"
      ? profile.networkAffiliated
      : "";
  const isRegistered = organisation.registrationStatus === "registered";
  return (
    <div className="surface-card grid gap-6 p-5 sm:p-7 lg:p-8">
      <div className="max-w-xl">
        <h2 className="text-global-navy text-xl font-bold tracking-[-0.01em] sm:text-2xl">
          {sangamStageTwoContent.title}
        </h2>
        <p className="text-slate mt-2 leading-6">
          {sangamStageTwoContent.description}
        </p>
      </div>
      <Alert tone="info">{sangamStageTwoContent.informalNotice}</Alert>
      <RadioGroup
        label="Is this Tamil Sangam formally registered?"
        name="registration-status"
        required
        value={organisation.registrationStatus}
        options={sangamRegisteredOptions}
        error={errors.registrationStatus}
        onChange={(event) => onRegistrationStatusChange(event.target.value)}
      />
      {isRegistered ? (
        <div className="border-heritage-gold/35 grid gap-5 border-l-2 pl-4">
          <div className="sm:max-w-sm">
            <TextField
              label="Registration number"
              required
              value={organisation.registrationNumber}
              error={errors.registrationNumber}
              onChange={(event) =>
                updateOrg("registrationNumber", event.target.value)
              }
            />
          </div>
          <RegistrationDocumentField
            status={documentStatus}
            filename={profile.registrationDocumentFilename || undefined}
            error={documentError || errors.registrationDocument}
            onSelect={onDocumentSelect}
            onRemove={onDocumentRemove}
          />
        </div>
      ) : null}
      <div className="border-global-navy/10 grid gap-4 border-t pt-6">
        <RadioGroup
          label={sangamStageTwoContent.networkQuestion}
          name="network-affiliated"
          value={networkValue}
          options={sangamNetworkAffiliationOptions}
          onChange={(event) =>
            onProfileChange({
              ...profile,
              networkAffiliated:
                event.target.value === "yes" || event.target.value === "no"
                  ? event.target.value
                  : "",
            })
          }
        />
        {networkValue === "yes" ? (
          <div className="sm:max-w-sm">
            <TextField
              label="Network or federation name"
              value={profile.networkName}
              helperText={sangamStageTwoContent.networkNameHelp}
              onChange={(event) =>
                onProfileChange({ ...profile, networkName: event.target.value })
              }
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StageLeadershipContact({
  declared,
  errors,
  onDeclaredChange,
  onOrganisationChange,
  onProfileChange,
  organisation,
  profile,
}: {
  readonly organisation: Organisation;
  readonly profile: TamilCommunityProfile;
  readonly declared: boolean;
  readonly errors: ValidationErrors;
  readonly onOrganisationChange: (organisation: Organisation) => void;
  readonly onProfileChange: (profile: TamilCommunityProfile) => void;
  readonly onDeclaredChange: (declared: boolean) => void;
}) {
  const updateOrg = (key: keyof Organisation, value: string) =>
    onOrganisationChange({ ...organisation, [key]: value });
  const updateProfile = (key: keyof TamilCommunityProfile, value: string) =>
    onProfileChange({ ...profile, [key]: value });

  return (
    <div className="grid gap-6">
      <div className="surface-card grid gap-7 p-5 sm:p-7 lg:p-8">
        <div className="max-w-xl">
          <h2 className="text-global-navy text-xl font-bold tracking-[-0.01em] sm:text-2xl">
            {sangamStageThreeContent.title}
          </h2>
          <p className="text-slate mt-2 leading-6">
            {sangamStageThreeContent.description}
          </p>
        </div>

        <div className="grid gap-4">
          <div>
            <h3 className="text-global-navy text-base font-bold">
              {sangamStageThreeContent.spocTitle}
            </h3>
            <p className="text-slate mt-1 text-sm">
              {sangamStageThreeContent.spocDescription}
            </p>
          </div>
          <div className="grid items-start gap-5 sm:grid-cols-3">
            <TextField
              label="Full name"
              required
              value={profile.spocFullName}
              error={errors.spocFullName}
              onChange={(event) =>
                updateProfile("spocFullName", event.target.value)
              }
            />
            <TextField
              label="Email"
              type="email"
              required
              value={profile.spocEmail}
              error={errors.spocEmail}
              onChange={(event) =>
                updateProfile("spocEmail", event.target.value)
              }
            />
            <TextField
              label="Phone"
              type="tel"
              required
              value={profile.spocPhone}
              error={errors.spocPhone}
              onChange={(event) =>
                updateProfile("spocPhone", event.target.value)
              }
            />
          </div>
        </div>

        <div className="border-global-navy/10 grid gap-4 border-t pt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h3 className="text-global-navy text-base font-bold">
                {sangamStageThreeContent.presidentTitle}
              </h3>
              <p className="text-slate mt-1 text-sm">
                {sangamStageThreeContent.presidentDescription}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onProfileChange({
                  ...profile,
                  presidentFullName: profile.spocFullName,
                  presidentEmail: profile.spocEmail,
                  presidentPhone: profile.spocPhone,
                })
              }
              className="text-global-navy focus-visible:ring-focus text-sm font-semibold underline underline-offset-4"
            >
              {sangamStageThreeContent.sameAsSpoc}
            </button>
          </div>
          <div className="grid items-start gap-5 sm:grid-cols-3">
            <TextField
              label="Full name"
              required
              value={profile.presidentFullName}
              error={errors.presidentFullName}
              onChange={(event) =>
                updateProfile("presidentFullName", event.target.value)
              }
            />
            <TextField
              label="Email"
              type="email"
              required
              value={profile.presidentEmail}
              error={errors.presidentEmail}
              onChange={(event) =>
                updateProfile("presidentEmail", event.target.value)
              }
            />
            <TextField
              label="Phone"
              type="tel"
              required
              value={profile.presidentPhone}
              error={errors.presidentPhone}
              onChange={(event) =>
                updateProfile("presidentPhone", event.target.value)
              }
            />
          </div>
        </div>

        <div className="border-global-navy/10 grid gap-5 border-t pt-6">
          <h3 className="text-global-navy text-base font-bold">
            {sangamStageThreeContent.digitalPresenceTitle}
          </h3>
          <div className="sm:max-w-md">
            <TextField
              label="Website"
              type="url"
              placeholder="https://"
              value={organisation.website}
              error={errors.website}
              onChange={(event) => updateOrg("website", event.target.value)}
              // A bare domain ("sangam.example.com") is accepted while
              // typing (H3 brief section 17), but the database's own
              // organizations_website_format check requires an explicit
              // http(s):// scheme — normalize on blur so what gets
              // persisted always satisfies it, and so the field visibly
              // shows the same value that was actually saved.
              onBlur={(event) => {
                const normalized = normalizeUrl(event.target.value);
                if (normalized) updateOrg("website", normalized);
              }}
            />
          </div>
          <SocialLinksField
            links={profile.socialLinks}
            error={errors.socialLinks}
            onChange={(links) =>
              onProfileChange({ ...profile, socialLinks: links })
            }
          />
        </div>
      </div>

      <div className="surface-elevated grid gap-4 p-5 sm:p-7 lg:p-8">
        <CheckboxField
          label={sangamStageThreeContent.declaration}
          checked={declared}
          error={errors.declaration}
          onChange={(event) => onDeclaredChange(event.target.checked)}
        />
      </div>
    </div>
  );
}
