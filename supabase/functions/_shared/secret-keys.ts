export const SECRET_KEY_NAME = "default";

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
