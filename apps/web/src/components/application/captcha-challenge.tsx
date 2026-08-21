"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

import type { CaptchaConfiguration } from "@/lib/supabase/environment";

interface CaptchaRenderOptions {
  readonly sitekey: string;
  readonly theme: "light";
  readonly callback: (token: string) => void;
  readonly "expired-callback": () => void;
  readonly "error-callback": () => void;
}

interface CaptchaWidgetApi {
  render(
    container: HTMLElement,
    options: CaptchaRenderOptions,
  ): string | number;
  reset(widgetId: string | number): void;
  remove?(widgetId: string | number): void;
}

declare global {
  interface Window {
    turnstile?: CaptchaWidgetApi;
    hcaptcha?: CaptchaWidgetApi;
  }
}

const providerScripts = {
  turnstile:
    "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
  hcaptcha: "https://js.hcaptcha.com/1/api.js?render=explicit",
} as const;

export function CaptchaChallenge({
  configuration,
  error,
  onTokenChange,
  resetKey,
}: {
  readonly configuration: CaptchaConfiguration;
  readonly error?: string;
  readonly onTokenChange: (token: string) => void;
  readonly resetKey: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | number | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  const renderWidget = useCallback(() => {
    if (!configuration.enabled || !containerRef.current) return;
    const api = window[configuration.provider];
    if (!api || widgetIdRef.current !== null) return;
    widgetIdRef.current = api.render(containerRef.current, {
      sitekey: configuration.siteKey,
      theme: "light",
      callback: (token) => onTokenChangeRef.current(token),
      "expired-callback": () => onTokenChangeRef.current(""),
      "error-callback": () => onTokenChangeRef.current(""),
    });
  }, [configuration]);

  useEffect(() => {
    if (!configuration.enabled || widgetIdRef.current === null) return;
    window[configuration.provider]?.reset(widgetIdRef.current);
    onTokenChangeRef.current("");
  }, [configuration, resetKey]);

  useEffect(
    () => () => {
      if (!configuration.enabled || widgetIdRef.current === null) return;
      window[configuration.provider]?.remove?.(widgetIdRef.current);
      widgetIdRef.current = null;
    },
    [configuration],
  );

  if (!configuration.enabled) return null;

  return (
    <div className="grid gap-2">
      <Script
        src={providerScripts[configuration.provider]}
        strategy="afterInteractive"
        onLoad={renderWidget}
        onReady={renderWidget}
      />
      <div
        ref={containerRef}
        aria-label="Security check"
        className="min-h-[4.1rem]"
      />
      {error ? (
        <p role="alert" className="text-error text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
