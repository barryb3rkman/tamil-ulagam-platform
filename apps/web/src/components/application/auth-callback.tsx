"use client";

import { Button } from "@tamil-ulagam/ui";
import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { usePlatform } from "@/features/enrollment/platform-provider";
import type {
  AuthCallbackIntent,
  AuthCallbackResult,
} from "@/features/enrollment/platform-services";
import {
  isValid,
  validatePasswordRecovery,
  type ValidationErrors,
} from "@/features/enrollment/validation";
import { getSafeReturnTarget, withReturnTarget } from "@/lib/return-target";

import { authJourneyPresentation } from "./auth-journey";
import { FormError, TextField } from "./form-fields";
import { asEventHandler } from "@/lib/event-handlers";

type CallbackView =
  | { readonly status: "processing" }
  | AuthCallbackResult
  | { readonly status: "password_updated" };

function callbackIntent(url: URL): AuthCallbackIntent | null {
  const flow = url.searchParams.get("flow");
  return flow === "confirmation" || flow === "recovery" ? flow : null;
}

export function AuthCallbackPanel() {
  const { isHydrated, platformError, resolveAuthCallback } = usePlatform();
  const [view, setView] = useState<CallbackView>({ status: "processing" });
  const [intent, setIntent] = useState<AuthCallbackIntent | null>(null);
  const [returnTarget, setReturnTarget] = useState<string | null>(null);
  const callbackStarted = useRef(false);

  useEffect(() => {
    if (!isHydrated || callbackStarted.current) return;
    callbackStarted.current = true;
    const callbackUrl = new URL(window.location.href);
    const requestedIntent = callbackIntent(callbackUrl);
    setIntent(requestedIntent);
    setReturnTarget(getSafeReturnTarget(callbackUrl.searchParams.get("next")));
    let active = true;
    const resolution: Promise<AuthCallbackResult> = requestedIntent
      ? resolveAuthCallback(requestedIntent, window.location.href)
      : Promise.resolve({
          status: "invalid",
          message:
            "This authentication link is incomplete. Request a new link and try again.",
        });
    void resolution
      .then((result) => {
        if (active) setView(result);
      })
      .catch(() => {
        if (active) {
          setView({
            status: "invalid",
            message:
              "This authentication link is invalid or has expired. Request a new link and try again.",
          });
        }
      });
    return () => {
      active = false;
    };
  }, [isHydrated, resolveAuthCallback]);

  if (view.status === "processing") {
    return (
      <div className="grid min-h-72 content-center gap-4" aria-live="polite">
        <h2 className="text-global-navy text-2xl font-bold">
          Checking your secure link
        </h2>
        <p className="text-slate leading-7">
          Please wait while Tamil Ulagam verifies this request.
        </p>
      </div>
    );
  }

  if (view.status === "invalid") {
    return (
      <div className="grid min-h-72 content-center gap-5" aria-live="polite">
        <h2 className="text-global-navy text-2xl font-bold">
          Link unavailable
        </h2>
        <FormError message={platformError || view.message} />
        <div className="flex flex-wrap gap-4">
          {intent === "recovery" ? (
            <Link
              className="text-global-navy focus-visible:ring-focus font-semibold underline underline-offset-4"
              href="/forgot-password"
            >
              Request a new reset link
            </Link>
          ) : null}
          <Link
            className="text-global-navy focus-visible:ring-focus font-semibold underline underline-offset-4"
            href="/login"
          >
            Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  if (view.status === "confirmation_success") {
    const journey = authJourneyPresentation(returnTarget, "signup");
    const destination = returnTarget ?? "/register";
    return (
      <div className="grid min-h-72 content-center gap-5" aria-live="polite">
        <span
          aria-hidden="true"
          className="bg-success/10 text-success grid size-12 place-items-center rounded-full text-xl font-bold"
        >
          ✓
        </span>
        <div>
          <h2 className="text-global-navy text-2xl font-bold">
            Email confirmed
          </h2>
          <p className="text-slate mt-2 max-w-md leading-7">
            {view.hasSession
              ? `Your email is confirmed and your secure session is ready. ${journey.accountLead}`
              : `Your email is confirmed. Sign in to continue. ${journey.accountLead}`}
          </p>
        </div>
        <Link
          className="bg-global-navy focus-visible:ring-focus rounded-button w-fit px-5 py-3 font-semibold text-white"
          href={
            view.hasSession
              ? destination
              : withReturnTarget("/login", returnTarget)
          }
        >
          {view.hasSession
            ? returnTarget
              ? "Continue your journey"
              : "Continue registration"
            : "Continue to sign in"}
        </Link>
      </div>
    );
  }

  if (view.status === "password_updated") {
    return (
      <div className="grid min-h-72 content-center gap-5" aria-live="polite">
        <h2 className="text-global-navy text-2xl font-bold">
          Password updated
        </h2>
        <p className="text-slate max-w-md leading-7">
          Your recovery session has been closed. Sign in with your new password.
        </p>
        <Link
          className="bg-global-navy focus-visible:ring-focus rounded-button w-fit px-5 py-3 font-semibold text-white"
          href="/login"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <PasswordRecoveryForm
      onSuccess={() => setView({ status: "password_updated" })}
    />
  );
}

function PasswordRecoveryForm({
  onSuccess,
}: {
  readonly onSuccess: () => void;
}) {
  const { completePasswordRecovery } = usePlatform();
  const [values, setValues] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validatePasswordRecovery(values);
    setErrors(nextErrors);
    setFormError("");
    if (!isValid(nextErrors)) return;
    setLoading(true);
    try {
      await completePasswordRecovery(values.password);
      onSuccess();
    } catch (error: unknown) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Your new password could not be saved. Request a new reset link and try again.",
      );
      setLoading(false);
    }
  };

  return (
    <form noValidate onSubmit={asEventHandler(submit)} className="grid gap-5">
      <div>
        <h2 className="text-global-navy text-2xl font-bold">
          Set a new password
        </h2>
        <p className="text-slate mt-2 leading-7">
          Choose a strong password for your Tamil Ulagam account.
        </p>
      </div>
      <FormError message={formError} />
      <TextField
        label="New password"
        type="password"
        autoComplete="new-password"
        required
        value={values.password}
        error={errors.password}
        helperText="At least 8 characters with upper and lowercase letters, a number and a symbol."
        onChange={(event) =>
          setValues({ ...values, password: event.target.value })
        }
      />
      <TextField
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        required
        value={values.confirmPassword}
        error={errors.confirmPassword}
        onChange={(event) =>
          setValues({ ...values, confirmPassword: event.target.value })
        }
      />
      <Button type="submit" size="large" disabled={loading} aria-busy={loading}>
        {loading ? "Saving password…" : "Set new password"}
      </Button>
    </form>
  );
}
