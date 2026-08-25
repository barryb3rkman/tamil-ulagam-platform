import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

// vitest.config.ts always runs with cwd = apps/web (its own `@` alias is
// resolved the same way), so this is stable regardless of test-runner
// transform details.
const globalsCssPath = path.join(process.cwd(), "src/app/globals.css");
const css = readFileSync(globalsCssPath, "utf8");

describe("design tokens (globals.css) — presence and consistency", () => {
  it("keeps the existing foundation palette untouched", () => {
    for (const token of [
      "--tu-color-global-navy",
      "--tu-color-deep-navy",
      "--tu-color-heritage-maroon",
      "--tu-color-heritage-gold",
      "--tu-color-warm-ivory",
    ]) {
      expect(css).toContain(token);
    }
  });

  it("defines all four V3 supporting color tokens", () => {
    for (const token of [
      "--tu-color-indigo-depth",
      "--tu-color-crimson-ember",
      "--tu-color-champagne",
      "--tu-color-teal-depth",
    ]) {
      expect(css).toContain(token);
      // Every new color token is also exposed through @theme inline as a
      // Tailwind color utility — a token that isn't wired through here
      // silently can't be used as `bg-*`/`text-*` anywhere.
      const themeName = token.replace("--tu-color-", "--color-");
      expect(css).toContain(themeName);
    }
  });

  it("defines exactly the four named gradients, each documented", () => {
    const gradients = [
      "gradient-federation-night",
      "gradient-warm-welcome",
      "gradient-sangam-dusk",
      "gradient-trust-signal",
    ];
    for (const gradient of gradients) {
      expect(css).toContain(`@utility ${gradient}`);
    }
    // No fifth gradient utility should quietly appear.
    const matches = css.match(/@utility gradient-[\w-]+/g) ?? [];
    expect(new Set(matches).size).toBe(gradients.length);
  });

  it("defines exactly the four surface levels plus the constrained glass variant", () => {
    for (const surface of [
      "surface-canvas",
      "surface-card",
      "surface-elevated",
      "surface-deep",
      "surface-glass",
    ]) {
      expect(css).toContain(`@utility ${surface}`);
    }
  });

  it("defines the new typography scales without touching the existing ones", () => {
    for (const utility of [
      "text-display",
      "text-label",
      "text-metadata",
      "text-numeric",
    ]) {
      expect(css).toContain(`@utility ${utility}`);
    }
  });

  it("preserves the existing motion duration scale", () => {
    for (const [token, value] of [
      ["--tu-motion-instant", "100ms"],
      ["--tu-motion-fast", "180ms"],
      ["--tu-motion-base", "280ms"],
      ["--tu-motion-medium", "420ms"],
      ["--tu-motion-slow", "560ms"],
    ] as const) {
      expect(css).toContain(`${token}: ${value}`);
    }
  });

  it("gives every new motion pattern an explicit reduced-motion treatment", () => {
    const reducedMotionBlockMatch = css.match(
      /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*\}\s*$/,
    );
    expect(reducedMotionBlockMatch).not.toBeNull();
    const reducedMotionBlock = reducedMotionBlockMatch?.[0] ?? "";
    for (const selector of [
      "[data-motion-mask]",
      "[data-motion-success]",
      "[data-motion-ambient]",
      "[data-motion-skeleton]",
    ]) {
      expect(reducedMotionBlock).toContain(selector);
    }
  });

  it("scopes ambient gradient drift off below the lg breakpoint", () => {
    expect(css).toContain("[data-motion-ambient]");
    expect(css).toMatch(
      /@media \(max-width: 1023\.98px\) \{[\s\S]*?\[data-motion-ambient\]/,
    );
  });
});
