function normalizeBasePath(basePath: string): string {
  const normalized = basePath.trim();

  if (!normalized || normalized === "/") {
    return "";
  }

  if (!normalized.startsWith("/")) {
    throw new Error("A base path must start with a forward slash.");
  }

  return normalized.replace(/\/+$/, "");
}

export function withBasePath(path: string, basePath = ""): string {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return path;
  }

  const normalizedBasePath = normalizeBasePath(basePath);

  if (
    !normalizedBasePath ||
    path === normalizedBasePath ||
    path.startsWith(`${normalizedBasePath}/`)
  ) {
    return path;
  }

  return `${normalizedBasePath}${path}`;
}
