import type { Organisation } from "@tamil-ulagam/shared";
import { Alert } from "@tamil-ulagam/ui";
import Link from "next/link";

import { TextField, TextareaField } from "@/components/application/form-fields";
import { organisationCategories } from "@/content/enrollment";
import { organisationStageIdentityContent as content } from "@/content/organisation";
import type { ValidationErrors } from "@/features/enrollment/validation";

export function OrganisationStageIdentity({
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
    <div className="surface-card grid gap-7 p-5 sm:p-7 lg:p-8">
      <div className="max-w-xl">
        <h2 className="text-global-navy text-xl font-bold tracking-[-0.01em] sm:text-2xl">
          {content.title}
        </h2>
        <p className="text-slate mt-2 leading-6">{content.description}</p>
      </div>
      <div className="grid gap-5">
        <fieldset className="grid gap-3">
          <legend className="text-global-navy mb-1 text-sm font-semibold">
            Organisation category
            <span className="text-heritage-maroon ml-1" aria-hidden="true">
              *
            </span>
          </legend>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {organisationCategories.map((option) => {
              const selected = organisation.category === option.value;
              return (
                <label
                  key={option.value}
                  className={`motion-card focus-within:ring-focus rounded-card relative min-h-28 cursor-pointer overflow-hidden border p-4 ${selected ? "border-heritage-maroon bg-heritage-maroon/5 shadow-card" : "border-global-navy/12 bg-white"}`}
                >
                  <input
                    type="radio"
                    name="organisation-category"
                    value={option.value}
                    checked={selected}
                    onChange={() => update("category", option.value)}
                    className="absolute inset-0 z-10 cursor-pointer opacity-0"
                  />
                  <span className="flex h-full flex-col justify-between">
                    <span className="text-global-navy block text-sm font-bold">
                      {option.label}
                    </span>
                    <span className="text-slate mt-2 block text-xs leading-5">
                      {option.description}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`absolute top-3 right-3 grid size-6 place-items-center rounded-full border text-xs font-bold ${selected ? "border-heritage-maroon bg-heritage-maroon text-white" : "border-global-navy/15 text-transparent"}`}
                  >
                    ✓
                  </span>
                </label>
              );
            })}
          </div>
          {errors.category ? (
            <p role="alert" className="text-error text-sm">
              {errors.category}
            </p>
          ) : null}
        </fieldset>

        {organisation.category === "tamil_community" ? (
          <Alert tone="info">
            {content.sangamGuidance}{" "}
            <Link
              href="/join/sangam"
              className="text-global-navy font-semibold underline underline-offset-4"
            >
              {content.sangamGuidanceCta}
            </Link>
          </Alert>
        ) : null}
      </div>

      <div className="border-global-navy/10 grid gap-5 border-t pt-6">
        <h3 className="text-global-navy text-base font-bold">
          Organisation profile
        </h3>
        <TextField
          label="Organisation name"
          required
          value={organisation.name}
          error={errors.name}
          onChange={(event) => update("name", event.target.value)}
        />
        <div className="grid items-start gap-5 sm:grid-cols-3">
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
        </div>
        <div className="sm:max-w-40">
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
      </div>
    </div>
  );
}
