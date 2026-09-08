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
  /* The journey pages decide what to show only once the platform provider has
     hydrated, which takes a few seconds on a machine running four browsers at
     once. The default five seconds was landing just short of that and failing
     three of them per run, while every one passed on its own. A failing
     assertion still fails; it just waits long enough to be sure first. */
  expect: { timeout: 10_000 },
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
    env: {
      TAMIL_ULAGAM_E2E: "1",
      NEXT_PUBLIC_ENROLLMENT_BACKEND:
        process.env.NEXT_PUBLIC_ENROLLMENT_BACKEND ?? "mock",
    },
    url: baseURL,
    /* A cold `next dev` compiles every route on first request, one at a
       time, and that — not the browsers — is what limits this suite: raising
       the worker count from four to six made it slower, because the extra
       workers only queued more requests at the same compiler and thirty-four
       tests timed out waiting.

       Reusing a server that is already up lets a working session pay that
       cost once instead of once per run. CI always starts its own, so it
       still gets a clean one. */
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
