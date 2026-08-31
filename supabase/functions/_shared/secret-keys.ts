// Pure parsing/validation for the SUPABASE_SECRET_KEYS dictionary, with
// zero Deno-specific or `npm:` imports — kept in its own file (rather
// than inline in service-client.ts) specifically so it can be imported
// and unit-tested directly under plain `node --test`, the same way
// email-template.ts is. `service-client.ts` imports this module to do
// the actual `Deno.env.get` read and client construction.
//
// SUPABASE_SECRET_KEYS is a Supabase-managed, platform-injected
// environment variable for hosted Edge Functions — never a user-defined
// secret, never set via `supabase secrets set`, and never present in any
// client bundle (Edge-Function-only, exactly like the legacy
// SUPABASE_SERVICE_ROLE_KEY it replaces). Per Supabase's current
// documentation it is a JSON dictionary of named secret API keys, e.g.
// `{"default": "sb_secret_..."}`.

/** The named secret key this project uses — Supabase's own docs use
 * "default" as the dictionary key for a project's primary secret key;
 * change here (not per call site) if a differently-named key is ever
 * introduced. */
export const SECRET_KEY_NAME = "default";

/**
 * Fails closed: a missing, non-JSON, non-object, or "default"-less
 * SUPABASE_SECRET_KEYS throws immediately, rather than the old pattern's
 * `?? ""` fallback, which silently built a client with an empty-string
 * key that only failed opaquely on its first real database call.
 */
export function parseSecretKeysDictionary(raw: string | undefined): string {
  if (!raw) {
    throw new Error("SUPABASE_SECRET_KEYS is not set.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("SUPABASE_SECRET_KEYS is not valid JSON.");
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("SUPABASE_SECRET_KEYS is not a JSON object.");
  }

  const secretKey = (parsed as Record<string, unknown>)[SECRET_KEY_NAME];
  if (typeof secretKey !== "string" || secretKey.length === 0) {
    throw new Error(
      `SUPABASE_SECRET_KEYS has no usable "${SECRET_KEY_NAME}" entry.`,
    );
  }

  return secretKey;
}
