import { defineConfig } from "eslint/config";
import prettierConfig from "eslint-config-prettier/flat";
import nextTypeScript from "eslint-config-next/typescript";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";

export const reactConfig = defineConfig([
  ...nextTypeScript,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  reactHooksPlugin.configs.flat.recommended,
  jsxA11yPlugin.flatConfigs.recommended,
  prettierConfig,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
]);
