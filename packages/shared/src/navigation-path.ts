function normalizeRoutePath(path: string): string {
  if (path === "/") {
    return path;
  }

  return path.replace(/\/+$/, "");
}

export function isNavigationPathCurrent(
  pathname: string,
  entryHref: string,
): boolean {
  const currentPath = normalizeRoutePath(pathname);
  const targetPath = normalizeRoutePath(entryHref);

  return (
    currentPath === targetPath ||
    (targetPath === "/initiatives" && currentPath.startsWith("/initiatives/"))
  );
}
