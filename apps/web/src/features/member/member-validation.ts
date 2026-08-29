import type { MemberProfile } from "@tamil-ulagam/shared";

import type { ValidationErrors } from "@/features/enrollment/validation";

/**
 * Phase H4 — validation for the Member affiliation flow's own two small
 * forms (personal profile, category connection question). Deliberately
 * separate from features/enrollment/validation.ts, the same "don't risk
 * an unrelated domain" reasoning sangam-validation.ts already
 * established for H3.
 */

export function validateMemberProfile(
  profile: MemberProfile,
): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!profile.fullName.trim()) errors.fullName = "Enter your full name.";
  if (!profile.phone.trim()) errors.phone = "Enter your mobile number.";
  if (!profile.country.trim()) errors.country = "Enter your country.";
  if (!profile.region.trim()) {
    errors.region = "Enter your state, province or region.";
  }
  if (!profile.city.trim()) errors.city = "Enter your city.";
  return errors;
}

export function validateConnectionAnswer(
  required: boolean,
  connectionType: string,
): ValidationErrors {
  if (required && !connectionType.trim()) {
    return { connectionType: "Select the option that best describes you." };
  }
  return {};
}
