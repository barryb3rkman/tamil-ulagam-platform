"use client";

import type {
  Organisation,
  OrganisationCategoryProfile,
  OrganisationRepresentative,
} from "@tamil-ulagam/shared";
import { ImageWithFallback } from "@tamil-ulagam/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";

import {
  businessOptions,
  educationOptions,
  healthcareOptions,
  nonprofitOptions,
  organisationCategories,
  registrationStatusOptions,
  representativeRoleOptions,
  tamilCommunityOptions,
} from "@/content/enrollment";
import { images } from "@/config/images";
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

import {
  CheckboxField,
  FormActions,
  FormError,
  FormSection,
  FormSubsection,
  RadioGroup,
  SelectField,
  TextareaField,
  TextField,
} from "./form-fields";
import { ProgressIndicator } from "./progress-indicator";
import { RegistrationStatusBadge } from "./registration-status-badge";

const asOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

type RepresentativeRole = (typeof representativeRoleOptions)[number]["value"];

/**
 * The wizard offers four simplified role groupings; the stored value is
 * still the full eight-value enum so historical records and admin review
 * keep exact meaning. See content/enrollment.ts for the full list used
 * for display.
 */
function roleToRelationship(
  role: RepresentativeRole | "",
): OrganisationRepresentative["relationship"] {
  switch (role) {
    case "leadership":
      return "president";
    case "staff_administrator":
      return "administrator";
    case "authorised_representative":
      return "authorised_representative";
    case "other":
      return "other";
    default:
      return "";
  }
}

function relationshipToRole(
  relationship: OrganisationRepresentative["relationship"],
): RepresentativeRole | "" {
  switch (relationship) {
    case "founder":
    case "president":
    case "director":
    case "secretary":
      return "leadership";
    case "administrator":
    case "employee":
      return "staff_administrator";
    case "authorised_representative":
      return "authorised_representative";
    case "other":
      return "other";
    default:
      return "";
  }
}

export function RegistrationWizard() {
  const router = useRouter();
  const {
    currentApplication,
    currentUser,
    ensureDraft,
    isHydrated,
    platformError,
    updateCategory,
    updateCategoryProfile,
    updateCurrentStep,
    updateOrganisation,
    updateRepresentative,
  } = usePlatform();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [profile, setProfile] = useState<OrganisationCategoryProfile | null>(
    null,
  );
  const [representative, setRepresentative] =
    useState<OrganisationRepresentative | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const initializedApplicationRef = useRef<string | null>(null);

  useEffect(() => {
    if (isHydrated && currentUser && !currentApplication && !platformError) {
      void ensureDraft().catch((error: unknown) => {
        setErrors({
          form:
            error instanceof Error
              ? error.message
              : "The registration could not be started.",
        });
      });
    }
  }, [currentApplication, currentUser, ensureDraft, isHydrated, platformError]);

  useEffect(() => {
    if (!currentApplication || !currentUser) return;
    if (
      initializedApplicationRef.current === currentApplication.registration.id
    ) {
      return;
    }
    const applicationId = currentApplication.registration.id;
    const initializationTask = window.setTimeout(() => {
      initializedApplicationRef.current = applicationId;
      setOrganisation(currentApplication.organisation);
      setProfile(currentApplication.registration.categoryProfile);
      setRepresentative({
        ...currentApplication.registration.representative,
        email:
          currentApplication.registration.representative.email ||
          currentUser.email,
      });
      // Older in-progress drafts may carry a step value from the
      // previous five-stage wizard (up to 4). The lean wizard only has
      // three data-entry steps; anything beyond that resumes at the
      // last one rather than being lost.
      setStep(
        Math.min(
          3,
          Math.max(1, currentApplication.registration.currentStep),
        ) as 1 | 2 | 3,
      );
    }, 0);
    return () => window.clearTimeout(initializationTask);
  }, [currentApplication, currentUser]);

  if (!isHydrated) {
    return <RegistrationLoading />;
  }

  if (!currentUser) {
    return (
      <RegistrationFrame currentStep={1}>
        <div className="rounded-card border-global-navy/12 shadow-card bg-white p-7 sm:p-10">
          <h2 className="text-global-navy text-2xl font-bold">
            Sign in to begin
          </h2>
          <p className="text-slate mt-3 max-w-xl leading-7">
            A personal account and an organisation are separate records. Create
            or sign in to your personal account before starting organisation
            enrollment.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="bg-global-navy rounded-button px-5 py-3 font-semibold text-white"
              href="/login"
            >
              Sign in
            </Link>
            <Link
              className="border-global-navy text-global-navy rounded-button border px-5 py-3 font-semibold"
              href="/signup"
            >
              Create account
            </Link>
          </div>
        </div>
      </RegistrationFrame>
    );
  }

  if (!currentApplication || !organisation || !representative) {
    return <RegistrationLoading />;
  }

  if (
    !["draft", "needs_changes"].includes(currentApplication.registration.status)
  ) {
    return (
      <RegistrationFrame currentStep={4}>
        <div className="rounded-card border-global-navy/12 shadow-card bg-white p-7 sm:p-10">
          <RegistrationStatusBadge
            status={currentApplication.registration.status}
          />
          <h2 className="text-global-navy mt-5 text-2xl font-bold">
            This registration is not open for editing
          </h2>
          <p className="text-slate mt-3 max-w-xl leading-7">
            Review the submitted information and current status from your
            dashboard.
          </p>
          <Link
            className="bg-global-navy rounded-button mt-6 inline-flex px-5 py-3 font-semibold text-white"
            href="/dashboard"
          >
            Open dashboard
          </Link>
        </div>
      </RegistrationFrame>
    );
  }

  const moveTo = async (nextStep: 1 | 2 | 3) => {
    await updateCurrentStep(nextStep);
    setStep(nextStep);
    setErrors({});
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveCurrent = async () => {
    setPending(true);
    setErrors({});
    try {
      if (step === 1 && organisation.category) {
        await updateCategory(organisation.category);
        await updateOrganisation(organisation);
      }
      if (step === 2) {
        await updateOrganisation(organisation);
        await updateRepresentative(representative);
      }
      if (step === 3) {
        if (profile) await updateCategoryProfile(profile);
        await updateOrganisation(organisation);
      }
      setNotice("Progress saved.");
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

  const submitStep = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    if (step === 1) {
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
    if (step === 2) {
      const organisationErrors = validateOrganisationContact(organisation);
      const representativeErrors =
        validateRepresentativeIdentity(representative);
      const nextErrors = { ...organisationErrors, ...representativeErrors };
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
    const trustErrors = validateOrganisationTrust(organisation);
    const categoryErrors = validateCategoryProfile(profile);
    const declarationErrors = validateDeclaration(representative);
    const nextErrors = {
      ...trustErrors,
      ...categoryErrors,
      ...declarationErrors,
    };
    setErrors(nextErrors);
    if (!isValid(nextErrors) || !profile) return;
    setPending(true);
    try {
      await updateOrganisation(organisation);
      if (profile) await updateCategoryProfile(profile);
      await updateRepresentative(representative);
      router.push("/register/review");
    } catch (error: unknown) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Registration details could not be saved.",
      });
      setPending(false);
    }
  };

  return (
    <RegistrationFrame currentStep={step}>
      <form noValidate onSubmit={submitStep} className="grid gap-5">
        <div aria-live="polite" className="min-h-6">
          {notice ? (
            <p className="text-success text-sm font-semibold">{notice}</p>
          ) : null}
        </div>
        {step === 1 ? (
          <OrganisationStep
            organisation={organisation}
            errors={errors}
            onChange={setOrganisation}
          />
        ) : null}
        {step === 2 ? (
          <ContactRepresentativeStep
            organisation={organisation}
            representative={representative}
            errors={errors}
            onOrganisationChange={setOrganisation}
            onRepresentativeChange={setRepresentative}
          />
        ) : null}
        {step === 3 && profile ? (
          <RegistrationTrustStep
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
          onBack={step > 1 ? () => void moveTo((step - 1) as 1 | 2) : undefined}
          onSave={() => void saveCurrent()}
          pending={pending}
          nextLabel={step === 3 ? "Review registration" : "Continue"}
        />
      </form>
    </RegistrationFrame>
  );
}

function RegistrationFrame({
  children,
  currentStep,
}: {
  readonly children: React.ReactNode;
  readonly currentStep: number;
}) {
  return (
    <section>
      <div className="mx-auto max-w-[88rem]">
        <div
          className={`mb-7 grid gap-6 ${currentStep === 1 ? "lg:grid-cols-[minmax(0,0.82fr)_minmax(22rem,1.18fr)] lg:items-stretch" : "max-w-3xl"}`}
        >
          <div className="self-center">
            <p className="text-heritage-maroon text-xs font-bold tracking-[0.18em] uppercase">
              Organisation enrollment
            </p>
            <h1 className="text-global-navy mt-3 text-3xl leading-tight font-bold tracking-[-0.035em] sm:text-4xl xl:text-5xl">
              Register your organisation
            </h1>
            <p className="text-slate mt-3 max-w-2xl leading-7 sm:text-lg sm:leading-8">
              A few quick questions to get you into review — about 3 to 5
              minutes. Your progress is saved so you can return later.
            </p>
          </div>
          {currentStep === 1 ? (
            <div className="rounded-large border-global-navy/10 shadow-card hidden min-h-56 overflow-hidden border bg-white sm:block lg:min-h-64">
              <ImageWithFallback
                asset={images.portalRegistrationIntro}
                className="h-full w-full object-cover"
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          ) : null}
        </div>
        <ProgressIndicator currentStep={currentStep} />
        {children}
      </div>
    </section>
  );
}

function RegistrationLoading() {
  return (
    <RegistrationFrame currentStep={1}>
      <div
        role="status"
        className="rounded-card text-slate shadow-card bg-white p-8"
      >
        Preparing your registration…
      </div>
    </RegistrationFrame>
  );
}

function OrganisationStep({
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
    <FormSection
      title="Tell us about your organisation"
      description="Choose the closest category, then the essentials. Required information is marked with an asterisk."
    >
      <fieldset className="grid gap-3">
        <legend className="text-global-navy mb-1 text-sm font-semibold">
          Organisation category
          <span className="text-heritage-maroon ml-1" aria-hidden="true">
            *
          </span>
        </legend>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {organisationCategories.map((option) => {
            const selected = organisation.category === option.value;
            return (
              <label
                key={option.value}
                className={`motion-card focus-within:ring-focus rounded-card relative min-h-28 cursor-pointer overflow-hidden border p-4 ${selected ? "border-heritage-maroon bg-heritage-maroon/5 shadow-card" : "border-global-navy/12 bg-white"}`}
              >
                <input
                  type="radio"
                  name="organisation-category"
                  value={option.value}
                  checked={selected}
                  onChange={() => update("category", option.value)}
                  className="absolute inset-0 z-10 cursor-pointer opacity-0"
                />
                <span className="flex h-full flex-col justify-between">
                  <span className="text-global-navy block text-sm font-bold">
                    {option.label}
                  </span>
                  <span className="text-slate mt-2 block text-xs leading-5">
                    {option.description}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`absolute top-3 right-3 grid size-6 place-items-center rounded-full border text-xs font-bold ${selected ? "border-heritage-maroon bg-heritage-maroon text-white" : "border-global-navy/15 text-transparent"}`}
                >
                  ✓
                </span>
              </label>
            );
          })}
        </div>
        {errors.category ? (
          <p role="alert" className="text-error text-sm">
            {errors.category}
          </p>
        ) : null}
      </fieldset>
      <FormSubsection
        title="Organisation profile"
        description="How the organisation is known publicly, and where it's based."
      >
        <TextField
          label="Organisation name"
          required
          value={organisation.name}
          error={errors.name}
          onChange={(event) => update("name", event.target.value)}
        />
        <div className="grid gap-5 md:grid-cols-3">
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
        <TextareaField
          label="Short description"
          required
          maxLength={600}
          value={organisation.description}
          error={errors.description}
          helperText={`${organisation.description.length}/600 characters`}
          onChange={(event) => update("description", event.target.value)}
        />
        <TextField
          label="Year established"
          inputMode="numeric"
          maxLength={4}
          value={organisation.yearEstablished}
          error={errors.yearEstablished}
          helperText="Optional."
          onChange={(event) => update("yearEstablished", event.target.value)}
        />
      </FormSubsection>
    </FormSection>
  );
}

function ContactRepresentativeStep({
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
  const updateRep = (key: keyof OrganisationRepresentative, value: string) =>
    onRepresentativeChange({ ...representative, [key]: value });
  const currentRole = relationshipToRole(representative.relationship);
  return (
    <FormSection
      title="Contact & representative"
      description="How Tamil Ulagam and reviewers can reach the organisation, and who is registering it."
    >
      <FormSubsection
        title="Organisation contact"
        description="Contact details controlled by the organisation, not a personal address."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Official email"
            type="email"
            required
            value={organisation.officialEmail}
            error={errors.officialEmail}
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
          <div className="md:col-span-2">
            <TextField
              label="Website or social link"
              type="url"
              placeholder="https://"
              value={organisation.website}
              error={errors.website}
              helperText="Optional."
              onChange={(event) => updateOrg("website", event.target.value)}
            />
          </div>
        </div>
      </FormSubsection>
      <FormSubsection
        title="Your details"
        description="You are registering this organisation as its representative."
      >
        <div className="grid gap-5 md:grid-cols-2">
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
          <SelectField
            label="Representative role"
            required
            value={currentRole}
            options={representativeRoleOptions}
            error={errors.relationship}
            onChange={(event) =>
              onRepresentativeChange({
                ...representative,
                relationship: roleToRelationship(
                  event.target.value as RepresentativeRole,
                ),
              })
            }
          />
        </div>
      </FormSubsection>
    </FormSection>
  );
}

function CategoryQuestion({
  profile,
  errors,
  onChange,
}: {
  readonly profile: OrganisationCategoryProfile;
  readonly errors: ValidationErrors;
  readonly onChange: (profile: OrganisationCategoryProfile) => void;
}) {
  switch (profile.category) {
    case "tamil_community":
      return (
        <SelectField
          label="Organisation subtype"
          required
          value={profile.subtype}
          options={asOptions(tamilCommunityOptions.subtypes)}
          error={errors.subtype}
          onChange={(event) =>
            onChange({ ...profile, subtype: event.target.value })
          }
        />
      );
    case "education":
      return (
        <SelectField
          label="Institution type"
          required
          value={profile.institutionType}
          options={asOptions(educationOptions.institutionTypes)}
          error={errors.institutionType}
          onChange={(event) =>
            onChange({ ...profile, institutionType: event.target.value })
          }
        />
      );
    case "healthcare":
      return (
        <SelectField
          label="Facility type"
          required
          value={profile.facilityType}
          options={asOptions(healthcareOptions.facilityTypes)}
          error={errors.facilityType}
          onChange={(event) =>
            onChange({ ...profile, facilityType: event.target.value })
          }
        />
      );
    case "business":
      return (
        <div className="grid gap-5 md:grid-cols-2">
          <SelectField
            label="Business type"
            required
            value={profile.businessType}
            options={asOptions(businessOptions.types)}
            error={errors.businessType}
            onChange={(event) =>
              onChange({ ...profile, businessType: event.target.value })
            }
          />
          <SelectField
            label="Industry"
            required
            value={profile.industry}
            options={asOptions(businessOptions.industries)}
            error={errors.industry}
            onChange={(event) =>
              onChange({ ...profile, industry: event.target.value })
            }
          />
        </div>
      );
    case "nonprofit":
      return (
        <SelectField
          label="Organisation subtype"
          required
          value={profile.subtype}
          options={asOptions(nonprofitOptions.subtypes)}
          error={errors.subtype}
          onChange={(event) =>
            onChange({ ...profile, subtype: event.target.value })
          }
        />
      );
    case "other":
      return (
        <>
          <TextField
            label="Organisation type"
            required
            value={profile.organisationType}
            error={errors.organisationType}
            onChange={(event) =>
              onChange({ ...profile, organisationType: event.target.value })
            }
          />
          <TextareaField
            label="Primary purpose"
            required
            value={profile.primaryPurpose}
            error={errors.primaryPurpose}
            onChange={(event) =>
              onChange({ ...profile, primaryPurpose: event.target.value })
            }
          />
        </>
      );
  }
}

function RegistrationTrustStep({
  organisation,
  profile,
  representative,
  errors,
  onOrganisationChange,
  onProfileChange,
  onRepresentativeChange,
}: {
  readonly organisation: Organisation;
  readonly profile: OrganisationCategoryProfile;
  readonly representative: OrganisationRepresentative;
  readonly errors: ValidationErrors;
  readonly onOrganisationChange: (organisation: Organisation) => void;
  readonly onProfileChange: (profile: OrganisationCategoryProfile) => void;
  readonly onRepresentativeChange: (
    representative: OrganisationRepresentative,
  ) => void;
}) {
  const updateOrg = (key: keyof Organisation, value: string) =>
    onOrganisationChange({ ...organisation, [key]: value });
  return (
    <FormSection
      title="Registration & trust"
      description="A little about legal standing, plus one question specific to your organisation type."
    >
      <FormSubsection
        title="Legal registration"
        description="Legitimate small and informal Tamil organisations are welcome — this does not block submission."
      >
        <RadioGroup
          label="Is this organisation formally registered?"
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
              label="Registration / incorporation number"
              helperText="Optional — reviewers may ask for this later if needed."
              value={organisation.registrationNumber}
              error={errors.registrationNumber}
              onChange={(event) =>
                updateOrg("registrationNumber", event.target.value)
              }
            />
          </div>
        ) : null}
      </FormSubsection>
      <FormSubsection
        title={`${organisationCategories.find((option) => option.value === profile.category)?.label ?? "Organisation"} details`}
      >
        <CategoryQuestion
          profile={profile}
          errors={errors}
          onChange={onProfileChange}
        />
      </FormSubsection>
      <FormSubsection
        title="Authority declaration"
        description="Required before the application can be submitted."
      >
        <CheckboxField
          label="I confirm that I am authorised to represent this organisation and that the information provided is accurate."
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
      </FormSubsection>
    </FormSection>
  );
}
