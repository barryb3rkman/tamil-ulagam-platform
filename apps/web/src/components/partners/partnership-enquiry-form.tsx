"use client";

import type {
  PartnershipArea,
  PartnershipEnquiryInput,
} from "@tamil-ulagam/shared";
import { partnershipAreas } from "@tamil-ulagam/shared";
import { Button } from "@tamil-ulagam/ui";
import { useState, useSyncExternalStore } from "react";

import {
  SelectField,
  TextareaField,
  TextField,
} from "@/components/application/form-fields";
import { partnershipAreaLabels } from "@/features/admin/admin-presentation";
import {
  type PartnershipErrors,
  validatePartnershipEnquiry,
} from "@/features/admin/partnership-validation";
import { usePublicPartnershipService } from "@/features/admin/use-admin-operations";
import { getPlatformErrorMessage } from "@/lib/supabase/errors";

const emptyInput: PartnershipEnquiryInput = {
  name: "",
  email: "",
  organisationName: "",
  country: "",
  area: "community",
  message: "",
};

export function PartnershipEnquiryForm() {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const service = usePublicPartnershipService();
  const [input, setInput] = useState(emptyInput);
  const [errors, setErrors] = useState<PartnershipErrors>({});
  const [operationError, setOperationError] = useState("");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = <Key extends keyof PartnershipEnquiryInput>(
    key: Key,
    value: PartnershipEnquiryInput[Key],
  ) => {
    setInput((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setOperationError("");
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validatePartnershipEnquiry(input);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    if (!service) {
      setOperationError(
        "Partnership enquiries are not configured for this deployment.",
      );
      return;
    }
    setPending(true);
    setOperationError("");
    try {
      await service.submitPartnershipEnquiry(input);
      setSubmitted(true);
      setInput(emptyInput);
    } catch (caught: unknown) {
      setOperationError(getPlatformErrorMessage(caught));
    } finally {
      setPending(false);
    }
  };

  if (submitted)
    return (
      <div
        role="status"
        aria-live="polite"
        className="border-success/25 bg-success/5 rounded-large border p-6 sm:p-8"
      >
        <p className="text-success text-xs font-bold tracking-[0.12em] uppercase">
          Enquiry received
        </p>
        <h3 className="text-global-navy mt-3 text-2xl font-bold">
          Your enquiry was received.
        </h3>
        <p className="text-slate mt-3 leading-7">
          The Federation team will review it.
        </p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => setSubmitted(false)}
        >
          Send another enquiry
        </Button>
      </div>
    );

  return (
    <form
      noValidate
      data-partnership-form-ready={mounted ? "true" : "false"}
      onSubmit={(event) => void submit(event)}
      className="border-global-navy/12 rounded-large shadow-card grid gap-5 border bg-white p-5 sm:p-7"
    >
      <div>
        <h3 className="text-global-navy text-2xl font-bold">
          Begin a partnership conversation
        </h3>
        <p className="text-slate mt-2 leading-7">
          This starts an enquiry only. It does not create an approved
          partnership.
        </p>
      </div>
      {operationError ? (
        <p
          role="alert"
          className="border-error/25 bg-error/5 text-error rounded-button border p-4"
        >
          {operationError}
        </p>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Name"
          required
          autoComplete="name"
          value={input.name}
          error={errors.name}
          onChange={(event) => update("name", event.target.value)}
        />
        <TextField
          label="Email"
          required
          type="email"
          autoComplete="email"
          value={input.email}
          error={errors.email}
          onChange={(event) => update("email", event.target.value)}
        />
        <TextField
          label="Organisation (optional)"
          autoComplete="organization"
          value={input.organisationName}
          error={errors.organisationName}
          onChange={(event) => update("organisationName", event.target.value)}
        />
        <TextField
          label="Country"
          required
          autoComplete="country-name"
          value={input.country}
          error={errors.country}
          onChange={(event) => update("country", event.target.value)}
        />
      </div>
      <SelectField
        label="Partnership area"
        required
        value={input.area}
        error={errors.area}
        options={partnershipAreas.map((area) => ({
          value: area,
          label: partnershipAreaLabels[area],
        }))}
        onChange={(event) =>
          update("area", event.target.value as PartnershipArea)
        }
      />
      <TextareaField
        label="Message"
        required
        rows={6}
        helperText="Describe the collaboration you would like the Federation to consider. 20–3000 characters."
        maxLength={3000}
        value={input.message}
        error={errors.message}
        onChange={(event) => update("message", event.target.value)}
      />
      <div aria-live="polite">
        <Button
          type="submit"
          size="large"
          disabled={pending || !mounted || !service}
          aria-busy={pending}
        >
          {pending ? "Sending enquiry…" : "Send enquiry"}
        </Button>
      </div>
    </form>
  );
}
