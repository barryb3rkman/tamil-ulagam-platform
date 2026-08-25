/**
 * A safe "return here after auth" target, used by /login and /signup so a
 * visitor bounced there from e.g. /join/member comes back to the right
 * place. Deliberately conservative: only ever an internal application
 * path, never anything that could send a visitor off-site (an open
 * redirect). Static-export compatible — this is pure string validation,
 * no server-side routing involved.
 */

const SAFE_INTERNAL_PATH = /^\/(?!\/)(?!\\)\S*$/;

/**
 * Returns `raw` unchanged if it is safe to use as a same-origin redirect
 * target, or null otherwise. Safe means: starts with exactly one `/`
 * (rejects `//host/...` and `/\host/...`, both of which browsers can
 * treat as protocol-relative), contains no whitespace, and — because it
 * must start with `/` — can never carry a URL scheme (`javascript:`,
 * `https:`, ...).
 */
export function getSafeReturnTarget(
  raw: string | null | undefined,
): string | null {
  if (typeof raw !== "string" || raw.length === 0) return null;
  return SAFE_INTERNAL_PATH.test(raw) ? raw : null;
}

/** Appends `?next=<path>` to an internal href, only when the target is
 * itself internal and non-empty. Used when linking to /login or /signup
 * from a screen that wants the visitor back afterward. */
export function withReturnTarget(
  href: `/${string}`,
  returnTarget: string | null | undefined,
): string {
  const safeTarget = getSafeReturnTarget(returnTarget);
  if (!safeTarget) return href;
  return `${href}?next=${encodeURIComponent(safeTarget)}`;
}
