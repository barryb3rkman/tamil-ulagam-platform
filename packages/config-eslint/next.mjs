import { defineConfig, globalIgnores } from "eslint/config";
import prettierConfig from "eslint-config-prettier/flat";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";

export const nextConfig = defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    // Next registers the jsx-a11y plugin but enables only a subset of
    // its rules. Redefining the plugin is an error, so the rest of the
    // recommended set is switched on directly.
    files: ["**/*.tsx"],
    rules: jsxA11yPlugin.flatConfigs.recommended.rules,
  },
  prettierConfig,
  globalIgnores([
    ".next/**",
    "coverage/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
  ]),
]);
