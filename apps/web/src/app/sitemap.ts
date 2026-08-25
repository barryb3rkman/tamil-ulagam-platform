import type { MetadataRoute } from "next";

import { getAbsoluteSiteUrl } from "@/config/metadata";
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
  "/join",
  "/join/sangam",
  "/join/member",
  "/contact",
  "/privacy",
  "/terms",
] as const;

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...staticPaths,
    ...initiatives.map((initiative) => initiative.href),
  ];

  return paths.map((path) => ({
    url: getAbsoluteSiteUrl(path || "/"),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
