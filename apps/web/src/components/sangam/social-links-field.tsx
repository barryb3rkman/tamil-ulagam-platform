"use client";

import { useId } from "react";

import { isValidUrl, normalizeUrl } from "@/features/sangam/sangam-validation";

// Recognised only for a compact, non-overengineered platform hint next
// to each link (H3 brief section 16 — "do not overengineer social-
// profile parsing"). Falls back to the bare hostname for anything else.
const PLATFORM_HINTS: Readonly<Record<string, string>> = {
  "instagram.com": "Instagram",
  "facebook.com": "Facebook",
  "youtube.com": "YouTube",
  "youtu.be": "YouTube",
  "linkedin.com": "LinkedIn",
  "twitter.com": "Twitter/X",
  "x.com": "Twitter/X",
  "tiktok.com": "TikTok",
  "whatsapp.com": "WhatsApp",
  "wa.me": "WhatsApp",
};

function platformHint(url: string): string {
  try {
    const hostname = new URL(
      /^https?:\/\//i.test(url) ? url : `https://${url}`,
    ).hostname.replace(/^www\./, "");
    return PLATFORM_HINTS[hostname] ?? hostname;
  } catch {
    return "";
  }
}

/**
 * "Social media links (optional)" — zero or more free-form URLs (H3
 * brief section 16), not hardcoded Instagram/Facebook/YouTube/LinkedIn
 * fields. Each row is a plain URL input with a compact remove control;
 * a trailing "Add another link" appends one more empty row.
 */
export function SocialLinksField({
  error,
  links,
  onChange,
}: {
  readonly links: readonly string[];
  readonly onChange: (links: string[]) => void;
  readonly error?: string;
}) {
  const groupId = useId();

  const updateAt = (index: number, value: string) => {
    onChange(links.map((link, i) => (i === index ? value : link)));
  };
  const removeAt = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };
  // Same reasoning as the Website field: a bare domain is fine while
  // typing, but organization_social_links' own url-format check
  // requires an explicit http(s):// scheme — normalize on blur so a
  // saved link always satisfies it.
  const normalizeAt = (index: number) => {
    const current = links[index] ?? "";
    const normalized = normalizeUrl(current);
    if (normalized && normalized !== current) updateAt(index, normalized);
  };

  return (
    <div className="grid gap-2">
      <span
        id={`${groupId}-label`}
        className="text-global-navy text-sm font-semibold"
      >
        Social media links
        <span className="text-slate ml-1.5 text-xs font-normal">
          {" "}
          (optional)
        </span>
      </span>
      <div
        role="group"
        aria-labelledby={`${groupId}-label`}
        className="grid gap-2.5"
      >
        {links.map((link, index) => {
          const invalid = Boolean(link.trim()) && !isValidUrl(link);
          const hint = link.trim() && !invalid ? platformHint(link) : "";
          return (
            <div key={index} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={link}
                  placeholder="https://"
                  aria-label={`Social media link ${index + 1}`}
                  aria-invalid={invalid}
                  onChange={(event) => updateAt(index, event.target.value)}
                  onBlur={() => normalizeAt(index)}
                  className="motion-control focus-visible:ring-focus border-global-navy/20 bg-warm-ivory/20 text-charcoal placeholder:text-slate/90 hover:border-global-navy/35 rounded-button focus-visible:border-interactive-blue aria-[invalid=true]:border-error aria-[invalid=true]:bg-error/3 min-h-11 w-full border px-4 py-2 pr-24 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] focus-visible:bg-white focus-visible:outline-none"
                />
                {hint ? (
                  <span
                    aria-hidden="true"
                    className="text-slate absolute top-1/2 right-3 -translate-y-1/2 text-xs"
                  >
                    {hint}
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`Remove social media link ${index + 1}`}
                className="text-slate hover:text-heritage-maroon focus-visible:ring-focus rounded-button flex size-11 shrink-0 items-center justify-center border border-transparent text-lg"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onChange([...links, ""])}
        className="text-global-navy focus-visible:ring-focus w-fit text-sm font-semibold underline underline-offset-4"
      >
        + Add another link
      </button>
      {error ? (
        <p role="alert" className="text-error text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
