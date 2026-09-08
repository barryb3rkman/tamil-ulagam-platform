import { test } from "@playwright/test";

/**
 * Marks a test as one that exists to produce review artefacts.
 *
 * A dozen specs walk a page at every viewport and write a PNG to
 * artifacts/ so a person can look at it. Between them they were over half
 * the wall time of the suite, and they catch nothing the rest of the suite
 * misses: each page spec already has "keeps <page> responsive without
 * horizontal overflow" and "loads the <page> content, links, navigation and
 * approved media" running on every push.
 *
 * So they are opt-in, the same way the motion review suite already is
 * (PREMIUM_MOTION_REVIEW). Run them when you want the pictures:
 *
 *   pnpm test:e2e:review
 */
export function reviewArtefactOnly(): void {
  test.skip(
    process.env.E2E_REVIEW !== "1",
    "Produces review artefacts. Run pnpm test:e2e:review to capture them.",
  );
}

/**
 * The viewports a sweep walks.
 *
 * The full set had nine, several of which could not disagree: 375/390/430 sit
 * inside one phone layout, and 1280/1366/1440/1920 inside one desktop layout.
 * These six keep a representative width for each layout the CSS actually
 * changes at, including one either side of the 1360px navigation breakpoint,
 * which is the only place the header swaps behaviour.
 */
export const sweepViewports = [
  { width: 375, height: 812 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 1000 },
] as const;
