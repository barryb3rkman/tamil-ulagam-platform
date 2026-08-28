import type { Organisation, TamilCommunityProfile } from "@tamil-ulagam/shared";

import {
  validateEmail,
  type ValidationErrors,
} from "@/features/enrollment/validation";

/**
 * Phase H3 (Tamil Sangam registration V2) — dedicated Sangam validators.
 *
 * Deliberately NOT reusing validateOrganisationContact/
 * validateRepresentativeIdentity from features/enrollment/validation.ts:
 * those require officialEmail/officialPhone and a single generic
 * "representative", both of which the Sangam journey no longer collects
 * (H3 brief sections 3/4). A parallel, Sangam-only file keeps every
 * change here from being able to affect the Organisation wizard, which
 * still imports the original functions unchanged.
 */

const SANGAM_MIN_YEAR = 1800;
const MAX_MEMBER_COUNT = 5_000_000;

export function validateSangamIdentity(
  organisation: Organisation,
  profile: TamilCommunityProfile,
): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!organisation.name.trim()) errors.name = "Enter the Sangam's name.";
  if (!organisation.country.trim()) errors.country = "Enter the country.";
  if (!organisation.region.trim()) {
    errors.region = "Enter the state, province or region.";
  }
  if (!organisation.city.trim()) errors.city = "Enter the city.";

  const year = organisation.yearEstablished.trim();
  const currentYear = new Date().getFullYear();
  if (!year) {
    errors.yearEstablished = "Enter the year of commencement.";
  } else if (
    !/^\d{4}$/.test(year) ||
    Number(year) < SANGAM_MIN_YEAR ||
    Number(year) > currentYear
  ) {
    errors.yearEstablished = `Enter a valid four-digit year between ${SANGAM_MIN_YEAR} and ${currentYear}.`;
  }

  const memberCount = profile.memberCount.trim();
  if (!memberCount) {
    errors.memberCount = "Enter the approximate number of members.";
  } else if (
    !/^\d+$/.test(memberCount) ||
    Number(memberCount) < 1 ||
    Number(memberCount) > MAX_MEMBER_COUNT
  ) {
    errors.memberCount = "Enter a whole number of members greater than 0.";
  }

  return errors;
}

export function validateSangamRegistrationDetails(
  organisation: Organisation,
  hasDocument: boolean,
): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!organisation.registrationStatus) {
    errors.registrationStatus =
      "Select whether the Sangam is formally registered.";
    return errors;
  }
  if (organisation.registrationStatus === "registered") {
    if (!organisation.registrationNumber.trim()) {
      errors.registrationNumber = "Enter the registration number.";
    }
    if (!hasDocument) {
      errors.registrationDocument = "Upload the registration document.";
    }
  }
  return errors;
}

export function validateSpoc(profile: TamilCommunityProfile): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!profile.spocFullName.trim()) {
    errors.spocFullName = "Enter the SPOC's full name.";
  }
  const emailError = validateEmail(profile.spocEmail);
  if (emailError)
    errors.spocEmail =
      "Enter the SPOC's " +
      emailError.charAt(0).toLowerCase() +
      emailError.slice(1);
  if (!profile.spocPhone.trim()) {
    errors.spocPhone = "Enter the SPOC's phone number.";
  }
  return errors;
}

export function validatePresident(
  profile: TamilCommunityProfile,
): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!profile.presidentFullName.trim()) {
    errors.presidentFullName = "Enter the President's full name.";
  }
  const emailError = validateEmail(profile.presidentEmail);
  if (emailError)
    errors.presidentEmail =
      "Enter the President's " +
      emailError.charAt(0).toLowerCase() +
      emailError.slice(1);
  if (!profile.presidentPhone.trim()) {
    errors.presidentPhone = "Enter the President's phone number.";
  }
  return errors;
}

/**
 * Sangam's own website/social-link normalizer (H3 brief section 17) — no
 * existing project-wide URL normalizer to reuse (Organisation's website
 * field requires a literal http(s):// prefix and is left exactly as-is).
 * A bare "sangam.example.com" or "www.sangam.example.com" is accepted and
 * silently prefixed with https://; anything else must already parse as a
 * valid absolute http(s) URL.
 */
export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const parsed = new URL(withScheme);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    return parsed.href;
  } catch {
    return "";
  }
}

export function isValidUrl(value: string): boolean {
  if (!value.trim()) return true;
  return normalizeUrl(value) !== "";
}

export function validateWebsite(organisation: Organisation): ValidationErrors {
  const errors: ValidationErrors = {};
  if (organisation.website && !isValidUrl(organisation.website)) {
    errors.website = "Enter a valid website address.";
  }
  return errors;
}

export function validateSocialLinks(links: readonly string[]): string {
  const invalid = links.some((link) => link.trim() && !isValidUrl(link));
  return invalid ? "Enter valid links, or remove the ones that aren't." : "";
}
