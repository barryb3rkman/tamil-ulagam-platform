import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/config/metadata";
import { initiatives } from "@/content/initiatives";

const staticPaths = [
  "",
  "/about",
  "/initiatives",
  "/tamil-id",
  "/chapters",
  "/events",
  "/news",
  "/partners",
  "/roadmap",
  "/contact",
  "/privacy",
  "/terms",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const paths = [
    ...staticPaths,
    ...initiatives.map((initiative) => initiative.href),
  ];

  return paths.map((path) => ({
    url: new URL(path || "/", siteUrl).toString(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
