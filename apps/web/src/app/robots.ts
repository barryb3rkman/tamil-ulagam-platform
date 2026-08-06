import type { MetadataRoute } from "next";

import { getAbsoluteSiteUrl, getSiteUrl } from "@/config/metadata";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: getAbsoluteSiteUrl("/sitemap.xml"),
    host: siteUrl.origin,
  };
}
