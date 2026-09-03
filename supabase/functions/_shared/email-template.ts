const COLORS = {
  deepNavy: "#0f2540",
  warmIvory: "#faf6ee",
  heritageMaroon: "#7a1f2b",
  antiqueGold: "#b8934a",
  charcoal: "#2b2b2b",
  slate: "#5b6472",
  white: "#ffffff",
} as const;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface EmailTemplateInput {
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly cta?: { readonly label: string; readonly url: string };
  readonly footnote?: string;
}

export interface RenderedEmail {
  readonly html: string;
  readonly text: string;
}

export function renderEmail(input: EmailTemplateInput): RenderedEmail {
  const paragraphsHtml = input.paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px 0;font-size:15px;line-height:24px;color:${COLORS.charcoal};">${paragraph}</p>`,
    )
    .join("");

  const ctaHtml = input.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px 0;">
        <tr>
          <td style="border-radius:8px;background-color:${COLORS.heritageMaroon};">
            <a href="${input.cta.url}" style="display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:${COLORS.white};text-decoration:none;">${escapeHtml(input.cta.label)}</a>
          </td>
        </tr>
      </table>`
    : "";

  const footnoteHtml = input.footnote
    ? `<p style="margin:16px 0 0 0;font-size:13px;line-height:20px;color:${COLORS.slate};">${input.footnote}</p>`
    : "";

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <title>${escapeHtml(input.heading)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${COLORS.warmIvory};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.warmIvory};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:${COLORS.white};border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background-color:${COLORS.deepNavy};padding:24px 32px;">
                <span style="font-size:16px;font-weight:700;color:${COLORS.white};letter-spacing:0.02em;">Tamil Ulagam</span>
              </td>
            </tr>
            <tr>
              <td style="height:3px;background-color:${COLORS.antiqueGold};line-height:3px;font-size:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px 0;font-size:20px;line-height:28px;color:${COLORS.deepNavy};font-weight:700;">${input.heading}</h1>
                ${paragraphsHtml}
                ${ctaHtml}
                ${footnoteHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:${COLORS.warmIvory};border-top:1px solid #e8e1d3;">
                <p style="margin:0;font-size:12px;line-height:18px;color:${COLORS.slate};">Tamil Ulagam Global Federation — this is an automated message about your account or organisation.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const textLines = [
    input.heading,
    "",
    ...input.paragraphs.map(stripHtmlToText),
    ...(input.cta ? ["", `${input.cta.label}: ${input.cta.url}`] : []),
    ...(input.footnote ? ["", stripHtmlToText(input.footnote)] : []),
    "",
    "Tamil Ulagam Global Federation",
  ];
  const text = textLines.join("\n");

  return { html, text };
}

function stripHtmlToText(value: string): string {
  return value
    .replace(/<a\s+[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "$2 ($1)")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
