import type {
  Organisation,
  OrganisationRepresentative,
} from "@tamil-ulagam/shared";

import { SelectField, TextField } from "@/components/application/form-fields";
import { representativeRoleOptions } from "@/content/enrollment";
import { organisationStageContactContent as content } from "@/content/organisation";
import type { ValidationErrors } from "@/features/enrollment/validation";

type RepresentativeRole = (typeof representativeRoleOptions)[number]["value"];

/**
 * The Contact & Representative stage offers four simplified role
 * groupings; the stored value stays the full eight-value enum so
 * historical records and admin review keep exact meaning — identical
 * mapping to the one the pre-V3 wizard used (content/enrollment.ts's
 * `representativeRelationships` remains the full list for display).
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

export function OrganisationStageContact({
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
    <div className="grid gap-6">
      <div className="surface-card grid gap-5 p-5 sm:p-7 lg:p-8">
        <div className="max-w-xl">
          <h2 className="text-global-navy text-xl font-bold tracking-[-0.01em] sm:text-2xl">
            {content.title}
          </h2>
          <p className="text-slate mt-2 leading-6">{content.description}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Official email"
            type="email"
            required
            value={organisation.officialEmail}
            error={errors.officialEmail}
            helperText={
              errors.officialEmail ? undefined : content.officialEmailHelp
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
      </div>

      <div className="surface-card grid gap-5 p-5 sm:p-7 lg:p-8">
        <h3 className="text-global-navy text-base font-bold">
          Your details as representative
        </h3>
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
        </div>
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
    </div>
  );
}
