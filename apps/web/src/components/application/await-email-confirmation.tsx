"use client";

import { Button } from "@tamil-ulagam/ui";
import { useCallback, useEffect, useRef, useState } from "react";

import { usePlatform } from "@/features/enrollment/platform-provider";

import { FormError } from "./form-fields";

/**
 * Seconds to wait before each background check. The gaps widen because the
 * common case is someone confirming within a minute, and a signed-out poll
 * is a failed sign-in as far as the auth server is concerned — hammering it
 * every few seconds would trip rate limits on a slow inbox.
 */
const checkSchedule: readonly number[] = [5, 8, 12, 18, 25];
const steadyInterval = 30;
const maxChecks = 40;

const resendCooldownSeconds = 60;

/**
 * Shown to someone whose account exists but whose email is not confirmed yet.
 *
 * The confirmation link may well be opened somewhere else — people read mail
 * on their phone and register on a laptop. Nothing about that other device
 * reaches this tab, so this screen watches for the confirmation itself by
 * retrying the sign-in it already has the credentials for, and moves on the
 * moment it succeeds. The manual button does the same check on demand, for
 * anyone who would rather not wait for the next one.
 *
 * The password lives in component state for as long as this screen is on
 * screen and is never stored anywhere; leaving the page discards it and the
 * person signs in normally instead.
 */
export function AwaitEmailConfirmation({
  email,
  password,
  returnTarget,
  onConfirmed,
}: {
  readonly email: string;
  readonly password: string;
  readonly returnTarget: string | null;
  readonly onConfirmed: () => void;
}) {
  const { captcha, login, resendEmailConfirmation } = usePlatform();
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">(
    "idle",
  );
  const [cooldown, setCooldown] = useState(0);
  const [gaveUp, setGaveUp] = useState(false);

  const confirmed = useRef(false);
  const loginRef = useRef(login);
  const onConfirmedRef = useRef(onConfirmed);
  useEffect(() => {
    loginRef.current = login;
    onConfirmedRef.current = onConfirmed;
  });

  // A live CAPTCHA makes silent retries impossible: each token is good for a
  // single request and only a person can produce the next one.
  const canPollQuietly = !captcha.enabled;

  const attemptSignIn = useCallback(async (): Promise<boolean> => {
    if (confirmed.current) return true;
    const result = await loginRef.current({ email, password });
    if (!result.ok) return false;
    confirmed.current = true;
    onConfirmedRef.current();
    return true;
  }, [email, password]);

  useEffect(() => {
    if (!canPollQuietly) return;
    let attempt = 0;
    let timer = 0;
    let cancelled = false;

    const scheduleNext = () => {
      if (cancelled || confirmed.current) return;
      if (attempt >= maxChecks) {
        setGaveUp(true);
        return;
      }
      const seconds = checkSchedule[attempt] ?? steadyInterval;
      attempt += 1;
      timer = window.setTimeout(() => {
        void attemptSignIn()
          .catch(() => false)
          .then(() => scheduleNext());
      }, seconds * 1000);
    };

    scheduleNext();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [attemptSignIn, canPollQuietly]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const checkNow = () => {
    setChecking(true);
    setError("");
    void attemptSignIn()
      .then((ok) => {
        if (!ok) {
          setError(
            "That email is not confirmed yet. Open the link we sent you, then check again.",
          );
        }
      })
      .catch(() => {
        setError("We could not check just now. Try again in a moment.");
      })
      .finally(() => setChecking(false));
  };

  const resend = () => {
    setResendState("sending");
    setError("");
    void resendEmailConfirmation(email, returnTarget)
      .then(() => {
        setResendState("sent");
        setCooldown(resendCooldownSeconds);
      })
      .catch((caught: unknown) => {
        setResendState("idle");
        setError(
          caught instanceof Error
            ? caught.message
            : "The confirmation email could not be sent again.",
        );
      });
  };

  return (
    <div className="grid gap-6" aria-live="polite">
      <div>
        <span
          aria-hidden="true"
          className="border-heritage-gold/40 text-heritage-gold relative mb-5 grid size-12 place-items-center rounded-full border text-xl"
        >
          <span className="motion-halo bg-heritage-gold/15 absolute size-12 rounded-full" />
          <span className="relative">&#9993;</span>
        </span>
        <h2 className="text-fg text-2xl font-bold">Confirm your email</h2>
        <p className="text-fg-muted mt-2 max-w-md leading-7">
          We sent a confirmation link to{" "}
          <strong className="text-fg-body">{email}</strong>. Open it on any
          device — phone, tablet, another browser. This page is watching, and
          will carry on by itself the moment your email is confirmed.
        </p>
      </div>

      <FormError message={error} />

      {canPollQuietly && !gaveUp ? (
        <p className="text-fg-muted flex items-center gap-3 text-sm">
          <span
            aria-hidden="true"
            className="bg-heritage-gold motion-halo size-2 shrink-0 rounded-full"
          />
          Waiting for confirmation…
        </p>
      ) : null}

      {gaveUp ? (
        <p className="text-fg-muted text-sm leading-6">
          We have stopped checking automatically. Use the button below once you
          have opened the link.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          onClick={checkNow}
          disabled={checking}
          aria-busy={checking}
          className="w-fit"
        >
          {checking ? "Checking…" : "I have confirmed my email"}
        </Button>
        <Button
          variant="ghost"
          onClick={resend}
          disabled={resendState === "sending" || cooldown > 0}
          className="w-fit"
        >
          {resendState === "sending"
            ? "Sending…"
            : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend the email"}
        </Button>
      </div>

      {resendState === "sent" && cooldown > 0 ? (
        <p className="text-success text-sm font-semibold">
          Sent. Check your inbox, and your spam folder.
        </p>
      ) : null}
    </div>
  );
}
