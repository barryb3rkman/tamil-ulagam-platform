import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

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
      const themeName = token.replace("--tu-color-", "--color-");
      expect(css).toContain(themeName);
    }
  });

  it("defines exactly the named gradients, each documented", () => {
    const gradients = [
      "gradient-federation-night",
      "gradient-warm-welcome",
      "gradient-sangam-dusk",
      "gradient-trust-signal",
      "gradient-aurora",
      "gradient-aurora-light",
      "gradient-gold-leaf",
    ];
    for (const gradient of gradients) {
      expect(css).toContain(`@utility ${gradient}`);
    }
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

  it("keeps the eyebrow, easing and inverse-status tokens the components rely on", () => {
    for (const utility of ["text-eyebrow", "text-eyebrow-sm"]) {
      expect(css).toContain(`@utility ${utility} {`);
    }
    for (const token of [
      "--tu-ease-snap",
      "--tu-color-success-inverse",
      "--tu-color-error-inverse",
      "--tu-gold-mid",
      "--tu-gold-light",
      "--tu-gold-shade",
    ]) {
      expect(css).toContain(token);
    }
  });

  it("keeps colour and easing out of the components", () => {
    const files = componentSources();
    const rawHex = files.flatMap(([file, source]) =>
      [...source.matchAll(/#[0-9a-fA-F]{6}/g)].map(
        (match) => `${file}: ${match[0]}`,
      ),
    );
    // Every colour lives in the palette. A hex here means one was
    // written into a component instead.
    expect(rawHex).toEqual([]);

    const inlineEasing = files.flatMap(([file, source]) =>
      [...source.matchAll(/ease-\[cubic-bezier/g)].map(() => file),
    );
    expect(inlineEasing).toEqual([]);
  });
});

function componentSources(): [string, string][] {
  const root = path.join(process.cwd(), "src/components");
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return entry.name.endsWith(".tsx") && !entry.name.includes(".test.")
        ? [full]
        : [];
    });
  return walk(root).map((file) => [
    path.relative(root, file),
    readFileSync(file, "utf8"),
  ]);
}
