export interface SupabasePublicEnvironment {
  readonly url: string;
  readonly publishableKey: string;
}

export type CaptchaProvider = "turnstile" | "hcaptcha";

export type CaptchaConfiguration =
  | { readonly enabled: false }
  | {
      readonly enabled: true;
      readonly provider: CaptchaProvider;
      readonly siteKey: string;
    };

export type PlatformRuntimeEnvironment =
  | { readonly backend: "mock"; readonly captcha: CaptchaConfiguration }
  | {
      readonly backend: "supabase-local" | "supabase-hosted";
      readonly supabase: SupabasePublicEnvironment;
      readonly captcha: CaptchaConfiguration;
    }
  | {
      readonly backend: "unavailable";
      readonly message: string;
      readonly captcha: CaptchaConfiguration;
    };

interface SupabasePublicEnvironmentInput {
  readonly url?: string;
  readonly publishableKey?: string;
}

export interface PlatformEnvironmentInput extends SupabasePublicEnvironmentInput {
  readonly enrollmentBackend?: string;
  readonly nodeEnvironment?: string;
  readonly captchaProvider?: string;
  readonly captchaSiteKey?: string;
}

const missingSupabaseMessage =
  "Organisation enrollment is not configured for this deployment. Set NEXT_PUBLIC_ENROLLMENT_BACKEND=supabase with both public Supabase values and rebuild the site.";

export function parseSupabasePublicEnvironment(
  input: SupabasePublicEnvironmentInput,
): SupabasePublicEnvironment {
  const url = input.url?.trim() ?? "";
  const publishableKey = input.publishableKey?.trim() ?? "";
  if (!url || !publishableKey) {
    throw new Error(
      "Supabase browser configuration is incomplete. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid absolute URL.");
  }
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must use HTTP or HTTPS.");
  }
  return { url: parsedUrl.toString().replace(/\/$/, ""), publishableKey };
}

export function parseCaptchaConfiguration(input: {
  readonly provider?: string;
  readonly siteKey?: string;
}): CaptchaConfiguration {
  const provider = input.provider?.trim().toLowerCase() ?? "";
  const siteKey = input.siteKey?.trim() ?? "";
  if (!provider && !siteKey) return { enabled: false };
  if (!provider || !siteKey) {
    throw new Error(
      "CAPTCHA configuration is incomplete. Set both NEXT_PUBLIC_AUTH_CAPTCHA_PROVIDER and NEXT_PUBLIC_AUTH_CAPTCHA_SITE_KEY.",
    );
  }
  if (provider !== "turnstile" && provider !== "hcaptcha") {
    throw new Error(
      "NEXT_PUBLIC_AUTH_CAPTCHA_PROVIDER must be turnstile or hcaptcha.",
    );
  }
  return { enabled: true, provider, siteKey };
}

function isLocalSupabaseUrl(url: string): boolean {
  const hostname = new URL(url).hostname;
  return hostname === "127.0.0.1" || hostname === "localhost";
}

export function selectPlatformRuntimeEnvironment(
  input: PlatformEnvironmentInput,
): PlatformRuntimeEnvironment {
  let captcha: CaptchaConfiguration;
  try {
    captcha = parseCaptchaConfiguration({
      provider: input.captchaProvider,
      siteKey: input.captchaSiteKey,
    });
  } catch (error: unknown) {
    return {
      backend: "unavailable",
      message: error instanceof Error ? error.message : missingSupabaseMessage,
      captcha: { enabled: false },
    };
  }

  const requestedBackend = input.enrollmentBackend?.trim().toLowerCase() ?? "";
  if (requestedBackend === "mock") {
    if (input.nodeEnvironment === "production") {
      return {
        backend: "unavailable",
        message:
          "Mock enrollment is disabled in production. Configure the hosted Supabase browser environment and rebuild the site.",
        captcha,
      };
    }
    return { backend: "mock", captcha };
  }
  if (requestedBackend && requestedBackend !== "supabase") {
    return {
      backend: "unavailable",
      message: "NEXT_PUBLIC_ENROLLMENT_BACKEND must be mock or supabase.",
      captcha,
    };
  }
  if (requestedBackend === "supabase") {
    try {
      const supabase = parseSupabasePublicEnvironment(input);
      return {
        backend: isLocalSupabaseUrl(supabase.url)
          ? "supabase-local"
          : "supabase-hosted",
        supabase,
        captcha,
      };
    } catch (error: unknown) {
      return {
        backend: "unavailable",
        message:
          error instanceof Error ? error.message : missingSupabaseMessage,
        captcha,
      };
    }
  }
  return { backend: "unavailable", message: missingSupabaseMessage, captcha };
}

export function getPlatformRuntimeEnvironment(): PlatformRuntimeEnvironment {
  return selectPlatformRuntimeEnvironment({
    enrollmentBackend: process.env.NEXT_PUBLIC_ENROLLMENT_BACKEND,
    nodeEnvironment: process.env.NODE_ENV,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    captchaProvider: process.env.NEXT_PUBLIC_AUTH_CAPTCHA_PROVIDER,
    captchaSiteKey: process.env.NEXT_PUBLIC_AUTH_CAPTCHA_SITE_KEY,
  });
}

export function getSupabasePublicEnvironment(): SupabasePublicEnvironment {
  return parseSupabasePublicEnvironment({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}

export function isSupabasePublicEnvironmentConfigured(): boolean {
  const environment = getPlatformRuntimeEnvironment();
  return (
    environment.backend === "supabase-local" ||
    environment.backend === "supabase-hosted"
  );
}
