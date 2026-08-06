export function getCanonicalRouteHref(route: string): string {
  if (route === "/" || !route.startsWith("/") || route.startsWith("//")) {
    return route;
  }

  const [pathname, fragment] = route.split("#", 2);
  const canonicalPathname = pathname?.endsWith("/") ? pathname : `${pathname}/`;

  return fragment ? `${canonicalPathname}#${fragment}` : canonicalPathname;
}
