import { defineConfig, devices } from "@playwright/test";

const pagesBaseUrl = process.env.PLAYWRIGHT_PAGES_URL;

if (!pagesBaseUrl) {
  throw new Error("PLAYWRIGHT_PAGES_URL is required for Pages-mode tests.");
}

const parsedBaseUrl = new URL(pagesBaseUrl);

if (parsedBaseUrl.protocol !== "http:" && parsedBaseUrl.protocol !== "https:") {
  throw new Error("PLAYWRIGHT_PAGES_URL must use HTTP or HTTPS.");
}

if (!parsedBaseUrl.pathname.endsWith("/")) {
  parsedBaseUrl.pathname = `${parsedBaseUrl.pathname}/`;
}

export default defineConfig({
  testDir: "./tests/e2e-pages",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: parsedBaseUrl.toString(),
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
