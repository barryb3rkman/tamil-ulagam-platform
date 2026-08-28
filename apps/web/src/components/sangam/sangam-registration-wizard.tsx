"use client";

import type {
  Organisation,
  OrganisationApplication,
  OrganisationRepresentative,
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
  SelectField,
  TextField,
  TextareaField,
} from "@/components/application/form-fields";
import { registrationStatusOptions } from "@/content/enrollment";
import {
  sangamNetworkAffiliationOptions,
  sangamRepresentativeRoleOptions,
  sangamStageOneContent,
  sangamStages,
  sangamStageThreeContent,
  sangamStageTwoContent,
} from "@/content/sangam";
import { usePlatform } from "@/features/enrollment/platform-provider";
import { useAutosave } from "@/features/enrollment/use-autosave";
import {
  isValid,
  validateDeclaration,
  validateOrganisationContact,
  validateOrganisationIdentity,
  validateOrganisationTrust,
  validateRepresentativeIdentity,
  type ValidationErrors,
} from "@/features/enrollment/validation";
import { useSangamRegistrationService } from "@/features/sangam/use-sangam-registration-service";
import { joinImages } from "@/config/join-images";

import { SangamLoggedOut } from "./sangam-logged-out";
import { SangamReview } from "./sangam-review";
import { SangamStatusScreen } from "./sangam-status-screen";

type LoadState = "loading" | "loaded" | "error";
type Stage = 1 | 2 | 3 | 4;

const editableStatuses = new Set(["draft", "needs_changes"]);

/**
 * Top-level /join/sangam orchestrator. Deliberately its own component —
 * not RegistrationWizard reused with an `isSangam` flag — but composed
 * from the same low-level pieces (form-fields.tsx primitives, the
 * unchanged validation.ts functions, the same StageProgress/Alert/
 * Skeleton primitives) per the D1 "share low-level pieces, not
 * page-level UX" rule. Auth-aware: logged out, session restoring, no
 * draft yet, draft in progress, locked while submitted/under review/
 * verified/rejected/suspended, and error/not-configured all render
 * distinct, never-flashing states.
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
  const [representative, setRepresentative] =
    useState<OrganisationRepresentative | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [pending, setPending] = useState(false);
  const initializedRef = useRef<string | null>(null);

  // Autosave (H2 brief sections 13-15) — same mechanism, same reused
  // hook, as the Organisation wizard (section 14/37: identical behavior,
  // not a parallel implementation). Replaces the old manual "Save
  // progress" button. useAutosave must be called unconditionally (Rules
  // of Hooks) — service/organisation/representative/profile can all
  // still be null this early (before the draft has loaded), so both the
  // persist function and `enabled` guard for that explicitly, rather
  // than this hook call moving below the loading-state early returns
  // further down.
  const persistCurrentStage = async () => {
    if (
      !service ||
      !application ||
      !organisation ||
      !representative ||
      !profile
    ) {
      return;
    }
    if (stage === 1) {
      await service.updateOrganisation(organisation.id, organisation);
    } else if (stage === 2) {
      await service.updateOrganisation(organisation.id, organisation);
      await service.updateRepresentative(
        application.registration.id,
        representative,
      );
      await service.updateCategoryProfile(organisation.id, profile);
    } else if (stage === 3) {
      await service.updateOrganisation(organisation.id, organisation);
      await service.updateCategoryProfile(organisation.id, profile);
      await service.updateRepresentative(
        application.registration.id,
        representative,
      );
    }
  };

  const autosave = useAutosave(
    persistCurrentStage,
    [organisation, representative, profile],
    {
      enabled: Boolean(
        service && application && organisation && representative && profile,
      ),
    },
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
    setProfile(
      application.registration.categoryProfile?.category === "tamil_community"
        ? application.registration.categoryProfile
        : null,
    );
    setRepresentative({
      ...application.registration.representative,
      email:
        application.registration.representative.email ||
        currentUser?.email ||
        "",
    });
    setStage(
      Math.min(4, Math.max(1, application.registration.currentStep)) as Stage,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- currentUser only used as a one-time email fallback
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

  if (!application || !organisation || !profile || !representative) {
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

  const submitStage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (stage === 1) {
      const nextErrors = validateOrganisationIdentity(organisation);
      setErrors(nextErrors);
      if (!isValid(nextErrors)) return;
      setPending(true);
      try {
        await service.updateOrganisation(organisation.id, organisation);
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
      const nextErrors = {
        ...validateOrganisationContact(organisation),
        ...validateRepresentativeIdentity(representative),
      };
      setErrors(nextErrors);
      if (!isValid(nextErrors)) return;
      setPending(true);
      try {
        await service.updateOrganisation(organisation.id, organisation);
        await service.updateRepresentative(
          application.registration.id,
          representative,
        );
        await service.updateCategoryProfile(organisation.id, profile);
        await moveTo(3);
      } catch (error: unknown) {
        setErrors({
          form:
            error instanceof Error
              ? error.message
              : "Contact and representative details could not be saved.",
        });
      } finally {
        setPending(false);
      }
      return;
    }
    if (stage === 3) {
      const nextErrors = {
        ...validateOrganisationTrust(organisation),
        ...validateDeclaration(representative),
      };
      setErrors(nextErrors);
      if (!isValid(nextErrors)) return;
      setPending(true);
      try {
        await service.updateOrganisation(organisation.id, organisation);
        await service.updateRepresentative(
          application.registration.id,
          representative,
        );
        await moveTo(4);
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
            // representative must be merged in the same way organisation
            // and profile are above — application.registration.representative
            // is only as fresh as the last setApplication() call (initial
            // load / post-submit reload), while phone/role/declaration are
            // edited locally and persisted explicitly on stage navigation
            // without ever refetching. Without this, the review screen
            // shows stale (often empty) representative data even though
            // the correct values are already saved server-side.
            representative,
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
          <StageYourSangam
            organisation={organisation}
            errors={errors}
            onChange={setOrganisation}
          />
        ) : null}
        {stage === 2 ? (
          <StageLeadershipReach
            organisation={organisation}
            representative={representative}
            profile={profile}
            errors={errors}
            onOrganisationChange={setOrganisation}
            onRepresentativeChange={setRepresentative}
            onProfileChange={setProfile}
          />
        ) : null}
        {stage === 3 ? (
          <StageStandingConfirmation
            organisation={organisation}
            representative={representative}
            errors={errors}
            onOrganisationChange={setOrganisation}
            onRepresentativeChange={setRepresentative}
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

function StageYourSangam({
  organisation,
  errors,
  onChange,
}: {
  readonly organisation: Organisation;
  readonly errors: ValidationErrors;
  readonly onChange: (organisation: Organisation) => void;
}) {
  const update = (key: keyof Organisation, value: string) =>
    onChange({ ...organisation, [key]: value });
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
        onChange={(event) => update("name", event.target.value)}
      />
      <div className="grid items-start gap-5 sm:grid-cols-3">
        <TextField
          label="Country"
          required
          value={organisation.country}
          error={errors.country}
          onChange={(event) => update("country", event.target.value)}
        />
        <TextField
          label="State / Province / Region"
          required
          value={organisation.region}
          error={errors.region}
          onChange={(event) => update("region", event.target.value)}
        />
        <TextField
          label="City"
          required
          value={organisation.city}
          error={errors.city}
          onChange={(event) => update("city", event.target.value)}
        />
      </div>
      <div className="sm:max-w-60">
        <TextField
          label="Year established"
          inputMode="numeric"
          maxLength={4}
          value={organisation.yearEstablished}
          error={errors.yearEstablished}
          onChange={(event) => update("yearEstablished", event.target.value)}
        />
      </div>
      <TextareaField
        label="Community served"
        required
        maxLength={600}
        value={organisation.description}
        error={errors.description}
        helperText={
          errors.description
            ? undefined
            : sangamStageOneContent.descriptionPrompt
        }
        onChange={(event) => update("description", event.target.value)}
      />
    </div>
  );
}

function StageLeadershipReach({
  organisation,
  representative,
  profile,
  errors,
  onOrganisationChange,
  onRepresentativeChange,
  onProfileChange,
}: {
  readonly organisation: Organisation;
  readonly representative: OrganisationRepresentative;
  readonly profile: TamilCommunityProfile;
  readonly errors: ValidationErrors;
  readonly onOrganisationChange: (organisation: Organisation) => void;
  readonly onRepresentativeChange: (
    representative: OrganisationRepresentative,
  ) => void;
  readonly onProfileChange: (profile: TamilCommunityProfile) => void;
}) {
  const updateOrg = (key: keyof Organisation, value: string) =>
    onOrganisationChange({ ...organisation, [key]: value });
  const updateRep = (key: keyof OrganisationRepresentative, value: string) =>
    onRepresentativeChange({ ...representative, [key]: value });
  // "" (untouched/never answered) never matches an option's own value, so
  // nothing shows pre-selected until the Sangam explicitly answers —
  // including "Prefer not to say", which maps back to "" on save. See
  // TamilCommunityProfile.networkAffiliated's doc comment for why "" also
  // represents an explicit "prefer not to say" on resume.
  const networkValue =
    profile.networkAffiliated === "yes" || profile.networkAffiliated === "no"
      ? profile.networkAffiliated
      : "";
  return (
    <div className="surface-card grid gap-7 p-5 sm:p-7 lg:p-8">
      <div className="max-w-xl">
        <h2 className="text-global-navy text-xl font-bold tracking-[-0.01em] sm:text-2xl">
          {sangamStageTwoContent.title}
        </h2>
        <p className="text-slate mt-2 leading-6">
          {sangamStageTwoContent.description}
        </p>
      </div>

      <div className="grid gap-5">
        <div className="grid items-start gap-5 sm:grid-cols-2">
          <TextField
            label="Official Sangam email"
            type="email"
            required
            value={organisation.officialEmail}
            error={errors.officialEmail}
            helperText={
              errors.officialEmail
                ? undefined
                : sangamStageTwoContent.officialEmailHelp
            }
            onChange={(event) => updateOrg("officialEmail", event.target.value)}
          />
          <TextField
            label="Official phone"
            type="tel"
            required
            value={organisation.officialPhone}
            error={errors.officialPhone}
            onChange={(event) => updateOrg("officialPhone", event.target.value)}
          />
        </div>
        <div className="sm:max-w-sm">
          <TextField
            label="Website or social link"
            type="url"
            placeholder="https://"
            value={organisation.website}
            error={errors.website}
            onChange={(event) => updateOrg("website", event.target.value)}
          />
        </div>
      </div>

      <div className="border-global-navy/10 grid gap-5 border-t pt-6">
        <h3 className="text-global-navy text-base font-bold">
          Your details as representative
        </h3>
        <div className="grid items-start gap-5 sm:grid-cols-2">
          <TextField
            label="Representative full name"
            required
            value={representative.fullName}
            error={errors.fullName}
            onChange={(event) => updateRep("fullName", event.target.value)}
          />
          <TextField
            label="Phone"
            type="tel"
            required
            value={representative.phone}
            error={errors.phone}
            onChange={(event) => updateRep("phone", event.target.value)}
          />
        </div>
        <div className="sm:max-w-sm">
          <SelectField
            label="Representative role"
            required
            value={representative.relationship}
            options={sangamRepresentativeRoleOptions}
            error={errors.relationship}
            onChange={(event) =>
              onRepresentativeChange({
                ...representative,
                relationship: event.target
                  .value as OrganisationRepresentative["relationship"],
              })
            }
          />
        </div>
      </div>

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

function StageStandingConfirmation({
  organisation,
  representative,
  errors,
  onOrganisationChange,
  onRepresentativeChange,
}: {
  readonly organisation: Organisation;
  readonly representative: OrganisationRepresentative;
  readonly errors: ValidationErrors;
  readonly onOrganisationChange: (organisation: Organisation) => void;
  readonly onRepresentativeChange: (
    representative: OrganisationRepresentative,
  ) => void;
}) {
  const updateOrg = (key: keyof Organisation, value: string) =>
    onOrganisationChange({ ...organisation, [key]: value });
  return (
    <div className="grid gap-6">
      <div className="surface-card grid gap-6 p-5 sm:p-7 lg:p-8">
        <div className="max-w-xl">
          <h2 className="text-global-navy text-xl font-bold tracking-[-0.01em] sm:text-2xl">
            {sangamStageThreeContent.title}
          </h2>
          <p className="text-slate mt-2 leading-6">
            {sangamStageThreeContent.description}
          </p>
        </div>
        <Alert tone="info">{sangamStageThreeContent.informalNotice}</Alert>
        <RadioGroup
          label="Is your Sangam formally registered?"
          name="registration-status"
          required
          value={organisation.registrationStatus}
          options={registrationStatusOptions}
          error={errors.registrationStatus}
          onChange={(event) =>
            updateOrg("registrationStatus", event.target.value)
          }
        />
        {organisation.registrationStatus === "registered" ? (
          <div className="border-heritage-gold/35 border-l-2 pl-4">
            <TextField
              label="Registration number"
              value={organisation.registrationNumber}
              error={errors.registrationNumber}
              onChange={(event) =>
                updateOrg("registrationNumber", event.target.value)
              }
            />
          </div>
        ) : null}
      </div>
      <div className="surface-elevated grid gap-4 p-5 sm:p-7 lg:p-8">
        <CheckboxField
          label={sangamStageThreeContent.declaration}
          checked={
            representative.authorisedDeclaration &&
            representative.accuracyDeclaration
          }
          error={errors.declaration}
          onChange={(event) =>
            onRepresentativeChange({
              ...representative,
              authorisedDeclaration: event.target.checked,
              accuracyDeclaration: event.target.checked,
            })
          }
        />
      </div>
    </div>
  );
}
