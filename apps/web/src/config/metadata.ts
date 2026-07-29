import type { Metadata } from "next";

import { siteContent } from "@/content/site";

const fallbackSiteUrl = "http://localhost:3000";

export function getSiteUrl(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ?? fallbackSiteUrl;

  try {
    return new URL(configuredUrl);
  } catch {
    return new URL(fallbackSiteUrl);
  }
}

export const defaultMetadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: siteContent.name,
    template: `%s | ${siteContent.shortName}`,
  },
  description: siteContent.description,
  applicationName: siteContent.name,
  category: "community",
  keywords: [
    "Tamil Ulagam",
    "Tamil global community",
    "Tamil culture",
    "Tamil federation",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en",
    siteName: siteContent.name,
    title: siteContent.name,
    description: siteContent.description,
    url: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export function createPageMetadata(
  title: string,
  description: string,
  path: `/${string}` | "/",
): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
    },
  };
}
