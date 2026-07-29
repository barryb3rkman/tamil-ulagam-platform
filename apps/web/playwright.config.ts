import { defineConfig, devices } from "@playwright/test";

const configuredPort = Number(process.env.PLAYWRIGHT_PORT ?? "3100");

if (
  !Number.isInteger(configuredPort) ||
  configuredPort < 1024 ||
  configuredPort > 65_535
) {
  throw new Error("PLAYWRIGHT_PORT must be a valid unprivileged TCP port.");
}

const port = configuredPort;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `exec ./node_modules/.bin/next dev --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
