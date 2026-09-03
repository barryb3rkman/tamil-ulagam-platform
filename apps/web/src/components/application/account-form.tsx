"use client";

import { Button, Container } from "@tamil-ulagam/ui";
import { type FormEvent, useEffect, useState } from "react";

import { usePlatform } from "@/features/enrollment/platform-provider";
import {
  isValid,
  validateEmail,
  type ValidationErrors,
} from "@/features/enrollment/validation";

import { FormError, TextField } from "./form-fields";

function initials(fullName: string): string {
  return (
    fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "TU"
  );
}

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

  const dirty =
    values.fullName !== currentUser.fullName ||
    values.email !== currentUser.email ||
    values.phone !== currentUser.phone ||
    values.country !== currentUser.country;

  const reset = () => {
    setValues({
      fullName: currentUser.fullName,
      email: currentUser.email,
      phone: currentUser.phone,
      country: currentUser.country,
    });
    setErrors({});
    setFormError("");
    setSaved(false);
  };

  return (
    <Container size="wide" className="py-6 sm:py-8 lg:px-8 lg:py-9 xl:px-10">
      <header className="gradient-aurora rounded-large glow-ring relative isolate overflow-hidden px-6 py-9 sm:px-9 sm:py-11">
        <div
          aria-hidden="true"
          data-motion-ambient
          className="bg-heritage-gold/12 motion-float pointer-events-none absolute -top-24 right-8 size-64 rounded-full blur-3xl"
        />
        <div
          aria-hidden="true"
          data-motion-ambient
          className="bg-royal-indigo/30 motion-float pointer-events-none absolute -bottom-24 left-1/4 size-72 rounded-full blur-3xl [animation-delay:2s]"
        />
        <div className="relative flex min-w-0 items-start gap-4">
          <span
            aria-hidden="true"
            className="gradient-gold-leaf text-ink font-display grid size-14 shrink-0 place-items-center rounded-2xl text-xl font-semibold shadow-[0_0.75rem_2rem_rgba(214,168,75,0.32)]"
          >
            {initials(currentUser.fullName)}
          </span>
          <div className="min-w-0">
            <p className="text-heritage-gold/85 text-[0.68rem] font-bold tracking-[0.22em] uppercase">
              Personal account
            </p>
            <h1 className="text-page-title text-gradient-gold mt-2 min-w-0">
              Account settings
            </h1>
            <p className="mt-3 text-lg font-semibold text-white/85">
              {currentUser.fullName}
            </p>
            <p className="mt-1.5 flex items-center gap-2 text-sm break-all text-white/55">
              <span
                aria-hidden="true"
                className="bg-heritage-gold/60 inline-block size-1.5 shrink-0 rounded-full"
              />
              {currentUser.email}
            </p>
            <p className="mt-3 max-w-xl text-[0.95rem] leading-7 text-white/62">
              One identity across every Tamil Ulagam workspace you belong to or
              manage.
            </p>
          </div>
        </div>
      </header>

      <div className="mt-8 grid max-w-6xl items-start gap-5">
        <form
          noValidate
          onSubmit={submit}
          className="rounded-large border-global-navy/10 grid gap-6 border bg-white p-6 sm:p-8 lg:p-9"
        >
          <div className="border-global-navy/10 border-b pb-5">
            <p className="text-slate text-[0.66rem] font-bold tracking-[0.14em] uppercase">
              Profile information
            </p>
            <h2 className="text-section-title text-gradient-ink mt-2">
              Personal profile
            </h2>
            <p className="text-slate mt-2 text-sm leading-6">
              Keep the contact information associated with your personal account
              current.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
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
          {dirty || saving ? (
            <div className="border-global-navy/10 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-slate text-sm">You have unsaved changes.</p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={reset}
                  disabled={saving}
                  className="border-global-navy/12 text-global-navy hover:border-global-navy/30 hover:bg-global-navy/5 focus-visible:ring-focus rounded-button motion-control inline-flex min-h-11 items-center border bg-white px-4 text-sm font-semibold focus-visible:outline-none disabled:opacity-60"
                >
                  Discard
                </button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={saving}
                  aria-busy={saving}
                >
                  {saving ? "Saving…" : "Save account"}
                </Button>
              </div>
            </div>
          ) : null}
          <p
            aria-live="polite"
            className="text-success text-sm font-semibold empty:hidden"
          >
            {saved ? "Account details saved." : ""}
          </p>
        </form>
      </div>
    </Container>
  );
}
