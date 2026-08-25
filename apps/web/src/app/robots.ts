import type { MetadataRoute } from "next";

import { getAbsoluteSiteUrl, getSiteUrl } from "@/config/metadata";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Internal design-system QA surface — never a public destination.
      disallow: "/dev/",
    },
    sitemap: getAbsoluteSiteUrl("/sitemap.xml"),
    host: siteUrl.origin,
  };
}
