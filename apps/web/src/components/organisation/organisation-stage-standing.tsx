import type {
  Organisation,
  OrganisationCategoryProfile,
  OrganisationRepresentative,
} from "@tamil-ulagam/shared";
import { Alert } from "@tamil-ulagam/ui";

import {
  CheckboxField,
  RadioGroup,
  SelectField,
  TextField,
} from "@/components/application/form-fields";
import {
  businessOptions,
  educationOptions,
  healthcareOptions,
  nonprofitOptions,
  organisationCategories,
  registrationStatusOptions,
  tamilCommunityOptions,
} from "@/content/enrollment";
import { organisationStageStandingContent as content } from "@/content/organisation";
import type { ValidationErrors } from "@/features/enrollment/validation";

const asOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

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
        <div className="grid items-start gap-5 sm:grid-cols-2">
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
          <TextField
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

export function OrganisationStageStanding({
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
  const categoryLabel =
    organisationCategories.find((option) => option.value === profile.category)
      ?.label ?? "Organisation";

  return (
    <div className="grid gap-6">
      <div className="surface-card grid gap-6 p-5 sm:p-7 lg:p-8">
        <div className="max-w-xl">
          <h2 className="text-global-navy text-xl font-bold tracking-[-0.01em] sm:text-2xl">
            {content.title}
          </h2>
          <p className="text-slate mt-2 leading-6">{content.description}</p>
        </div>
        <Alert tone="info">{content.informalNotice}</Alert>
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
              helperText="Reviewers may ask for this later if needed."
              value={organisation.registrationNumber}
              error={errors.registrationNumber}
              onChange={(event) =>
                updateOrg("registrationNumber", event.target.value)
              }
            />
          </div>
        ) : null}

        <div className="border-global-navy/10 grid gap-5 border-t pt-6">
          <h3 className="text-global-navy text-base font-bold">
            {categoryLabel} details
          </h3>
          <CategoryQuestion
            profile={profile}
            errors={errors}
            onChange={onProfileChange}
          />
        </div>
      </div>

      <div className="surface-elevated grid gap-4 p-5 sm:p-7 lg:p-8">
        <CheckboxField
          label={content.declaration}
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
