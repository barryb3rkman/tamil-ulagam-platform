"use client";

import type { MemberProfile } from "@tamil-ulagam/shared";
import type { FormEvent } from "react";

import {
  FormActions,
  FormError,
  TextField,
} from "@/components/application/form-fields";
import { memberProfileContent } from "@/content/member";
import type { ValidationErrors } from "@/features/enrollment/validation";

/**
 * Step 1 (H4 brief section 4) — the account is already authenticated, so
 * account email is never asked again here. Pre-filled from whatever the
 * profile already has; always shown (not conditionally skipped) so a
 * returning member can still correct a typo, matching the rest of the
 * platform's "always show, pre-filled" convention rather than a
 * skip-if-already-set branch.
 */
export function MemberProfileStage({
  errors,
  formError,
  onChange,
  onSubmit,
  pending,
  profile,
}: {
  readonly profile: MemberProfile;
  readonly errors: ValidationErrors;
  readonly formError: string;
  readonly pending: boolean;
  readonly onChange: (profile: MemberProfile) => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const update = (key: keyof MemberProfile, value: string) =>
    onChange({ ...profile, [key]: value });

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-6">
      <div className="surface-card grid gap-6 p-5 sm:p-7 lg:p-8">
        <div className="max-w-xl">
          <h2 className="text-global-navy text-xl font-bold tracking-[-0.01em] sm:text-2xl">
            {memberProfileContent.title}
          </h2>
          <p className="text-slate mt-2 leading-6">
            {memberProfileContent.description}
          </p>
        </div>
        <div className="grid items-start gap-5 sm:grid-cols-2">
          <TextField
            label="Full name"
            required
            value={profile.fullName}
            error={errors.fullName}
            onChange={(event) => update("fullName", event.target.value)}
          />
          <TextField
            label="Mobile number"
            type="tel"
            required
            value={profile.phone}
            error={errors.phone}
            onChange={(event) => update("phone", event.target.value)}
          />
        </div>
        <div className="grid items-start gap-5 sm:grid-cols-3">
          <TextField
            label="Country"
            required
            value={profile.country}
            error={errors.country}
            onChange={(event) => update("country", event.target.value)}
          />
          <TextField
            label="State / Province / Region"
            required
            value={profile.region}
            error={errors.region}
            onChange={(event) => update("region", event.target.value)}
          />
          <TextField
            label="City"
            required
            value={profile.city}
            error={errors.city}
            onChange={(event) => update("city", event.target.value)}
          />
        </div>
      </div>
      <FormError message={formError} />
      <FormActions pending={pending} nextLabel="Continue" />
    </form>
  );
}
