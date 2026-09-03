import type { KnipConfig } from "knip";

/**
 * Dead-code detection. Runs in CI so unreachable code cannot quietly
 * accumulate again.
 *
 * Two categories are excluded on purpose, and neither is an oversight:
 *
 * Public page sections. Commit dafea9d trimmed the public site to match
 * the source presentation, leaving roughly forty written, working
 * sections exported but not rendered. They are content decisions on hold,
 * not dead code, and deleting them would throw away copy that has been
 * through review.
 *
 * Supabase edge functions. They are deployed and invoked over HTTP, so
 * nothing in this repository imports them. Knip cannot see that.
 *
 * The four homepage sections under components/home are held for the same
 * reason as the page sections: they were taken off the homepage during
 * the redesign, not orphaned by accident.
 */
const config: KnipConfig = {
  workspaces: {
    "apps/web": {
      entry: [
        "src/app/**/{page,layout,template,loading,error,not-found,route,default}.tsx",
        "src/app/**/{sitemap,robots,manifest,opengraph-image,icon,apple-icon}.ts",
        "playwright.pages.config.ts",
        "tests/**/*.spec.ts",
      ],
      project: ["src/**/*.{ts,tsx}", "tests/**/*.ts"],
      ignore: [
        "src/lib/supabase/database.types.ts",
        "src/components/home/community-stories-preview.tsx",
        "src/components/home/partnership-invitation.tsx",
        "src/components/home/tamil-id-feature.tsx",
        "src/components/home/why-tamil-ulagam-section.tsx",
      ],
    },
    "packages/config-eslint": { entry: ["*.mjs"], project: ["*.mjs"] },
    "packages/config-typescript": {},
  },
  ignore: ["supabase/**"],
  // eslint is invoked by lint-staged through `pnpm --dir`, coverage and
  // husky by their tools rather than by an import.
  // eslint is invoked by lint-staged through `pnpm --dir` rather than
  // imported, so nothing in the tree references it.
  ignoreDependencies: ["eslint", "tailwindcss"],
  // nextjs.json names the Next TypeScript plugin. It resolves from the
  // consuming app; pulling all of Next into a config package to satisfy
  // the reference would be worse than the reference.
  ignoreUnresolved: ["next"],
  ignoreExportsUsedInFile: true,
  // An unreachable file or an unused dependency is unambiguous, so those
  // fail the build. An unused export is not: the held page sections above
  // are all unused exports, and so is anything a barrel re-exports ahead
  // of being wired up. Those are reported for a human to read, not
  // enforced.
  rules: {
    files: "error",
    dependencies: "error",
    devDependencies: "error",
    unlisted: "error",
    unresolved: "error",
    exports: "warn",
    types: "warn",
    duplicates: "warn",
    enumMembers: "warn",
  },
};

export default config;
