import { reactConfig } from "@tamil-ulagam/config-eslint/react";
import { typedConfig } from "@tamil-ulagam/config-eslint/typed";

const config = [...reactConfig, ...typedConfig(import.meta.dirname)];

export default config;
