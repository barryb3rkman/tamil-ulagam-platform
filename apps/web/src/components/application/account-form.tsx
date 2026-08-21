"use client";

import { Button } from "@tamil-ulagam/ui";
import { type FormEvent, useEffect, useState } from "react";

import { usePlatform } from "@/features/enrollment/platform-provider";
import {
  isValid,
  validateEmail,
  type ValidationErrors,
} from "@/features/enrollment/validation";

import { FormError, TextField } from "./form-fields";

export function AccountForm() {
  const { currentUser, isHydrated, updateProfile } = usePlatform();
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  useEffect(() => {
    if (!currentUser) return;
    const initializationTask = window.setTimeout(() => {
      setValues({
        fullName: currentUser.fullName,
        email: currentUser.email,
        phone: currentUser.phone,
        country: currentUser.country,
      });
    }, 0);
    return () => window.clearTimeout(initializationTask);
  }, [currentUser]);
  if (!isHydrated) return <p role="status">Loading account…</p>;
  if (!currentUser)
    return (
      <div className="rounded-card shadow-card bg-white p-7">
        <h1 className="text-global-navy text-3xl font-bold">
          Sign in to edit your account
        </h1>
      </div>
    );
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: ValidationErrors = {};
    if (!values.fullName.trim()) nextErrors.fullName = "Enter your full name.";
    const emailError = validateEmail(values.email);
    if (emailError) nextErrors.email = emailError;
    setErrors(nextErrors);
    if (!isValid(nextErrors)) return;
    setSaving(true);
    setFormError("");
    try {
      await updateProfile(values);
      setSaved(true);
    } catch (error: unknown) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Account details could not be saved. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <div>
      <p className="text-heritage-maroon text-xs font-bold tracking-[0.14em] uppercase">
        Personal profile
      </p>
      <h1 className="text-global-navy mt-3 text-3xl font-bold">
        Account details
      </h1>
      <p className="text-slate mt-3 max-w-xl leading-7">
        Your personal account remains separate from the organisation you
        represent.
      </p>
      <form
        noValidate
        onSubmit={submit}
        className="rounded-large border-global-navy/12 shadow-card mt-6 grid gap-6 border bg-white p-6 sm:p-8"
      >
        <div className="border-global-navy/10 border-b pb-5">
          <h2 className="text-global-navy text-xl font-bold">
            Personal profile
          </h2>
          <p className="text-slate mt-2 text-sm leading-6">
            Keep the contact information associated with your personal account
            current.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Full name"
            required
            value={values.fullName}
            error={errors.fullName}
            onChange={(event) => {
              setSaved(false);
              setValues({ ...values, fullName: event.target.value });
            }}
          />
          <TextField
            label="Email"
            type="email"
            required
            value={values.email}
            error={errors.email}
            onChange={(event) => {
              setSaved(false);
              setValues({ ...values, email: event.target.value });
            }}
          />
          <TextField
            label="Phone"
            type="tel"
            value={values.phone}
            onChange={(event) => {
              setSaved(false);
              setValues({ ...values, phone: event.target.value });
            }}
          />
          <TextField
            label="Country"
            value={values.country}
            onChange={(event) => {
              setSaved(false);
              setValues({ ...values, country: event.target.value });
            }}
          />
        </div>
        <FormError message={formError} />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p aria-live="polite" className="text-success text-sm font-semibold">
            {saved ? "Account details saved." : ""}
          </p>
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={saving}
            aria-busy={saving}
          >
            {saving ? "Saving…" : "Save account"}
          </Button>
        </div>
      </form>
    </div>
  );
}
