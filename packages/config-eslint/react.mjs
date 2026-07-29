import { defineConfig } from "eslint/config";
import prettierConfig from "eslint-config-prettier/flat";
import nextTypeScript from "eslint-config-next/typescript";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export const reactConfig = defineConfig([
  ...nextTypeScript,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  reactHooksPlugin.configs.flat.recommended,
  prettierConfig,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
]);
