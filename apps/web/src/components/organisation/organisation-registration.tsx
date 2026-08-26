"use client";

import type {
  Organisation,
  OrganisationCategoryProfile,
  OrganisationRepresentative,
} from "@tamil-ulagam/shared";
import {
  Alert,
  ImageWithFallback,
  Skeleton,
  StageProgress,
} from "@tamil-ulagam/ui";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { FormActions, FormError } from "@/components/application/form-fields";
import { joinImages } from "@/config/join-images";
import { organisationStages } from "@/content/organisation";
import { usePlatform } from "@/features/enrollment/platform-provider";
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

/**
 * Top-level /join/organisation (and, unchanged in behaviour, /register)
 * orchestrator — the V3 replacement for the old bordered-card
 * RegistrationWizard. Mounted at both routes deliberately (D2 brief
 * section 3): one implementation, two entry points, no duplicated UX.
 * Reuses the existing, already-proven Organisation service layer
 * (usePlatform().ensureDraft/updateCategory/updateOrganisation/...) —
 * no new service, no new RPC, no schema change. Auth-aware states never
 * flash incorrectly: hydration → logged out → platform-unavailable →
 * draft loading → draft-load error with retry → locked status screen
 * (submitted/under_review/verified/rejected/suspended) → the editable
 * stages, in that order.
 */
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
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [draftError, setDraftError] = useState("");
  const [draftAttempt, setDraftAttempt] = useState(0);
  const initializedApplicationRef = useRef<string | null>(null);

  useEffect(() => {
    if (isHydrated && currentUser && !currentApplication && !platformError) {
      // ensureDraft (and every other value pulled from usePlatform())
      // must stay a genuine effect dependency here, not be routed
      // through a separately memoized callback with its own, narrower
      // dependency array — PlatformProvider's context value is recreated
      // on every provider re-render (its own useMemo depends on state/
      // applications/etc.), so a callback memoized only on draftAttempt
      // would freeze a stale ensureDraft closure from the very first
      // render, before hydration/services were ready, and every later
      // retry would silently keep calling that same stale, broken
      // closure. draftAttempt is still a dependency so the "Try again"
      // button's increment reliably re-triggers this effect.
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

  // profile (categoryProfile) is deliberately NOT required here: a brand
  // new draft has no category chosen yet, so profile is still null —
  // Stage 1 (choosing the category) doesn't need it at all, and only
  // Stages 3/4 do, once updateCategory() has created it (see submitStage's
  // stage-1 branch below).
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
    await updateCurrentStep(nextStage);
    setStage(nextStage);
    setErrors({});
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveCurrent = async () => {
    setPending(true);
    setErrors({});
    try {
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
      setNotice("Saved just now.");
    } catch (error: unknown) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Progress could not be saved. Please try again.",
      });
    } finally {
      setPending(false);
    }
  };

  const submitStage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    if (stage === 1) {
      if (!organisation.category) {
        setErrors({ category: "Choose an organisation category." });
        return;
      }
      const nextErrors = validateOrganisationIdentity(organisation);
      setErrors(nextErrors);
      if (!isValid(nextErrors)) return;
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
      if (!isValid(nextErrors)) return;
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
      if (!isValid(nextErrors) || !profile) return;
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
        <div aria-live="polite" className="min-h-6">
          {notice ? (
            <p className="text-success text-sm font-semibold">{notice}</p>
          ) : null}
        </div>
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
          onSave={() => void saveCurrent()}
          pending={pending}
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
    <section className="surface-canvas">
      <div className="mx-auto max-w-[74rem] px-5 py-10 sm:px-7 sm:py-14 lg:px-10">
        <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)] lg:items-center">
          <div>
            <p className="text-heritage-maroon text-xs font-bold tracking-[0.16em] uppercase">
              Organisation registration
            </p>
            <h1 className="text-global-navy mt-3 text-3xl leading-tight font-bold tracking-[-0.03em] sm:text-4xl">
              Register your organisation
            </h1>
            <p className="text-slate mt-3 max-w-xl leading-7">
              A few short stages to get your organisation into federation
              review. Your progress is saved as you go, so you can return
              anytime.
            </p>
          </div>
          {currentStage === 1 ? (
            <div className="rounded-large border-global-navy/10 shadow-navigation relative hidden aspect-[4/3] overflow-hidden border sm:block">
              <ImageWithFallback
                asset={joinImages.organisationJourneyHero}
                className="h-full w-full object-cover"
                priority
                sizes="(min-width: 1024px) 32vw, 100vw"
              />
              <div
                aria-hidden="true"
                className="gradient-federation-night pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-70 mix-blend-multiply"
              />
            </div>
          ) : null}
        </div>
        <StageProgress
          stages={[...organisationStages]}
          currentStage={currentStage}
        />
        {children}
      </div>
    </section>
  );
}
