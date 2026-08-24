"use client";

import { Button } from "@tamil-ulagam/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { usePlatform } from "@/features/enrollment/platform-provider";
import {
  isValid,
  validateCaptchaToken,
  validateEmail,
  validateLogin,
  validateSignup,
  type ValidationErrors,
} from "@/features/enrollment/validation";

import { FormError, TextField } from "./form-fields";
import { CaptchaChallenge } from "./captcha-challenge";

type SubmissionState = "idle" | "loading" | "success" | "error";

export function SignupForm() {
  const router = useRouter();
  const { captcha, platformError, signup } = usePlatform();
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [state, setState] = useState<SubmissionState>("idle");
  const [formError, setFormError] = useState("");
  const [requiresEmailConfirmation, setRequiresEmailConfirmation] =
    useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [captchaResetKey, setCaptchaResetKey] = useState(0);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateSignup(values);
    const nextCaptchaError = validateCaptchaToken(
      captcha.enabled,
      captchaToken,
    );
    setErrors(nextErrors);
    setCaptchaError(nextCaptchaError);
    setFormError("");
    if (!isValid(nextErrors) || nextCaptchaError) return;
    setState("loading");
    try {
      const result = await signup({ ...values, captchaToken });
      if (!result.ok) {
        setState("error");
        setFormError(result.message);
        setCaptchaResetKey((value) => value + 1);
        return;
      }
      setRequiresEmailConfirmation(Boolean(result.requiresEmailConfirmation));
      setState("success");
    } catch (error: unknown) {
      setState("error");
      setFormError(
        error instanceof Error
          ? error.message
          : "The account could not be created. Please try again.",
      );
      setCaptchaResetKey((value) => value + 1);
    }
  };

  if (state === "success") {
    return (
      <div className="grid min-h-80 content-center gap-5" aria-live="polite">
        <span
          aria-hidden="true"
          className="bg-success/10 text-success grid size-12 place-items-center rounded-full text-xl font-bold"
        >
          ✓
        </span>
        <div>
          <h2 className="text-global-navy text-2xl font-bold">
            Account created
          </h2>
          <p className="text-slate mt-2 max-w-md leading-7">
            {requiresEmailConfirmation
              ? "Check your email and confirm your account before signing in. Organisation information remains a separate enrollment step."
              : "Your account is ready. Organisation information remains a separate enrollment step."}
          </p>
        </div>
        <Button
          onClick={() =>
            router.push(requiresEmailConfirmation ? "/login" : "/register")
          }
          className="w-fit"
        >
          {requiresEmailConfirmation
            ? "Go to sign in"
            : "Start organisation registration"}
        </Button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="grid gap-5">
      <div>
        <h2 className="text-global-navy text-2xl font-bold">
          Personal details
        </h2>
        <p className="text-slate mt-2">
          Begin with your personal account. Organisation details come next.
        </p>
      </div>
      <FormError message={formError || platformError} />
      <TextField
        label="Full name"
        autoComplete="name"
        required
        value={values.fullName}
        error={errors.fullName}
        onChange={(event) =>
          setValues({ ...values, fullName: event.target.value })
        }
      />
      <TextField
        label="Email address"
        type="email"
        autoComplete="email"
        required
        value={values.email}
        error={errors.email}
        onChange={(event) =>
          setValues({ ...values, email: event.target.value })
        }
      />
      <TextField
        label="Password"
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
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        required
        value={values.confirmPassword}
        error={errors.confirmPassword}
        onChange={(event) =>
          setValues({ ...values, confirmPassword: event.target.value })
        }
      />
      <CaptchaChallenge
        configuration={captcha}
        error={captchaError}
        resetKey={captchaResetKey}
        onTokenChange={(token) => {
          setCaptchaToken(token);
          if (token) setCaptchaError("");
        }}
      />
      <div className="grid gap-2">
        <label
          htmlFor="signup-terms-accepted"
          className="border-global-navy/15 focus-within:ring-focus rounded-button flex min-h-12 cursor-pointer items-start gap-3 border bg-white px-4 py-3"
        >
          <input
            id="signup-terms-accepted"
            type="checkbox"
            required
            checked={values.termsAccepted}
            aria-invalid={Boolean(errors.termsAccepted)}
            aria-describedby={
              errors.termsAccepted ? "signup-terms-accepted-error" : undefined
            }
            className="accent-heritage-maroon mt-0.5 size-5 shrink-0"
            onChange={(event) =>
              setValues({ ...values, termsAccepted: event.target.checked })
            }
          />
          <span className="text-charcoal text-sm font-semibold">
            I agree to the{" "}
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="text-global-navy underline underline-offset-4"
            >
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="text-global-navy underline underline-offset-4"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.termsAccepted ? (
          <p
            id="signup-terms-accepted-error"
            role="alert"
            className="text-error text-sm"
          >
            {errors.termsAccepted}
          </p>
        ) : null}
      </div>
      <Button
        type="submit"
        size="large"
        disabled={state === "loading"}
        aria-busy={state === "loading"}
      >
        {state === "loading" ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-slate text-center text-sm">
        Already have an account?{" "}
        <Link
          className="text-global-navy focus-visible:ring-focus font-semibold underline underline-offset-4"
          href="/login"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function LoginForm() {
  const router = useRouter();
  const { captcha, login, platformError } = usePlatform();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [state, setState] = useState<SubmissionState>("idle");
  const [formError, setFormError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [captchaResetKey, setCaptchaResetKey] = useState(0);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    const nextCaptchaError = validateCaptchaToken(
      captcha.enabled,
      captchaToken,
    );
    setErrors(nextErrors);
    setCaptchaError(nextCaptchaError);
    setFormError("");
    if (!isValid(nextErrors) || nextCaptchaError) return;
    setState("loading");
    try {
      const result = await login({ ...values, captchaToken });
      if (!result.ok) {
        setState("error");
        setFormError(result.message);
        setCaptchaResetKey((value) => value + 1);
        return;
      }
      setState("success");
      router.push(
        result.hasApplication
          ? "/dashboard"
          : result.canReview
            ? "/admin"
            : "/register",
      );
    } catch (error: unknown) {
      setState("error");
      setFormError(
        error instanceof Error
          ? error.message
          : "Sign in could not be completed. Please try again.",
      );
      setCaptchaResetKey((value) => value + 1);
    }
  };

  return (
    <form noValidate onSubmit={submit} className="grid gap-5">
      <div>
        <h2 className="text-global-navy text-2xl font-bold">Account access</h2>
        <p className="text-slate mt-2">
          Continue your organisation enrollment journey.
        </p>
      </div>
      <FormError message={formError || platformError} />
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={values.email}
        error={errors.email}
        onChange={(event) =>
          setValues({ ...values, email: event.target.value })
        }
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        value={values.password}
        error={errors.password}
        onChange={(event) =>
          setValues({ ...values, password: event.target.value })
        }
      />
      <div className="flex items-center justify-end">
        <Link
          className="text-global-navy focus-visible:ring-focus text-sm font-semibold underline underline-offset-4"
          href="/forgot-password"
        >
          Forgot password?
        </Link>
      </div>
      <CaptchaChallenge
        configuration={captcha}
        error={captchaError}
        resetKey={captchaResetKey}
        onTokenChange={(token) => {
          setCaptchaToken(token);
          if (token) setCaptchaError("");
        }}
      />
      <Button
        type="submit"
        size="large"
        disabled={state === "loading"}
        aria-busy={state === "loading"}
      >
        {state === "loading"
          ? "Signing in…"
          : state === "success"
            ? "Signed in"
            : "Sign In"}
      </Button>
      <p className="text-slate text-center text-sm">
        New to Tamil Ulagam?{" "}
        <Link
          className="text-global-navy focus-visible:ring-focus font-semibold underline underline-offset-4"
          href="/signup"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const { captcha, platformError, requestPasswordReset } = usePlatform();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [state, setState] = useState<SubmissionState>("idle");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [captchaResetKey, setCaptchaResetKey] = useState(0);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailError = validateEmail(email);
    const nextCaptchaError = validateCaptchaToken(
      captcha.enabled,
      captchaToken,
    );
    setError(emailError);
    setCaptchaError(nextCaptchaError);
    setFormError("");
    if (emailError || nextCaptchaError) return;
    setState("loading");
    try {
      await requestPasswordReset(email, captchaToken);
      setState("success");
    } catch (requestError: unknown) {
      setState("error");
      setFormError(
        requestError instanceof Error
          ? requestError.message
          : "The reset request could not be sent. Please try again.",
      );
      setCaptchaResetKey((value) => value + 1);
    }
  };

  if (state === "success") {
    return (
      <div className="grid min-h-72 content-center gap-5" aria-live="polite">
        <h2 className="text-global-navy text-2xl font-bold">
          Reset request received
        </h2>
        <p className="text-slate max-w-md leading-7">
          If an account matches that email, a secure reset link will be sent.
          Open it in the same browser to set a new password.
        </p>
        <Link
          className="text-global-navy focus-visible:ring-focus w-fit font-semibold underline underline-offset-4"
          href="/login"
        >
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="grid gap-5">
      <div>
        <h2 className="text-global-navy text-2xl font-bold">
          Account recovery
        </h2>
        <p className="text-slate mt-2">
          Enter the email address connected to your account.
        </p>
      </div>
      <FormError message={formError || platformError} />
      <TextField
        label="Email address"
        type="email"
        autoComplete="email"
        required
        value={email}
        error={error}
        onChange={(event) => setEmail(event.target.value)}
      />
      <CaptchaChallenge
        configuration={captcha}
        error={captchaError}
        resetKey={captchaResetKey}
        onTokenChange={(token) => {
          setCaptchaToken(token);
          if (token) setCaptchaError("");
        }}
      />
      <Button
        type="submit"
        size="large"
        disabled={state === "loading"}
        aria-busy={state === "loading"}
      >
        {state === "loading" ? "Sending…" : "Send reset link"}
      </Button>
      <Link
        className="text-global-navy focus-visible:ring-focus text-center text-sm font-semibold underline underline-offset-4"
        href="/login"
      >
        Back to sign in
      </Link>
    </form>
  );
}
