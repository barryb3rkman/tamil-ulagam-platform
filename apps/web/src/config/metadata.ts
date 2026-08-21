import type { Metadata } from "next";
import type { ImageMetadata } from "@tamil-ulagam/shared";

import { siteContent } from "@/content/site";

const fallbackSiteUrl = "http://localhost:3000";

export function getSiteUrl(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ?? fallbackSiteUrl;

  try {
    const siteUrl = new URL(configuredUrl);

    if (siteUrl.protocol !== "http:" && siteUrl.protocol !== "https:") {
      return new URL(fallbackSiteUrl);
    }

    siteUrl.hash = "";
    siteUrl.search = "";
    siteUrl.pathname = `${siteUrl.pathname.replace(/\/+$/, "")}/`;

    return siteUrl;
  } catch {
    return new URL(fallbackSiteUrl);
  }
}

export function getAbsoluteSiteUrl(path: `/${string}` | "/"): string {
  const siteUrl = getSiteUrl();
  const relativePath = path === "/" ? "" : path.replace(/^\/+/, "");
  const isFilePath = /\/[^/]+\.[^/]+$/.test(path);
  const canonicalPath =
    relativePath && !isFilePath && !relativePath.endsWith("/")
      ? `${relativePath}/`
      : relativePath;

  return new URL(canonicalPath, siteUrl).toString();
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
    canonical: getAbsoluteSiteUrl("/"),
  },
  openGraph: {
    type: "website",
    locale: "en",
    siteName: siteContent.name,
    title: siteContent.name,
    description: siteContent.description,
    url: getAbsoluteSiteUrl("/"),
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
  socialImage?: ImageMetadata,
): Metadata {
  const absolutePageUrl = getAbsoluteSiteUrl(path);

  return {
    title,
    description,
    alternates: {
      canonical: absolutePageUrl,
    },
    openGraph: {
      title,
      description,
      url: absolutePageUrl,
      images: socialImage
        ? [
            {
              url: getAbsoluteSiteUrl(socialImage.path),
              width: socialImage.width,
              height: socialImage.height,
              alt: socialImage.alt,
            },
          ]
        : undefined,
    },
  };
}

export function createApplicationMetadata(
  title: string,
  description: string,
  path: `/${string}`,
): Metadata {
  return {
    ...createPageMetadata(title, description, path),
    robots: {
      index: false,
      follow: false,
    },
  };
}
