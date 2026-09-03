import { globalIgnores } from "eslint/config";
import { nextConfig } from "@tamil-ulagam/config-eslint/next";
import { typedConfig } from "@tamil-ulagam/config-eslint/typed";

const webConfig = [
  ...nextConfig,
  ...typedConfig(import.meta.dirname),
  globalIgnores(["src/lib/supabase/database.types.ts"]),
];

export default webConfig;
