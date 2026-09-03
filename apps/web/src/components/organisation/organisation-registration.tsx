"use client";

import type {
  Organisation,
  OrganisationCategoryProfile,
  OrganisationRepresentative,
} from "@tamil-ulagam/shared";
import { Alert, Skeleton, StageProgress } from "@tamil-ulagam/ui";
import { type FormEvent, useEffect, useRef, useState } from "react";

import {
  focusFirstInvalidField,
  FormActions,
  FormError,
} from "@/components/application/form-fields";
import { JourneyMasthead } from "@/components/join/journey-masthead";
import { organisationStages } from "@/content/organisation";
import { usePlatform } from "@/features/enrollment/platform-provider";
import { useAutosave } from "@/features/enrollment/use-autosave";
import {
  isValid,
  validateCategoryProfile,
  validateDeclaration,
  validateOrganisationContact,
  validateOrganisationIdentity,
  validateOrganisationTrust,
  validateRepresentativeIdentity,
  type ValidationErrors,
} from "@/features/enrollment/validation";

import { OrganisationLoggedOut } from "./organisation-logged-out";
import { OrganisationReview } from "./organisation-review";
import { OrganisationStageContact } from "./organisation-stage-contact";
import { OrganisationStageIdentity } from "./organisation-stage-identity";
import { OrganisationStageStanding } from "./organisation-stage-standing";
import { OrganisationStatusScreen } from "./organisation-status-screen";

type Stage = 1 | 2 | 3 | 4;

const editableStatuses = new Set(["draft", "needs_changes"]);

export function OrganisationRegistration() {
  const {
    currentApplication,
    currentUser,
    ensureDraft,
    isHydrated,
    platformError,
    submitRegistration,
    updateCategory,
    updateCategoryProfile,
    updateCurrentStep,
    updateOrganisation,
    updateRepresentative,
  } = usePlatform();

  const [stage, setStage] = useState<Stage>(1);
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [profile, setProfile] = useState<OrganisationCategoryProfile | null>(
    null,
  );
  const [representative, setRepresentative] =
    useState<OrganisationRepresentative | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [pending, setPending] = useState(false);
  const [draftError, setDraftError] = useState("");
  const [draftAttempt, setDraftAttempt] = useState(0);
  const initializedApplicationRef = useRef<string | null>(null);

  const persistCurrentStage = async () => {
    if (!organisation || !representative) return;
    if (stage === 1 && organisation.category) {
      await updateCategory(organisation.category);
      await updateOrganisation(organisation);
    }
    if (stage === 2) {
      await updateOrganisation(organisation);
      await updateRepresentative(representative);
    }
    if (stage === 3) {
      if (profile) await updateCategoryProfile(profile);
      await updateOrganisation(organisation);
    }
  };

  const autosave = useAutosave(
    persistCurrentStage,
    [organisation, representative, profile],
    { enabled: Boolean(organisation && representative) },
  );

  useEffect(() => {
    if (isHydrated && currentUser && !currentApplication && !platformError) {
      void ensureDraft().catch((error: unknown) => {
        setDraftError(
          error instanceof Error
            ? error.message
            : "The registration could not be started.",
        );
      });
    }
  }, [
    currentApplication,
    currentUser,
    isHydrated,
    platformError,
    ensureDraft,
    draftAttempt,
  ]);

  useEffect(() => {
    if (!currentApplication) return;
    if (
      initializedApplicationRef.current === currentApplication.registration.id
    ) {
      return;
    }
    initializedApplicationRef.current = currentApplication.registration.id;
    setOrganisation(currentApplication.organisation);
    setProfile(currentApplication.registration.categoryProfile);
    setRepresentative({
      ...currentApplication.registration.representative,
      email:
        currentApplication.registration.representative.email ||
        currentUser?.email ||
        "",
    });
    setStage(
      Math.min(
        4,
        Math.max(1, currentApplication.registration.currentStep),
      ) as Stage,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- currentUser only used as a one-time email fallback
  }, [currentApplication]);

  if (!isHydrated) {
    return (
      <OrganisationFrame currentStage={1}>
        <Skeleton className="h-96 w-full" />
      </OrganisationFrame>
    );
  }

  if (!currentUser) {
    return <OrganisationLoggedOut />;
  }

  if (platformError) {
    return (
      <OrganisationFrame currentStage={1}>
        <Alert
          tone="info"
          title="Organisation registration is not available here"
        >
          {platformError}
        </Alert>
      </OrganisationFrame>
    );
  }

  if (draftError) {
    return (
      <OrganisationFrame currentStage={1}>
        <Alert tone="error" role="alert" title="Something went wrong">
          {draftError}
        </Alert>
        <button
          type="button"
          onClick={() => {
            setDraftError("");
            setDraftAttempt((n) => n + 1);
          }}
          className="border-global-navy text-global-navy focus-visible:ring-focus rounded-button mt-4 min-h-11 border px-5 text-sm font-semibold"
        >
          Try again
        </button>
      </OrganisationFrame>
    );
  }

  if (!currentApplication || !organisation || !representative) {
    return (
      <OrganisationFrame currentStage={1}>
        <Skeleton className="h-96 w-full" />
      </OrganisationFrame>
    );
  }

  if (!editableStatuses.has(currentApplication.registration.status)) {
    return <OrganisationStatusScreen application={currentApplication} />;
  }

  const moveTo = async (nextStage: Stage) => {
    const saved = await autosave.flush();
    if (!saved) {
      setErrors({
        form: "Your latest changes could not be saved. Retry before leaving this stage.",
      });
      return;
    }
    try {
      await updateCurrentStep(nextStage);
      setStage(nextStage);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: unknown) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Your progress could not be updated. Please try again.",
      });
    }
  };

  const submitStage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (stage === 1) {
      if (!organisation.category) {
        setErrors({ category: "Choose an organisation category." });
        focusFirstInvalidField(event.currentTarget);
        return;
      }
      const nextErrors = validateOrganisationIdentity(organisation);
      setErrors(nextErrors);
      if (!isValid(nextErrors)) {
        focusFirstInvalidField(event.currentTarget);
        return;
      }
      setPending(true);
      try {
        const updated = await updateCategory(organisation.category);
        setProfile(updated.registration.categoryProfile);
        await updateOrganisation(organisation);
        await moveTo(2);
      } catch (error: unknown) {
        setErrors({
          form:
            error instanceof Error
              ? error.message
              : "Organisation details could not be saved.",
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
      if (!isValid(nextErrors)) {
        focusFirstInvalidField(event.currentTarget);
        return;
      }
      setPending(true);
      try {
        await updateOrganisation(organisation);
        await updateRepresentative(representative);
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
        ...validateCategoryProfile(profile),
        ...validateDeclaration(representative),
      };
      setErrors(nextErrors);
      if (!isValid(nextErrors) || !profile) {
        focusFirstInvalidField(event.currentTarget);
        return;
      }
      setPending(true);
      try {
        await updateOrganisation(organisation);
        await updateCategoryProfile(profile);
        await updateRepresentative(representative);
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

  if (stage === 4 && profile) {
    return (
      <OrganisationReview
        application={{
          ...currentApplication,
          organisation,
          registration: {
            ...currentApplication.registration,
            categoryProfile: profile,
            representative,
          },
        }}
        onEdit={(targetStage) => void moveTo(targetStage)}
        onSubmitted={async () => {
          await submitRegistration();
        }}
      />
    );
  }

  return (
    <OrganisationFrame currentStage={stage}>
      <form noValidate onSubmit={submitStage} className="grid gap-6">
        {currentApplication.registration.status === "needs_changes" &&
        currentApplication.registration.adminFeedback ? (
          <Alert tone="warning" title="Changes requested">
            {currentApplication.registration.adminFeedback}
          </Alert>
        ) : null}
        {stage === 1 ? (
          <OrganisationStageIdentity
            organisation={organisation}
            errors={errors}
            onChange={setOrganisation}
          />
        ) : null}
        {stage === 2 ? (
          <OrganisationStageContact
            organisation={organisation}
            representative={representative}
            errors={errors}
            onOrganisationChange={setOrganisation}
            onRepresentativeChange={setRepresentative}
          />
        ) : null}
        {stage === 3 && profile ? (
          <OrganisationStageStanding
            organisation={organisation}
            profile={profile}
            representative={representative}
            errors={errors}
            onOrganisationChange={setOrganisation}
            onProfileChange={setProfile}
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
    </OrganisationFrame>
  );
}

function OrganisationFrame({
  children,
  currentStage,
}: {
  readonly children: React.ReactNode;
  readonly currentStage: number;
}) {
  return (
    <section className="surface-page">
      <JourneyMasthead
        compact
        align="start"
        eyebrow="Organisation registration"
        title="Register your organisation"
        description="A few short stages to get your organisation into federation review."
      >
        <StageProgress
          stages={[...organisationStages]}
          currentStage={currentStage}
        />
      </JourneyMasthead>
      <div className="mx-auto max-w-[74rem] px-5 py-10 sm:px-7 sm:py-12 lg:px-10">
        {children}
      </div>
    </section>
  );
}
