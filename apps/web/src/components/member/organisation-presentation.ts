import { isTamilSangam, type EligibleOrganisation } from "@tamil-ulagam/shared";

import { organisationCategories } from "@/content/enrollment";

/** "Tamil Sangam" for a Sangam-subtyped organisation, otherwise the
 * existing organisation-category label (e.g. "Education"). Never derived
 * from the organisation's name — see EligibleOrganisation/isTamilSangam. */
export function organisationKindLabel(
  organisation: EligibleOrganisation,
): string {
  if (isTamilSangam(organisation)) return "Tamil Sangam";
  return (
    organisationCategories.find(
      (option) => option.value === organisation.category,
    )?.label ?? "Organisation"
  );
}

export function organisationLocationLabel(
  organisation: EligibleOrganisation,
): string {
  return [organisation.city, organisation.region, organisation.country]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}
