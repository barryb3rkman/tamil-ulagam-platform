import { defineConfig, globalIgnores } from "eslint/config";
import prettierConfig from "eslint-config-prettier/flat";
import nextTypeScript from "eslint-config-next/typescript";

export const baseConfig = defineConfig([
  ...nextTypeScript,
  prettierConfig,
  globalIgnores(["coverage/**", "dist/**"]),
]);
