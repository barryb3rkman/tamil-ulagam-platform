import type { NavigationEntry } from "@tamil-ulagam/shared";

export const primaryNavigation = [
  { label: "About", href: "/about" },
  {
    label: "Initiatives",
    href: "/initiatives",
    children: [
      { label: "Healthcare", href: "/initiatives/healthcare" },
      { label: "Education", href: "/initiatives/education" },
      { label: "Business", href: "/initiatives/business" },
      { label: "Jobs", href: "/initiatives/jobs" },
      { label: "Research", href: "/initiatives/research" },
      { label: "Tourism", href: "/initiatives/tourism" },
      { label: "Arts & Culture", href: "/initiatives/arts-culture" },
      { label: "Global Events", href: "/initiatives/global-events" },
    ],
  },
  { label: "Tamil ID", href: "/tamil-id" },
  { label: "Chapters", href: "/chapters" },
  { label: "Partners", href: "/partners" },
  { label: "Events", href: "/events" },
  { label: "News", href: "/news" },
] as const satisfies readonly NavigationEntry[];

export const footerNavigation = [
  {
    label: "Federation",
    href: "/about",
    children: [
      { label: "About", href: "/about" },
      { label: "Partners", href: "/partners" },
      { label: "Roadmap", href: "/roadmap" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    label: "Explore",
    href: "/initiatives",
    children: [
      { label: "Initiatives", href: "/initiatives" },
      { label: "Chapters", href: "/chapters" },
      { label: "Events", href: "/events" },
      { label: "News", href: "/news" },
    ],
  },
  {
    label: "Legal",
    href: "/privacy",
    children: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
] as const satisfies readonly NavigationEntry[];
