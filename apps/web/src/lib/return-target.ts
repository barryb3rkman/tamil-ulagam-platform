const SAFE_INTERNAL_PATH = /^\/(?!\/)(?!\\)\S*$/;

export function getSafeReturnTarget(
  raw: string | null | undefined,
): string | null {
  if (typeof raw !== "string" || raw.length === 0) return null;
  return SAFE_INTERNAL_PATH.test(raw) ? raw : null;
}

export function withReturnTarget(
  href: `/${string}`,
  returnTarget: string | null | undefined,
): string {
  const safeTarget = getSafeReturnTarget(returnTarget);
  if (!safeTarget) return href;
  return `${href}?next=${encodeURIComponent(safeTarget)}`;
}
