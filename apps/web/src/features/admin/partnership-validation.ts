import type { PartnershipEnquiryInput } from "@tamil-ulagam/shared";
import { partnershipAreas } from "@tamil-ulagam/shared";

export type PartnershipField =
  "name" | "email" | "organisationName" | "country" | "area" | "message";

export type PartnershipErrors = Partial<Record<PartnershipField, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validatePartnershipEnquiry(
  input: PartnershipEnquiryInput,
): PartnershipErrors {
  const errors: PartnershipErrors = {};
  const nameLength = input.name.trim().length;
  if (nameLength < 2 || nameLength > 160)
    errors.name = "Enter a name between 2 and 160 characters.";
  const email = input.email.trim();
  if (!emailPattern.test(email) || email.length > 320)
    errors.email = "Enter a valid email address.";
  if (input.organisationName.trim().length > 240)
    errors.organisationName = "Use 240 characters or fewer.";
  const countryLength = input.country.trim().length;
  if (countryLength < 2 || countryLength > 120)
    errors.country = "Enter a country between 2 and 120 characters.";
  if (!partnershipAreas.includes(input.area))
    errors.area = "Choose a partnership area.";
  const messageLength = input.message.trim().length;
  if (messageLength < 20 || messageLength > 3000)
    errors.message = "Enter a message between 20 and 3000 characters.";
  return errors;
}
