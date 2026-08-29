// Pure TS, zero Deno-specific APIs — runs directly under Node's built-in
// test runner (`node --test supabase/functions/_shared`), unlike the
// other files in this directory which need `Deno.env` and `npm:`
// specifiers Node cannot resolve. See docs/operations/resend-email.md
// for why the Edge Functions themselves are not unit-tested this way.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { escapeHtml, renderEmail } from "./email-template.ts";

describe("escapeHtml", () => {
  it("escapes all five HTML-significant characters", () => {
    assert.equal(
      escapeHtml(`<script>alert("x")</script> & 'quote'`),
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;quote&#39;",
    );
  });

  it("leaves ordinary text untouched", () => {
    assert.equal(escapeHtml("Chennai Tamil Sangam"), "Chennai Tamil Sangam");
  });
});

describe("renderEmail", () => {
  it("includes the heading, every paragraph, and the CTA in the HTML", () => {
    const { html } = renderEmail({
      heading: "Affiliation confirmed",
      paragraphs: ["<strong>Test Org</strong> confirmed your membership."],
      cta: {
        label: "Open Member Workspace",
        url: "https://example.test/workspace/member",
      },
      footnote: "This link expires in 24 hours.",
    });
    assert.match(html, /Affiliation confirmed/);
    assert.match(html, /Test Org<\/strong> confirmed your membership\./);
    assert.match(html, /Open Member Workspace/);
    assert.match(html, /https:\/\/example\.test\/workspace\/member/);
    assert.match(html, /This link expires in 24 hours\./);
  });

  it("never emits a <script> tag or inline event handler, and carries no CSS <style> block or web font", () => {
    const { html } = renderEmail({
      heading: "Test",
      paragraphs: ["Body."],
    });
    assert.doesNotMatch(html, /<script/i);
    assert.doesNotMatch(html, /\son\w+=/i); // onclick=, onload=, etc.
    assert.doesNotMatch(html, /<style/i);
    assert.doesNotMatch(html, /@font-face/i);
  });

  it("omits the CTA block entirely when none is given", () => {
    const { html } = renderEmail({ heading: "Test", paragraphs: ["Body."] });
    assert.doesNotMatch(html, /rounded-button|<a href=/);
  });

  it("produces a plain-text fallback with the heading, paragraphs, and a labelled link (not raw HTML)", () => {
    const { text } = renderEmail({
      heading: "Affiliation confirmed",
      paragraphs: ["<strong>Test Org</strong> confirmed your membership."],
      cta: {
        label: "Open Member Workspace",
        url: "https://example.test/workspace/member",
      },
    });
    assert.match(text, /Affiliation confirmed/);
    assert.match(text, /Test Org confirmed your membership\./);
    assert.doesNotMatch(text, /<strong>/);
    assert.match(
      text,
      /Open Member Workspace: https:\/\/example\.test\/workspace\/member/,
    );
  });

  it("strips an inline <a> tag inside a paragraph down to 'label (url)' in the plain-text version", () => {
    const { text } = renderEmail({
      heading: "Test",
      paragraphs: [
        'See <a href="https://example.test/x">this link</a> for details.',
      ],
    });
    assert.match(
      text,
      /See this link \(https:\/\/example\.test\/x\) for details\./,
    );
  });

  it("does not double-escape text that a caller already escaped", () => {
    // escapeHtml("O'Brien & Co.") would produce &#39; and &amp; — renderEmail
    // must pass that straight through to the HTML unmodified, and the
    // plain-text fallback must decode it back to the original characters.
    const escaped = escapeHtml("O'Brien & Co.");
    const { html, text } = renderEmail({
      heading: "Test",
      paragraphs: [escaped],
    });
    assert.match(html, /O&#39;Brien &amp; Co\./);
    assert.doesNotMatch(html, /&amp;#39;/); // would indicate double-escaping
    assert.match(text, /O'Brien & Co\./);
  });
});
