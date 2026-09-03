import { baseConfig } from "@tamil-ulagam/config-eslint/base";
import { typedConfig } from "@tamil-ulagam/config-eslint/typed";

const config = [...baseConfig, ...typedConfig(import.meta.dirname)];

export default config;
