export type PlatformErrorKind =
  | "authentication"
  | "conflict"
  | "configuration"
  | "network"
  | "rate_limit"
  | "not_found"
  | "unauthorized"
  | "validation"
  | "unknown";

export class PlatformServiceError extends Error {
  constructor(
    message: string,
    readonly kind: PlatformErrorKind,
  ) {
    super(message);
    this.name = "PlatformServiceError";
  }
}

interface ErrorDetails {
  readonly code: string;
  readonly message: string;
  readonly status?: number;
}

function readError(error: unknown): ErrorDetails {
  if (!error || typeof error !== "object") {
    return { code: "", message: "" };
  }

  const record = error as Record<string, unknown>;
  return {
    code: typeof record.code === "string" ? record.code : "",
    message: typeof record.message === "string" ? record.message : "",
    status: typeof record.status === "number" ? record.status : undefined,
  };
}

export function mapSupabaseError(
  error: unknown,
  fallback = "The request could not be completed. Please try again.",
): PlatformServiceError {
  if (error instanceof PlatformServiceError) return error;

  const { code, message, status } = readError(error);
  const normalized = message.toLowerCase();

  if (
    status === 429 ||
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit" ||
    normalized.includes("rate limit") ||
    normalized.includes("too many requests")
  ) {
    return new PlatformServiceError(
      "Too many requests were made in a short time. Wait a little before trying again.",
      "rate_limit",
    );
  }

  if (
    code === "email_not_confirmed" ||
    normalized.includes("email not confirmed")
  ) {
    return new PlatformServiceError(
      "Confirm your email address before signing in. Check your inbox for the confirmation link.",
      "authentication",
    );
  }

  if (
    code === "weak_password" ||
    normalized.includes("password should be") ||
    normalized.includes("password is too weak")
  ) {
    return new PlatformServiceError(
      "Use at least 8 characters with upper and lowercase letters, a number and a symbol.",
      "validation",
    );
  }

  if (
    code === "otp_expired" ||
    code === "flow_state_expired" ||
    code === "bad_code_verifier" ||
    normalized.includes("code verifier") ||
    normalized.includes("token has expired") ||
    normalized.includes("otp expired")
  ) {
    return new PlatformServiceError(
      "This authentication link is invalid or has expired. Request a new link and try again.",
      "authentication",
    );
  }

  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("invalid credentials")
  ) {
    return new PlatformServiceError(
      "Those credentials were not recognised.",
      "authentication",
    );
  }

  if (status && status >= 500) {
    return new PlatformServiceError(
      "The account service is temporarily unavailable. Please try again shortly.",
      "network",
    );
  }

  if (
    normalized.includes("user already registered") ||
    normalized.includes("already been registered") ||
    code === "23505"
  ) {
    return new PlatformServiceError(
      "This account could not be created. Try signing in or request a password reset.",
      "conflict",
    );
  }

  if (
    code === "42501" ||
    code === "PGRST301" ||
    status === 401 ||
    status === 403
  ) {
    return new PlatformServiceError(
      "You do not have permission to complete this action.",
      "unauthorized",
    );
  }

  if (code === "P0002" || status === 404) {
    return new PlatformServiceError(
      "The requested organisation registration could not be found.",
      "not_found",
    );
  }

  if (code === "23514" || code === "22023") {
    const isUserSafeValidationMessage = [
      "category details do not match",
      "complete ",
      "feedback is required",
      "only draft",
      "this application cannot",
      "this review decision is not valid",
      "unsupported administrative status transition",
    ].some((prefix) => normalized.startsWith(prefix));
    return new PlatformServiceError(
      isUserSafeValidationMessage
        ? message
        : "Review the registration information and try again.",
      "validation",
    );
  }

  if (
    normalized.includes("failed to fetch") ||
    normalized.includes("network") ||
    normalized.includes("load failed")
  ) {
    return new PlatformServiceError(
      "Tamil Ulagam could not reach the enrollment service. Check your connection and try again.",
      "network",
    );
  }

  return new PlatformServiceError(fallback, "unknown");
}

export function getPlatformErrorMessage(error: unknown): string {
  return mapSupabaseError(error).message;
}
