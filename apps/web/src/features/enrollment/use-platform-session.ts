"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EnrollmentPlatformState } from "@tamil-ulagam/shared";

import { getPlatformErrorMessage } from "@/lib/supabase/errors";

import type { PlatformBackendKind, PlatformServices } from "./contracts";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  getPlatformRuntimeEnvironment,
  type CaptchaConfiguration,
} from "@/lib/supabase/environment";

import { createSupabasePlatformServices } from "./supabase-services";
import { createMockPlatformServices } from "./mock-services";
import { BrowserMockStateRepository } from "./repository";

/**
 * Bringing the platform up: choose a backend, take the first snapshot,
 * and keep it current as the session changes.
 *
 * Two details here are load-bearing and easy to lose. Every refresh
 * carries a sequence number, so a slow early response can never overwrite
 * a newer one. And on Supabase a first snapshot with no user is retried
 * once after a short pause, because the session may still be restoring
 * from storage when the provider mounts — without it a signed-in visitor
 * briefly looks logged out, and a screen that denies on that basis denies
 * the wrong person.
 */
export const unavailableMessage =
  "Organisation enrollment is not configured for this deployment. Set the public Supabase environment values and rebuild the site.";

function createRuntimeServices(): {
  readonly services: PlatformServices | null;
  readonly captcha: CaptchaConfiguration;
  readonly error: string;
} {
  const environment = getPlatformRuntimeEnvironment();
  if (
    environment.backend === "supabase-local" ||
    environment.backend === "supabase-hosted"
  ) {
    return {
      services: createSupabasePlatformServices(getSupabaseBrowserClient()),
      captcha: environment.captcha,
      error: "",
    };
  }
  if (environment.backend === "mock") {
    return {
      services: createMockPlatformServices(
        new BrowserMockStateRepository(window.localStorage),
      ),
      captcha: environment.captcha,
      error: "",
    };
  }
  return {
    services: null,
    captcha: environment.captcha,
    // The compiler and the linter disagree here. Control flow has left
    // only the unavailable variant, so the comparison is always true and
    // the rule says so — but TypeScript still will not narrow the object
    // enough to read `message` without it.
    error:
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      environment.backend === "unavailable"
        ? environment.message
        : unavailableMessage,
  };
}

export function usePlatformSession() {
  const [services, setServices] = useState<PlatformServices | null>(null);
  const [backendKind, setBackendKind] =
    useState<PlatformBackendKind>("unavailable");
  const [state, setState] = useState<EnrollmentPlatformState | null>(null);
  const [canReviewApplications, setCanReviewApplications] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [platformError, setPlatformError] = useState("");
  const [captcha, setCaptcha] = useState<CaptchaConfiguration>({
    enabled: false,
  });
  const refreshSequence = useRef(0);

  const refresh = useCallback(async (runtime: PlatformServices) => {
    const sequence = ++refreshSequence.current;
    try {
      const [nextState, reviewer] = await Promise.all([
        runtime.snapshot(),
        runtime.canReviewApplications(),
      ]);
      if (sequence === refreshSequence.current) {
        setState(nextState);
        setCanReviewApplications(reviewer);
        setPlatformError("");
        setIsHydrated(true);
      }
      return { state: nextState, canReview: reviewer };
    } catch (error: unknown) {
      if (sequence === refreshSequence.current) {
        setIsHydrated(true);
        setPlatformError(getPlatformErrorMessage(error));
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribe: () => void = () => undefined;

    let refreshStarted = false;

    const initialise = async () => {
      try {
        const configuration = createRuntimeServices();
        const runtime = configuration.services;
        setCaptcha(configuration.captcha);
        if (!runtime) {
          if (!active) return;
          setBackendKind("unavailable");
          setPlatformError(configuration.error || unavailableMessage);
          setIsHydrated(true);
          return;
        }

        if (!active) return;
        setServices(runtime);
        setBackendKind(runtime.kind);
        unsubscribe = runtime.onAuthStateChange(() => {
          void refresh(runtime).catch(() => undefined);
        });
        refreshStarted = true;
        const first = await refresh(runtime);

        if (
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- the cleanup below flips `active`, which control-flow analysis cannot see. Without this a resolved refresh writes state to an unmounted provider.
          active &&
          runtime.kind === "supabase" &&
          !first.state.currentUserId
        ) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- `active` is flipped by the cleanup function, which control-flow analysis cannot see. Without this guard a resolved refresh sets state on an unmounted provider.
          if (active) await refresh(runtime).catch(() => undefined);
        }
      } catch (error: unknown) {
        if (active && !refreshStarted) {
          setPlatformError(getPlatformErrorMessage(error));
          setIsHydrated(true);
        }
      }
    };

    void initialise();
    return () => {
      active = false;
      unsubscribe();
    };
  }, [refresh]);

  // resetDemo replaces the snapshot outright rather than re-reading it,
  // which is what it did when this lived in the provider.
  const applyState = useCallback((next: EnrollmentPlatformState) => {
    setState(next);
  }, []);

  return {
    applyState,
    backendKind,
    canReviewApplications,
    captcha,
    isHydrated,
    platformError,
    refresh,
    services,
    state,
  };
}
