"use client";

import type {
  Organisation,
  OrganisationCategory,
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
  representativeRelationships,
  tamilCommunityOptions,
} from "@/content/enrollment";
import { images } from "@/config/images";
import { usePlatform } from "@/features/enrollment/platform-provider";
import {
  isValid,
  validateCategoryProfile,
  validateOrganisation,
  validateRepresentative,
  type ValidationErrors,
} from "@/features/enrollment/validation";

import {
  CheckboxField,
  FormActions,
  FormError,
  FormSection,
  FormSubsection,
  MultiSelect,
  RadioGroup,
  SelectField,
  TextareaField,
  TextField,
} from "./form-fields";
import { ProgressIndicator } from "./progress-indicator";
import { RegistrationStatusBadge } from "./registration-status-badge";

const asOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

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
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
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
    if (!currentApplication) return;
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
      setRepresentative(currentApplication.registration.representative);
      setStep(currentApplication.registration.currentStep);
    }, 0);
    return () => window.clearTimeout(initializationTask);
  }, [currentApplication]);

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
      <RegistrationFrame currentStep={5}>
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

  const moveTo = async (nextStep: 1 | 2 | 3 | 4) => {
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
      if (step === 1 && organisation.category)
        await updateCategory(organisation.category);
      if (step === 2) await updateOrganisation(organisation);
      if (step === 3 && profile) await updateCategoryProfile(profile);
      if (step === 4) await updateRepresentative(representative);
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
      setPending(true);
      try {
        const updated = await updateCategory(organisation.category);
        setProfile(updated.registration.categoryProfile);
        await moveTo(2);
      } catch (error: unknown) {
        setErrors({
          form:
            error instanceof Error
              ? error.message
              : "The organisation category could not be saved.",
        });
      } finally {
        setPending(false);
      }
      return;
    }
    if (step === 2) {
      const nextErrors = validateOrganisation(organisation);
      setErrors(nextErrors);
      if (!isValid(nextErrors)) return;
      setPending(true);
      try {
        await updateOrganisation(organisation);
        await moveTo(3);
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
    if (step === 3) {
      const nextErrors = validateCategoryProfile(profile);
      setErrors(nextErrors);
      if (!isValid(nextErrors) || !profile) return;
      setPending(true);
      try {
        await updateCategoryProfile(profile);
        await moveTo(4);
      } catch (error: unknown) {
        setErrors({
          form:
            error instanceof Error
              ? error.message
              : "Category details could not be saved.",
        });
      } finally {
        setPending(false);
      }
      return;
    }
    const nextErrors = validateRepresentative(representative);
    setErrors(nextErrors);
    if (!isValid(nextErrors)) return;
    setPending(true);
    try {
      await updateRepresentative(representative);
      router.push("/register/review");
    } catch (error: unknown) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Representative details could not be saved.",
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
          <CategoryStep
            category={organisation.category}
            error={errors.category}
            onChange={(category) =>
              setOrganisation({ ...organisation, category })
            }
          />
        ) : null}
        {step === 2 ? (
          <OrganisationDetailsStep
            organisation={organisation}
            errors={errors}
            onChange={setOrganisation}
          />
        ) : null}
        {step === 3 && profile ? (
          <CategoryDetailsStep
            profile={profile}
            errors={errors}
            onChange={setProfile}
          />
        ) : null}
        {step === 4 ? (
          <RepresentativeStep
            representative={representative}
            errors={errors}
            onChange={setRepresentative}
          />
        ) : null}
        <FormError message={errors.form ?? ""} />
        <FormActions
          onBack={
            step > 1 ? () => void moveTo((step - 1) as 1 | 2 | 3) : undefined
          }
          onSave={() => void saveCurrent()}
          pending={pending}
          nextLabel={step === 4 ? "Review registration" : "Continue"}
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
              Build a clear organisation profile for future review. Your
              progress is saved so you can return later.
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

function CategoryStep({
  category,
  error,
  onChange,
}: {
  readonly category: OrganisationCategory | "";
  readonly error?: string;
  readonly onChange: (category: OrganisationCategory) => void;
}) {
  return (
    <FormSection
      title="What type of organisation are you registering?"
      description="Choose the closest category. The next questions will adapt to your selection."
    >
      <fieldset className="grid gap-3">
        <legend className="sr-only">Organisation category</legend>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {organisationCategories.map((option, index) => {
            const selected = category === option.value;
            return (
              <label
                key={option.value}
                className={`motion-card focus-within:ring-focus rounded-card relative min-h-40 cursor-pointer overflow-hidden border p-5 ${selected ? "border-heritage-maroon bg-heritage-maroon/5 shadow-card" : "border-global-navy/12 bg-white"}`}
              >
                <span className="flex h-full flex-col">
                  <input
                    type="radio"
                    name="organisation-category"
                    value={option.value}
                    checked={category === option.value}
                    onChange={() => onChange(option.value)}
                    className="absolute inset-0 z-10 cursor-pointer opacity-0"
                  />
                  <span className="mb-6 flex items-center justify-between gap-3">
                    <span className="text-slate text-xs font-bold tracking-[0.12em]">
                      0{index + 1}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`grid size-7 place-items-center rounded-full border text-xs font-bold ${selected ? "border-heritage-maroon bg-heritage-maroon text-white" : "border-global-navy/15 text-transparent"}`}
                    >
                      ✓
                    </span>
                  </span>
                  <span className="mt-auto">
                    <span className="text-global-navy block text-base font-bold">
                      {option.label}
                    </span>
                    <span className="text-slate mt-2 block text-sm leading-6">
                      {option.description}
                    </span>
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        {error ? (
          <p role="alert" className="text-error text-sm">
            {error}
          </p>
        ) : null}
      </fieldset>
    </FormSection>
  );
}

function OrganisationDetailsStep({
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
      title="Organisation details"
      description="Provide official contact and location information. Required information is marked with an asterisk."
    >
      <FormSubsection
        title="Organisation profile"
        description="Tell us how the organisation is known publicly."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Organisation name"
            required
            value={organisation.name}
            error={errors.name}
            onChange={(event) => update("name", event.target.value)}
          />
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
          label="Short description"
          required
          maxLength={600}
          value={organisation.description}
          error={errors.description}
          helperText={`${organisation.description.length}/600 characters`}
          onChange={(event) => update("description", event.target.value)}
        />
      </FormSubsection>
      <FormSubsection
        title="Location"
        description="Use the organisation's principal address."
      >
        <div className="grid gap-5 md:grid-cols-2">
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
          <TextField
            label="Postal code"
            value={organisation.postalCode}
            onChange={(event) => update("postalCode", event.target.value)}
          />
          <div className="md:col-span-2">
            <TextField
              label="Street address"
              required
              value={organisation.streetAddress}
              error={errors.streetAddress}
              onChange={(event) => update("streetAddress", event.target.value)}
            />
          </div>
        </div>
      </FormSubsection>
      <FormSubsection
        title="Official contact"
        description="Provide contact details controlled by the organisation."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Official email"
            type="email"
            required
            value={organisation.officialEmail}
            error={errors.officialEmail}
            onChange={(event) => update("officialEmail", event.target.value)}
          />
          <TextField
            label="Official phone"
            type="tel"
            required
            value={organisation.officialPhone}
            error={errors.officialPhone}
            onChange={(event) => update("officialPhone", event.target.value)}
          />
          <div className="md:col-span-2">
            <TextField
              label="Website"
              type="url"
              placeholder="https://"
              value={organisation.website}
              error={errors.website}
              onChange={(event) => update("website", event.target.value)}
            />
          </div>
        </div>
      </FormSubsection>
      <FormSubsection
        title="Registration information"
        description="Tell us whether the organisation has formal legal registration."
      >
        <RadioGroup
          label="Registration status"
          name="registration-status"
          required
          value={organisation.registrationStatus}
          options={registrationStatusOptions}
          error={errors.registrationStatus}
          onChange={(event) => update("registrationStatus", event.target.value)}
        />
        {organisation.registrationStatus === "registered" ? (
          <div className="border-heritage-gold/35 grid gap-5 border-l-2 pl-4 md:grid-cols-3">
            <TextField
              label="Registration / incorporation number"
              required
              value={organisation.registrationNumber}
              error={errors.registrationNumber}
              onChange={(event) =>
                update("registrationNumber", event.target.value)
              }
            />
            <TextField
              label="Registration authority"
              required
              value={organisation.registrationAuthority}
              error={errors.registrationAuthority}
              onChange={(event) =>
                update("registrationAuthority", event.target.value)
              }
            />
            <TextField
              label="Registration country"
              required
              value={organisation.registrationCountry}
              error={errors.registrationCountry}
              onChange={(event) =>
                update("registrationCountry", event.target.value)
              }
            />
          </div>
        ) : null}
      </FormSubsection>
      <div className="border-global-navy/12 rounded-button border border-dashed bg-white p-4">
        <p className="text-global-navy text-sm font-semibold">
          Organisation logo · optional
        </p>
        <p className="text-slate mt-1 text-sm">
          Logo upload is not part of the current enrollment step and is not
          required for this registration.
        </p>
      </div>
    </FormSection>
  );
}

function CategoryDetailsStep({
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
        <FormSection title="Tamil / community organisation profile">
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
          <MultiSelect
            label="Primary activities"
            required
            value={profile.primaryActivities}
            options={tamilCommunityOptions.activities}
            error={errors.primaryActivities}
            onChange={(primaryActivities) =>
              onChange({ ...profile, primaryActivities })
            }
          />
          <div className="grid gap-5 md:grid-cols-2">
            <SelectField
              label="Approximate membership size"
              value={profile.membershipSize}
              options={asOptions(tamilCommunityOptions.membershipSizes)}
              onChange={(event) =>
                onChange({ ...profile, membershipSize: event.target.value })
              }
            />
            <TextField
              label="Geographic area served"
              value={profile.geographicAreaServed}
              onChange={(event) =>
                onChange({
                  ...profile,
                  geographicAreaServed: event.target.value,
                })
              }
            />
            <TextField
              label="President / Chairperson name"
              value={profile.chairpersonName}
              onChange={(event) =>
                onChange({ ...profile, chairpersonName: event.target.value })
              }
            />
            <TextField
              label="Secretary name"
              value={profile.secretaryName}
              onChange={(event) =>
                onChange({ ...profile, secretaryName: event.target.value })
              }
            />
            <TextField
              label="Languages used by organisation"
              value={profile.languages}
              onChange={(event) =>
                onChange({ ...profile, languages: event.target.value })
              }
            />
          </div>
        </FormSection>
      );
    case "education":
      return (
        <FormSection title="Education profile">
          <div className="grid gap-5 md:grid-cols-2">
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
            <SelectField
              label="Ownership / governance type"
              required
              value={profile.governanceType}
              options={asOptions(educationOptions.governanceTypes)}
              error={errors.governanceType}
              onChange={(event) =>
                onChange({ ...profile, governanceType: event.target.value })
              }
            />
          </div>
          <RadioGroup
            label="Tamil-related programmes offered?"
            name="tamil-programmes"
            required
            value={profile.tamilProgrammesOffered}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            error={errors.tamilProgrammesOffered}
            onChange={(event) =>
              onChange({
                ...profile,
                tamilProgrammesOffered: event.target.value as "yes" | "no",
              })
            }
          />
          {profile.tamilProgrammesOffered === "yes" ? (
            <TextareaField
              label="Describe Tamil-related programmes"
              required
              value={profile.tamilProgrammesDescription}
              error={errors.tamilProgrammesDescription}
              onChange={(event) =>
                onChange({
                  ...profile,
                  tamilProgrammesDescription: event.target.value,
                })
              }
            />
          ) : null}
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="Accreditation / recognition authority"
              value={profile.accreditationAuthority}
              onChange={(event) =>
                onChange({
                  ...profile,
                  accreditationAuthority: event.target.value,
                })
              }
            />
            <TextField
              label="Accreditation / recognition number"
              value={profile.accreditationNumber}
              onChange={(event) =>
                onChange({
                  ...profile,
                  accreditationNumber: event.target.value,
                })
              }
            />
            <TextField
              label="Student population range"
              value={profile.studentPopulation}
              onChange={(event) =>
                onChange({ ...profile, studentPopulation: event.target.value })
              }
            />
          </div>
          <MultiSelect
            label="Primary areas of study"
            value={profile.studyAreas}
            options={educationOptions.studyAreas}
            onChange={(studyAreas) => onChange({ ...profile, studyAreas })}
          />
        </FormSection>
      );
    case "healthcare":
      return (
        <FormSection
          title="Healthcare organisation profile"
          description="This enrollment does not collect patient information, health records, prescriptions, insurance information or medical histories."
        >
          <div className="grid gap-5 md:grid-cols-2">
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
            <SelectField
              label="Ownership type"
              required
              value={profile.ownershipType}
              options={asOptions(healthcareOptions.ownershipTypes)}
              error={errors.ownershipType}
              onChange={(event) =>
                onChange({ ...profile, ownershipType: event.target.value })
              }
            />
          </div>
          <MultiSelect
            label="Systems of medicine / healthcare"
            required
            value={profile.systemsOfMedicine}
            options={healthcareOptions.systems}
            error={errors.systemsOfMedicine}
            onChange={(systemsOfMedicine) =>
              onChange({ ...profile, systemsOfMedicine })
            }
          />
          <TextareaField
            label="Main specialties / services"
            required
            value={profile.mainServices}
            error={errors.mainServices}
            onChange={(event) =>
              onChange({ ...profile, mainServices: event.target.value })
            }
          />
          <RadioGroup
            label="Is this facility licensed / registered?"
            name="healthcare-licensed"
            required
            value={profile.licensed}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            error={errors.licensed}
            onChange={(event) =>
              onChange({
                ...profile,
                licensed: event.target.value as "yes" | "no",
              })
            }
          />
          {profile.licensed === "yes" ? (
            <div className="grid gap-5 md:grid-cols-2">
              <TextField
                label="Licence / registration number"
                required
                value={profile.licenceNumber}
                error={errors.licenceNumber}
                onChange={(event) =>
                  onChange({ ...profile, licenceNumber: event.target.value })
                }
              />
              <TextField
                label="Licensing authority"
                required
                value={profile.licensingAuthority}
                error={errors.licensingAuthority}
                onChange={(event) =>
                  onChange({
                    ...profile,
                    licensingAuthority: event.target.value,
                  })
                }
              />
            </div>
          ) : null}
          <div className="grid gap-3 md:grid-cols-2">
            <CheckboxField
              label="24×7 service"
              checked={profile.twentyFourSeven}
              onChange={(event) =>
                onChange({ ...profile, twentyFourSeven: event.target.checked })
              }
            />
            <CheckboxField
              label="Emergency services"
              checked={profile.emergencyServices}
              onChange={(event) =>
                onChange({
                  ...profile,
                  emergencyServices: event.target.checked,
                })
              }
            />
          </div>
          <TextField
            label="Number of beds"
            inputMode="numeric"
            value={profile.numberOfBeds}
            onChange={(event) =>
              onChange({ ...profile, numberOfBeds: event.target.value })
            }
          />
        </FormSection>
      );
    case "business":
      return (
        <FormSection title="Business / company profile">
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
          <TextareaField
            label="Products / services description"
            required
            value={profile.productsServices}
            error={errors.productsServices}
            onChange={(event) =>
              onChange({ ...profile, productsServices: event.target.value })
            }
          />
          <div className="grid gap-5 md:grid-cols-2">
            <SelectField
              label="Employee size range"
              value={profile.employeeSize}
              options={asOptions(businessOptions.employeeSizes)}
              onChange={(event) =>
                onChange({ ...profile, employeeSize: event.target.value })
              }
            />
            <TextField
              label="Operating countries"
              value={profile.operatingCountries}
              onChange={(event) =>
                onChange({ ...profile, operatingCountries: event.target.value })
              }
            />
          </div>
        </FormSection>
      );
    case "nonprofit":
      return (
        <FormSection title="NGO / non-profit profile">
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
          <MultiSelect
            label="Primary areas of work"
            required
            value={profile.primaryAreas}
            options={nonprofitOptions.areas}
            error={errors.primaryAreas}
            onChange={(primaryAreas) => onChange({ ...profile, primaryAreas })}
          />
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="Beneficiary regions"
              value={profile.beneficiaryRegions}
              onChange={(event) =>
                onChange({ ...profile, beneficiaryRegions: event.target.value })
              }
            />
            <TextField
              label="Approximate organisation size"
              value={profile.organisationSize}
              onChange={(event) =>
                onChange({ ...profile, organisationSize: event.target.value })
              }
            />
          </div>
        </FormSection>
      );
    case "other":
      return (
        <FormSection title="Other organisation profile">
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
        </FormSection>
      );
  }
}

function RepresentativeStep({
  representative,
  errors,
  onChange,
}: {
  readonly representative: OrganisationRepresentative;
  readonly errors: ValidationErrors;
  readonly onChange: (representative: OrganisationRepresentative) => void;
}) {
  const update = (
    key: keyof OrganisationRepresentative,
    value: string | boolean,
  ) => onChange({ ...representative, [key]: value });
  return (
    <FormSection
      title="Representative information"
      description="You are registering this organisation as an individual representative."
    >
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
            onChange={(event) => update("fullName", event.target.value)}
          />
          <TextField
            label="Email"
            type="email"
            required
            value={representative.email}
            error={errors.email}
            onChange={(event) => update("email", event.target.value)}
          />
          <TextField
            label="Phone"
            type="tel"
            required
            value={representative.phone}
            error={errors.phone}
            onChange={(event) => update("phone", event.target.value)}
          />
          <TextField
            label="Designation"
            required
            value={representative.designation}
            error={errors.designation}
            onChange={(event) => update("designation", event.target.value)}
          />
          <SelectField
            label="Relationship to organisation"
            required
            value={representative.relationship}
            options={representativeRelationships}
            error={errors.relationship}
            onChange={(event) => update("relationship", event.target.value)}
          />
        </div>
      </FormSubsection>
      <FormSubsection
        title="Authority declarations"
        description="Both confirmations are required before the application can be submitted."
      >
        <div className="grid gap-3">
          <CheckboxField
            label="I confirm that I am authorised to submit this organisation's information."
            checked={representative.authorisedDeclaration}
            error={errors.authorisedDeclaration}
            onChange={(event) =>
              update("authorisedDeclaration", event.target.checked)
            }
          />
          <CheckboxField
            label="I confirm that the information provided is accurate to the best of my knowledge."
            checked={representative.accuracyDeclaration}
            error={errors.accuracyDeclaration}
            onChange={(event) =>
              update("accuracyDeclaration", event.target.checked)
            }
          />
        </div>
      </FormSubsection>
    </FormSection>
  );
}
