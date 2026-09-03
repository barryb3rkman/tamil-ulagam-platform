import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import vitestPlugin from "@vitest/eslint-plugin";
import testingLibraryPlugin from "eslint-plugin-testing-library";

/**
 * Type-aware rules, shared by every package.
 *
 * These need the TypeScript program, so a package using this must pass
 * its own tsconfig root through `projectService`. Rules that only read
 * the syntax tree cannot catch the things here: an unawaited promise, a
 * condition that is always true, an async function with nothing to
 * await. Those are bugs, not style.
 */
export const typedConfig = (tsconfigRootDir) =>
  defineConfig([
    {
      files: ["**/*.{ts,tsx,mts,cts}"],
      extends: [tseslint.configs.recommendedTypeChecked],
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
      rules: {
        // Async correctness. A dropped promise means an error nobody
        // sees and an operation nobody waits for.
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-misused-promises": "error",
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/require-await": "error",
        "@typescript-eslint/return-await": ["error", "in-try-catch"],

        // Escape hatches stay closed.
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-unsafe-assignment": "error",
        "@typescript-eslint/no-unsafe-member-access": "error",
        "@typescript-eslint/no-unsafe-call": "error",
        "@typescript-eslint/no-unsafe-return": "error",
        "@typescript-eslint/no-unsafe-argument": "error",
        "@typescript-eslint/no-unnecessary-type-assertion": "error",

        // Dead conditions usually mean a misunderstood type.
        "@typescript-eslint/no-unnecessary-condition": "error",

        // Type-only imports are erased at build time; mixing them into
        // value imports keeps modules alive that need not be.
        "@typescript-eslint/consistent-type-imports": [
          "error",
          { fixStyle: "inline-type-imports" },
        ],

        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            caughtErrorsIgnorePattern: "^_",
          },
        ],
      },
    },
    {
      // Code that adapts data crossing a process boundary. The generated
      // Supabase types claim these columns are never null; RLS, joins,
      // narrowed selects and schema drift all say otherwise, and the
      // types are not checked at runtime. Deleting the guards to satisfy
      // the linter would trade a real safety net for a clean report.
      files: [
        "**/test/setup.ts",
        "**/lib/supabase/**/*.ts",
        "**/features/**/*-service.ts",
        "**/features/**/supabase-services.ts",
        "**/features/**/repository.ts",
        "**/features/**/platform-provider.tsx",
      ],
      rules: {
        "@typescript-eslint/no-unnecessary-condition": "off",
      },
    },
    {
      // Adapters and test doubles that satisfy an async interface. A
      // method returning a resolved value with nothing to await is the
      // whole point of implementing the contract; there is no bug to
      // find here.
      files: [
        "**/features/enrollment/platform-services.ts",
        "**/features/**/mock-*.ts",
        "**/*.test.{ts,tsx}",
      ],
      rules: {
        "@typescript-eslint/require-await": "off",
      },
    },
    {
      files: ["**/*.test.{ts,tsx}", "**/tests/**/*.{ts,tsx}"],
      plugins: {
        vitest: vitestPlugin,
        "testing-library": testingLibraryPlugin,
      },
      rules: {
        ...vitestPlugin.configs.recommended.rules,
        "vitest/no-focused-tests": "error",
        "vitest/no-disabled-tests": "warn",
        "vitest/expect-expect": "error",
        "vitest/no-identical-title": "error",
        // Vitest's expect takes an optional message as a second
        // argument, which is how these suites name the failing asset.
        "vitest/valid-expect": ["error", { maxArgs: 2 }],
        // vi.fn() references are unbound by design; asserting on them is
        // the normal way to check a mock was called.
        "@typescript-eslint/unbound-method": "off",
        // Mocks are typed loosely on purpose; the strictness that
        // matters is in the code under test.
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        // Specs deliberately assert on shapes the types already
        // guarantee, which is the point of a regression test.
        "@typescript-eslint/no-unnecessary-condition": "off",
      },
    },
    {
      files: ["**/*.test.tsx"],
      rules: {
        ...testingLibraryPlugin.configs["flat/react"].rules,

        // Much of this suite asserts that something is *absent* — no
        // form, no mailto link, no JSON-LD block, a dialog element that
        // exists but is not open. None of that is reachable through
        // role queries: a closed dialog is out of the accessibility
        // tree, and a <script> has no role at all. Rewriting these to
        // satisfy the rule would mean deleting the assertion, so the
        // rule is off rather than the coverage.
        "testing-library/no-node-access": "off",
        "testing-library/no-container": "off",
      },
    },
    {
      // Suites that walk a fixture list and assert per entry. The
      // assertion is inside the loop by necessity; there is no single
      // expect that covers a data-driven set.
      files: [
        "**/config/images.test.ts",
        "**/content/initiative-details.test.ts",
        "**/initiative-detail-page.test.tsx",
        "**/lib/supabase/local-integration-*.test.ts",
      ],
      rules: {
        "vitest/no-conditional-expect": "off",
        "vitest/no-standalone-expect": "off",
      },
    },
  ]);
