import type {
  Organisation,
  OrganisationCategoryProfile,
  OrganisationRepresentative,
} from "@tamil-ulagam/shared";

export type ValidationErrors = Record<string, string>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const websitePattern = /^https?:\/\/.+/i;

export function validateEmail(value: string): string {
  if (!value.trim()) return "Enter an email address.";
  return emailPattern.test(value.trim()) ? "" : "Enter a valid email address.";
}

export function validateSignup(input: {
  readonly fullName: string;
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};
  if (input.fullName.trim().length < 2) {
    errors.fullName = "Enter your full name.";
  }
  const emailError = validateEmail(input.email);
  if (emailError) errors.email = emailError;
  const passwordError = validatePassword(input.password);
  if (passwordError) errors.password = passwordError;
  if (input.confirmPassword !== input.password) {
    errors.confirmPassword = "Passwords do not match.";
  }
  return errors;
}

export function validatePassword(value: string): string {
  if (value.length < 8) return "Use at least 8 characters.";
  if (
    !/[A-Z]/.test(value) ||
    !/[a-z]/.test(value) ||
    !/[0-9]/.test(value) ||
    !/[^A-Za-z0-9]/.test(value)
  ) {
    return "Include upper and lowercase letters, a number and a symbol.";
  }
  return "";
}

export function validatePasswordRecovery(input: {
  readonly password: string;
  readonly confirmPassword: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};
  const passwordError = validatePassword(input.password);
  if (passwordError) errors.password = passwordError;
  if (input.confirmPassword !== input.password) {
    errors.confirmPassword = "Passwords do not match.";
  }
  return errors;
}

export function validateCaptchaToken(enabled: boolean, token: string): string {
  return enabled && !token.trim()
    ? "Complete the security check before continuing."
    : "";
}

export function validateLogin(input: {
  readonly email: string;
  readonly password: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};
  const emailError = validateEmail(input.email);
  if (emailError) errors.email = emailError;
  if (!input.password) errors.password = "Enter your password.";
  return errors;
}

export function validateOrganisation(
  organisation: Organisation,
): ValidationErrors {
  const errors: ValidationErrors = {};
  const required: readonly [keyof Organisation, string][] = [
    ["name", "Enter the organisation name."],
    ["country", "Enter the country."],
    ["region", "Enter the state, province or region."],
    ["city", "Enter the city."],
    ["streetAddress", "Enter the street address."],
    ["officialPhone", "Enter the official phone number."],
    ["description", "Add a short organisation description."],
    ["registrationStatus", "Select the registration status."],
  ];
  required.forEach(([key, message]) => {
    if (!String(organisation[key]).trim()) errors[key] = message;
  });
  const emailError = validateEmail(organisation.officialEmail);
  if (emailError) errors.officialEmail = emailError;
  if (
    organisation.website &&
    !websitePattern.test(organisation.website.trim())
  ) {
    errors.website =
      "Use a full website URL beginning with http:// or https://.";
  }
  if (
    organisation.yearEstablished &&
    (!/^\d{4}$/.test(organisation.yearEstablished) ||
      Number(organisation.yearEstablished) < 1000 ||
      Number(organisation.yearEstablished) > new Date().getFullYear())
  ) {
    errors.yearEstablished = "Enter a valid four-digit year.";
  }
  if (organisation.description.trim().length > 600) {
    errors.description = "Keep the description within 600 characters.";
  }
  if (organisation.registrationStatus === "registered") {
    if (!organisation.registrationNumber.trim()) {
      errors.registrationNumber =
        "Enter the registration or incorporation number.";
    }
    if (!organisation.registrationAuthority.trim()) {
      errors.registrationAuthority = "Enter the registration authority.";
    }
    if (!organisation.registrationCountry.trim()) {
      errors.registrationCountry = "Enter the registration country.";
    }
  }
  return errors;
}

export function validateCategoryProfile(
  profile: OrganisationCategoryProfile | null,
): ValidationErrors {
  if (!profile) return { category: "Select an organisation category." };
  const errors: ValidationErrors = {};
  switch (profile.category) {
    case "tamil_community":
      if (!profile.subtype) errors.subtype = "Select an organisation subtype.";
      if (profile.primaryActivities.length === 0) {
        errors.primaryActivities = "Select at least one primary activity.";
      }
      break;
    case "education":
      if (!profile.institutionType)
        errors.institutionType = "Select an institution type.";
      if (!profile.governanceType)
        errors.governanceType = "Select a governance type.";
      if (!profile.tamilProgrammesOffered) {
        errors.tamilProgrammesOffered = "Select yes or no.";
      }
      if (
        profile.tamilProgrammesOffered === "yes" &&
        !profile.tamilProgrammesDescription.trim()
      ) {
        errors.tamilProgrammesDescription =
          "Describe the Tamil-related programmes.";
      }
      break;
    case "healthcare":
      if (!profile.facilityType)
        errors.facilityType = "Select a facility type.";
      if (!profile.ownershipType)
        errors.ownershipType = "Select an ownership type.";
      if (profile.systemsOfMedicine.length === 0) {
        errors.systemsOfMedicine = "Select at least one system of healthcare.";
      }
      if (!profile.mainServices.trim())
        errors.mainServices = "Describe the main specialties or services.";
      if (!profile.licensed) errors.licensed = "Select the licensing status.";
      if (profile.licensed === "yes") {
        if (!profile.licenceNumber.trim())
          errors.licenceNumber = "Enter the licence number.";
        if (!profile.licensingAuthority.trim())
          errors.licensingAuthority = "Enter the licensing authority.";
      }
      break;
    case "business":
      if (!profile.businessType)
        errors.businessType = "Select a business type.";
      if (!profile.industry) errors.industry = "Select an industry.";
      if (!profile.productsServices.trim())
        errors.productsServices = "Describe the products or services.";
      break;
    case "nonprofit":
      if (!profile.subtype) errors.subtype = "Select an organisation subtype.";
      if (profile.primaryAreas.length === 0)
        errors.primaryAreas = "Select at least one primary area of work.";
      break;
    case "other":
      if (!profile.organisationType.trim())
        errors.organisationType = "Enter the organisation type.";
      if (!profile.primaryPurpose.trim())
        errors.primaryPurpose = "Describe the organisation's primary purpose.";
      break;
  }
  return errors;
}

export function validateRepresentative(
  representative: OrganisationRepresentative,
): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!representative.fullName.trim())
    errors.fullName = "Enter the representative's full name.";
  const emailError = validateEmail(representative.email);
  if (emailError) errors.email = emailError;
  if (!representative.phone.trim())
    errors.phone = "Enter the representative's phone number.";
  if (!representative.designation.trim())
    errors.designation = "Enter the representative's designation.";
  if (!representative.relationship)
    errors.relationship = "Select the relationship to the organisation.";
  if (!representative.authorisedDeclaration)
    errors.authorisedDeclaration =
      "Confirm that you are authorised to submit this information.";
  if (!representative.accuracyDeclaration)
    errors.accuracyDeclaration = "Confirm that the information is accurate.";
  return errors;
}

export function isValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}
