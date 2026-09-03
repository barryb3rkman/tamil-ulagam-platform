import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  oxc: {
    jsx: {
      runtime: "automatic",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      reporter: ["text", "html"],
      // Set to the levels measured when thresholds were introduced, so
      // coverage can only go up. Raise these as it improves; never lower
      // them to make a build pass.
      thresholds: {
        statements: 56,
        branches: 55,
        functions: 52,
        lines: 58,
      },
    },
  },
});
