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
  readonly termsAccepted: boolean;
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
  if (!input.termsAccepted) {
    errors.termsAccepted = "Agree to the Terms of Use and Privacy Policy.";
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

// Step 1 — Organisation: name, country, region, city, description.
export function validateOrganisationIdentity(
  organisation: Organisation,
): ValidationErrors {
  const errors: ValidationErrors = {};
  const required: readonly [keyof Organisation, string][] = [
    ["name", "Enter the organisation name."],
    ["country", "Enter the country."],
    ["region", "Enter the state, province or region."],
    ["city", "Enter the city."],
    ["description", "Add a short organisation description."],
  ];
  required.forEach(([key, message]) => {
    if (!String(organisation[key]).trim()) errors[key] = message;
  });
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
  return errors;
}

// Step 2 — Contact & representative: official email/phone, website format.
export function validateOrganisationContact(
  organisation: Organisation,
): ValidationErrors {
  const errors: ValidationErrors = {};
  const emailError = validateEmail(organisation.officialEmail);
  if (emailError) errors.officialEmail = emailError;
  if (!organisation.officialPhone.trim()) {
    errors.officialPhone = "Enter the official phone number.";
  }
  if (
    organisation.website &&
    !websitePattern.test(organisation.website.trim())
  ) {
    errors.website =
      "Use a full website URL beginning with http:// or https://.";
  }
  return errors;
}

// Step 3 — Registration & trust.
export function validateOrganisationTrust(
  organisation: Organisation,
): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!organisation.registrationStatus) {
    errors.registrationStatus = "Select the registration status.";
  }
  return errors;
}

export function validateOrganisation(
  organisation: Organisation,
): ValidationErrors {
  return {
    ...validateOrganisationIdentity(organisation),
    ...validateOrganisationContact(organisation),
    ...validateOrganisationTrust(organisation),
  };
}

export function validateCategoryProfile(
  profile: OrganisationCategoryProfile | null,
): ValidationErrors {
  if (!profile) return { category: "Select an organisation category." };
  const errors: ValidationErrors = {};
  switch (profile.category) {
    case "tamil_community":
      if (!profile.subtype) errors.subtype = "Select an organisation subtype.";
      break;
    case "education":
      if (!profile.institutionType)
        errors.institutionType = "Select an institution type.";
      break;
    case "healthcare":
      if (!profile.facilityType)
        errors.facilityType = "Select a facility type.";
      break;
    case "business":
      if (!profile.businessType)
        errors.businessType = "Select a business type.";
      if (!profile.industry) errors.industry = "Select an industry.";
      break;
    case "nonprofit":
      if (!profile.subtype) errors.subtype = "Select an organisation subtype.";
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

export function validateRepresentativeIdentity(
  representative: OrganisationRepresentative,
): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!representative.fullName.trim())
    errors.fullName = "Enter the representative's full name.";
  if (!representative.phone.trim())
    errors.phone = "Enter the representative's phone number.";
  if (!representative.relationship)
    errors.relationship = "Select the representative's role.";
  return errors;
}

export function validateDeclaration(
  representative: OrganisationRepresentative,
): ValidationErrors {
  const errors: ValidationErrors = {};
  if (
    !representative.authorisedDeclaration ||
    !representative.accuracyDeclaration
  ) {
    errors.declaration =
      "Confirm that you are authorised to represent this organisation and that the information is accurate.";
  }
  return errors;
}

export function validateRepresentative(
  representative: OrganisationRepresentative,
): ValidationErrors {
  return {
    ...validateRepresentativeIdentity(representative),
    ...validateDeclaration(representative),
  };
}

export function isValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}
